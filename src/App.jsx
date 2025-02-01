import { useState } from 'react';
import abi from './abi.json';
import { ethers } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const App = () => {
  const [balance, setUserBalance] = useState(0);
  const [amount, setUserAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  const ContractAddress = '0x0D34a4371A3fB48Bc3212e812E31EdbF96B3A1d3';

  async function requestAccounts() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    setWalletAddress(accounts[0]);
  }

  async function getBalance() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(ContractAddress, abi, provider);
        const tx = await contract.getBalance();
        const formattedBalance = ethers.formatEther(tx);
        setUserBalance(formattedBalance);
        toast.success(`Your Balance: ${formattedBalance} ETH`);
      } catch (error) {
        toast.error('Failed to fetch balance');
      }
    }
  }

  async function setAmount() {
    if (!amount) {
      toast.error('Please enter a value');
      return;
    }

    if (window.ethereum) {
      await requestAccounts();
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ContractAddress, abi, signer);
      const tx = await contract.deposit(ethers.parseEther(amount), {
        value: ethers.parseEther(amount),
      });

      await tx.wait();
      toast.success('Deposit Successful');
      await getBalance();
    } catch (error) {
      toast.error('Transaction failed');
    }
  }

  async function withdrawAmount() {
    if (!amount) {
      toast.error('Please enter a value');
      return;
    }

    if (window.ethereum) {
      await requestAccounts();
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ContractAddress, abi, signer);
      const tx = await contract.withdraw(ethers.parseEther(amount));
      await tx.wait();
      toast.success('Withdrawal successful');
      await getBalance();
    } catch (error) {
      toast.error('Transaction failed');
    }
  }

  return (
    <div className='app-container'>
      <h1>HolaPow Dapp</h1>

      <button onClick={requestAccounts} className='connect-btn'>
        {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
      </button>

      <div className='card'>
        <h2>Contract Balance</h2>
        <p>{balance} ETH</p>
        <button onClick={getBalance} className='primary-btn'>Get Balance</button>
      </div>

      <div className='card'>
        <h2>Deposit / Withdraw</h2>
        <input
          type='number'
          placeholder='Enter amount in ETH'
          className='input-field'
          value={amount}
          onChange={(e) => setUserAmount(e.target.value)}
        />
        <div className='button-group'>
          <button onClick={setAmount} className='primary-btn'>Deposit</button>
          <button onClick={withdrawAmount} className='secondary-btn'>Withdraw</button>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default App;

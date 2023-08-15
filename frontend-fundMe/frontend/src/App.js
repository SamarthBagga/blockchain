import { useEffect } from "react";
import "./App.css";
import { ethers } from "ethers";
import { abi } from "./abi.js";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const contractAddress = "0x1A3c7b974081209F5B81efF93ce91C1b0C3E7dAB";
  const [isConnected, toggleConnect] = useState(false);
  const [fundAmount, setFundAmount] = useState("");

  async function connect() {
    console.log("we have run connect func");
    if (typeof window.ethereum == "undefined") {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      toggleConnect(false);
    } else {
      try {
        // Specify the chainId to request connection to a specific network (e.g., Ethereum mainnet)
        await window.ethereum.request({
          method: "eth_requestAccounts",
          params: [
            {
              chainId: "0x1", // Replace with the desired chainId for the network
            },
          ],
        });
        toggleConnect(true); // Update isConnected state to true if connected
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    }
  }

  useEffect(() => {
    connect();
  }, []);

  async function getBalance() {
    if (typeof window.ethereum != "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(contractAddress);
      toast("The balance is " + ethers.utils.formatEther(balance));
    }
  }

  async function fund() {
    const ethAmount = fundAmount;
    console.log("Eth amount is" + ethAmount);
    toast(`Funding with ${ethAmount}`);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log("provider is this " + provider);
    const signer = provider.getSigner();
    console.log("signer is this " + signer);
    console.log("abi is this " + abi);
    const contract = new ethers.Contract(contractAddress, abi, signer);
    console.log("contract is this " + contract);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      console.log(
        "fund happened and transacrion response is this " + transactionResponse
      );
      // listen for the tx to be mined
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  }
  function handleFundAmountChange(event) {
    setFundAmount(event.target.value);
  }

  function listenForTransactionMine(transactionResponse, provider) {
    toast(`Mining ${transactionResponse.hash}...`);
    // return new Promise()
    // create a listener for the blockchain
    return new Promise((resolve, reject) => {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        toast(
          `Completed with ${transactionReceipt.confirmations} confirmations`
        );
        resolve();
      });
    });
  }

  async function withdraw() {
    console.log("Withdrawing....");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="App">
      <div className="isConnected">
        You are currently {isConnected ? "connected" : "not connected"} to
        MetaMask.
        {!isConnected ? (
          <button onClick={connect}>Connect to MetaMask</button>
        ) : (
          ""
        )}
      </div>
      <div>
        <button onClick={getBalance}>Get Balance</button>
      </div>
      <div>
        <input onChange={handleFundAmountChange} placeholder="ETH Amount" />
        <button onClick={fund}>Fund!</button>
      </div>
      <div>
        <button onClick={withdraw}>Withdraw</button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;

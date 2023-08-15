import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import BallotContract from "../ABI/Ballot"; // Import the Ballot contract ABI

const Ballots = () => {
  const [issueName, setIssueName] = useState("");
  const [issues, setIssues] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const contractAddress = "0x9be868bad697c63C20E99Fe232DC10A6799C81Dc"; // Replace with the deployed contract address
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = provider.getSigner();

  async function connectToContract() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  const initializeEthers = async () => {
    // ethers connection for the smart contract
    const contract = new ethers.Contract(
      contractAddress,
      BallotContract.abi,
      signer
    );

    // Get the list of all issues
    const allIssues = await contract.getAllIssues();
    setIssues(allIssues);
    setIsConnected(true);
  };

  // Connects to the smart contract token id (check /contracts/contract-address.json)
  async function init() {
    try {
      await window.ethereum.enable();
      await initializeEthers();
    } catch (error) {
      console.error("Error connecting to contract:", error);
    }
  }

  useEffect(() => {
    // When the page loads, initialize the init function
    // to connect the frontend with the smart contract
    init();
  }, []);

  async function createNewIssue() {
    try {
      const contract = new ethers.Contract(
        contractAddress,
        BallotContract.abi,
        provider.getSigner()
      );

      await contract.createIssue(issueName, 24);
      setIssueName("");
      // After creating the issue, update the list of issues by fetching again from the contract
      const allIssues = await contract.getAllIssues();
      setIssues(allIssues);
    } catch (error) {
      console.error("Error creating issue:", error);
    }
  }

  return (
    <div>
      <h2>Ballot Interaction</h2>
      {typeof window.ethereum == "undefined" ? (
        <button onClick={connectToContract}>Connect to Contract</button>
      ) : (
        <div>
          <div>
            <h3>Create Issue</h3>
            <input
              type="text"
              value={issueName}
              onChange={(e) => setIssueName(e.target.value)}
              placeholder="Enter issue name"
            />
            <button onClick={createNewIssue}>Create Issue</button>
          </div>
          <div>
            <h3>Vote</h3>
            {/* Add code to select issue and vote */}
          </div>
          <div>
            <h3>Issues</h3>
            <ul>
              {issues.map((issue, index) => (
                <li key={index}>
                  {issue.name} - Yes Votes: {issue.yesVotes}, No Votes:{" "}
                  {issue.noVotes}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ballots;

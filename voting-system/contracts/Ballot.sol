pragma solidity ^0.8.4;

contract Ballot {
    struct IssueInfo {
        bytes32 name;
        uint votingDeadline;
    }

    struct VoterInfo {
        uint yesVotes;
        uint noVotes;
        mapping(address => bool) hasVoted;
        address[] voters;
    }

    IssueInfo[] private issueInfos;
    VoterInfo[] private voterInfos;

    function createIssue(bytes32 _name, uint _votingDurationHours) public returns (uint) {
        IssueInfo memory newIssue = IssueInfo({
            name: _name,
            votingDeadline: block.timestamp + (_votingDurationHours * 1 hours)
        });
        issueInfos.push(newIssue);
        voterInfos.push();
        return issueInfos.length - 1; // Return the index of the created issue
    }

    modifier votingOpen(uint issueIndex) {
        require(block.timestamp <= issueInfos[issueIndex].votingDeadline, "Voting is closed for this issue");
        _;
    }

    function castVote(uint issueIndex, bool isYesVote) public votingOpen(issueIndex) {
        require(issueIndex < issueInfos.length, "Invalid issue index");
        VoterInfo storage voterInfo = voterInfos[issueIndex];
        require(!voterInfo.hasVoted[msg.sender], "You have already voted for this issue");

        if (isYesVote) {
            voterInfo.yesVotes++;
        } else {
            voterInfo.noVotes++;
        }
        voterInfo.hasVoted[msg.sender] = true;
        voterInfo.voters.push(msg.sender); // Add the address to the list of voters for this issue
    }

    function getIssueVotes(uint issueIndex) public view returns (uint yesVotes, uint noVotes) {
        require(issueIndex < issueInfos.length, "Invalid issue index");
        VoterInfo storage voterInfo = voterInfos[issueIndex];
        return (voterInfo.yesVotes, voterInfo.noVotes);
    }

    function getVotersForIssue(uint issueIndex) public view returns (address[] memory) {
        require(issueIndex < issueInfos.length, "Invalid issue index");
        VoterInfo storage voterInfo = voterInfos[issueIndex];
        return voterInfo.voters;
    }

    function hasAddressVoted(uint issueIndex, address voter) public view returns (bool) {
        require(issueIndex < issueInfos.length, "Invalid issue index");
        VoterInfo storage voterInfo = voterInfos[issueIndex];
        return voterInfo.hasVoted[voter];
    }

    function determineWinner(uint issueIndex) public votingOpen(issueIndex) returns (string memory) {
        require(issueIndex < issueInfos.length, "Invalid issue index");
        IssueInfo storage issue = issueInfos[issueIndex];
        VoterInfo storage voterInfo = voterInfos[issueIndex];

        if (block.timestamp <= issue.votingDeadline) {
            return "Voting is still ongoing";
        } else {
            if (voterInfo.yesVotes > voterInfo.noVotes) {
                return "Yes wins";
            } else if (voterInfo.yesVotes < voterInfo.noVotes) {
                return "No wins";
            } else {
                return "It's a tie";
            }
        }
    }

    function getAllIssues() public view returns (bytes32[] memory) {
        bytes32[] memory allIssues = new bytes32[](issueInfos.length);
        for (uint i = 0; i < issueInfos.length; i++) {
            allIssues[i] = issueInfos[i].name;
        }
        return allIssues;
    }

}

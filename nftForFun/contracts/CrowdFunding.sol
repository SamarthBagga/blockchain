// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ProjectNFT is ERC721 {
    uint256 private tokenIdCounter;

    struct Project {
        string name;
        string description;
        string imageLink;
    }

    mapping(uint256 => Project) public projects;
    Project[] private allProjects; // Use a private array to store projects

    constructor() ERC721("ProjectNFT", "PNFT") {
        tokenIdCounter = 0;
    }

    function mintNFT(
        string memory projectName,
        string memory projectDescription,
        string memory ipfsImageLink
    ) public {
        uint256 tokenId = tokenIdCounter;

        _safeMint(msg.sender, tokenId);

        projects[tokenId] = Project({
            name: projectName,
            description: projectDescription,
            imageLink: ipfsImageLink
        });

        // Add project directly to the private array
        allProjects.push(Project(projectName, projectDescription, ipfsImageLink));

        tokenIdCounter++;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {

    // Import the Strings library and use toString to convert uint256 to string
    string memory tokenIdStr = Strings.toString(tokenId);

    string memory baseURI = "https://gateway.pinata.cloud/ipfs/";
    string memory ipfsLink = projects[tokenId].imageLink;

    return string(abi.encodePacked(baseURI, ipfsLink, "/", tokenIdStr, ".json"));
}


    function getTotalProjects() external view returns (uint256) {
        return allProjects.length;
    }

    function getProjectByIndex(uint256 index) external view returns (Project memory) {
        require(index < allProjects.length, "Index out of bounds");
        return allProjects[index];
    }

    function getTokenCounter() external view returns (uint256) {
        return tokenIdCounter;
    }
}

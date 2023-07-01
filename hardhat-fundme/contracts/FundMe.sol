
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PriceConvertor.sol";
error notOwner();
contract FundMe{

    uint256 public constant minimumUsd = 50 * 1e18;

    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    address public owner;

    constructor(){
        owner = msg.sender;
    }
     
     function fund() public payable  {
            //want to be able to set a minimum fund amount
            require(PriceConverter.getConversionRate(msg.value) >= minimumUsd, "Send more monies not enough");
            funders.push(msg.sender);
            addressToAmountFunded[msg.sender] = msg.value;
     }
     

     function withdraw() public onlyOwner {
        for(uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++){
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        // reset the array
        funders = new address[](0);
        // actually withdraw the funds
        //transfer
        // payable(msg.sender).transfer(address(this).balance);
        // send 
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send Failed");
        // call
        (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call Failed");
     }
     modifier onlyOwner {
        require(msg.sender == owner, "sender is not owner dont steal!");
        _;
     }

     receive() external payable {
         fund();
     }

     fallback() external payable {
         fund();
     }

     // receive()
     // fallback


}



// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal reference contract for a creator drop claim signal.
/// The current web app uses a zero-value Base transaction as the claim action.
/// Deploying this contract later would let the app emit indexed claim events.
contract BaseCreatorDrop {
    string public name = "Base Drop Pass";
    uint256 public immutable maxSupply;
    uint256 public totalClaims;
    mapping(address => bool) public claimed;

    event Claimed(address indexed collector, uint256 indexed edition);

    constructor(uint256 supply) {
        maxSupply = supply;
    }

    function claim() external {
        require(!claimed[msg.sender], "Already claimed");
        require(totalClaims < maxSupply, "Sold out");

        totalClaims += 1;
        claimed[msg.sender] = true;

        emit Claimed(msg.sender, totalClaims);
    }
}

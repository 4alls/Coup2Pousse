//SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

/// @dev Réexporte le mock Chainlink fourni par le package pour que Hardhat le compile
/// @dev et le rende disponible aux tests via ethers.getContractFactory("MockV3Aggregator")
import "@chainlink/contracts/src/v0.8/tests/MockV3Aggregator.sol";

//SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

/// @title Une factory de vaults ERC-4626 de staking
/// @author Thibaut Baudry
/// @notice Ce contrat déploie et enregistre un StakingVault par token stakable, et remplace
/// @notice l'ancien registre tokensStakable/addToken du contrat Staking.sol
/// @dev Le contrat intelligent est Ownable, le propriétaire peut créer des vaults et configurer leur RewardsController

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {StakingVault} from "./StakingVault.sol";

contract StakingVaultFactory is Ownable {

    mapping(address => address) public vaults;

    /// @notice Emit lorsqu'un vault est créé pour un token
    /// @param token L'adresse du token sous-jacent stakable
    /// @param vault L'adresse du vault créé
    /// @param name Le nom du token de parts du vault
    /// @param symbol Le symbole du token de parts du vault
    /// @param rewardRateDivisor Le diviseur du taux de reward du vault
    event VaultCreated(address indexed token, address indexed vault, string name, string symbol, uint256 rewardRateDivisor);

    /// @dev Définit l'adresse qui déploie comme propriétaire de la factory
    constructor() Ownable(msg.sender) {}

    /// @notice Déploie un StakingVault pour un token et l'enregistre
    /// @dev Ne peut être exécuté que par le propriétaire de la factory
    /// @param name Le nom du token de parts (ex. "Staked USDC")
    /// @param symbol Le symbole du token de parts (ex. "sUSDC")
    /// @param token L'adresse du token sous-jacent stakable
    /// @param rewardRateDivisor Le diviseur du taux de reward du vault
    /// @return vault L'adresse du vault créé
    function createVault(
        string calldata name,
        string calldata symbol,
        address token,
        uint256 rewardRateDivisor
    ) external onlyOwner returns (address vault) {
        require(token != address(0), "Address 0");
        require(vaults[token] == address(0), "Vault already exists");

        StakingVault newVault = new StakingVault(IERC20(token), name, symbol, rewardRateDivisor);
        vault = address(newVault);
        vaults[token] = vault;

        emit VaultCreated(token, vault, name, symbol, rewardRateDivisor);
    }

    /// @notice Définit le RewardsController autorisé sur le vault d'un token
    /// @dev Ne peut être exécuté que par le propriétaire de la factory
    /// @param token L'adresse du token dont le vault doit être configuré
    /// @param controller L'adresse du RewardsController (le contrat Staking.sol orchestrateur)
    function setRewardsController(address token, address controller) external onlyOwner {
        address vault = vaults[token];
        require(vault != address(0), "Vault does not exist");
        StakingVault(vault).setRewardsController(controller);
    }

    /// @notice Récupère l'adresse du vault d'un token
    /// @param token L'adresse du token stakable
    /// @return address L'adresse du vault correspondant, ou address(0) s'il n'existe pas
    function getVault(address token) external view returns (address) {
        return vaults[token];
    }
}

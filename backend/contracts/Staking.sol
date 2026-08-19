//SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

/// @title Le contrat orchestrateur des rewards de staking à impact positif
/// @author Thibaut Baudry
/// @notice Ce contrat calcule et distribue les rewards en C2P des stakers, en s'appuyant sur les
/// @notice vaults ERC-4626 de StakingVaultFactory pour l'accounting des positions de stake
/// @notice On considère que les rewards sont effectuées en C2P avec un taux de 1 C2P = 1 USD
/// @dev Le contrat intelligent est ChainlinkClient, il donne la valeur de l'USDC et des autres tokens de manière sécurisée
/// @dev Le dépôt et le retrait des tokens stakés se font directement sur les vaults (deposit/withdraw ERC-4626), pas ici

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "./TokenFarm.sol";
import {StakingVault} from "./StakingVault.sol";
import {StakingVaultFactory} from "./StakingVaultFactory.sol";

contract Staking is ChainlinkClient {

    C2PToken public immutable rewardsToken;
    StakingVaultFactory public immutable vaultFactory;
    address public immutable usdcToken;
    uint64 numerateur = 1e18;

    AggregatorV3Interface internal priceFeedUSDC;

    error NoRewards();
    error VaultDoesNotExist();

    /// @dev Définit le C2P comme token de reward
    /// @dev Définit la StakingVaultFactory qui gère les vaults de staking
    /// @dev Définit le hash chainlink USDC/USD comme priceFeedUSDC
    /// @param _vaultFactory L'adresse de la StakingVaultFactory
    /// @param _usdcToken L'adresse du token USDC, pour distinguer le vault au pricing Chainlink fixe des autres
    /// @param _c2pToken L'addresse du token C2P
    constructor(address _vaultFactory, address _usdcToken, address _c2pToken) {
        rewardsToken = C2PToken(_c2pToken);
        vaultFactory = StakingVaultFactory(_vaultFactory);
        usdcToken = _usdcToken;
        priceFeedUSDC = AggregatorV3Interface(0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E);
    }

    /// @notice Récupère la valeur de l'USDC en USD sur SEPOLIA
    /// @return uint256 La valeur de l'USDC en USD
    function getUSDCValueChainLink() public view returns (uint256) {
        (, int price,,,) = priceFeedUSDC.latestRoundData();
        return (uint256(price) * 1e10 / numerateur);
    }

    /// @notice Récupère la valeur du token en USD sur SEPOLIA
    /// @param _chainlinkAddress L'adresse Chainlink correspondante à la pair token/USD
    /// @return uint256 La valeur du token en USD
    function getOtherValueChainLink(address _chainlinkAddress) public view returns (uint256) {
        AggregatorV3Interface priceFeedOtherToken = AggregatorV3Interface(_chainlinkAddress);
        (, int price,,,) = priceFeedOtherToken.latestRoundData();
        return (uint256(price) * 1e10 / numerateur);
    }

    /// @notice Calcule la valeur en USD des rewards accumulées par l'appelant sur le vault d'un token
    /// @param _vaultToken L'adresse du token stakable dont on veut calculer les rewards
    /// @param _chainlinkAddress L'adresse Chainlink de la pair token/USD (ignorée si _vaultToken est l'USDC)
    /// @return uint256 La valeur en USD des rewards de l'appelant sur ce vault
    function calculateRewards(address _vaultToken, address _chainlinkAddress) public view returns (uint256) {
        address vault = vaultFactory.getVault(_vaultToken);
        if (vault == address(0)) revert VaultDoesNotExist();

        uint256 basis = StakingVault(vault).pendingRewardBasis(msg.sender);
        uint256 price = _vaultToken == usdcToken
            ? getUSDCValueChainLink()
            : getOtherValueChainLink(_chainlinkAddress);

        return basis * price;
    }

    /// @notice Envoie les rewards au staker et au projet Agricole avec un taux de partage de 50%
    /// @param _vaultToken L'adresse du token stakable dont on récupère les rewards
    /// @param _projectAgriculteur L'adresse du projet agricole que le staker souhaite financer
    /// @param _chainlinkAddress L'adresse Chainlink de la pair token/USD (ignorée si _vaultToken est l'USDC)
    function getRewardAndSupportProject(address _vaultToken, address _projectAgriculteur, address _chainlinkAddress) external {
        address vault = vaultFactory.getVault(_vaultToken);
        if (vault == address(0)) revert VaultDoesNotExist();

        uint256 rewards = calculateRewards(_vaultToken, _chainlinkAddress);
        if (rewards > 0) {
            StakingVault(vault).settleRewardBasis(msg.sender);

            uint256 rewardsForProject = rewards / 2;
            uint256 rewardsForStaker = rewards / 2;
            rewardsToken.transfer(_projectAgriculteur, rewardsForProject);
            rewardsToken.transfer(msg.sender, rewardsForStaker);
        } else {
            revert NoRewards();
        }
    }
}

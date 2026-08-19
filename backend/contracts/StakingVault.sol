//SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

/// @title Un vault ERC-4626 de staking pour un token donné
/// @author Thibaut Baudry
/// @notice Ce contrat tokenise les positions de stake d'un token (parts transférables et composables)
/// @notice totalAssets() ne représente que le principal déposé : le vault n'auto-compound pas
/// @notice l'actif sous-jacent, les rewards en C2P sont calculées et distribuées séparément par le RewardsController
/// @dev Déployé exclusivement par StakingVaultFactory, qui devient la "factory" administrant ce vault

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakingVault is ERC4626 {

    address public immutable factory;
    uint256 public immutable rewardRateDivisor;
    address public rewardsController;

    mapping(address => uint256) public lastAccrualTimestamp;
    mapping(address => uint256) public accruedRewardBasis;

    /// @notice Emit lorsque le RewardsController autorisé à settle les rewards est mis à jour
    /// @param controller L'adresse du nouveau RewardsController
    event RewardsControllerUpdated(address indexed controller);

    /// @dev S'assure que l'appelant est la factory qui a déployé ce vault
    modifier onlyFactory() {
        require(msg.sender == factory, "Not the factory");
        _;
    }

    /// @dev S'assure que l'appelant est le RewardsController autorisé
    modifier onlyRewardsController() {
        require(msg.sender == rewardsController, "Not the rewards controller");
        _;
    }

    /// @param asset_ Le token sous-jacent stakable dans ce vault
    /// @param name_ Le nom du token de parts (ex. "Staked USDC")
    /// @param symbol_ Le symbole du token de parts (ex. "sUSDC")
    /// @param rewardRateDivisor_ Le diviseur du taux de reward (plus il est bas, plus les rewards s'accumulent vite)
    constructor(
        IERC20 asset_,
        string memory name_,
        string memory symbol_,
        uint256 rewardRateDivisor_
    ) ERC20(name_, symbol_) ERC4626(asset_) {
        require(rewardRateDivisor_ > 0, "Divisor = 0");
        factory = msg.sender;
        rewardRateDivisor = rewardRateDivisor_;
    }

    /// @notice Définit le RewardsController autorisé à settle les rewards des stakers
    /// @dev Ne peut être exécuté que par la factory
    /// @param _controller L'adresse du RewardsController (le contrat Staking.sol orchestrateur)
    function setRewardsController(address _controller) external onlyFactory {
        require(_controller != address(0), "Address 0");
        rewardsController = _controller;
        emit RewardsControllerUpdated(_controller);
    }

    /// @notice Calcule la base de reward (avant pricing) accumulée par un compte, y compris depuis le dernier accrual
    /// @param account Le compte dont on veut connaître la base de reward
    /// @return uint256 La base de reward accumulée, divisée par rewardRateDivisor
    function pendingRewardBasis(address account) public view returns (uint256) {
        uint256 basis = accruedRewardBasis[account];
        uint256 last = lastAccrualTimestamp[account];
        if (last != 0 && block.timestamp > last) {
            basis += (block.timestamp - last) * balanceOf(account);
        }
        return basis / rewardRateDivisor;
    }

    /// @notice Remet à zéro la base de reward d'un compte après distribution des rewards
    /// @dev Ne peut être exécuté que par le RewardsController ; accrue d'abord jusqu'à l'instant présent
    /// @param account Le compte dont la base de reward doit être settle
    function settleRewardBasis(address account) external onlyRewardsController {
        _accrue(account);
        accruedRewardBasis[account] = 0;
    }

    /// @dev Accumule la base de reward d'un compte depuis son dernier accrual jusqu'à maintenant
    /// @param account Le compte à accrue
    function _accrue(address account) internal {
        uint256 last = lastAccrualTimestamp[account];
        if (last != 0 && block.timestamp > last) {
            accruedRewardBasis[account] += (block.timestamp - last) * balanceOf(account);
        }
        lastAccrualTimestamp[account] = block.timestamp;
    }

    /// @dev Accrue l'émetteur et le destinataire avant tout changement de solde de parts
    /// @dev Couvre mint (dépôt), burn (retrait) et transfert direct des parts entre stakers
    function _update(address from, address to, uint256 value) internal override {
        if (from != address(0)) {
            _accrue(from);
        }
        if (to != address(0)) {
            _accrue(to);
        }
        super._update(from, to, value);
    }
}

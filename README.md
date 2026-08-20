# 🌱 Coup2Pousse

**Dapp de staking à impact positif** : les utilisateurs stakent des tokens, génèrent des rewards en **C2P**, et en reversent la moitié à un **projet agricole** de leur choix.

Projet réalisé dans le cadre de la formation développeur blockchain [ALYRA](https://alyra.fr/).

<p align="center">
  <img src="https://github.com/ThibautBaudry/Coup2Pousse/blob/main/Coup2Pousse.png" alt="Logo" width="400">
</p>

## Sommaire

- [Fonctionnement](#fonctionnement)
- [Architecture](#architecture)
- [Stack technique](#stack-technique)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Backend — tests, coverage, déploiement](#backend--tests-coverage-déploiement)
- [Frontend — développement local](#frontend--développement-local)
- [Structure du repo](#structure-du-repo)
- [Screenshots](#screenshots)
- [Auteur](#auteur)

## Fonctionnement

1. Un utilisateur dépose de l'USDC (ou un autre token enregistré) dans un **vault de staking**.
2. Les rewards s'accumulent avec le temps, proportionnellement au montant staké.
3. L'utilisateur choisit un **projet agricole** enregistré par une association et récupère ses rewards en C2P : **50%** lui reviennent, **50%** sont reversés au projet.
4. Les prix (USDC/USD et autres paires) sont récupérés de manière sécurisée via **Chainlink**.

## Architecture

Le protocole est en cours de modernisation vers des standards DeFi plus composables (vaults tokenisés, liquidité on-chain).

| Contrat | Rôle |
|---|---|
| `TokenFarm.sol` | Tokens ERC-20 : **C2P** (reward), **USDC** et **ETH** (mocks stakables) |
| `ProjectsFarm.sol` | Registre des associations et des projets agricoles qu'elles portent |
| `StakingVault.sol` | Vault **ERC-4626** par token stakable : dépôt/retrait standard, parts transférables (`sUSDC`...), accrual des rewards dans le temps |
| `StakingVaultFactory.sol` | Déploie et administre les vaults (un par token stakable) |
| `Staking.sol` | Orchestrateur : calcule la valeur des rewards via Chainlink et exécute le partage 50/50 staker/projet |

### Roadmap DeFi

- [x] Vaults ERC-4626 pour les positions de staking (composables, transférables)
- [ ] Frontend branché sur la nouvelle architecture par vaults

Un AMM (paire C2P/USDC) a été envisagé pour donner un marché on-chain au C2P, mais mis de côté pour l'instant.

## Stack technique

**Backend** — Solidity, [OpenZeppelin](https://openzeppelin.com/), [Chainlink](https://chain.link/), [Hardhat](https://hardhat.org/)

**Frontend** — [Next.js](https://nextjs.org/) / React, [RainbowKit](https://www.rainbowkit.com/) + [Chakra UI](https://chakra-ui.com/), [Wagmi](https://wagmi.sh/) / [Viem](https://viem.sh/)

## Installation

```bash
git clone https://github.com/ThibautBaudry/Coup2Pousse.git
cd Coup2Pousse

cd backend && npm install
cd ../frontend && npm install
```

## Variables d'environnement

**`backend/.env`**

| Variable | Description |
|---|---|
| `SEPOLIA_RPC_URL` | URL RPC du réseau Sepolia (Alchemy, Infura...) |
| `PRIVATE_KEY` | Clé privée du compte de déploiement |
| `ETHERSCAN_API_KEY` | Clé API pour la vérification des contrats |

**`frontend/.env`**

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_ALCHEMY_RPC` | URL RPC utilisée par le frontend |
| `NEXT_PUBLIC_WALLET_CONNECT_ID` | Project ID WalletConnect (RainbowKit) |

## Backend — tests, coverage, déploiement

```bash
cd backend

npx hardhat compile          # compiler les contrats
npx hardhat test             # lancer la suite de tests
REPORT_GAS=true npx hardhat test   # + rapport de gas
npx hardhat coverage         # rapport de couverture (backend/coverage/index.html)

npx hardhat node             # nœud local pour le développement
npx hardhat run scripts/deploy.js --network localhost   # déploiement local
npx hardhat run scripts/deploy.js --network sepolia      # déploiement Sepolia
```

## Frontend — développement local

```bash
cd frontend
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Structure du repo

```
backend/
  contracts/       # contrats Solidity
  scripts/         # scripts de déploiement
  test/unit/       # tests unitaires Hardhat
  ignition/        # modules de déploiement Hardhat Ignition

frontend/
  app/              # pages Next.js (App Router)
  components/       # composants React (staking, projets, associations...)
  constants/        # adresses et ABI des contrats déployés
  utils/            # helpers wagmi/viem
```

## Screenshots

![App Screenshot](https://github.com/ThibautBaudry/Coup2Pousse/blob/main/App.png)

## Auteur

- [@ThibautBaudry](https://github.com/ThibautBaudry/)

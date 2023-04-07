# P2P NFT Lending Borrowing Platform by @uok825
 It allows users to create and cancel borrow requests, lend requests, payback requests (with or without interest), and even liquidate requests. This platform represents a trustless and transparent lending environment, empowering users to leverage their NFTs securely and efficiently
Video: https://www.loom.com/share/6df4f1b9e995410ba793b9ac6acf58e3
## Requirements

Before you begin, you need to install the following tools:
- [Node (v18 LTS)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Deployment

1. Create an .env file using the .env.example file as a template.

2. Clone this repo & install dependencies

```
git clone https://github.com/uok825/p2p-nft-lending.git
cd se-2
yarn install
```

3. App is setup to deploy on sepolia. To deploy and start the app.

```bash
  yarn deploy
  yarn start
```

# Acknowledgements

- [ScaffoldETH v2](https://github.com/scaffold-eth/se-2)
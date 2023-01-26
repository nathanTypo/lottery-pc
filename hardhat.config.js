require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("hardhat-contract-sizer")
require("dotenv").config()

const PRIVATE_KEY_ACC1 = process.env.PRIVATE_KEY_ACC1 || ""
const PRIVATE_KEY_ACC2 = process.env.PRIVATE_KEY_ACC2 || ""
const PRIVATE_KEY_ACC3 = process.env.PRIVATE_KEY_ACC3 || ""
const PRIVATE_KEY_ACC4 = process.env.PRIVATE_KEY_ACC4 || ""

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || ""
const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || ""
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL || ""
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || ""

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
            // gasPrice: 130000000000,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            //accounts: Thanks hardhat, we have all thing set for us
            chainId: 31337,
            blockConfirmations: 1,
        },
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY_ACC1, PRIVATE_KEY_ACC2, PRIVATE_KEY_ACC3, PRIVATE_KEY_ACC4],
            chainId: 5,
            blockConfirmations: 6, //Given etherscan a time to index our transaction
        },

        ethereum: {
            url: ETHEREUM_RPC_URL,
            accounts: [PRIVATE_KEY_ACC1, PRIVATE_KEY_ACC2, PRIVATE_KEY_ACC3, PRIVATE_KEY_ACC4],
            chainId: 1,
        },

        mumbai: {
            url: MUMBAI_RPC_URL,
            accounts: [PRIVATE_KEY_ACC1, PRIVATE_KEY_ACC2, PRIVATE_KEY_ACC3, PRIVATE_KEY_ACC4],
            chainId: 80001,
            blockConfirmations: 6,
        },

        polygon: {
            url: POLYGON_RPC_URL,
            accounts: [PRIVATE_KEY_ACC1, PRIVATE_KEY_ACC2, PRIVATE_KEY_ACC3, PRIVATE_KEY_ACC4],
            chainId: 137,
        },
    },

    solidity: {
        compilers: [
            {
                version: "0.6.6",
            },
            {
                version: "0.8.8",
            },
            {
                version: "0.8.17",
            },
        ],
    },

    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },

    gasReporter: {
        enabled: true, //false if you dont want to work with
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH", // if nothing it default to eth network(ETH), try with MATIC to see how it const on Polygonor ROSE
    },

    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
            5: 0, // first account on Goerli
            137: 0, //first account on polygon
            80001: 0, // first account on Mumbai
        },

        account1: {
            default: 1,
            1: 1,
            5: 1,
            137: 1,
            80001: 1,
        },

        account2: {
            default: 2,
            1: 2,
            5: 2,
            137: 2,
            80001: 2,
        },

        account3: {
            default: 3,
            1: 3,
            5: 3,
            137: 3,
            80001: 3,
        },
    },

    mocha: {
        timeout: 1000000, //500 seconds max
    },
}

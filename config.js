// CoinRush Network Configuration
// Public RPC endpoints only.
// Never put private keys or seed phrases here.

const COINRUSH_CONFIG = {

    appName: "CoinRush",

    networks: {

        bnb: {
            name: "BNB Smart Chain",
            symbol: "BNB",
            chainId: 56,
            hexChainId: "0x38",
            rpcUrls: [
                "https://bsc-dataseed.binance.org/"
            ],
            explorer:
                "https://bscscan.com/"
        },

        solana: {
            name: "Solana",
            symbol: "SOL",
            rpcUrls: [
                "https://api.mainnet-beta.solana.com"
            ],
            explorer:
                "https://solscan.io/"
        }

    },

    security: {

        neverRequestSeedPhrase: true,

        neverRequestPrivateKey: true,

        nonCustodial: true

    }

};


// Make configuration available to app.js
window.COINRUSH_CONFIG = COINRUSH_CONFIG;

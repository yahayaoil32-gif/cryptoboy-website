// CoinRush Solana Chain Manager

const CoinRushSolana = {

    rpc:
        "https://api.mainnet-beta.solana.com",

    symbol: "SOL",

    decimals: 9,

    explorer:
        "https://solscan.io/",


    async request(method, params = []) {

        const response = await fetch(
            this.rpc,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: 1,
                    method: method,
                    params: params
                })
            }
        );

        const data =
            await response.json();

        if (data.error) {
            throw new Error(
                data.error.message ||
                "Solana RPC error"
            );
        }

        return data.result;
    },


    async getBalance(address) {

        if (!address) {
            return 0;
        }

        const result =
            await this.request(
                "getBalance",
                [address]
            );

        const lamports =
            result.value || 0;

        return lamports / 1000000000;
    },


    async getLatestBlockhash() {

        const result =
            await this.request(
                "getLatestBlockhash",
                [
                    {
                        commitment: "confirmed"
                    }
                ]
            );

        return result.value;
    },


    async getTransaction(signature) {

        return await this.request(
            "getTransaction",
            [
                signature,
                {
                    encoding: "jsonParsed",
                    maxSupportedTransactionVersion: 0
                }
            ]
        );
    },


    explorerAddress(address) {

        return (
            this.explorer +
            "account/" +
            address
        );
    },


    explorerTransaction(signature) {

        return (
            this.explorer +
            "tx/" +
            signature
        );
    }

};


// Make available to CoinRush
window.CoinRushSolana =
    CoinRushSolana;

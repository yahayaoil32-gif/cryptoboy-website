// CoinRush BNB Chain Manager

const CoinRushBNB = {

    chainId: 56,

    rpc:
        "https://bsc-dataseed.binance.org/",

    explorer:
        "https://bscscan.com/",

    symbol: "BNB",

    decimals: 18,


    async getBlockNumber() {

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
                    method: "eth_blockNumber",
                    params: []
                })
            }
        );

        const data =
            await response.json();

        return parseInt(
            data.result,
            16
        );
    },


    async getBalance(address) {

        if (!address) {
            return "0";
        }

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
                    method: "eth_getBalance",
                    params: [
                        address,
                        "latest"
                    ]
                })
            }
        );

        const data =
            await response.json();

        if (!data.result) {
            return "0";
        }

        const wei =
            BigInt(data.result);

        const whole =
            wei / 1000000000000000000n;

        const fraction =
            wei % 1000000000000000000n;

        const decimals =
            fraction
                .toString()
                .padStart(18, "0")
                .slice(0, 6);

        return whole + "." + decimals;
    },


    explorerAddress(address) {

        return (
            this.explorer +
            "address/" +
            address
        );
    },


    explorerTransaction(hash) {

        return (
            this.explorer +
            "tx/" +
            hash
        );
    }

};


// Make available to CoinRush
window.CoinRushBNB =
    CoinRushBNB;

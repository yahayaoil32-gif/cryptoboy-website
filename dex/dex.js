// CoinRush DEX Manager
// Quote and routing foundation for BNB + Solana.
// No transaction is signed or sent automatically.

const CoinRushDEX = {

    async getSolanaQuote(
        inputMint,
        outputMint,
        amount,
        slippageBps = 50
    ) {

        if (!inputMint || !outputMint) {
            throw new Error(
                "Input and output token mints are required."
            );
        }

        if (!amount || Number(amount) <= 0) {
            throw new Error(
                "Enter a valid amount."
            );
        }

        const url =
            "https://lite-api.jup.ag/swap/v1/quote" +
            "?inputMint=" +
            encodeURIComponent(inputMint) +
            "&outputMint=" +
            encodeURIComponent(outputMint) +
            "&amount=" +
            encodeURIComponent(amount) +
            "&slippageBps=" +
            encodeURIComponent(slippageBps);

        const response =
            await fetch(url);

        if (!response.ok) {
            throw new Error(
                "Jupiter quote request failed."
            );
        }

        return await response.json();
    },


    async getBnbQuote() {

        /*
         * PancakeSwap quote integration will use
         * the official router/SDK configuration.
         *
         * We deliberately do not invent a quote here.
         */

        throw new Error(
            "BNB DEX quote requires PancakeSwap router configuration."
        );
    },


    validateSlippage(slippageBps) {

        const value =
            Number(slippageBps);

        if (!Number.isFinite(value)) {
            return false;
        }

        if (value < 1 || value > 500) {
            return false;
        }

        return true;
    },


    validateBscAddress(address) {

        return /^0x[a-fA-F0-9]{40}$/.test(
            address
        );
    },


    validateSolanaAddress(address) {

        return (
            typeof address === "string" &&
            address.length >= 32 &&
            address.length <= 44
        );
    }

};


// Make available to CoinRush
window.CoinRushDEX =
    CoinRushDEX;

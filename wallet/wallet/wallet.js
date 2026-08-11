// CoinRush Wallet Manager
// Non-custodial wallet connection
// Never request seed phrases or private keys.

const CoinRushWallet = {

    account: null,
    chainId: null,

    async connect() {

        if (!window.ethereum) {
            throw new Error(
                "No EVM wallet detected. Open CoinRush inside a compatible wallet."
            );
        }

        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts"
        });

        if (!accounts || accounts.length === 0) {
            throw new Error("No wallet account selected.");
        }

        this.account = accounts[0];

        this.chainId = await window.ethereum.request({
            method: "eth_chainId"
        });

        this.saveSession();

        return {
            address: this.account,
            chainId: this.chainId
        };
    },


    async getBalance() {

        if (!this.account) {
            return "0";
        }

        const balance = await window.ethereum.request({
            method: "eth_getBalance",
            params: [
                this.account,
                "latest"
            ]
        });

        const wei = BigInt(balance);

        const whole =
            wei / 1000000000000000000n;

        const fraction =
            wei % 1000000000000000000n;

        const decimals =
            fraction
                .toString()
                .padStart(18, "0")
                .slice(0, 4);

        return whole + "." + decimals;
    },


    async switchToBNB() {

        if (!window.ethereum) {
            throw new Error("Wallet not detected.");
        }

        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [
                {
                    chainId: "0x38"
                }
            ]
        });

        this.chainId = "0x38";

        this.saveSession();
    },


    getAddress() {

        return this.account;
    },


    isConnected() {

        return !!this.account;
    },


    saveSession() {

        if (!this.account) return;

        localStorage.setItem(
            "coinrush_wallet",
            JSON.stringify({
                address: this.account,
                chainId: this.chainId
            })
        );
    },


    clearSession() {

        this.account = null;
        this.chainId = null;

        localStorage.removeItem(
            "coinrush_wallet"
        );
    },


    restoreSession() {

        try {

            const saved =
                localStorage.getItem(
                    "coinrush_wallet"
                );

            if (!saved) return null;

            const data =
                JSON.parse(saved);

            this.account =
                data.address || null;

            this.chainId =
                data.chainId || null;

            return data;

        } catch (error) {

            console.error(
                "Wallet session error:",
                error
            );

            return null;
        }
    },


    listen() {

        if (!window.ethereum) return;

        window.ethereum.on(
            "accountsChanged",
            accounts => {

                if (!accounts.length) {

                    this.clearSession();

                    window.dispatchEvent(
                        new Event("coinrushWalletDisconnected")
                    );

                    return;
                }

                this.account =
                    accounts[0];

                this.saveSession();

                window.dispatchEvent(
                    new Event("coinrushWalletChanged")
                );
            }
        );


        window.ethereum.on(
            "chainChanged",
            chainId => {

                this.chainId =
                    chainId;

                this.saveSession();

                window.dispatchEvent(
                    new Event("coinrushChainChanged")
                );
            }
        );
    }

};


// Restore previous session
CoinRushWallet.restoreSession();

// Listen for wallet changes
CoinRushWallet.listen();

// Make it available to the rest of CoinRush
window.CoinRushWallet = CoinRushWallet;

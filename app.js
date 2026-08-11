/* CoinRush - app.js
   Wallet connection + BNB Chain + Solana-ready foundation
   Non-custodial: never request seed phrases or private keys.
*/

let currentWallet = null;
let currentProvider = null;
let currentChain = null;

// Supported networks
const CHAINS = {
    bnb: {
        name: "BNB Smart Chain",
        chainId: "0x38",
        symbol: "BNB",
        rpc: "https://bsc-dataseed.binance.org/"
    },

    bnbTestnet: {
        name: "BNB Testnet",
        chainId: "0x61",
        symbol: "tBNB",
        rpc: "https://data-seed-prebsc-1-s1.bnbchain.org:8545/"
    },

    solana: {
        name: "Solana",
        symbol: "SOL"
    }
};


// ------------------------------------
// Utility
// ------------------------------------

function shortAddress(address) {
    if (!address) return "";
    return address.slice(0, 6) + "..." + address.slice(-4);
}

function getElement(id) {
    return document.getElementById(id);
}

function showMessage(message) {
    console.log("[CoinRush]", message);

    const status = getElement("status");

    if (status) {
        status.textContent = message;
    }
}


// ------------------------------------
// Detect wallet
// ------------------------------------

function hasEvmWallet() {
    return typeof window.ethereum !== "undefined";
}

function detectWallet() {

    if (hasEvmWallet()) {
        console.log("EVM wallet detected.");
        return true;
    }

    console.log("No EVM wallet detected.");
    return false;
}


// ------------------------------------
// Connect EVM Wallet
// ------------------------------------

async function connectEVMWallet() {

    if (!hasEvmWallet()) {

        alert(
            "No EVM wallet detected.\n\n" +
            "Open CoinRush inside a compatible wallet browser " +
            "or install a wallet extension."
        );

        return;
    }

    try {

        showMessage("Connecting wallet...");

        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts"
        });

        if (!accounts || accounts.length === 0) {
            throw new Error("No wallet account returned.");
        }

        currentWallet = accounts[0];
        currentProvider = window.ethereum;

        const chainId = await window.ethereum.request({
            method: "eth_chainId"
        });

        currentChain = chainId;

        saveWalletSession();

        await updateWalletUI();

        showMessage(
            "Connected: " + shortAddress(currentWallet)
        );

    } catch (error) {

        console.error(error);

        showMessage("Wallet connection failed.");

        alert(
            "Wallet connection failed:\n" +
            (error.message || error)
        );
    }
}


// ------------------------------------
// Switch to BNB Chain
// ------------------------------------

async function switchToBNB() {

    if (!hasEvmWallet()) {
        alert("No EVM wallet detected.");
        return;
    }

    try {

        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [
                {
                    chainId: CHAINS.bnb.chainId
                }
            ]
        });

        currentChain = CHAINS.bnb.chainId;

        await updateWalletUI();

        showMessage("Connected to BNB Smart Chain.");

    } catch (error) {

        // Chain not added to wallet
        if (error.code === 4902) {

            try {

                await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            chainId: CHAINS.bnb.chainId,
                            chainName: CHAINS.bnb.name,
                            nativeCurrency: {
                                name: "BNB",
                                symbol: "BNB",
                                decimals: 18
                            },
                            rpcUrls: [
                                CHAINS.bnb.rpc
                            ],
                            blockExplorerUrls: [
                                "https://bscscan.com/"
                            ]
                        }
                    ]
                });

                currentChain = CHAINS.bnb.chainId;

                await updateWalletUI();

            } catch (addError) {

                console.error(addError);

                alert(
                    "BNB Chain could not be added."
                );
            }

        } else {

            console.error(error);

            alert(
                "Please switch your wallet to BNB Smart Chain."
            );
        }
    }
}


// ------------------------------------
// Get BNB Balance
// ------------------------------------

async function getBNBBalance(address) {

    if (!hasEvmWallet() || !address) {
        return "0";
    }

    try {

        const balanceHex = await window.ethereum.request({
            method: "eth_getBalance",
            params: [
                address,
                "latest"
            ]
        });

        const balanceWei = BigInt(balanceHex);

        const whole = balanceWei / 1000000000000000000n;
        const fraction =
            balanceWei % 1000000000000000000n;

        const fractionText =
            fraction
                .toString()
                .padStart(18, "0")
                .slice(0, 4);

        return whole.toString() + "." + fractionText;

    } catch (error) {

        console.error("Balance error:", error);

        return "0";
    }
}


// ------------------------------------
// Update Wallet UI
// ------------------------------------

async function updateWalletUI() {

    if (!currentWallet) {
        return;
    }

    const balance = await getBNBBalance(currentWallet);

    const addressElements = [
        "address",
        "addr",
        "paddr",
        "walletAddress"
    ];

    addressElements.forEach(id => {

        const element = getElement(id);

        if (element) {
            element.textContent =
                shortAddress(currentWallet);
        }
    });


    const balanceElements = [
        "balance",
        "wb",
        "ab",
        "pbal",
        "walletBalance"
    ];

    balanceElements.forEach(id => {

        const element = getElement(id);

        if (element) {
            element.textContent =
                balance + " BNB";
        }
    });


    const status = getElement("status");

    if (status) {
        status.textContent =
            "Connected: " +
            shortAddress(currentWallet);
    }


    const receiveAddress =
        getElement("receiveAddr");

    if (receiveAddress) {
        receiveAddress.textContent =
            currentWallet;
    }
}


// ------------------------------------
// Main Connect Button
// ------------------------------------

async function connectWallet() {

    await connectEVMWallet();

}


// ------------------------------------
// Disconnect
// ------------------------------------

function disconnectWallet() {

    currentWallet = null;
    currentProvider = null;
    currentChain = null;

    localStorage.removeItem(
        "coinrush_wallet"
    );

    showMessage(
        "Wallet disconnected"
    );

    const status = getElement("status");

    if (status) {
        status.textContent =
            "Wallet not connected";
    }

    const balanceElements = [
        "balance",
        "wb",
        "ab",
        "pbal",
        "walletBalance"
    ];

    balanceElements.forEach(id => {

        const element = getElement(id);

        if (element) {
            element.textContent =
                "0 BNB";
        }
    });
}


// ------------------------------------
// Save wallet session
// ------------------------------------

function saveWalletSession() {

    if (!currentWallet) return;

    localStorage.setItem(
        "coinrush_wallet",
        JSON.stringify({
            address: currentWallet,
            chain: currentChain
        })
    );
}


// ------------------------------------
// Load previous session
// ------------------------------------

function loadWalletSession() {

    try {

        const saved =
            localStorage.getItem(
                "coinrush_wallet"
            );

        if (!saved) return;

        const data =
            JSON.parse(saved);

        if (data.address) {

            currentWallet =
                data.address;

            currentChain =
                data.chain || null;

            console.log(
                "Previous wallet session found:",
                shortAddress(currentWallet)
            );
        }

    } catch (error) {

        console.error(
            "Session error:",
            error
        );
    }
}


// ------------------------------------
// Wallet events
// ------------------------------------

function listenWalletEvents() {

    if (!window.ethereum) return;

    window.ethereum.on(
        "accountsChanged",
        async accounts => {

            if (!accounts.length) {

                disconnectWallet();
                return;
            }

            currentWallet =
                accounts[0];

            await updateWalletUI();
        }
    );


    window.ethereum.on(
        "chainChanged",
        async chainId => {

            currentChain =
                chainId;

            await updateWalletUI();
        }
    );
}


// ------------------------------------
// Trending token system
// ------------------------------------
// Real token data will be connected through
// the API module later.

const trendingTokens = [];

function renderTrendingTokens(tokens) {

    const container =
        getElement("trending");

    if (!container) {
        console.log(
            "Trending container not found."
        );
        return;
    }

    container.innerHTML = "";

    if (!tokens || tokens.length === 0) {

        container.innerHTML = `
            <div class="empty">
                No live tokens available yet.
            </div>
        `;

        return;
    }

    tokens.forEach(token => {

        const item =
            document.createElement("div");

        item.className =
            "token-item";

        item.innerHTML = `
            <div>
                <strong>
                    ${token.name || "Unknown Token"}
                </strong>

                <div>
                    ${token.symbol || ""}
                </div>
            </div>

            <div>
                ${token.price || "--"}
            </div>
        `;

        container.appendChild(item);
    });
}


// ------------------------------------
// App startup
// ------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "CoinRush application started."
        );

        loadWalletSession();

        listenWalletEvents();

        detectWallet();

        // Initial empty trending state
        renderTrendingTokens(
            trendingTokens
        );
    }
);


// ------------------------------------
// Expose functions for HTML buttons
// ------------------------------------

window.CoinRush = {

    connectWallet,
    connectEVMWallet,
    disconnectWallet,
    switchToBNB,
    getBNBBalance,
    renderTrendingTokens

};

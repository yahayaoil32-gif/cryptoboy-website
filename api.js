/* CoinRush API Layer
   Safe frontend API helpers.
   Do NOT put private keys, seed phrases, or admin secrets here.
*/

window.CoinRushAPI = (() => {
  const config = window.COINRUSH_CONFIG || {};

  const API_BASE =
    config.API_BASE_URL ||
    "";

  async function request(path, options = {}) {
    const url = `${API_BASE}${path}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const type = response.headers.get("content-type") || "";

    if (type.includes("application/json")) {
      return response.json();
    }

    return response.text();
  }

  // Trending meme coins
  async function getTrending(chain = "all") {
    try {
      return await request(
        `/api/trending?chain=${encodeURIComponent(chain)}`
      );
    } catch (error) {
      console.warn("Trending API unavailable:", error);
      return [];
    }
  }

  // Transaction history
  async function getHistory(address, chain = "bsc") {
    if (!address) return [];

    try {
      return await request(
        `/api/history?address=${encodeURIComponent(address)}&chain=${encodeURIComponent(chain)}`
      );
    } catch (error) {
      console.warn("History API unavailable:", error);
      return [];
    }
  }

  // User rewards
  async function getRewards(address) {
    if (!address) {
      return {
        tradingRewards: 0,
        referralRewards: 0,
        totalRewards: 0
      };
    }

    try {
      return await request(
        `/api/rewards?address=${encodeURIComponent(address)}`
      );
    } catch (error) {
      console.warn("Rewards API unavailable:", error);

      return {
        tradingRewards: 0,
        referralRewards: 0,
        totalRewards: 0
      };
    }
  }

  // Referral information
  async function getReferral(address) {
    if (!address) return null;

    try {
      return await request(
        `/api/referral?address=${encodeURIComponent(address)}`
      );
    } catch (error) {
      console.warn("Referral API unavailable:", error);
      return null;
    }
  }

  // Portfolio data
  async function getPortfolio(address, chain = "all") {
    if (!address) return null;

    try {
      return await request(
        `/api/portfolio?address=${encodeURIComponent(address)}&chain=${encodeURIComponent(chain)}`
      );
    } catch (error) {
      console.warn("Portfolio API unavailable:", error);
      return null;
    }
  }

  // Record a verified trade.
  // The backend must verify the blockchain transaction itself.
  async function recordTrade(data) {
    if (!data || !data.txHash || !data.address) {
      throw new Error("Missing verified transaction information.");
    }

    return request("/api/trades", {
      method: "POST",
      body: JSON.stringify({
        address: data.address,
        txHash: data.txHash,
        chain: data.chain || "bsc"
      })
    });
  }

  // Reward withdrawal request.
  // Backend must perform eligibility checks.
  async function requestRewardWithdrawal(address, amount) {
    if (!address || !amount || Number(amount) <= 0) {
      throw new Error("Invalid reward withdrawal request.");
    }

    return request("/api/rewards/withdraw", {
      method: "POST",
      body: JSON.stringify({
        address,
        amount: Number(amount)
      })
    });
  }

  return {
    request,
    getTrending,
    getHistory,
    getRewards,
    getReferral,
    getPortfolio,
    recordTrade,
    requestRewardWithdrawal
  };
})();

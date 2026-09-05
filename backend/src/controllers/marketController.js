const {
    getMarketData
} = require("../services/marketData/marketDataService");

const getLatestMarketData = async (req, res) => {
    try {
        const { symbol } = req.params;

        if (!symbol) {
            return res.status(400).json({
                message: "Stock symbol is required"
            });
        }

        const marketData = await getMarketData(symbol);

        res.status(200).json({
            marketData
        });

    } catch (error) {
        console.error("Market data error:", error.message);

        res.status(503).json({
            message: "Market data currently unavailable"
        });
    }
};

module.exports = {
    getLatestMarketData
};
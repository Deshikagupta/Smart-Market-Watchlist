const Watchlist = require("../models/Watchlist");

// Add a stock to user's watchlist
const addToWatchlist = async (req, res) => {
    try {
        const { symbol, companyName } = req.body;

        if (!symbol || !companyName) {
            return res.status(400).json({
                message: "Please provide stock symbol and company name"
            });
        }

        const normalizedSymbol = symbol.trim().toUpperCase();

        // Prevent duplicate stocks for the same user
        const existingStock = await Watchlist.findOne({
            user: req.user._id,
            symbol: normalizedSymbol
        });

        if (existingStock) {
            return res.status(409).json({
                message: "Stock already exists in your watchlist"
            });
        }

        const stock = await Watchlist.create({
            user: req.user._id,
            symbol: normalizedSymbol,
            companyName: companyName.trim()
        });

        res.status(201).json({
            message: "Stock added to watchlist",
            stock
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to add stock",
            error: error.message
        });
    }
};


// Get user's watchlist
const getWatchlist = async (req, res) => {
    try {
        const watchlist = await Watchlist.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            count: watchlist.length,
            watchlist
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch watchlist",
            error: error.message
        });
    }
};


// Remove a stock from user's watchlist
const removeFromWatchlist = async (req, res) => {
    try {
        const symbol = req.params.symbol.trim().toUpperCase();

        const stock = await Watchlist.findOneAndDelete({
            user: req.user._id,
            symbol
        });

        if (!stock) {
            return res.status(404).json({
                message: "Stock not found in your watchlist"
            });
        }

        res.status(200).json({
            message: "Stock removed from watchlist"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to remove stock",
            error: error.message
        });
    }
};


module.exports = {
    addToWatchlist,
    getWatchlist,
    removeFromWatchlist
};
const mongoose = require("mongoose");

const watchlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        symbol: {
            type: String,
            required: true,
            uppercase: true,
            trim: true
        },

        companyName: {
            type: String,
            required: true,
            trim: true
        },

        lastCheckedPrice: {
            type: Number,
            default: null
        },

        lastCheckedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Same user cannot add the same stock twice
watchlistSchema.index(
    { user: 1, symbol: 1 },
    { unique: true }
);

module.exports = mongoose.model("Watchlist", watchlistSchema);
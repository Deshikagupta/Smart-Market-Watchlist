const mongoose = require("mongoose");

const marketSnapshotSchema = new mongoose.Schema(
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

        price: {
            type: Number,
            required: true
        },

        previousClose: {
            type: Number,
            default: null
        },

        marketState: {
            type: String,
            default: "UNKNOWN"
        },

        capturedAt: {
            type: Date,
            required: true
        },
        dataTimestamp: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

marketSnapshotSchema.index(
    {
        user: 1,
        symbol: 1,
        capturedAt: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "MarketSnapshot",
    marketSnapshotSchema
);
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const watchlistRoutes = require("./routes/watchlistRoutes");

const authRoutes = require("./routes/authRoutes");
const marketRoutes = require("./routes/marketRoutes");
const snapshotRoutes = require("./routes/snapshotRoutes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Smart Market Watchlist API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/snapshot", snapshotRoutes);

module.exports = app;
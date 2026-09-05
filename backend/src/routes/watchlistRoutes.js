const express = require("express");

const {
    addToWatchlist,
    getWatchlist,
    removeFromWatchlist
} = require("../controllers/watchlistController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// All watchlist routes require authentication
router.use(protect);

router.post("/", addToWatchlist);

router.get("/", getWatchlist);

router.delete("/:symbol", removeFromWatchlist);

module.exports = router;
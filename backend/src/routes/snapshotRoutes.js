const express = require("express");

const {
    checkWatchlist,
    acknowledgeWatchlist,
    getSnapshotHistory
} = require("../controllers/snapshotController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/check", checkWatchlist);

router.post("/acknowledge", acknowledgeWatchlist);

router.get("/history/:symbol", getSnapshotHistory);

module.exports = router;
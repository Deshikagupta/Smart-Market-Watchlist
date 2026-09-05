const express = require("express");

const {
    getLatestMarketData
} = require("../controllers/marketController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/:symbol", getLatestMarketData);

module.exports = router;
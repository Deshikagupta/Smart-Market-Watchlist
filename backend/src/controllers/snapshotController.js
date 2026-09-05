const Watchlist = require("../models/Watchlist");
const MarketSnapshot = require("../models/MarketSnapshot");

const {
    getMarketData
} = require("../services/marketData/marketDataService");

const {
    calculateAttention
} = require("../services/attention/attentionService");

const {
    validateMarketData
} = require("../services/dataValidation/dataValidationService");


const checkWatchlist = async (req, res) => {
    try {
        const userId = req.user.id;

        const watchlist = await Watchlist.find({
            user: userId
        });

        if (watchlist.length === 0) {
            return res.status(200).json({
                message: "Watchlist is empty",
                changes: []
            });
        }

        const changes = [];

        for (const stock of watchlist) {

            /*
             * FETCH LATEST MARKET DATA
             */

            const currentData = await getMarketData(
                stock.symbol
            );

            /*
             * VALIDATE MARKET DATA
             */

            const validation = validateMarketData(
                currentData
            );

            /*
             * TIME AT WHICH USER CHECKED THE STOCK
             *
             * This is different from Yahoo's market timestamp.
             * We use this for historical observations so every
             * check can create a separate history entry.
             */

            const checkedAt = new Date();


            /*
             * HANDLE INVALID / STALE DATA
             */

            if (validation.status !== "FRESH") {

                changes.push({

                    symbol:
                        stock.symbol,

                    companyName:
                        stock.companyName,

                    currentPrice:
                        currentData?.price ?? null,

                    previousPrice:
                        stock.lastCheckedPrice ?? null,

                    previousClose:
                        currentData?.previousClose ?? null,

                    currency:
                        currentData?.currency ?? null,

                    exchange:
                        currentData?.exchange ?? null,

                    marketState:
                        currentData?.marketState ?? null,

                    dataTimestamp:
                        currentData?.timestamp ?? null,

                    priceChange:
                        null,

                    priceChangePercent:
                        null,

                    attentionLevel:
                        "LOW",

                    attentionScore:
                        0,

                    reasons: [
                        validation.reason
                    ],

                    dataStatus:
                        validation.status,

                    checkedAt
                });

                continue;
            }


            /*
             * PREVIOUS CHECKPOINT PRICE
             */

            const previousPrice =
                stock.lastCheckedPrice;


            let change;


            /*
             * FIRST CHECK
             */

            if (
                previousPrice === null ||
                previousPrice === undefined
            ) {

                change = {

                    hasChanged:
                        false,

                    isFirstCheck:
                        true,

                    priceChange:
                        null,

                    priceChangePercent:
                        null
                };

            } else {

                /*
                 * CALCULATE PRICE CHANGE
                 */

                const priceChange =
                    currentData.price -
                    previousPrice;


                const priceChangePercent =
                    previousPrice > 0
                        ? (
                            priceChange /
                            previousPrice
                        ) * 100
                        : 0;


                change = {

                    hasChanged:
                        priceChange !== 0,

                    isFirstCheck:
                        false,

                    priceChange,

                    priceChangePercent
                };
            }


            /*
             * CALCULATE ATTENTION
             */

            const attention =
                calculateAttention(change);


            /*
             * SAVE MARKET SNAPSHOT
             *
             * IMPORTANT:
             * capturedAt = actual time when user checked
             *
             * dataTimestamp = timestamp received from Yahoo
             *
             * This allows multiple observations even when
             * Yahoo returns the same market timestamp.
             */

            await MarketSnapshot.create({

                user:
                    userId,

                symbol:
                    stock.symbol,

                price:
                    currentData.price,

                previousClose:
                    currentData.previousClose,

                marketState:
                    currentData.marketState,

                capturedAt:
                    checkedAt
            });


            /*
             * UPDATE WATCHLIST CHECKPOINT
             *
             * This is VERY IMPORTANT.
             *
             * The next check will compare the new Yahoo price
             * against this price.
             */

            stock.lastCheckedPrice =
                currentData.price;

            await stock.save();


            /*
             * ADD RESULT TO RESPONSE
             */

            changes.push({

                symbol:
                    stock.symbol,

                companyName:
                    stock.companyName,

                currentPrice:
                    currentData.price,

                previousPrice,

                previousClose:
                    currentData.previousClose,

                currency:
                    currentData.currency,

                exchange:
                    currentData.exchange,

                marketState:
                    currentData.marketState,

                dataTimestamp:
                    currentData.timestamp,

                priceChange:
                    change.priceChange !== null
                        ? Number(
                            change.priceChange.toFixed(2)
                        )
                        : null,

                priceChangePercent:
                    change.priceChangePercent !== null
                        ? Number(
                            change.priceChangePercent.toFixed(2)
                        )
                        : null,

                attentionLevel:
                    attention.level,

                attentionScore:
                    attention.score,

                reasons:
                    attention.reasons,

                dataStatus:
                    validation.status,

                checkedAt
            });
        }


        /*
         * RETURN RESULT
         */

        return res.status(200).json({

            message:
                "Watchlist checked successfully",

            changes
        });

    } catch (error) {

        console.error(
            "Watchlist check error:",
            error.message
        );

        return res.status(500).json({

            message:
                "Failed to check watchlist",

            error:
                error.message
        });
    }
};


module.exports = {
    checkWatchlist
};


// =====================================================
// ACKNOWLEDGE WATCHLIST
// =====================================================

const acknowledgeWatchlist = async (req, res) => {

    try {

        const userId = req.user.id;

        const watchlist =
            await Watchlist.find({
                user: userId
            });


        if (watchlist.length === 0) {

            return res.status(200).json({

                message:
                    "Watchlist is empty"
            });
        }


        for (const stock of watchlist) {

            const currentData =
                await getMarketData(
                    stock.symbol
                );


            stock.lastCheckedPrice =
                currentData.price;

            stock.lastCheckedAt =
                currentData.timestamp;


            await stock.save();
        }


        return res.status(200).json({

            message:
                "Watchlist acknowledged successfully",

            acknowledgedAt:
                new Date()
        });

    } catch (error) {

        console.error(
            "Watchlist acknowledge error:",
            error.message
        );

        return res.status(500).json({

            message:
                "Failed to acknowledge watchlist"
        });
    }
};


// =====================================================
// SNAPSHOT HISTORY
// =====================================================

const getSnapshotHistory = async (req, res) => {

    try {

        const userId =
            req.user.id;


        const symbol =
            req.params.symbol
                .trim()
                .toUpperCase();


        const snapshots =
            await MarketSnapshot.find({

                user:
                    userId,

                symbol:
                    symbol

            })
                .sort({
                    capturedAt: -1
                })
                .limit(20);


        if (snapshots.length === 0) {

            return res.status(200).json({

                symbol,

                history: []
            });
        }


        const history = [];


        for (
            let i = 0;
            i < snapshots.length;
            i++
        ) {

            const current =
                snapshots[i];


            /*
             * Snapshots are sorted:
             *
             * newest -> oldest
             *
             * Therefore the next item
             * is the previous observation.
             */

            const previous =
                snapshots[i + 1];


            let priceChange = null;

            let priceChangePercent = null;


            if (previous) {

                priceChange =
                    current.price -
                    previous.price;


                priceChangePercent =
                    previous.price > 0
                        ? (
                            priceChange /
                            previous.price
                        ) * 100
                        : 0;


                priceChange =
                    Number(
                        priceChange.toFixed(2)
                    );


                priceChangePercent =
                    Number(
                        priceChangePercent.toFixed(2)
                    );
            }


            history.push({

                capturedAt:
                    current.capturedAt,
                    
                dataTimestamp:
                    current.dataTimestamp,

                previousPrice:
                    previous?.price ?? null,

                currentPrice:
                    current.price,

                priceChange,

                priceChangePercent,

                previousClose:
                    current.previousClose,

                marketState:
                    current.marketState
            });
        }


        return res.status(200).json({

            symbol,

            history
        });

    } catch (error) {

        console.error(
            "Snapshot history error:",
            error.message
        );

        return res.status(500).json({

            message:
                "Failed to fetch snapshot history"
        });
    }
};


module.exports = {

    checkWatchlist,

    acknowledgeWatchlist,

    getSnapshotHistory
};
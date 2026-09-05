const validateMarketData = (marketData) => {

    if (!marketData) {
        return {
            status: "INVALID",
            reason: "Market data is unavailable"
        };
    }

    if (
        typeof marketData.price !== "number" ||
        marketData.price <= 0
    ) {
        return {
            status: "INVALID",
            reason: "Invalid market price"
        };
    }

    if (!marketData.timestamp) {
        return {
            status: "INVALID",
            reason: "Market data timestamp is missing"
        };
    }

    const timestamp = new Date(
        marketData.timestamp
    );

    if (Number.isNaN(timestamp.getTime())) {
        return {
            status: "INVALID",
            reason: "Invalid market data timestamp"
        };
    }

    /*
     * Yahoo Finance provides the timestamp of the
     * latest market quote, not the time at which
     * our backend fetched the data.
     *
     * Therefore, we should not mark a valid quote
     * as stale merely because it is older than
     * five minutes.
     */

    return {
        status: "FRESH",
        reason: null
    };
};

module.exports = {
    validateMarketData
};
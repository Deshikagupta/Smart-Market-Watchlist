const axios = require("axios");

const getMarketData = async (symbol) => {
    const normalizedSymbol = symbol.trim().toUpperCase();
    const yahooSymbol = `${normalizedSymbol}.NS`;

    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`;

        const response = await axios.get(url, {
            params: {
                range: "5d",
                interval: "1d",
                events: "div,splits"
            },
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36"
            },
            timeout: 10000
        });

        const result = response.data?.chart?.result?.[0];

        if (!result) {
            throw new Error(
                `No market data found for ${normalizedSymbol}`
            );
        }

        const meta = result.meta;
        const timestamps = result.timestamp || [];
        const quote = result.indicators?.quote?.[0];

        if (!meta || !quote || timestamps.length === 0) {
            throw new Error(
                `Incomplete market data for ${normalizedSymbol}`
            );
        }

        const prices = quote.close || [];
        const opens = quote.open || [];
        const highs = quote.high || [];
        const lows = quote.low || [];
        const volumes = quote.volume || [];

        // Find the latest valid closing price
        let latestIndex = -1;

        for (let i = prices.length - 1; i >= 0; i--) {
            if (prices[i] !== null && prices[i] !== undefined) {
                latestIndex = i;
                break;
            }
        }

        if (latestIndex === -1) {
            throw new Error(
                `Current price unavailable for ${normalizedSymbol}`
            );
        }

        const price = prices[latestIndex];

        // Find previous valid closing price
        let previousIndex = latestIndex - 1;

        while (
            previousIndex >= 0 &&
            (prices[previousIndex] === null ||
                prices[previousIndex] === undefined)
        ) {
            previousIndex--;
        }

        const previousClose =
            previousIndex >= 0
                ? prices[previousIndex]
                : null;

        const timestamp = timestamps[latestIndex]
            ? new Date(timestamps[latestIndex] * 1000)
            : new Date();

        return {
            symbol: normalizedSymbol,

            providerSymbol: yahooSymbol,

            price,

            previousClose,

            currency:
                meta.currency || "INR",

            exchange:
                meta.fullExchangeName ||
                meta.exchangeName ||
                meta.exchange ||
                "NSE",

            marketState:
                meta.currentTradingPeriod?.regular
                    ? "MARKET DATA"
                    : "N/A",

            open:
                opens[latestIndex] ?? null,

            dayHigh:
                highs[latestIndex] ?? null,

            dayLow:
                lows[latestIndex] ?? null,

            volume:
                volumes[latestIndex] ?? null,

            timestamp
        };

    } catch (error) {
        console.error(
            `Market data error for ${normalizedSymbol}:`,
            error.response?.status || error.message
        );

        throw new Error(
            `Unable to fetch market data for ${normalizedSymbol}`
        );
    }
};

module.exports = {
    getMarketData
};
const YahooFinance = require("yahoo-finance2").default;

const yahooFinance = new YahooFinance();

const getMarketData = async (symbol) => {
    const normalizedSymbol = symbol.trim().toUpperCase();

    const yahooSymbol = `${normalizedSymbol}.NS`;

    try {
        const quote = await yahooFinance.quote(
            yahooSymbol
        );

        if (!quote) {
            throw new Error(
                `No market data found for ${normalizedSymbol}`
            );
        }

        if (
            quote.regularMarketPrice === undefined ||
            quote.regularMarketPrice === null
        ) {
            throw new Error(
                `Current price unavailable for ${normalizedSymbol}`
            );
        }

        return {
            symbol: normalizedSymbol,

            providerSymbol: yahooSymbol,

            price: quote.regularMarketPrice,

            previousClose:
                quote.regularMarketPreviousClose ??
                quote.previousClose ??
                null,

            currency:
                quote.currency ?? "INR",

            exchange:
                quote.fullExchangeName ??
                quote.exchange ??
                null,

            marketState:
                quote.marketState === "POSTPOST"
                    ? "POST MARKET"
                    : quote.marketState === "PRE"
                        ? "PRE MARKET"
                            : quote.marketState === "REGULAR"
                                ? "MARKET OPEN"
                                : quote.marketState ?? "N/A",

            open:
                quote.regularMarketOpen ??
                null,

            dayHigh:
                quote.regularMarketDayHigh ??
                null,

            dayLow:
                quote.regularMarketDayLow ??
                null,

            volume:
                quote.regularMarketVolume ??
                null,

            timestamp:
                quote.regularMarketTime
                    ? new Date(
                        quote.regularMarketTime
                    )
                    : new Date()
        };

    } catch (error) {

        console.error(
            `Market data error for ${normalizedSymbol}:`,
            error.message
        );

        throw new Error(
            `Unable to fetch market data for ${normalizedSymbol}`
        );
    }
};

module.exports = {
    getMarketData
};
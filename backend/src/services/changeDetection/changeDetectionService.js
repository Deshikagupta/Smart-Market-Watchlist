const calculateChange = (previousSnapshot, currentData) => {
    // First time checking this stock
    if (!previousSnapshot) {
        return {
            hasChanged: false,
            isFirstCheck: true,
            priceChange: null,
            priceChangePercent: null
        };
    }

    const priceChange =
        currentData.price - previousSnapshot.price;

    const priceChangePercent =
        previousSnapshot.price > 0
            ? (priceChange / previousSnapshot.price) * 100
            : 0;

    return {
        hasChanged: priceChange !== 0,
        isFirstCheck: false,
        priceChange,
        priceChangePercent
    };
};

module.exports = {
    calculateChange
};
const calculateAttention = ({
    priceChangePercent,
    isFirstCheck
}) => {

    // =========================================================
    // FIRST CHECK
    // =========================================================

    // No previous checkpoint exists, so there is
    // nothing meaningful to compare against.
    if (isFirstCheck) {
        return {
            level: "LOW",
            score: 0,
            reasons: [
                "First market check"
            ]
        };
    }


    // =========================================================
    // VALIDATION
    // =========================================================

    if (
        priceChangePercent === null ||
        priceChangePercent === undefined ||
        Number.isNaN(Number(priceChangePercent))
    ) {
        return {
            level: "LOW",
            score: 0,
            reasons: [
                "Price movement could not be calculated"
            ]
        };
    }


    // =========================================================
    // PRICE MOVEMENT
    // =========================================================

    const change = Math.abs(
        Number(priceChangePercent)
    );

    const direction =
        Number(priceChangePercent) > 0
            ? "increased"
            : Number(priceChangePercent) < 0
                ? "decreased"
                : "remained unchanged";


    // =========================================================
    // HIGH ATTENTION
    // =========================================================

    if (change >= 5) {
        return {
            level: "HIGH",
            score: 3,
            reasons: [
                `Price ${direction} by ${change.toFixed(2)}% since last check`,
                "Significant market movement detected"
            ]
        };
    }


    // =========================================================
    // MEDIUM ATTENTION
    // =========================================================

    if (change >= 2) {
        return {
            level: "MEDIUM",
            score: 2,
            reasons: [
                `Price ${direction} by ${change.toFixed(2)}% since last check`,
                "Moderate market movement detected"
            ]
        };
    }


    // =========================================================
    // LOW ATTENTION
    // =========================================================

    if (change > 0) {
        return {
            level: "LOW",
            score: 1,
            reasons: [
                `Small price movement of ${change.toFixed(2)}%`
            ]
        };
    }


    // =========================================================
    // NO MOVEMENT
    // =========================================================

    return {
        level: "LOW",
        score: 0,
        reasons: [
            "No price movement since last check"
        ]
    };
};


module.exports = {
    calculateAttention
};
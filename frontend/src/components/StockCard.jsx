import AttentionBadge from "./AttentionBadge";

function StockCard({ stock, onDelete }) {
    const hasChange = stock.priceChange !== null;

    const isPositive =
        hasChange && stock.priceChange > 0;

    const isNegative =
        hasChange && stock.priceChange < 0;

   
    return (
    <article className="stock-card">

        {/* ================= HEADER ================= */}

        <div className="stock-card-header">

            <div>
                <h3 className="stock-symbol">
                    {stock.symbol}
                </h3>

                <p className="company-name">
                    {stock.companyName}
                </p>
            </div>

            <AttentionBadge
                level={stock.attentionLevel}
            />

        </div>


        {/* ================= CURRENT PRICE ================= */}

        <div className="stock-price-section">

            <span className="price-label">
                Current Price
            </span>

            <span className="current-price">
                {stock.currentPrice !== null &&
                stock.currentPrice !== undefined
                    ? `₹${Number(
                        stock.currentPrice
                    ).toFixed(2)}`
                    : "N/A"
                }
            </span>

        </div>


        {/* ================= MAIN METRICS ================= */}

        <div className="stock-metrics">

            {/* Previous Price */}

            <div className="metric">

                <span className="metric-label">
                    Previous Price
                </span>

                <span className="metric-value">

                    {stock.previousPrice !== null &&
                    stock.previousPrice !== undefined
                        ? `₹${Number(
                            stock.previousPrice
                        ).toFixed(2)}`
                        : "N/A"
                    }

                </span>

            </div>


            {/* Price Change */}

            <div className="metric">

                <span className="metric-label">
                    Price Change
                </span>

                <span
                    className={`metric-value ${
                        isPositive
                            ? "positive"
                            : isNegative
                                ? "negative"
                                : ""
                    }`}
                >

                    {hasChange
                        ? `${isPositive ? "+" : ""}₹${Number(
                            stock.priceChange
                        ).toFixed(2)}`
                        : "N/A"
                    }

                </span>

            </div>


            {/* Percentage Change */}

            <div className="metric">

                <span className="metric-label">
                    Percentage Change
                </span>

                <span
                    className={`metric-value ${
                        isPositive
                            ? "positive"
                            : isNegative
                                ? "negative"
                                : ""
                    }`}
                >

                    {stock.priceChangePercent !== null &&
                    stock.priceChangePercent !== undefined
                        ? `${isPositive ? "+" : ""}${Number(
                            stock.priceChangePercent
                        ).toFixed(2)}%`
                        : "N/A"
                    }

                </span>

            </div>


            {/* Attention Score */}

            <div className="metric">

                <span className="metric-label">
                    Attention Score
                </span>

                <span className="metric-value">
                    {stock.attentionScore ?? 0}
                </span>

            </div>

        </div>


        {/* ================= MARKET INFORMATION ================= */}

        <div className="stock-metrics">

            {/* Previous Close */}

            <div className="metric">

                <span className="metric-label">
                    Previous Close
                </span>

                <span className="metric-value">

                    {stock.previousClose !== null &&
                    stock.previousClose !== undefined
                        ? `₹${Number(
                            stock.previousClose
                        ).toFixed(2)}`
                        : "N/A"
                    }

                </span>

            </div>


            {/* Exchange */}

            <div className="metric">

                <span className="metric-label">
                    Exchange
                </span>

                <span className="metric-value">
                    {stock.exchange || "N/A"}
                </span>

            </div>


            {/* Currency */}

            <div className="metric">

                <span className="metric-label">
                    Currency
                </span>

                <span className="metric-value">
                    {stock.currency || "N/A"}
                </span>

            </div>


            {/* Market State */}

            <div className="metric">

                <span className="metric-label">
                    Market State
                </span>

                <span className="metric-value">
                    {stock.marketState || "N/A"}
                </span>

            </div>

        </div>


        {/* ================= ATTENTION REASONS ================= */}

        {stock.reasons &&
            stock.reasons.length > 0 && (

                <div className="attention-reasons">

                    <span className="reasons-title">
                        Attention Factors
                    </span>

                    <ul>

                        {stock.reasons.map(
                            (reason, index) => (
                                <li key={index}>
                                    {reason}
                                </li>
                            )
                        )}

                    </ul>

                </div>
            )
        }


        {/* ================= DATA STATUS ================= */}

        {stock.dataStatus && (

            <div className="data-status">

                <span className="metric-label">
                    Data Status
                </span>

                <span className="metric-value">
                    {stock.dataStatus}
                </span>

            </div>

        )}


        {/* ================= FOOTER ================= */}

        <div className="stock-card-footer">

            <span className="checked-time">

                Last checked:{" "}

                {stock.checkedAt
                    ? new Date(
                        stock.checkedAt
                    ).toLocaleTimeString()
                    : "N/A"
                }

            </span>


            <button
                className="remove-button"
                onClick={() =>
                    onDelete(stock.symbol)
                }
            >
                Remove
            </button>

        </div>

    </article>
);
}

export default StockCard;
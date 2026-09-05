import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import apiRequest from "../services/api";
import StockCard from "../components/StockCard";

import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();

    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [symbol, setSymbol] = useState("");
    const [companyName, setCompanyName] = useState("");

    const [adding, setAdding] = useState(false);

    const [history, setHistory] = useState({});

    const user = JSON.parse(localStorage.getItem("user"));

    // =========================================================
    // FETCH WATCHLIST
    // =========================================================

    const fetchWatchlist = async () => {
        const data = await apiRequest("/snapshot/check");

        return data;
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        let cancelled = false;

        const loadInitialWatchlist = async () => {
            try {
                const data = await fetchWatchlist();

                if (!cancelled) {
                    setStocks(data.changes || []);
                    setError("");
                }
            } catch (error) {
                console.error("Dashboard error:", error);

                if (
                    error.message &&
                    error.message.toLowerCase().includes("token")
                ) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");

                    navigate("/");

                    return;
                }

                if (!cancelled) {
                    setError(error.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadInitialWatchlist();

        return () => {
            cancelled = true;
        };
    }, [navigate]);

    // =========================================================
    // LOAD / REFRESH WATCHLIST
    // =========================================================

    const loadWatchlist = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await fetchWatchlist();

            setStocks(data.changes || []);
        } catch (error) {
            console.error("Dashboard error:", error);

            if (
                error.message &&
                error.message.toLowerCase().includes("token")
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/");

                return;
            }

            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // ADD STOCK
    // =========================================================

    const handleAddStock = async (event) => {
        event.preventDefault();

        try {
            setAdding(true);
            setError("");

            await apiRequest("/watchlist", {
                method: "POST",

                body: JSON.stringify({
                    symbol,
                    companyName
                })
            });

            setSymbol("");
            setCompanyName("");

            await loadWatchlist();
        } catch (error) {
            console.error("Add stock error:", error);

            setError(error.message);
        } finally {
            setAdding(false);
        }
    };

    // =========================================================
    // DELETE STOCK
    // =========================================================

    const handleDeleteStock = async (stockSymbol) => {
        try {
            setError("");

            await apiRequest(`/watchlist/${stockSymbol}`, {
                method: "DELETE"
            });

            setHistory((prev) => {
                const updated = {
                    ...prev
                };

                delete updated[stockSymbol];

                return updated;
            });

            await loadWatchlist();
        } catch (error) {
            console.error("Delete stock error:", error);

            setError(error.message);
        }
    };

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
    };

    // =========================================================
    // LOAD PRICE HISTORY
    // =========================================================

    const loadHistory = async (stockSymbol) => {
        try {
            setError("");

            const data = await apiRequest(
                `/snapshot/history/${stockSymbol}`
            );

            setHistory((prev) => ({
                ...prev,

                [stockSymbol]: data.history || []
            }));
        } catch (error) {
            console.error("History error:", error);

            if (
                error.message &&
                error.message.toLowerCase().includes("token")
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/");

                return;
            }

            setError(error.message);
        }
    };

    // =========================================================
    // ACKNOWLEDGE CHANGES
    // =========================================================

    const handleAcknowledge = async () => {
        try {
            setError("");

            await apiRequest("/snapshot/acknowledge", {
                method: "POST"
            });

            await loadWatchlist();
        } catch (error) {
            console.error("Acknowledge error:", error);

            if (
                error.message &&
                error.message.toLowerCase().includes("token")
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/");

                return;
            }

            setError(error.message);
        }
    };

    // =========================================================
    // RETURN
    // =========================================================

    return (
        <div className="dashboard-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="dashboard-header">

                <div className="brand">

                    <h1 className="brand-title">
                        Smart Market Watchlist
                    </h1>

                    <p className="brand-subtitle">
                        Market monitoring and attention prioritization
                    </p>

                </div>

                <div className="user-section">

                    <span className="welcome-text">
                        Welcome, {user?.name}
                    </span>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="dashboard-main">

                {/* =================================================
                    ADD STOCK
                ================================================= */}

                <section className="add-stock-section">

                    <h2 className="section-title">
                        Add Stock
                    </h2>

                    <p className="section-description">
                        Add a stock to your personal market watchlist.
                    </p>

                    <form
                        className="add-stock-form"
                        onSubmit={handleAddStock}
                    >

                        <input
                            className="form-input"
                            type="text"
                            placeholder="Stock symbol"
                            value={symbol}
                            onChange={(event) =>
                                setSymbol(
                                    event.target.value.toUpperCase()
                                )
                            }
                            required
                        />

                        <input
                            className="form-input"
                            type="text"
                            placeholder="Company name"
                            value={companyName}
                            onChange={(event) =>
                                setCompanyName(event.target.value)
                            }
                            required
                        />

                        <button
                            className="primary-button"
                            type="submit"
                            disabled={adding}
                        >
                            {adding
                                ? "Adding..."
                                : "Add Stock"
                            }
                        </button>

                    </form>

                </section>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                {/* =================================================
                    WATCHLIST
                ================================================= */}

                <section className="watchlist-section">

                    <div className="watchlist-header">

                        <h2 className="watchlist-title">
                            Your Watchlist
                        </h2>

                        <div className="watchlist-actions">

                            <button
                                className="secondary-button"
                                onClick={loadWatchlist}
                                disabled={loading}
                            >
                                {loading
                                    ? "Checking..."
                                    : "Check for Changes"
                                }
                            </button>

                            <button
                                className="secondary-button"
                                onClick={handleAcknowledge}
                                disabled={
                                    loading ||
                                    stocks.length === 0
                                }
                            >
                                Acknowledge Changes
                            </button>

                        </div>

                    </div>


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {loading && (
                        <div className="status-message">
                            Checking market changes...
                        </div>
                    )}


                    {/* =================================================
                        EMPTY WATCHLIST
                    ================================================= */}

                    {!loading &&
                        !error &&
                        stocks.length === 0 && (

                            <div className="status-message">
                                Your watchlist is empty.
                            </div>

                        )}


                    {/* =================================================
                        STOCK GRID
                    ================================================= */}

                    {!loading &&
                        stocks.length > 0 && (

                            <div className="stock-grid">

                                {stocks.map((stock) => (

                                    <div
                                        key={stock.symbol}
                                        className="stock-wrapper"
                                    >

                                        {/* =================================
                                            STOCK CARD
                                        ================================= */}

                                        <StockCard
                                            stock={stock}
                                            onDelete={
                                                handleDeleteStock
                                            }
                                        />


                                        {/* =================================
                                            HISTORY BUTTON
                                        ================================= */}

                                        <button
                                            className="history-button"
                                            onClick={() =>
                                                loadHistory(
                                                    stock.symbol
                                                )
                                            }
                                        >
                                            {history[stock.symbol]
                                                ? "Refresh History"
                                                : "View History"
                                            }
                                        </button>


                                        {/* =================================
                                            PRICE HISTORY
                                        ================================= */}

                                        {history[stock.symbol] && (

                                            <section className="price-history-section">

                                                {/* =========================
                                                    HISTORY HEADER
                                                ========================= */}

                                                <div className="history-header">

                                                    <div>

                                                        <h2 className="history-title">
                                                            Price History
                                                        </h2>

                                                        <p className="history-subtitle">
                                                            Historical market
                                                            observations for{" "}
                                                            <strong>
                                                                {stock.symbol}
                                                            </strong>
                                                        </p>

                                                    </div>

                                                    <button
                                                        className="refresh-history-button"
                                                        onClick={() =>
                                                            loadHistory(
                                                                stock.symbol
                                                            )
                                                        }
                                                    >
                                                        Refresh History
                                                    </button>

                                                </div>


                                                {/* =========================
                                                    EMPTY HISTORY
                                                ========================= */}

                                                {history[stock.symbol]
                                                    .length === 0 ? (

                                                    <div className="empty-history">
                                                        No historical observations
                                                        available.
                                                    </div>

                                                ) : (

                                                    /* =========================
                                                        TABLE CONTAINER
                                                    ========================= */

                                                    <div className="history-table-wrapper">

                                                        <table className="history-table">

                                                            <thead>

                                                                <tr>

                                                                    <th>
                                                                        Date & Time
                                                                    </th>

                                                                    <th>
                                                                        Previous Price
                                                                    </th>

                                                                    <th>
                                                                        Current Price
                                                                    </th>

                                                                    <th>
                                                                        Change
                                                                    </th>

                                                                    <th>
                                                                        Change %
                                                                    </th>

                                                                    <th>
                                                                        Previous Close
                                                                    </th>

                                                                    <th>
                                                                        Market State
                                                                    </th>

                                                                </tr>

                                                            </thead>


                                                            <tbody>

                                                                {history[
                                                                    stock.symbol
                                                                ].map(
                                                                    (
                                                                        item,
                                                                        index
                                                                    ) => {

                                                                        const isPositive =
                                                                            item.priceChange !==
                                                                                null &&
                                                                            item.priceChange >
                                                                                0;

                                                                        const isNegative =
                                                                            item.priceChange !==
                                                                                null &&
                                                                            item.priceChange <
                                                                                0;

                                                                        return (

                                                                            <tr
                                                                                key={`${stock.symbol}-${item.capturedAt}-${index}`}
                                                                            >

                                                                                {/* DATE */}

                                                                                <td className="history-date">

                                                                                    {item.capturedAt
                                                                                        ? new Date(
                                                                                            item.capturedAt
                                                                                        ).toLocaleString(
                                                                                            "en-IN",
                                                                                            {
                                                                                                day: "2-digit",
                                                                                                month: "2-digit",
                                                                                                year: "numeric",
                                                                                                hour: "2-digit",
                                                                                                minute: "2-digit",
                                                                                                second: "2-digit"
                                                                                            }
                                                                                        )
                                                                                        : "N/A"
                                                                                    }

                                                                                </td>


                                                                                {/* PREVIOUS PRICE */}

                                                                                <td>

                                                                                    {item.previousPrice !==
                                                                                        null &&
                                                                                    item.previousPrice !==
                                                                                        undefined
                                                                                        ? `₹${Number(
                                                                                            item.previousPrice
                                                                                        ).toFixed(
                                                                                            2
                                                                                        )}`
                                                                                        : "N/A"
                                                                                    }

                                                                                </td>


                                                                                {/* CURRENT PRICE */}

                                                                                <td>

                                                                                    {item.currentPrice !==
                                                                                        null &&
                                                                                    item.currentPrice !==
                                                                                        undefined
                                                                                        ? `₹${Number(
                                                                                            item.currentPrice
                                                                                        ).toFixed(
                                                                                            2
                                                                                        )}`
                                                                                        : "N/A"
                                                                                    }

                                                                                </td>


                                                                                {/* PRICE CHANGE */}

                                                                                <td
                                                                                    className={
                                                                                        isPositive
                                                                                            ? "positive"
                                                                                            : isNegative
                                                                                                ? "negative"
                                                                                                : ""
                                                                                    }
                                                                                >

                                                                                    {item.priceChange !==
                                                                                    null
                                                                                        ? `${isPositive ? "+" : ""}₹${Number(
                                                                                            item.priceChange
                                                                                        ).toFixed(
                                                                                            2
                                                                                        )}`
                                                                                        : "N/A"
                                                                                    }

                                                                                </td>


                                                                                {/* PERCENTAGE CHANGE */}

                                                                                <td
                                                                                    className={
                                                                                        isPositive
                                                                                            ? "positive"
                                                                                            : isNegative
                                                                                                ? "negative"
                                                                                                : ""
                                                                                    }
                                                                                >

                                                                                    {item.priceChangePercent !==
                                                                                    null
                                                                                        ? `${isPositive ? "+" : ""}${Number(
                                                                                            item.priceChangePercent
                                                                                        ).toFixed(
                                                                                            2
                                                                                        )}%`
                                                                                        : "N/A"
                                                                                    }

                                                                                </td>


                                                                                {/* PREVIOUS CLOSE */}

                                                                                <td>

                                                                                    {item.previousClose !==
                                                                                        null &&
                                                                                    item.previousClose !==
                                                                                        undefined
                                                                                        ? `₹${Number(
                                                                                            item.previousClose
                                                                                        ).toFixed(
                                                                                            2
                                                                                        )}`
                                                                                        : "N/A"
                                                                                    }

                                                                                </td>


                                                                                {/* MARKET STATE */}

                                                                                <td>

                                                                                    <span className="market-state">

                                                                                        {item.marketState ||
                                                                                            "N/A"
                                                                                        }

                                                                                    </span>

                                                                                </td>

                                                                            </tr>

                                                                        );
                                                                    }
                                                                )}

                                                            </tbody>

                                                        </table>

                                                    </div>

                                                )}

                                            </section>

                                        )}

                                    </div>

                                ))}

                            </div>

                        )}

                </section>

            </main>

        </div>
    );
}

export default Dashboard;
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PriceChart from '../components/charts/PriceChart';
import AccuracyTracker from '../components/charts/AccuracyTracker';
import PredictionHistory from '../components/charts/PredictionHistory';
import TabsContainer from '../components/ui/TabsContainer';

const API_BASE_URL = 'http://localhost:5000'; // Add API base URL
const AUTO_REFRESH_INTERVAL = 60000; // Refresh price data every 60 seconds

const Predictions = () => {
    const [watchlist, setWatchlist] = useState([]);
    const [selectedCoin, setSelectedCoin] = useState('');
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const refreshTimerRef = useRef(null);

    useEffect(() => {
        // Fetch user's watchlist when component mounts
        fetchWatchlist();

        // Cleanup on unmount
        return () => {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        };
    }, []);

    // Set up auto-refresh when a coin is selected
    useEffect(() => {
        // Clear any existing timer
        if (refreshTimerRef.current) {
            clearInterval(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }

        // If we have a selected coin and auto-refresh is enabled, start the timer
        if (selectedCoin && autoRefresh) {
            refreshTimerRef.current = setInterval(() => {
                console.log(`Auto-refreshing price data for ${selectedCoin}...`);
                getPrediction(selectedCoin, true); // Force refresh
            }, AUTO_REFRESH_INTERVAL);
        }

        return () => {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        };
    }, [selectedCoin, autoRefresh]);

    // Format the last updated time in a user-friendly way
    const getTimeAgo = (timestamp) => {
        if (!timestamp) return 'N/A';

        const now = new Date();
        const updatedTime = new Date(timestamp);
        const diffMs = now - updatedTime;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);

        if (diffSec < 60) {
            return `${diffSec} seconds ago`;
        } else if (diffMin < 60) {
            return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
        } else if (diffHour < 24) {
            return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
        } else {
            return updatedTime.toLocaleString();
        }
    };

    // Toggle auto-refresh
    const toggleAutoRefresh = () => {
        setAutoRefresh(!autoRefresh);
    };

    // Get watchlist items
    const fetchWatchlist = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required - please log in again');
                return;
            }

            const config = {
                headers: {
                    'x-auth-token': token
                }
            };

            const res = await axios.get(`${API_BASE_URL}/api/watchlist`, config);
            setWatchlist(res.data);

            // If there are coins in the watchlist, select the first one by default
            if (res.data.length > 0) {
                setSelectedCoin(res.data[0].coinName);
                getPrediction(res.data[0].coinName);
            }
        } catch (err) {
            console.error('Error fetching watchlist:', err.response?.data || err.message);
            setError('Error fetching watchlist');
        }
    };

    // Force refresh prediction
    const handleRefreshPrediction = () => {
        if (selectedCoin) {
            // Force a refresh by bypassing the cache
            getPrediction(selectedCoin, true);
        }
    };

    // Get prediction for a specific coin
    const getPrediction = async (coinName, forceRefresh = false) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required - please log in again');
                setLoading(false);
                return;
            }

            const config = {
                headers: {
                    'x-auth-token': token
                }
            };

            // Add refresh parameter to force new prediction
            const endpoint = forceRefresh
                ? `${API_BASE_URL}/api/predictions/${coinName}?refresh=true`
                : `${API_BASE_URL}/api/predictions/${coinName}`;

            const res = await axios.get(endpoint, config);
            setPrediction(res.data);
            setLastUpdated(new Date());
            setLoading(false);
        } catch (err) {
            console.error('Error fetching prediction:', err.response?.data || err.message);
            setError('Error fetching prediction');
            setLoading(false);
        }
    };

    // Handle coin selection change
    const handleCoinChange = (e) => {
        const coin = e.target.value;
        setSelectedCoin(coin);
        getPrediction(coin);
    };

    const getTrendClass = (trend) => {
        if (trend === 'Buy') return 'positive';
        if (trend === 'Sell') return 'negative';
        return 'neutral';
    };

    // Format price to USD with appropriate decimal places
    const formatPrice = (price) => {
        if (!price && price !== 0) return 'N/A';

        // Parse price to a number if it's a string
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;

        if (numPrice >= 10000) {
            // For large prices like Bitcoin, show with commas and 0 decimals
            return `$${numPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        } else if (numPrice >= 100) {
            // For medium prices, show with 2 decimal places
            return `$${numPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else if (numPrice >= 1) {
            // For smaller prices like Ethereum, show with 2 decimal places
            return `$${numPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else if (numPrice >= 0.01) {
            // For very small prices, show with 4 decimal places
            return `$${numPrice.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
        } else {
            // For extremely small prices like some altcoins, show with 6 decimal places
            return `$${numPrice.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}`;
        }
    };

    // Format price change percentage
    const formatPriceChange = (percent) => {
        if (percent === null || percent === undefined) return '0.00%';

        // Make sure it's a number
        const numPercent = typeof percent === 'string' ? parseFloat(percent) : percent;

        return numPercent >= 0 ?
            `+${numPercent.toFixed(2)}%` :
            `${numPercent.toFixed(2)}%`;
    };

    return (
        <div className="prediction-container">
            <h1>Zenith AI Predictions</h1>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="prediction-header">
                <div className="prediction-select">
                    <label htmlFor="coinSelect">Select a coin from your watchlist:</label>
                    <select
                        id="coinSelect"
                        className="form-input"
                        value={selectedCoin}
                        onChange={handleCoinChange}
                        disabled={watchlist.length === 0 || loading}
                    >
                        {watchlist.length === 0 ? (
                            <option value="">No coins in watchlist</option>
                        ) : (
                            watchlist.map(coin => (
                                <option key={coin._id} value={coin.coinName}>
                                    {coin.coinName} ({coin.coinSymbol})
                                </option>
                            ))
                        )}
                    </select>
                </div>
                <div className="auto-refresh-toggle">
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={toggleAutoRefresh}
                        />
                        <span className="slider round"></span>
                    </label>
                    <span className="auto-refresh-label">
                        Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
                    </span>
                </div>
                <button
                    className="btn btn-refresh"
                    onClick={handleRefreshPrediction}
                    disabled={loading || !selectedCoin}
                >
                    {loading ? 'Refreshing...' : 'Refresh Now'}
                </button>
            </div>

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading prediction...</p>
                </div>
            ) : (
                <>
                    {prediction && (
                        <div className="prediction-card">
                            <div className="prediction-summary">
                                <div className="prediction-header-row">
                                    <h2>{selectedCoin} Prediction</h2>
                                    <div className={`prediction-badge ${getTrendClass(prediction.predictedTrend)}`}>
                                        {prediction.predictedTrend}
                                    </div>
                                    <div className="refresh-button-container">
                                        <button
                                            className="btn btn-icon-refresh"
                                            onClick={handleRefreshPrediction}
                                            disabled={loading}
                                            title="Refresh price and prediction"
                                        >
                                            <i className="fas fa-sync-alt"></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="price-prediction-container">
                                    <div className="price-card current">
                                        <h3>Current Price</h3>
                                        <div className="price-value">
                                            {formatPrice(prediction.currentPrice)}
                                            <span className="price-badge">
                                                {lastUpdated ? `Updated ${getTimeAgo(lastUpdated)}` :
                                                    `Updated ${getTimeAgo(prediction.timestamp)}`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="price-arrow">
                                        <div className={`arrow ${prediction.priceChangePercent >= 0 ? 'up' : 'down'}`}></div>
                                        <div className="prediction-timeframe">{prediction.timeFrame || '24h'}</div>
                                    </div>

                                    <div className="price-card predicted">
                                        <h3>Predicted Price</h3>
                                        <div className="price-value">{formatPrice(prediction.predictedPrice)}</div>
                                        <div className={`price-change ${prediction.priceChangePercent >= 0 ? 'positive' : 'negative'}`}>
                                            {formatPriceChange(prediction.priceChangePercent)}
                                        </div>
                                    </div>
                                </div>

                                <div className="prediction-confidence-container">
                                    <h3>AI Confidence</h3>
                                    <div className="confidence-meter">
                                        <div
                                            className="confidence-fill"
                                            style={{ width: `${prediction.confidenceScore}%` }}
                                        ></div>
                                        <span className="confidence-value">{prediction.confidenceScore}%</span>
                                    </div>
                                </div>

                                {/* Add price chart component */}
                                <PriceChart prediction={prediction} coinName={selectedCoin} />

                                {/* Add performance tracking tabs */}
                                <TabsContainer
                                    tabs={[
                                        {
                                            label: 'Zenith AI Accuracy',
                                            icon: 'fas fa-chart-pie',
                                            content: (
                                                <AccuracyTracker
                                                    coinName={selectedCoin}
                                                    prediction={prediction}
                                                />
                                            )
                                        },
                                        {
                                            label: 'Prediction History',
                                            icon: 'fas fa-history',
                                            content: (
                                                <PredictionHistory
                                                    coinName={selectedCoin}
                                                    prediction={prediction}
                                                />
                                            )
                                        }
                                    ]}
                                />
                            </div>

                            {prediction.rsi && prediction.macd && prediction.volatility && (
                                <div className="technical-indicators">
                                    <h3>Technical Indicators</h3>
                                    <div className="indicators-grid">
                                        <div className="indicator">
                                            <p className="indicator-label">RSI (14)</p>
                                            <p className="indicator-value">{prediction.rsi.toFixed(2)}</p>
                                            <p className="indicator-desc">
                                                {prediction.rsi < 30 ? 'Oversold' : prediction.rsi > 70 ? 'Overbought' : 'Neutral'}
                                            </p>
                                        </div>
                                        <div className="indicator">
                                            <p className="indicator-label">MACD</p>
                                            <p className="indicator-value">{prediction.macd.toFixed(3)}</p>
                                            <p className="indicator-desc">
                                                {prediction.macd > 0 ? 'Bullish' : 'Bearish'}
                                            </p>
                                        </div>
                                        <div className="indicator">
                                            <p className="indicator-label">Volatility</p>
                                            <p className="indicator-value">{prediction.volatility.toFixed(2)}%</p>
                                            <p className="indicator-desc">
                                                {prediction.volatility < 1 ? 'Low' : prediction.volatility > 2 ? 'High' : 'Medium'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="prediction-analysis">
                                <h3>Detailed Analysis</h3>
                                <p>{prediction.detailedAnalysis ||
                                    `Our AI model ${prediction.predictedTrend === 'Buy'
                                        ? 'suggests this is a good time to buy'
                                        : prediction.predictedTrend === 'Sell'
                                            ? 'indicates this might be a good time to sell'
                                            : 'recommends holding your position'} for ${selectedCoin}.`
                                }</p>
                            </div>

                            <p className="prediction-timestamp">
                                Prediction updated: {new Date(prediction.timestamp).toLocaleString()}
                                <button
                                    className="btn btn-sm btn-refresh-inline"
                                    onClick={handleRefreshPrediction}
                                    disabled={loading}
                                >
                                    Refresh
                                </button>
                            </p>
                        </div>
                    )}

                    {watchlist.length === 0 && (
                        <div className="card">
                            <p>You don't have any coins in your watchlist yet. Please add some coins to your watchlist first.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Predictions; 
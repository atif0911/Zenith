import React, { useEffect, useState } from 'react';

const PredictionHistory = ({ coinName, prediction }) => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [stats, setStats] = useState({
        totalCount: 0,
        accurateCount: 0,
        buyCount: 0,
        sellCount: 0,
        holdCount: 0
    });

    useEffect(() => {
        if (coinName && prediction) {
            fetchPredictionHistory(coinName, prediction);
        }
    }, [coinName, prediction]);

    const fetchPredictionHistory = (coinName, prediction) => {
        setIsLoading(true);

        // In a real implementation, this would fetch actual prediction history from an API
        // For demo purposes, we'll generate mock data based on current price
        setTimeout(() => {
            try {
                // Generate random prediction history based on the coin name and current price
                const mockHistory = generateMockHistory(coinName, prediction);

                // Calculate stats
                const totalCount = mockHistory.length;
                const accurateCount = mockHistory.filter(item => item.accurate).length;
                const buyCount = mockHistory.filter(item => item.predictedTrend === 'Buy').length;
                const sellCount = mockHistory.filter(item => item.predictedTrend === 'Sell').length;
                const holdCount = mockHistory.filter(item => item.predictedTrend === 'Hold').length;

                setStats({
                    totalCount,
                    accurateCount,
                    buyCount,
                    sellCount,
                    holdCount,
                    accuracyRate: ((accurateCount / totalCount) * 100).toFixed(1)
                });

                setHistory(mockHistory);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching prediction history:', error);
                setIsLoading(false);
            }
        }, 600);
    };

    const generateMockHistory = (coinName, prediction) => {
        const mockHistory = [];
        const today = new Date();
        const trends = ['Buy', 'Sell', 'Hold'];

        // Seed with coin name for consistent but varied results
        const coinNameSum = coinName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);

        // Use the actual current price from the prediction as base
        const currentPrice = prediction?.currentPrice || 1000;

        // Create a price history with realistic movements
        const priceHistory = generatePriceHistory(currentPrice, 30, coinNameSum);

        // Generate 30 historical predictions (one month)
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - (i + 1)); // Start from yesterday

            // Get yesterday's price and tomorrow's price to determine trend
            const actualPrice = priceHistory[i];
            const yesterdayPrice = i > 0 ? priceHistory[i - 1] : actualPrice;
            const tomorrowPrice = i < 29 ? priceHistory[i + 1] : actualPrice;

            // Determine the actual trend based on price movement
            let actualTrend;
            const priceChange = ((tomorrowPrice - actualPrice) / actualPrice) * 100;

            if (priceChange > 1.5) {
                actualTrend = 'Buy';
            } else if (priceChange < -1.5) {
                actualTrend = 'Sell';
            } else {
                actualTrend = 'Hold';
            }

            // Use a more realistic approach to generate predicted trend
            // In real life, prediction algorithms are not random but have patterns
            // For demo purposes, we'll create patterns based on the coin name
            let predictedTrend;
            const dayOfMonth = date.getDate();

            // Use a combination of date and coin name to create patterns
            const patternSeed = (dayOfMonth + coinNameSum) % 10;

            if (patternSeed < 4) {
                predictedTrend = 'Buy';
            } else if (patternSeed < 7) {
                predictedTrend = 'Sell';
            } else {
                predictedTrend = 'Hold';
            }

            // Determine if prediction was accurate
            const accurate = predictedTrend === actualTrend;

            // Add some realistic confidence scores - higher when accurate
            let confidenceScore;
            if (accurate) {
                confidenceScore = 65 + Math.floor(Math.random() * 25);
            } else {
                confidenceScore = 50 + Math.floor(Math.random() * 20);
            }

            // Calculate predicted price based on the predicted trend
            let predictedPrice;
            if (predictedTrend === 'Buy') {
                predictedPrice = actualPrice * (1 + (0.02 + Math.random() * 0.03));
            } else if (predictedTrend === 'Sell') {
                predictedPrice = actualPrice * (1 - (0.02 + Math.random() * 0.03));
            } else {
                predictedPrice = actualPrice * (1 + (Math.random() * 0.02 - 0.01));
            }

            mockHistory.push({
                id: i,
                date: date.toLocaleDateString(),
                predictedTrend,
                actualTrend,
                predictedPrice: predictedPrice.toFixed(2),
                actualPrice: actualPrice.toFixed(2),
                priceChange: priceChange.toFixed(2),
                accurate,
                confidenceScore,
                details: accurate ?
                    `Correctly predicted ${predictedTrend.toLowerCase()} signal with ${Math.abs(priceChange).toFixed(2)}% price movement.` :
                    `Incorrectly predicted ${predictedTrend.toLowerCase()} when market ${actualTrend.toLowerCase()}ed by ${Math.abs(priceChange).toFixed(2)}%.`
            });
        }

        return mockHistory;
    };

    const generatePriceHistory = (currentPrice, days, seed) => {
        const prices = [];
        let lastPrice = currentPrice;

        // Use a realistic approach with market patterns
        // Create some volatility based on the coin (seed)
        const volatility = 0.01 + ((seed % 10) / 100); // 1-10% daily volatility

        // Create a trend bias based on the coin
        const trendBias = ((seed % 20) - 10) / 1000; // -1% to +1% daily trend bias

        // Generate historical prices working backwards
        for (let i = 0; i < days; i++) {
            // Calculate price change with volatility and trend bias
            const change = (Math.random() * 2 - 1) * volatility + trendBias;

            // Introduce some market patterns
            // Add some cyclical behavior
            const cycleFactor = Math.sin((i + seed) / 7) * (volatility / 2);

            // Calculate new price with randomness, trend, and cycles
            const newPrice = lastPrice / (1 + change + cycleFactor);
            prices.push(newPrice);
            lastPrice = newPrice;
        }

        return prices.reverse(); // Return in chronological order (oldest first)
    };

    const filterHistory = (items) => {
        if (filter === 'all') return items;
        if (filter === 'accurate') return items.filter(item => item.accurate);
        if (filter === 'inaccurate') return items.filter(item => !item.accurate);
        if (filter === 'buy') return items.filter(item => item.predictedTrend === 'Buy');
        if (filter === 'sell') return items.filter(item => item.predictedTrend === 'Sell');
        if (filter === 'hold') return items.filter(item => item.predictedTrend === 'Hold');
        return items;
    };

    const getStatusClass = (item) => {
        if (item.accurate) return 'accurate';
        return 'inaccurate';
    };

    const getTrendClass = (trend) => {
        if (trend === 'Buy') return 'positive';
        if (trend === 'Sell') return 'negative';
        return 'neutral';
    };

    // Format price to USD 
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 2
        }).format(price);
    };

    // Format percentage
    const formatPercent = (percent) => {
        const num = parseFloat(percent);
        return (num >= 0 ? '+' : '') + num.toFixed(2) + '%';
    };

    if (isLoading) {
        return (
            <div className="history-loading">
                <div className="spinner"></div>
                <p>Loading prediction history...</p>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="no-history-data">
                <p>No prediction history available for {coinName}</p>
            </div>
        );
    }

    const filteredHistory = filterHistory(history);

    return (
        <div className="prediction-history-container">
            <h3>Zenith AI Prediction History</h3>

            <div className="history-stats-row">
                <div className="history-stat">
                    <div className="stat-value">{stats.totalCount}</div>
                    <div className="stat-label">Total Predictions</div>
                </div>
                <div className="history-stat">
                    <div className="stat-value">{stats.accuracyRate}%</div>
                    <div className="stat-label">Accuracy Rate</div>
                </div>
                <div className="history-stat">
                    <div className="stat-value">{stats.buyCount}/{stats.sellCount}/{stats.holdCount}</div>
                    <div className="stat-label">Buy/Sell/Hold</div>
                </div>
            </div>

            <div className="history-filter">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All <span className="filter-count">({history.length})</span>
                </button>
                <button
                    className={`filter-btn ${filter === 'accurate' ? 'active' : ''}`}
                    onClick={() => setFilter('accurate')}
                >
                    Accurate <span className="filter-count">({stats.accurateCount})</span>
                </button>
                <button
                    className={`filter-btn ${filter === 'inaccurate' ? 'active' : ''}`}
                    onClick={() => setFilter('inaccurate')}
                >
                    Inaccurate <span className="filter-count">({stats.totalCount - stats.accurateCount})</span>
                </button>
                <button
                    className={`filter-btn ${filter === 'buy' ? 'active' : ''}`}
                    onClick={() => setFilter('buy')}
                >
                    Buy <span className="filter-count">({stats.buyCount})</span>
                </button>
                <button
                    className={`filter-btn ${filter === 'sell' ? 'active' : ''}`}
                    onClick={() => setFilter('sell')}
                >
                    Sell <span className="filter-count">({stats.sellCount})</span>
                </button>
                <button
                    className={`filter-btn ${filter === 'hold' ? 'active' : ''}`}
                    onClick={() => setFilter('hold')}
                >
                    Hold <span className="filter-count">({stats.holdCount})</span>
                </button>
            </div>

            <div className="history-list">
                {filteredHistory.length === 0 ? (
                    <div className="no-results">No predictions match your filter criteria</div>
                ) : (
                    <>
                        <div className="history-header">
                            <div className="history-col date">Date</div>
                            <div className="history-col signal">Prediction</div>
                            <div className="history-col signal">Actual</div>
                            <div className="history-col price">Predicted</div>
                            <div className="history-col price">Actual</div>
                            <div className="history-col confidence">Confidence</div>
                            <div className="history-col accuracy">Accuracy</div>
                        </div>

                        {filteredHistory.map(item => (
                            <div
                                key={item.id}
                                className={`history-row ${getStatusClass(item)}`}
                            >
                                <div className="history-col date">{item.date}</div>
                                <div className="history-col signal">
                                    <span className={`signal-badge ${getTrendClass(item.predictedTrend)}`}>
                                        {item.predictedTrend}
                                    </span>
                                </div>
                                <div className="history-col signal">
                                    <span className={`signal-badge ${getTrendClass(item.actualTrend)}`}>
                                        {item.actualTrend}
                                    </span>
                                </div>
                                <div className="history-col price">{formatPrice(item.predictedPrice)}</div>
                                <div className="history-col price">
                                    {formatPrice(item.actualPrice)}
                                    <span className={`price-change ${parseFloat(item.priceChange) >= 0 ? 'positive' : 'negative'}`}>
                                        {formatPercent(item.priceChange)}
                                    </span>
                                </div>
                                <div className="history-col confidence">
                                    <div className="confidence-bar">
                                        <div
                                            className="confidence-fill"
                                            style={{ width: `${item.confidenceScore}%` }}
                                        ></div>
                                        <span className="confidence-text">{item.confidenceScore}%</span>
                                    </div>
                                </div>
                                <div className="history-col accuracy">
                                    <span className={`accuracy-badge ${item.accurate ? 'true' : 'false'}`}>
                                        {item.accurate ? 'Correct' : 'Incorrect'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            <div className="history-disclaimer">
                <p>* Historical data is presented to help you evaluate Zenith AI's prediction performance over time.</p>
            </div>
        </div>
    );
};

export default PredictionHistory; 
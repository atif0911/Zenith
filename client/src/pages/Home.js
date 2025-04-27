import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
    const [trendingCoins, setTrendingCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTrendingCoins = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/api/coins/trending');
                setTrendingCoins(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching trending coins:', err);
                setError('Failed to load trending coins');
                setLoading(false);
            }
        };

        fetchTrendingCoins();
    }, []);

    // Format price to USD with appropriate decimal places
    const formatPrice = (price) => {
        if (price >= 1000) {
            return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else if (price >= 1) {
            return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else {
            // For very small prices (less than $1)
            return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
        }
    };

    return (
        <div>
            <div className="home-banner">
                <h1>Zenith: AI-Driven Crypto Trading Platform</h1>
                <p>Leverage Zenith's powerful AI to make smarter cryptocurrency investment decisions</p>
                <div style={{ marginTop: '2rem' }}>
                    <Link to="/register" className="btn">
                        Get Started with Zenith
                    </Link>
                </div>
            </div>

            <div className="features">
                <div className="feature-card">
                    <h3>Personalized Watchlist</h3>
                    <p>
                        Build and manage your own customized cryptocurrency watchlist with Zenith to track the coins
                        that matter most to you.
                    </p>
                </div>
                <div className="feature-card">
                    <h3>Zenith AI Predictions</h3>
                    <p>
                        Get advanced trading signals and price predictions powered by Zenith's sophisticated machine
                        learning algorithms.
                    </p>
                </div>
                <div className="feature-card">
                    <h3>Real-Time Market Data</h3>
                    <p>
                        Access Zenith's up-to-the-minute cryptocurrency price data, market trends, and trading volumes.
                    </p>
                </div>
            </div>

            <div className="trending-section">
                <div className="card">
                    <h2 className="section-title">Trending Cryptocurrencies</h2>
                    <p>
                        Below are some of the most popular cryptocurrencies trending right now. Sign up for Zenith to track these and more!
                    </p>
                    <div className="trending-coins">
                        {loading ? (
                            <div className="loading">Loading trending coins...</div>
                        ) : error ? (
                            <div className="error">{error}</div>
                        ) : (
                            trendingCoins.map((coin) => (
                                <div className="coin-card" key={coin.id}>
                                    <div className="coin-info">
                                        <div className="coin-name">{coin.name}</div>
                                        <div className="coin-symbol">{coin.symbol}</div>
                                    </div>
                                    <div className={`coin-price ${coin.positive ? 'positive' : 'negative'}`}>
                                        {formatPrice(coin.price)}
                                        <span className="price-change">
                                            {coin.priceChange24h > 0 ? '+' : ''}
                                            {coin.priceChange24h ? coin.priceChange24h.toFixed(2) : '0.00'}%
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home; 
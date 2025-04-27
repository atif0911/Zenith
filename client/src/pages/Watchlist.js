import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000'; // Add API base URL

const Watchlist = () => {
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [removingCoin, setRemovingCoin] = useState(null);
    const [formData, setFormData] = useState({
        coinName: '',
        coinSymbol: ''
    });

    const { coinName, coinSymbol } = formData;

    useEffect(() => {
        getWatchlist();
    }, []);

    // Clear success message after 3 seconds
    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => {
                setSuccessMsg(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    // Get watchlist items
    const getWatchlist = async () => {
        try {
            setError(null);
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

            const res = await axios.get(`${API_BASE_URL}/api/watchlist`, config);
            setWatchlist(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching watchlist:', err.response?.data || err.message);
            setError('Error fetching watchlist');
            setLoading(false);
        }
    };

    // Add coin to watchlist
    const addToWatchlist = async (e) => {
        e.preventDefault();

        try {
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required - please log in again');
                return;
            }

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            };

            console.log('Adding coin to watchlist:', formData);

            // Validate input
            if (!coinName.trim() || !coinSymbol.trim()) {
                setError('Coin name and symbol are required');
                return;
            }

            // Format coin symbol to uppercase
            const formattedData = {
                ...formData,
                coinSymbol: coinSymbol.toUpperCase()
            };

            const res = await axios.post(`${API_BASE_URL}/api/watchlist`, formattedData, config);

            // Add to watchlist state and clear form
            setWatchlist([res.data, ...watchlist]);
            setFormData({
                coinName: '',
                coinSymbol: ''
            });

            setSuccessMsg(`${coinName} added to watchlist successfully`);
        } catch (err) {
            console.error('Error adding to watchlist:', err.response?.data || err.message);
            setError(err.response?.data?.msg || 'Error adding to watchlist');
        }
    };

    // Remove coin from watchlist
    const removeCoin = async (id, coinName) => {
        try {
            setError(null);
            setRemovingCoin(id);

            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required - please log in again');
                setRemovingCoin(null);
                return;
            }

            const config = {
                headers: {
                    'x-auth-token': token
                }
            };

            console.log('Removing coin with ID:', id);

            await axios.delete(`${API_BASE_URL}/api/watchlist/${id}`, config);

            // Update watchlist state
            setWatchlist(watchlist.filter(coin => coin._id !== id));
            setSuccessMsg(`${coinName} removed from watchlist`);
            setRemovingCoin(null);
        } catch (err) {
            console.error('Error removing coin:', err.response?.data || err.message);
            setError('Error removing coin. Please try again.');
            setRemovingCoin(null);
        }
    };

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading your watchlist...</p>
            </div>
        );
    }

    return (
        <div className="watchlist-container">
            <div className="watchlist-header">
                <h1>Zenith Watchlist</h1>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            <div className="card">
                <h3>Add Cryptocurrency to Zenith</h3>
                <form onSubmit={addToWatchlist}>
                    <div className="form-group">
                        <label htmlFor="coinName">Coin Name</label>
                        <input
                            type="text"
                            name="coinName"
                            id="coinName"
                            className="form-input"
                            placeholder="e.g. Bitcoin"
                            value={coinName}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="coinSymbol">Coin Symbol</label>
                        <input
                            type="text"
                            name="coinSymbol"
                            id="coinSymbol"
                            className="form-input"
                            placeholder="e.g. BTC"
                            value={coinSymbol}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <button type="submit" className="btn btn-primary">
                            Add to Zenith Watchlist
                        </button>
                    </div>
                </form>
            </div>

            <h2 className="section-title">Your Zenith Portfolio</h2>

            {watchlist.length === 0 ? (
                <div className="empty-watchlist">
                    <p>No cryptocurrencies in your Zenith watchlist yet. Add some above to get started!</p>
                </div>
            ) : (
                <div className="coin-list">
                    {watchlist.map(coin => (
                        <div className="coin-card" key={coin._id}>
                            <div className="coin-info">
                                <div className="coin-name">{coin.coinName}</div>
                                <div className="coin-symbol">{coin.coinSymbol}</div>
                            </div>
                            <div className="coin-actions">
                                <Link to={`/predictions`} className="btn btn-view">
                                    View Zenith AI Insights
                                </Link>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => removeCoin(coin._id, coin.coinName)}
                                    disabled={removingCoin === coin._id}
                                >
                                    {removingCoin === coin._id ? 'Removing...' : 'Remove'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Watchlist; 
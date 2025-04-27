const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('config');

// @route   GET api/coins/trending
// @desc    Get trending coins
// @access  Public
router.get('/trending', async (req, res) => {
    try {
        // Using CoinGecko API to get trending coins
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
            params: {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: 5,
                page: 1,
                sparkline: false,
                price_change_percentage: '24h'
            }
        });

        // Format the response to match our application's needs
        const trendingCoins = response.data.map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            price: coin.current_price,
            priceChange24h: coin.price_change_percentage_24h,
            positive: coin.price_change_percentage_24h >= 0
        }));

        res.json(trendingCoins);
    } catch (err) {
        console.error('Error fetching trending coins:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 
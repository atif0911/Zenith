const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Watchlist = require('../../models/Watchlist');
const User = require('../../models/User');

// @route   GET api/watchlist
// @desc    Get all coins in user's watchlist
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const watchlist = await Watchlist.find({ user: req.user.id }).sort({ date: -1 });
        res.json(watchlist);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/watchlist
// @desc    Add new coin to watchlist
// @access  Private
router.post(
    '/',
    [
        auth,
        [
            check('coinName', 'Coin name is required').not().isEmpty(),
            check('coinSymbol', 'Coin symbol is required').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { coinName, coinSymbol } = req.body;

            // Check if coin already exists in watchlist
            const existingCoin = await Watchlist.findOne({
                user: req.user.id,
                coinSymbol: coinSymbol
            });

            if (existingCoin) {
                return res.status(400).json({ msg: 'Coin already in watchlist' });
            }

            const newWatchlistItem = new Watchlist({
                user: req.user.id,
                coinName,
                coinSymbol
            });

            const watchlistItem = await newWatchlistItem.save();

            res.json(watchlistItem);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   DELETE api/watchlist/:id
// @desc    Delete a coin from watchlist
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        console.log('[WATCHLIST] Delete request for item ID:', req.params.id);

        const watchlistItem = await Watchlist.findById(req.params.id);

        if (!watchlistItem) {
            console.log('[WATCHLIST] Item not found with ID:', req.params.id);
            return res.status(404).json({ msg: 'Watchlist item not found' });
        }

        // Check user
        if (watchlistItem.user.toString() !== req.user.id) {
            console.log('[WATCHLIST] User not authorized to delete item');
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Use deleteOne instead of remove (which is deprecated)
        await Watchlist.deleteOne({ _id: req.params.id });
        console.log('[WATCHLIST] Item successfully deleted:', req.params.id);

        res.json({ msg: 'Watchlist item removed' });
    } catch (err) {
        console.error('[WATCHLIST] Error removing item:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Watchlist item not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router; 
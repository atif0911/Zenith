const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const User = require('../../models/User');

// @route   GET api/auth
// @desc    Get user by token
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        console.log('[AUTH] Getting user by ID:', req.user.id);
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            console.log('[AUTH] User not found with ID:', req.user.id);
            return res.status(404).json({ msg: 'User not found' });
        }

        console.log('[AUTH] User found, returning data');
        res.json(user);
    } catch (err) {
        console.error('[AUTH] Error fetching user:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post(
    '/',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    async (req, res) => {
        console.log('[AUTH] Login attempt for:', req.body.email);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('[AUTH] Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });

            if (!user) {
                console.log('[AUTH] User not found with email:', email);
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                console.log('[AUTH] Password mismatch for user:', email);
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const payload = {
                user: {
                    id: user.id
                }
            };

            console.log('[AUTH] Creating JWT token for user:', user.id);
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: '5 days' },
                (err, token) => {
                    if (err) {
                        console.error('[AUTH] JWT Sign error:', err.message);
                        throw err;
                    }
                    console.log('[AUTH] Login successful for:', email);
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error('[AUTH] Server error during login:', err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check(
            'password',
            'Please enter a password with 6 or more characters'
        ).isLength({ min: 6 })
    ],
    async (req, res) => {
        console.log('[AUTH] Registration attempt for:', req.body.email);
        console.log('[AUTH] Registration request body:', req.body);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('[AUTH] Registration validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            let user = await User.findOne({ email });

            if (user) {
                console.log('[AUTH] Registration failed - email already exists:', email);
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'User already exists' }] });
            }

            // Create a new user with username mapped from name
            user = new User({
                username: name,  // Map name from request to username in schema
                email,
                password
            });

            // Log the user object before saving
            console.log('[AUTH] Creating new user:', JSON.stringify(user));

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();
            console.log('[AUTH] New user created:', email);

            const payload = {
                user: {
                    id: user.id
                }
            };

            console.log('[AUTH] Creating JWT token for new user');
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: '5 days' },
                (err, token) => {
                    if (err) {
                        console.error('[AUTH] JWT Sign error for new user:', err.message);
                        throw err;
                    }
                    console.log('[AUTH] Registration successful for:', email);
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error('[AUTH] Server error during registration:', err.message);
            console.error('[AUTH] Full error:', err);
            res.status(500).json({ msg: 'Server error', error: err.message });
        }
    }
);

// @route   PUT api/auth/update
// @desc    Update user profile
// @access  Private
router.put('/update', auth, async (req, res) => {
    try {
        console.log('[AUTH] Update request for user ID:', req.user.id);
        console.log('[AUTH] Update request body:', req.body);

        // Find the user
        let user = await User.findById(req.user.id);
        if (!user) {
            console.log('[AUTH] User not found with ID:', req.user.id);
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update fields if provided
        if (req.body.username) user.username = req.body.username;
        if (req.body.email) {
            // Check if email is already taken by another user
            const existingUser = await User.findOne({ email: req.body.email });
            if (existingUser && existingUser.id !== req.user.id) {
                console.log('[AUTH] Email already in use:', req.body.email);
                return res.status(400).json({ msg: 'Email already in use' });
            }
            user.email = req.body.email;
        }

        // Save the updated user
        await user.save();

        // Return the updated user (without password)
        const updatedUser = await User.findById(req.user.id).select('-password');
        console.log('[AUTH] User updated successfully:', updatedUser);
        res.json(updatedUser);
    } catch (err) {
        console.error('[AUTH] Error updating user:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/auth/password
// @desc    Change user password
// @access  Private
router.put('/password', auth, [
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'Please enter a new password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    try {
        console.log('[AUTH] Password change request for user ID:', req.user.id);

        // Find the user
        let user = await User.findById(req.user.id);
        if (!user) {
            console.log('[AUTH] User not found with ID:', req.user.id);
            return res.status(404).json({ msg: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            console.log('[AUTH] Current password incorrect for user:', req.user.id);
            return res.status(400).json({ msg: 'Current password is incorrect' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Save the updated user
        await user.save();

        console.log('[AUTH] Password changed successfully for user:', req.user.id);
        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error('[AUTH] Error changing password:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/auth
// @desc    Delete user account
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        console.log('[AUTH] Delete account request for user ID:', req.user.id);
        
        // Find the user
        let user = await User.findById(req.user.id);
        if (!user) {
            console.log('[AUTH] User not found with ID:', req.user.id);
            return res.status(404).json({ msg: 'User not found' });
        }
        
        // Delete any associated watchlist items
        const Watchlist = require('../../models/Watchlist');
        await Watchlist.deleteMany({ user: req.user.id });
        console.log('[AUTH] Deleted watchlist items for user:', req.user.id);
        
        // Delete the user
        await User.findByIdAndDelete(req.user.id);
        console.log('[AUTH] User deleted successfully:', req.user.id);
        
        res.json({ msg: 'User account deleted successfully' });
    } catch (err) {
        console.error('[AUTH] Error deleting user:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Initialize Middleware
app.use(express.json({ extended: false }));

// Configure CORS - allow requests from client
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-auth-token']
}));

// Debug middleware for auth headers
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    console.log('Auth header:', req.header('x-auth-token'));
    next();
});

// Define Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/watchlist', require('./routes/api/watchlist'));
app.use('/api/predictions', require('./routes/api/predictions'));
app.use('/api/coins', require('./routes/api/coins'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;

// Start server with port conflict handling
const startServer = () => {
    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
        console.log(`API is available at: http://localhost:${PORT}/api`);
        console.log(`To test, open browser at: http://localhost:3000/`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
            setTimeout(() => {
                app.listen(PORT + 1, () => {
                    console.log(`Server started on port ${PORT + 1}`);
                    console.log(`API is available at: http://localhost:${PORT + 1}/api`);
                    console.log(`To test, open browser at: http://localhost:3000/`);
                });
            }, 1000);
        } else {
            console.error('Server error:', err);
        }
    });
};

startServer(); 
const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('Connection string:', db.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://USER:PASSWORD@')); // Hide credentials

        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('MongoDB Connected Successfully!');

        // Create initial data
        await createInitialData();
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);

        if (err.name === 'MongoNetworkError') {
            console.error('Cannot connect to MongoDB. Please ensure MongoDB is running or check your connection string.');
        }

        // Exit process with failure
        process.exit(1);
    }
};

// Function to create initial data if needed
const createInitialData = async () => {
    try {
        // Check if we have any users
        const User = require('../models/User');
        const count = await User.countDocuments();

        if (count === 0) {
            console.log('No users found, creating a demo user...');
            const bcrypt = require('bcryptjs');

            // Create a demo user
            const demoUser = new User({
                username: 'demouser',
                email: 'demo@example.com',
                password: 'password123'
            });

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            demoUser.password = await bcrypt.hash(demoUser.password, salt);

            await demoUser.save();
            console.log('Demo user created successfully!');
            console.log('Email: demo@example.com, Password: password123');
        }
    } catch (err) {
        console.error('Error creating initial data:', err.message);
    }
};

module.exports = connectDB; 
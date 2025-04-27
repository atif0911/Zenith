const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PredictionSchema = new Schema({
    coinName: {
        type: String,
        required: true
    },
    predictedTrend: {
        type: String,
        enum: ['Buy', 'Hold', 'Sell'],
        required: true
    },
    confidenceScore: {
        type: Number,
        required: true
    },
    rsi: {
        type: Number
    },
    macd: {
        type: Number
    },
    volatility: {
        type: Number
    },
    currentPrice: {
        type: Number
    },
    predictedPrice: {
        type: Number
    },
    timeFrame: {
        type: String,
        default: '24h'
    },
    priceChangePercent: {
        type: Number
    },
    detailedAnalysis: {
        type: String
    },
    historicalData: {
        dates: [String],
        prices: [Number],
        predicted: [Number]
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('prediction', PredictionSchema); 
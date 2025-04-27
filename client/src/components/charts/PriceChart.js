import React, { useEffect, useState } from 'react';
import LineChart from './LineChart';

const PriceChart = ({ prediction, coinName }) => {
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (prediction) {
            generateChartData(prediction, coinName);
        }
    }, [prediction, coinName]);

    const generateChartData = (prediction, coinName) => {
        setIsLoading(true);

        try {
            // Generate dates for the past 7 days up to today
            const dates = [];
            const today = new Date();

            for (let i = 7; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            }

            // Generate dates for the next 3 days (prediction)
            for (let i = 1; i <= 3; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() + i);
                dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            }

            // Generate historical prices based on the current price
            const currentPrice = prediction.currentPrice;
            const historicalPrices = [];

            // Simulate slight variations for historical prices (last 7 days)
            let lastPrice = currentPrice * 0.9; // Start with a lower price

            for (let i = 0; i < 8; i++) {
                // Random variation between -2% and +2%
                const change = (Math.random() * 4 - 2) / 100;
                lastPrice = lastPrice * (1 + change);

                if (i === 7) {
                    // The last historical price should be the current price
                    historicalPrices.push(currentPrice);
                } else {
                    historicalPrices.push(lastPrice);
                }
            }

            // Generate prediction prices
            const predictedPrices = [];
            const priceChange = prediction.priceChangePercent / 100;

            // Calculate the target price based on the predicted price change
            const targetPrice = currentPrice * (1 + priceChange);

            // Calculate steps to reach the target price over 3 days
            const step = (targetPrice - currentPrice) / 3;

            for (let i = 1; i <= 3; i++) {
                const predictedPrice = currentPrice + (step * i);
                predictedPrices.push(predictedPrice);
            }

            // Create the chart data object
            const data = {
                labels: dates,
                datasets: [
                    {
                        label: 'Historical Price',
                        data: [...historicalPrices, null, null, null], // Add nulls for prediction days
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Predicted Price',
                        data: [null, null, null, null, null, null, null, currentPrice, ...predictedPrices], // Add nulls for historical days
                        borderColor: 'rgba(153, 102, 255, 1)',
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderDash: [5, 5],
                        pointBackgroundColor: 'rgba(153, 102, 255, 1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            };

            setChartData(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error generating chart data:', error);
            setIsLoading(false);
        }
    };

    const chartOptions = {
        plugins: {
            title: {
                display: true,
                text: `${coinName} Price Trend & Prediction`,
                font: {
                    size: 16
                }
            },
            tooltip: {
                callbacks: {
                    title: function (tooltipItems) {
                        return tooltipItems[0].label;
                    }
                }
            }
        }
    };

    if (isLoading) {
        return (
            <div className="chart-loading">
                <div className="spinner"></div>
                <p>Loading chart data...</p>
            </div>
        );
    }

    if (!chartData) {
        return (
            <div className="no-chart-data">
                <p>No chart data available for {coinName}</p>
            </div>
        );
    }

    return (
        <div className="prediction-chart-container">
            <h3>Zenith Price History & Prediction</h3>
            <div className="prediction-chart">
                <LineChart chartData={chartData} options={chartOptions} />
            </div>
            <div className="chart-legend">
                <div className="legend-item">
                    <div className="legend-color historical"></div>
                    <span>Historical Price</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color predicted"></div>
                    <span>Zenith AI Prediction</span>
                </div>
            </div>
        </div>
    );
};

export default PriceChart; 
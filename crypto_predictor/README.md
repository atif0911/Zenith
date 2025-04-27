# Cryptocurrency Trading Signal Predictor

A machine learning system that predicts cryptocurrency trading signals (Buy, Hold, Sell) based on historical price data and technical indicators.

## Features

- **Data Collection**: Fetches historical cryptocurrency data using Yahoo Finance API
- **Technical Indicators**: Calculates multiple indicators including:
  - Moving Averages (MA14, MA50)
  - Relative Strength Index (RSI)
  - MACD (Moving Average Convergence Divergence)
  - Volatility

- **Machine Learning Models**:
  - Random Forest Classifier
  - XGBoost Classifier (with automatic model selection)

- **Performance Evaluation**:
  - Accuracy metrics
  - Classification report
  - Backtesting with simulated trading

## Getting Started

### Prerequisites

- Python 3.7+
- Required packages listed in `requirements.txt`

### Installation

1. Clone the repository
2. Install required packages:
   ```
   pip install -r requirements.txt
   ```

### Usage

Run the main script to fetch data, train the model, and get predictions:

```
python main.py
```

## Project Structure

- `data/`: Data fetching functionality
- `features/`: Feature engineering tools
- `labels/`: Signal generation logic
- `model/`: Machine learning models
- `utils/`: Configuration and utilities
- `reports/`: Generated reports and backtesting results
- `logs/`: Prediction logs

## Configuration

Edit `utils/config.py` to change:
- Target cryptocurrency
- Date range
- Technical indicator parameters
- Model parameters

## License

This project is open source and available for educational and personal use. 
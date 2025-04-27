# ML Model Integration Setup

This document provides instructions on how to set up and run the cryptocurrency prediction ML model with the web application.

## Prerequisites

Before running the ML model API, ensure you have the following installed:

1. Python 3.8 or higher
2. Node.js 14 or higher
3. MongoDB

## ML Model Setup

The ML predictor requires several Python packages. Install them using:

```bash
pip install -r crypto_predictor/requirements.txt
pip install flask yfinance scikit-learn pandas numpy
```

## Running the Application

There are several ways to run the application:

### Option 1: Run Everything Together

This option runs the backend server, frontend client, and ML API all at once:

```bash
npm run dev-with-ml
```

### Option 2: Run Components Separately

In separate terminal windows:

1. Run the backend server:
```bash
npm run server
```

2. Run the frontend client:
```bash
npm run client
```

3. Run the ML API service:
```bash
npm run ml-api
```

## Environment Variables

You can configure the following environment variables:

- `ML_API_URL`: URL for the ML API service (default: http://localhost:5001/api/predict)
- `PORT`: Port for the main server (default: 5000)

## Adding New Cryptocurrencies

To add support for additional cryptocurrencies:

1. Open `crypto_predictor/api_service.py`
2. Add your cryptocurrency to the `SUPPORTED_COINS` dictionary with its Yahoo Finance ticker symbol

## Troubleshooting

If you encounter issues with the ML API:

1. Check that the ML API service is running by visiting http://localhost:5001/api/predict/Bitcoin in your browser
2. Ensure all required Python packages are installed
3. Check the console logs for any Python errors
4. Make sure the model files exist in the `crypto_predictor/model/saved/` directory

## How It Works

1. The frontend sends a request to the Node.js backend API
2. The backend checks if it has a recent prediction (less than 1 hour old)
3. If no recent prediction exists, it calls the ML API service
4. The ML API service fetches real-time cryptocurrency data from Yahoo Finance
5. The ML model processes the data and generates a prediction
6. The prediction is returned to the frontend and displayed to the user 
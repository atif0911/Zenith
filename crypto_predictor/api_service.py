import os
import sys
from flask import Flask, request, jsonify
import pandas as pd
import joblib
import yfinance as yf
from datetime import datetime, timedelta
import numpy as np
import traceback

# Add the current directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import our modules
from crypto_predictor.data.fetch_data import fetch_crypto_data
from crypto_predictor.features.engineer_features import add_features
from crypto_predictor.model.predict_model import predict_action

app = Flask(__name__)

# Load the model and other necessary files
try:
    model = joblib.load('crypto_predictor/model/saved/model.pkl')
    scaler = joblib.load('crypto_predictor/model/saved/scaler.pkl')
    label_encoder = joblib.load('crypto_predictor/model/saved/label_encoder.pkl')
    
    # Load feature list
    with open('crypto_predictor/model/saved/features.txt', 'r') as f:
        features = [line.strip() for line in f.readlines()]
        
    print("Model and related files loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    
# Dictionary of supported cryptocurrencies and their Yahoo Finance tickers
SUPPORTED_COINS = {
    'Bitcoin': 'BTC-USD',
    'Ethereum': 'ETH-USD',
    'Cardano': 'ADA-USD',
    'Solana': 'SOL-USD',
    'Binance Coin': 'BNB-USD',
    'XRP': 'XRP-USD',
    'Dogecoin': 'DOGE-USD',
    'Polkadot': 'DOT-USD'
}

@app.route('/api/predict/<coin_name>', methods=['GET'])
def get_prediction(coin_name):
    try:
        if coin_name not in SUPPORTED_COINS:
            return jsonify({'error': f'Unsupported coin: {coin_name}. Supported coins are: {list(SUPPORTED_COINS.keys())}'}), 400
            
        # Get ticker symbol
        ticker = SUPPORTED_COINS[coin_name]
        
        # Fetch historical data for the last 60 days
        end_date = datetime.now()
        start_date = end_date - timedelta(days=60)
        
        print(f"Fetching data for {ticker} from {start_date} to {end_date}")
        data = yf.download(ticker, start=start_date.strftime('%Y-%m-%d'), end=end_date.strftime('%Y-%m-%d'), interval='1d')
        
        if data.empty:
            return jsonify({'error': f'Could not fetch data for {coin_name}'}), 500
            
        # Add features
        df = add_features(data)
        
        # Get latest data point
        latest_data = df.iloc[-1]
        
        # Make prediction
        if model is not None:
            # Extract features
            feature_values = []
            for feature in features:
                if feature in latest_data:
                    feature_values.append(latest_data[feature])
                else:
                    return jsonify({'error': f"Required feature '{feature}' not found in latest data"}), 500
                    
            # Scale the features
            scaled_features = scaler.transform([feature_values])
            
            # Make prediction
            prediction_encoded = model.predict(scaled_features)[0]
            
            # Get prediction probabilities (confidence)
            prediction_proba = model.predict_proba(scaled_features)[0]
            
            # Decode prediction back to string label
            prediction = label_encoder.inverse_transform([prediction_encoded])[0]
            
            # Calculate confidence score (highest probability)
            confidence_score = int(np.max(prediction_proba) * 100)
            
            # Create the response
            historical_prices = df['Close'].tolist()[-8:]  # Last 8 days of prices
            dates = [d.strftime('%Y-%m-%d') for d in df.index.tolist()[-8:]]  # Last 8 days
            
            # Predicted price - simple projection based on trend
            predicted_prices = []
            if prediction == 'Buy':
                # Project slight increase
                last_price = historical_prices[-1]
                predicted_prices = [None, None, None, None, None, 
                                   last_price * 1.01, 
                                   last_price * 1.02, 
                                   last_price * 1.025]
            elif prediction == 'Sell':
                # Project slight decrease
                last_price = historical_prices[-1]
                predicted_prices = [None, None, None, None, None, 
                                   last_price * 0.99, 
                                   last_price * 0.98, 
                                   last_price * 0.975]
            else:  # Hold
                # Project stability
                last_price = historical_prices[-1]
                predicted_prices = [None, None, None, None, None, 
                                   last_price * 1.003, 
                                   last_price * 1.005, 
                                   last_price * 1.002]
            
            response = {
                'coinName': coin_name,
                'predictedTrend': prediction,
                'confidenceScore': confidence_score,
                'currentPrice': latest_data['Close'],
                'rsi': round(latest_data['RSI'], 2) if 'RSI' in latest_data else None,
                'macd': round(latest_data['MACD'], 4) if 'MACD' in latest_data else None,
                'volatility': round(latest_data['Volatility'], 4) if 'Volatility' in latest_data else None,
                'historicalData': {
                    'dates': dates,
                    'prices': historical_prices,
                    'predicted': predicted_prices
                },
                'timestamp': datetime.now().isoformat()
            }
            
            return jsonify(response)
        else:
            # Return mock prediction if model is not loaded
            trends = ['Buy', 'Hold', 'Sell']
            trend = trends[np.random.randint(0, len(trends))]
            confidence = np.random.randint(60, 100)
            
            return jsonify({
                'coinName': coin_name,
                'predictedTrend': trend,
                'confidenceScore': confidence,
                'currentPrice': latest_data['Close'],
                'timestamp': datetime.now().isoformat(),
                'note': 'Model not loaded - using mock prediction'
            })
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001) 
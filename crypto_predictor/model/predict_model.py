import pandas as pd
import os
import joblib
import numpy as np
from datetime import datetime

def predict_action(model, latest_data):
    """
    Predict trading action based on latest data.
    
    Args:
        model: Trained classifier model
        latest_data: DataFrame row containing the latest data point with all features
    
    Returns:
        str: Predicted action ('Buy', 'Sell', or 'Hold')
    """
    try:
        # Load the saved scaler
        scaler = joblib.load('model/saved/scaler.pkl')
        
        # Load the label encoder
        label_encoder = joblib.load('model/saved/label_encoder.pkl')
        
        # Load the feature list
        with open('model/saved/features.txt', 'r') as f:
            features = [line.strip() for line in f.readlines()]
        
        # Create a copy of the data to avoid modifying the original
        data = latest_data.copy()
        
        # Add derived features if not present
        if 'RSI_Change' not in data:
            # Since we only have the latest data point, we can't calculate diff
            # Use a default value or estimate from historical data
            data['RSI_Change'] = 0
        
        if 'MACD_Change' not in data:
            data['MACD_Change'] = 0
            
        if 'MA_Ratio' not in data:
            data['MA_Ratio'] = data['MA14'] / data['MA50']
            
        if 'Price_MA14_Ratio' not in data:
            data['Price_MA14_Ratio'] = data['Close'] / data['MA14']
        
        # Replace any inf values
        for feature in features:
            if pd.isna(data[feature]) or np.isinf(data[feature]):
                data[feature] = 0
        
        # Extract features from latest data
        feature_values = []
        for feature in features:
            if feature in data:
                feature_values.append(data[feature])
            else:
                raise ValueError(f"Required feature '{feature}' not found in latest data")
                
        # Scale the features
        scaled_features = scaler.transform([feature_values])
        
        # Make prediction
        prediction_encoded = model.predict(scaled_features)[0]
        
        # Decode prediction back to string label
        prediction = label_encoder.inverse_transform([prediction_encoded])[0]
        
        # Log the prediction
        log_prediction(prediction, data)
        
        return prediction
        
    except Exception as e:
        print(f"Error making prediction: {e}")
        return "Hold"  # Default to Hold on error

def log_prediction(action, current_data):
    """
    Log the prediction to a CSV file
    
    Args:
        action: Predicted action ('Buy', 'Sell', or 'Hold')
        current_data: Dictionary or Series containing current data values
    """
    # Prepare a log row with the relevant data
    log_data = {
        'Date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'Close': current_data.get('Close', 0),
        'RSI': current_data.get('RSI', 0),
        'MACD': current_data.get('MACD', 0),
        'Volatility': current_data.get('Volatility', 0),
        'Action': action,
    }
    
    log_df = pd.DataFrame([log_data])
    
    # Ensure log directory exists
    os.makedirs('logs', exist_ok=True)
    log_file = 'logs/predictions_log.csv'
    
    # Check if log file exists
    if os.path.exists(log_file):
        log_df.to_csv(log_file, mode='a', header=False, index=False)
    else:
        log_df.to_csv(log_file, mode='w', header=True, index=False)
        
    print(f"Logged prediction: {action} on {log_data['Date']} with Close: {log_data['Close']:.2f}, RSI: {log_data['RSI']:.2f}")


from data.fetch_data import fetch_crypto_data
from features.engineer_features import add_features
from labels.create_labels import generate_labels
from model.train_model import train
from model.predict_model import predict_action
import pandas as pd
import joblib
import os
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

def main():
    print("Cryptocurrency Trading Signal Predictor")
    print("======================================")
    
    # Step 1: Fetch Data
    print("\nFetching historical cryptocurrency data...")
    df = fetch_crypto_data()
    print(f"Data fetched: {len(df)} records from {df.index.min().date()} to {df.index.max().date()}")
    
    # Step 2: Feature Engineering
    print("\nEngineering features...")
    df = add_features(df)
    
    # Step 3: Create Labels
    print("\nGenerating trading signals...")
    df = generate_labels(df)
    
    # Step 4: Train Model
    print("\nTraining prediction model...")
    model = train(df)
    
    # Step 5: Evaluate on test data
    evaluate_model(df, model)
    
    # Step 6: Predict on latest data
    latest_data = df.iloc[-1]
    action = predict_action(model, latest_data)
    
    print("\n====== PREDICTION RESULT ======")
    print(f"Latest Date: {df.index[-1].date()}")
    print(f"Latest Close Price: ${latest_data['Close']:.2f}")
    print(f"RSI: {latest_data['RSI']:.2f}")
    print(f"MACD: {latest_data['MACD']:.4f}")
    print(f"Recommended Action: {action}")
    print("===============================")

def evaluate_model(df, model):
    """
    Evaluate model performance on historical data
    """
    # Load the scaler
    scaler = joblib.load('model/saved/scaler.pkl')
    
    # Load the label encoder
    label_encoder = joblib.load('model/saved/label_encoder.pkl')
    
    # Load feature list
    with open('model/saved/features.txt', 'r') as f:
        features = [line.strip() for line in f.readlines()]
    
    # Add the new features if they don't exist in the dataframe
    if 'RSI_Change' not in df.columns:
        df.loc[:, 'RSI_Change'] = df['RSI'].diff()
    
    if 'MACD_Change' not in df.columns:
        df.loc[:, 'MACD_Change'] = df['MACD'].diff()
        
    if 'MA_Ratio' not in df.columns:
        df.loc[:, 'MA_Ratio'] = df['MA14'] / df['MA50']
        
    if 'Price_MA14_Ratio' not in df.columns:
        df.loc[:, 'Price_MA14_Ratio'] = df['Close'] / df['MA14']
    
    # Replace infinite values with NaN
    df = df.replace([np.inf, -np.inf], np.nan)
    
    # Prepare the data, fill NaN values with column means
    col_means = df[features].mean()
    df = df.fillna(col_means)
    
    # Final check for any remaining NaNs
    X = df[features].fillna(0)
    y = df['Signal'].fillna('Hold')
    
    # Drop rows with NaN values
    valid_indices = ~X.isna().any(axis=1)
    X = X[valid_indices]
    y = y[valid_indices]
    
    # Encode the target labels
    y_encoded = label_encoder.transform(y)
    
    # Scale features
    X_scaled = scaler.transform(X)
    
    # Make predictions
    y_pred_encoded = model.predict(X_scaled)
    
    # Decode predictions back to string labels
    y_pred = label_encoder.inverse_transform(y_pred_encoded)
    
    # Calculate accuracy
    accuracy = accuracy_score(y, y_pred)
    print(f"\nHistorical Prediction Accuracy: {accuracy:.4f}")
    
    # Print classification report
    print("\nClassification Report:")
    print(classification_report(y, y_pred))
    
    # Create confusion matrix
    cm = confusion_matrix(y, y_pred)
    
    # Ensure 'reports' directory exists
    os.makedirs('reports', exist_ok=True)
    
    # Save confusion matrix as CSV
    cm_df = pd.DataFrame(cm, index=label_encoder.classes_, columns=label_encoder.classes_)
    cm_df.to_csv('reports/confusion_matrix.csv')
    
    # Calculate backtest performance
    backtest_performance(df, y_pred)

def backtest_performance(df, predictions):
    """
    Simulate trading performance based on predictions
    """
    # Create a copy of dataframe with predictions
    backtest_df = df.copy()
    
    # Map the predictions to dataframe
    backtest_df = backtest_df.iloc[:len(predictions)]
    backtest_df['Predicted_Signal'] = predictions
    
    # Calculate returns based on signals
    backtest_df['Strategy_Return'] = 0.0
    
    # For Buy signals, we buy at close and sell at next close
    buy_signals = backtest_df['Predicted_Signal'] == 'Buy'
    backtest_df.loc[buy_signals, 'Strategy_Return'] = backtest_df.loc[buy_signals, 'Next_Day_Return']
    
    # For Sell signals, we short at close and buy back at next close (negative return)
    sell_signals = backtest_df['Predicted_Signal'] == 'Sell'
    backtest_df.loc[sell_signals, 'Strategy_Return'] = -backtest_df.loc[sell_signals, 'Next_Day_Return']
    
    # Calculate cumulative returns
    backtest_df['Cumulative_Market_Return'] = (1 + backtest_df['Next_Day_Return']).cumprod() - 1
    backtest_df['Cumulative_Strategy_Return'] = (1 + backtest_df['Strategy_Return']).cumprod() - 1
    
    # Calculate some performance metrics
    total_trades = len(backtest_df[backtest_df['Predicted_Signal'] != 'Hold'])
    winning_trades = len(backtest_df[(backtest_df['Predicted_Signal'] != 'Hold') & 
                                    (backtest_df['Strategy_Return'] > 0)])
    
    if total_trades > 0:
        win_rate = winning_trades / total_trades
    else:
        win_rate = 0
        
    final_market_return = backtest_df['Cumulative_Market_Return'].iloc[-1]
    final_strategy_return = backtest_df['Cumulative_Strategy_Return'].iloc[-1]
    
    print("\nBacktest Results:")
    print(f"Total Trades: {total_trades}")
    print(f"Win Rate: {win_rate:.2%}")
    print(f"Market Return: {final_market_return:.2%}")
    print(f"Strategy Return: {final_strategy_return:.2%}")
    
    # Save backtest results
    backtest_df[['Close', 'Predicted_Signal', 'Next_Day_Return', 'Strategy_Return', 
                'Cumulative_Market_Return', 'Cumulative_Strategy_Return']].to_csv('reports/backtest_results.csv')

if __name__ == "__main__":
    main()

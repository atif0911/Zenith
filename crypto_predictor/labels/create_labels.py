import pandas as pd 
import numpy as np

def label(row):
    """
    Generate trading signals based on multiple technical indicators:
    - Price relation to Moving Averages (MA14, MA50)
    - RSI levels (overbought/oversold)
    - MACD signal line crossovers
    """
    signals = []
    
    # Check Moving Average signals
    if row['Close'] > row['MA14'] and row['MA14'] > row['MA50']:
        signals.append('Buy')  # Strong uptrend
    elif row['Close'] < row['MA14'] and row['MA14'] < row['MA50']:
        signals.append('Sell')  # Strong downtrend
    
    # Check RSI signals (traditional levels: >70 overbought, <30 oversold)
    if row['RSI'] < 30:
        signals.append('Buy')  # Oversold condition
    elif row['RSI'] > 70:
        signals.append('Sell')  # Overbought condition
    
    # Check MACD signals
    if row['MACD'] > row['MACD_Signal']:
        signals.append('Buy')  # MACD crossed above signal line
    elif row['MACD'] < row['MACD_Signal']:
        signals.append('Sell')  # MACD crossed below signal line
    
    # Determine final signal based on majority rule
    if not signals:
        return 'Hold'
    
    buy_count = signals.count('Buy')
    sell_count = signals.count('Sell')
    
    if buy_count > sell_count:
        return 'Buy'
    elif sell_count > buy_count:
        return 'Sell'
    else:
        return 'Hold'

def generate_labels(df):
    # Debug info
    print("DataFrame shape:", df.shape)
    print("DataFrame columns:", df.columns)
    print("DataFrame index type:", type(df.index))
    
    # Create tomorrow's price column for evaluation
    print("Creating Next_Close...")
    next_close = df['Close'].shift(-1)
    df['Next_Close'] = next_close
    
    # Create percent change to next day for validation
    print("Creating Next_Day_Return...")
    returns = df['Next_Close'] / df['Close'] - 1
    print("Returns shape:", returns.shape)
    df['Next_Day_Return'] = returns.fillna(0)
    
    # Applying the 'label' function to generate signals
    print("Generating signals...")
    df['Signal'] = df.apply(label, axis=1)
    
    return df

import pandas as pd

def add_features(df):
    """
    Add technical indicators and features to the dataframe
    
    Args:
        df: DataFrame with OHLCV data
        
    Returns:
        DataFrame with added features
    """
    # First, let's flatten the MultiIndex columns if they exist
    if isinstance(df.columns, pd.MultiIndex):
        print("Flattening MultiIndex columns...")
        df.columns = [col[0] for col in df.columns]
    
    # Moving Averages
    df['MA14'] = df['Close'].rolling(window=14).mean()
    df['MA50'] = df['Close'].rolling(window=50).mean()
    df['Price_Change'] = df['Close'].pct_change()
    
    # Calculate RSI (14-period)
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    
    # Calculate RS and RSI
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))
    
    # Calculate MACD
    ema12 = df['Close'].ewm(span=12, adjust=False).mean()
    ema26 = df['Close'].ewm(span=26, adjust=False).mean()
    df['MACD'] = ema12 - ema26
    df['MACD_Signal'] = df['MACD'].ewm(span=9, adjust=False).mean()
    df['MACD_Hist'] = df['MACD'] - df['MACD_Signal']
    
    # Add volatility indicator
    df['Volatility'] = df['Close'].rolling(window=14).std()
    
    # Fill NA values after calculating indicators
    df = df.fillna(0)
    
    return df

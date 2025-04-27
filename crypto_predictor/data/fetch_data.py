import yfinance as yf
from utils.config import TICKER, START_DATE, END_DATE, INTERVAL
import pandas as pd
from datetime import datetime

def fetch_crypto_data():
    """
    Fetch cryptocurrency data from Yahoo Finance
    
    Returns:
        DataFrame: Historical OHLCV data for the configured ticker
    """
    # If END_DATE is None, use current date
    end_date = END_DATE if END_DATE else datetime.now().strftime('%Y-%m-%d')
    
    print(f"Fetching data for {TICKER} from {START_DATE} to {end_date}")
    data = yf.download(TICKER, start=START_DATE, end=end_date, interval=INTERVAL)
    
    # Make sure you have required columns
    data = data[['Open', 'High', 'Low', 'Close', 'Volume']]
    
    # Print the first few rows for debugging
    print("\nData sample:")
    print(data.head())
    
    return data

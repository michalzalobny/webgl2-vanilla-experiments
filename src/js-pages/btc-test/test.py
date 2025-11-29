# import pandas as pd

# # Load your CSV file
# df = pd.read_csv("btc_hourly.csv")

# # Convert Timestamp to datetime
# df['Datetime'] = pd.to_datetime(df['Timestamp'], unit='s')

# # Extract date only
# df['Date'] = df['Datetime'].dt.date

# # Keep only the first row for each date
# daily_df = df.groupby('Date').first().reset_index(drop=True)

# # Drop helper columns
# daily_df = daily_df[['Timestamp', 'Open', 'High', 'Low', 'Close', 'Volume']]

# # Save to new CSV
# daily_df.to_csv("btc_daily_first_hour.csv", index=False)

# print("Daily CSV created with first hour of each day.")




import pandas as pd
import matplotlib.pyplot as plt

def plot_prices(df, title, output_file):
    """
    Plots BTC prices over time.

    Parameters:
    - df: DataFrame with columns ['Timestamp', 'Open', 'High', 'Low', 'Close', 'Volume']
    - title: Title of the plot
    - output_file: Filename to save the plot
    """
    # Convert timestamp to datetime
    df['Datetime'] = pd.to_datetime(df['Timestamp'], unit='s')

    # Plot Close price
    plt.figure(figsize=(12, 6))
    plt.plot(df['Datetime'], df['Close'], label='Close Price', color='blue')
    plt.xlabel('Time')
    plt.ylabel('Price')
    plt.title(title)
    plt.grid(True)
    plt.legend()
    plt.tight_layout()
    plt.savefig(output_file)
    plt.close()
    print(f"Plot saved as {output_file}")


# Load hourly data
hourly_df = pd.read_csv("btc_hourly.csv")
plot_prices(hourly_df, "BTC Hourly Prices", "btc_hourly_plot.png")

# Load daily first-hour data
daily_df = pd.read_csv("btc_daily.csv")
plot_prices(daily_df, "BTC Daily First Hour Prices", "btc_daily_plot.png")


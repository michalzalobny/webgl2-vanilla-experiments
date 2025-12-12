import pandas as pd
import time

def cut_data_csv(from_ts=None, to_ts=None, input_file="./data.csv", output_file="./data_cut.csv"):
    # Load CSV
    df = pd.read_csv(input_file)

    # Default "from_ts" = 2019.01.01 in timestamp format
    if from_ts is None:
        from_ts = time.mktime(time.strptime("2025-11-24", "%Y-%m-%d"))

    # Default "to_ts" = timestamp from last row
    if to_ts is None:
        to_ts = df["Timestamp"].iloc[-1]

    # Filter rows
    df_cut = df[(df["Timestamp"] >= from_ts) & (df["Timestamp"] <= to_ts)]

    # Save to new CSV
    df_cut.to_csv(output_file, index=False)

    return df_cut
  
cut_data_csv()

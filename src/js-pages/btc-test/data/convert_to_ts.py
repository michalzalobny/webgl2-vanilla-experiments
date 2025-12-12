import csv

input_file = "./btc/daily/btc_daily.csv"
output_file = "./data.ts"

data = []

with open(input_file, "r") as f:
    reader = csv.DictReader(f)
    for row in reader:
        timestamp_ms = int(float(row["Timestamp"]) * 1000)
        price = float(row["Close"])
        data.append({"timestamp": timestamp_ms, "price": price})

# Write to TypeScript file
with open(output_file, "w") as f:
    f.write("export const data = [\n")
    for item in data:
        f.write(f"  {{ timestamp: {item['timestamp']}, price: {item['price']} }},\n")
    f.write("];\n")

print(f"Successfully created {output_file}")

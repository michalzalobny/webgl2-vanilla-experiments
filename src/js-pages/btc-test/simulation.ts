export interface PricePoint {
  timestamp: number; // ms
  price: number;
}

export interface Period {
  start: number; // ms
  end: number; // ms
}

export interface Transaction {
  timestamp: number;
  price: number;
  fiatInvested: number;
  assetAcquired: number;
  buyLogic: string;
}

export interface SimulationParams {
  prices: PricePoint[];
  period: Period;

  baseBuyAmount?: number;
  buyIntervalMs?: number;
  lookBackMs?: number;

  dipMultiplier?: number;
  riseMultiplier?: number;
  dipThresholdPercent?: number;
  dipExtraMultiple?: number;

  allowSelling?: boolean;
  sellMaximumPortfolioPercent?: number;
}

/** ——————————————————————————————————————— */
/** ------------------- HELPERS -------------- */
/** ——————————————————————————————————————— */

function avg(arr: number[]) {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

/** ——————————————————————————————————————— */
/** ----------------- SIMULATOR -------------- */
/** ——————————————————————————————————————— */

export function runSimulation({
  prices,
  period,
  baseBuyAmount = 100,
  buyIntervalMs = 30 * 24 * 60 * 60 * 1000, // default 30 days
  lookBackMs = 30 * 24 * 60 * 60 * 1000, // default 30 days

  dipMultiplier = 2,
  riseMultiplier = 2,
  dipThresholdPercent = 20,
  dipExtraMultiple = 20,

  allowSelling = false,
  sellMaximumPortfolioPercent = 1,
}: SimulationParams): number {
  const START = period.start;
  const END = period.end;
  const LB_EARLIEST = START - lookBackMs;

  // Filter + sort
  const all = prices
    .filter((p) => p.timestamp >= LB_EARLIEST && p.timestamp <= END)
    .sort((a, b) => a.timestamp - b.timestamp);

  if (all.length < 2) return 0;

  const sim = all.filter((p) => p.timestamp >= START);

  let totalFiat = 0;
  let totalAsset = 0;
  let lastBuyTs = START;

  const transactions: Transaction[] = [];

  for (const p of sim) {
    const sinceLastBuy = p.timestamp - lastBuyTs;
    if (sinceLastBuy < buyIntervalMs && transactions.length > 0) continue;

    let fiatToSpend = baseBuyAmount;
    let buyLogic = transactions.length === 0 ? 'INITIAL BUY' : 'STANDARD DCA';

    // --------------- LOOKBACK ----------------
    const lbStart = p.timestamp - lookBackMs;
    const lbPrices = all.filter((h) => h.timestamp >= lbStart && h.timestamp <= p.timestamp);

    const avgPrice = lbPrices.length > 0 ? avg(lbPrices.map((x) => x.price)) : p.price;

    const deviation = (p.price - avgPrice) / avgPrice;

    // --------------- BUY LOGIC ---------------
    if (transactions.length > 0) {
      if (deviation < 0) {
        // DIP BUY
        fiatToSpend += baseBuyAmount * Math.abs(deviation) * dipMultiplier;

        if (Math.abs(deviation) * 100 > dipThresholdPercent) {
          fiatToSpend += baseBuyAmount * dipExtraMultiple;
        }

        buyLogic = '📉 DIP BUY';
      } else if (deviation > 0) {
        // RISE BUY: spend less
        fiatToSpend -= baseBuyAmount * deviation * riseMultiplier;
        buyLogic = '📈 RISE BUY';

        // Selling logic
        if (fiatToSpend < 0 && allowSelling) {
          const maxSell = totalAsset * p.price * sellMaximumPortfolioPercent;
          const sellValue = Math.min(Math.abs(fiatToSpend), maxSell);

          totalAsset -= sellValue / p.price; // remove asset
          totalFiat += sellValue;

          fiatToSpend = -sellValue;
          buyLogic = '📈✂️ SELL';
        }
      }
    }

    // If no selling allowed, prevent negative buy
    if (!allowSelling) {
      fiatToSpend = Math.max(0, fiatToSpend);
    }

    const acquired = fiatToSpend / p.price;

    if (fiatToSpend > 0) totalFiat += fiatToSpend;
    totalAsset += acquired;
    lastBuyTs = p.timestamp;

    console.log(
      `${buyLogic} | ${deviation >= 0 ? '+' : '-'}${(Math.abs(deviation) * 100).toFixed(
        2,
      )}% | ${fiatToSpend >= 0 ? '+' : '-'}$${Math.abs(fiatToSpend).toFixed(
        2,
      )} | ${new Date(p.timestamp).toISOString()} | ASSET: ${totalAsset.toFixed(4)}`,
    );

    transactions.push({
      timestamp: p.timestamp,
      price: p.price,
      fiatInvested: fiatToSpend,
      assetAcquired: acquired,
      buyLogic,
    });
  }

  const lastPrice = sim[sim.length - 1].price;
  const portfolioValue = totalAsset * lastPrice;
  const profit = portfolioValue - totalFiat;
  const profitPercent = (profit / totalFiat) * 100;

  console.log(`Profit: ${profitPercent.toFixed(2)}%`);
  return profitPercent;
}

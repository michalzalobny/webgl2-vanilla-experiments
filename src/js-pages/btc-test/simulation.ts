import { avg, formatTimestamp } from './utils';

export interface PricePoint {
  timestamp: number; // ms
  price: number;
}

export interface Period {
  start: number; // ms
  end: number; // ms
}

type SimulationParams = {
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
};

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

  // Filter + sort -> Optimize prices, so we only iterate through the ones in selected period including the maximum lookback
  const all = prices
    .filter((p) => p.timestamp >= LB_EARLIEST && p.timestamp <= END)
    .sort((a, b) => a.timestamp - b.timestamp);

  if (all.length < 2) {
    console.log('Not enough price points to run the strategy.');
    return 0;
  }

  // Include timestamps from Start to End only in the simulation
  const sim = all.filter((p) => p.timestamp >= START);

  let totalFiat = 0;
  let totalAsset = 0;
  let lastBuyTs = START;

  // Running the simulation
  for (const p of sim) {
    const sinceLastBuy = p.timestamp - lastBuyTs;
    if (sinceLastBuy < buyIntervalMs) continue;
    lastBuyTs = p.timestamp;

    let fiatToSpend = baseBuyAmount;
    let buyLogic = '';

    // Get average price from lookback window
    const lbStart = p.timestamp - lookBackMs;
    const lbPrices = all.filter((h) => h.timestamp >= lbStart && h.timestamp <= p.timestamp);
    const avgPrice = lbPrices.length > 0 ? avg(lbPrices.map((x) => x.price)) : p.price;
    const deviation = (p.price - avgPrice) / avgPrice;

    // == BUY LOGIC ==
    if (deviation < 0) {
      // DIP BUY
      fiatToSpend += baseBuyAmount * Math.abs(deviation) * dipMultiplier;

      //Buy even more if dip threshold is big enough
      if (Math.abs(deviation) * 100 > dipThresholdPercent) {
        fiatToSpend += baseBuyAmount * dipExtraMultiple;
      }
      buyLogic = '📉 DIP BUY';
    } else if (deviation > 0) {
      // RISE BUY: spend less
      fiatToSpend -= baseBuyAmount * deviation * riseMultiplier;
      buyLogic = '📈 RISE BUY';

      // Selling logic
      if (fiatToSpend < 0) {
        if (allowSelling) {
          const maxSell = totalAsset * p.price * sellMaximumPortfolioPercent;
          const sellValue = Math.min(Math.abs(fiatToSpend), maxSell);

          totalAsset -= sellValue / p.price; // remove asset
          totalFiat += sellValue;

          fiatToSpend = -sellValue;
          buyLogic = '📈✂️ SELL';
        } else {
          fiatToSpend = 0;
        }
      }
    }

    // // If no selling allowed, prevent negative buy
    // if (!allowSelling) {
    //   fiatToSpend = Math.max(0, fiatToSpend);
    // }

    const acquired = fiatToSpend / p.price;

    if (fiatToSpend > 0) totalFiat += fiatToSpend;
    totalAsset += acquired;

    console.log(
      `${buyLogic} | ${deviation >= 0 ? '+' : '-'}${(Math.abs(deviation) * 100).toFixed(
        2,
      )}% | ${fiatToSpend >= 0 ? '+' : '-'}$${Math.abs(fiatToSpend).toFixed(
        2,
      )} | ASSET: ${totalAsset.toFixed(4)} | ${formatTimestamp(p.timestamp)}`,
    );
  }

  const lastPrice = sim[sim.length - 1].price;
  const portfolioValue = totalAsset * lastPrice;
  const profit = portfolioValue - totalFiat;
  const profitPercent = (profit / totalFiat) * 100;

  console.log(`💰 Profit: ${profitPercent.toFixed(2)}%`);
  return profitPercent;
}

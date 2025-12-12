import { runSimulation, Period, PricePoint } from './simulation';

import { data } from './data/btc/daily/data';
import { worstPeriods, bestPeriods } from './data/btc/periods';

// Helpers
const oneHour = () => 60 * 60 * 1000;
const oneDay = () => 24 * oneHour();
const oneMonth = () => 30 * oneDay();

// Keep your parameter search grids:
const buyIntervalsMs = [oneMonth(), 2 * oneMonth()];
const lookBacksMs = [2 * oneMonth()];
const dipMultipliers = [4];
const riseMultipliers = [0, 2, 4];
const dipThresholdPercents = [20];
const dipExtraMultiples = [4, 2];
const allowSeelings = [true];
const sellMaximumPortfolioPercents = [0, 1, 0.3, 0.7];

function optimizeParameters(period: Period, prices: PricePoint[]) {
  let bestProfit = -Infinity;
  let bestParams;

  for (const buyIntervalMs of buyIntervalsMs) {
    for (const lookBackMs of lookBacksMs) {
      for (const dipMultiplier of dipMultipliers) {
        for (const riseMultiplier of riseMultipliers) {
          for (const dipThresholdPercent of dipThresholdPercents) {
            for (const dipExtraMultiple of dipExtraMultiples) {
              for (const allowSelling of allowSeelings) {
                for (const sellMaximumPortfolioPercent of sellMaximumPortfolioPercents) {
                  const profitPercent = runSimulation({
                    period,
                    prices,
                    buyIntervalMs: buyIntervalMs,
                    lookBackMs: lookBackMs,
                    dipMultiplier,
                    riseMultiplier,
                    dipThresholdPercent,
                    dipExtraMultiple,
                    allowSelling,
                    sellMaximumPortfolioPercent,
                  });

                  if (profitPercent > bestProfit) {
                    bestProfit = profitPercent;

                    bestParams = {
                      period,
                      buyIntervalMs: buyIntervalMs * oneDay(),
                      lookBackMs: lookBackMs * oneMonth(),
                      dipMultiplier,
                      riseMultiplier,
                      dipThresholdPercent,
                      dipExtraMultiple,
                      allowSelling,
                      sellMaximumPortfolioPercent,
                    };
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  console.log('Best Parameters:', bestParams);
  console.log(`Best Profit: ${bestProfit.toFixed(2)}%`);
  return bestParams;
}

// let selectedPeriod = {
//   start: Date.parse('2020-01-01'),
//   end: Date.parse('2025-01-10'),
// };

const selectedPeriod = worstPeriods[3];
// optimizeParameters(selectedPeriod, data);

runSimulation({
  period: {
    // start: Date.parse('2025-10-24'), //y-m-d
    // end: Date.parse('2025-11-31'), // //y-m-d
    // start: 1763938800000,
    // end: 1764374220000,
    // start: Date.parse('2024-01-01'),
    // end: Date.parse('2025-01-10'),
    start: Date.parse(selectedPeriod.start),
    end: Date.parse(selectedPeriod.end),
  },
  prices: data,
  buyIntervalMs: oneMonth(),
  lookBackMs: oneMonth(),

  dipMultiplier: 2,
  riseMultiplier: 2,

  dipThresholdPercent: 20,
  dipExtraMultiple: 4,

  allowSelling: true,
  sellMaximumPortfolioPercent: 0.5,
});

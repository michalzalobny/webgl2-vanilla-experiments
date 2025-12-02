import { worstPeriods, bestPeriods, averagePeriods } from './realBtcPrices';
import { runSimulation, Period } from './simulation';

const periods: Period[][] = [worstPeriods, bestPeriods, averagePeriods];

interface SimulationParams {
  period: { start: string; end: string };
  baseBuyAmount?: number;
  buyIntervalDays?: number;
  lookBackMonths?: number;
  dipMultiplier?: number;
  riseMultiplier?: number;
  dipThresholdPercent?: number;
  dipExtraMultiple?: number;
  allowSelling?: boolean;
  sellMaximumPortfolioPercent?: number;
}

const baseBuyAmounts = [100];
const buyIntervals = [30, 60];
const lookBackMonthsList = [2];
const dipMultipliers = [4];
const riseMultipliers = [0, 2, 4];
const dipThresholdPercents = [20];
const dipExtraMultiples = [4, 2];
const allowSeelings = [true];
const sellMaximumPortfolioPercents = [0, 1, 0.3, 0.7];

function optimizeParameters(period: { start: string; end: string }) {
  let bestProfit = -Infinity;
  let bestParams: SimulationParams | null = null;

  for (const baseBuyAmount of baseBuyAmounts) {
    for (const buyIntervalDays of buyIntervals) {
      for (const lookBackMonths of lookBackMonthsList) {
        for (const dipMultiplier of dipMultipliers) {
          for (const riseMultiplier of riseMultipliers) {
            for (const dipThresholdPercent of dipThresholdPercents) {
              for (const dipExtraMultiple of dipExtraMultiples) {
                for (const allowSelling of allowSeelings) {
                  for (const sellMaximumPortfolioPercent of sellMaximumPortfolioPercents) {
                    const profitPercent = runSimulation({
                      period,
                      baseBuyAmount,
                      buyIntervalDays,
                      lookBackMonths,
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
                        baseBuyAmount,
                        buyIntervalDays,
                        lookBackMonths,
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
  }

  console.log('Best Parameters:');
  console.log(bestParams);
  console.log(`Profit Percent: ${bestProfit.toFixed(2)}%`);
  return bestParams;
}

let selectedPeriod = {
  start: '2020-01-01',
  end: '2025-01-10',
  reason: '',
};

// selectedPeriod = averagePeriods[3];

// optimizeParameters(selectedPeriod);

// runSimulation({
//   period: selectedPeriod,
//   baseBuyAmount: 400,
//   buyIntervalDays: 30,
//   lookBackMonths: 2,
//   dipMultiplier: 0,
//   riseMultiplier: 3,
//   dipThresholdPercent: 20,
//   dipExtraMultiple: 8,
//   allowSelling: true,
//   sellMaximumPortfolioPercent: 1,
// });

runSimulation({
  period: {
    start: Date.parse('2020-01-01'),
    end: Date.parse('2024-01-01'),
  },
  prices: [
    { timestamp: 1609459200000, price: 730 },
    { timestamp: 1609545600000, price: 740 },
  ],
});

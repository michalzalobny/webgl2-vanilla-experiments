import { realBtcPrices } from './realBtcPrices';

/**
 * CONFIGURATION VARIABLES
 * Adjust these variables to change the simulation scenario and strategy.
 */

// --- Scenario Period ---
const START_DATE_STR: string = '2023-01-01';
const END_DATE_STR: string = '2024-01-01';

// --- Strategy Variables ---
const BUY_INTERVAL_DAYS: number = 30; // How often a buy is triggered (e.g., 30 days)
const BASE_FIAT_BUY_AMOUNT: number = 500; // Standard amount to invest (in USD)
const DROP_MULTIPLIER: number = 4; // Multiplier for the extra buy amount on dips (4x the drop percentage)

// --- Mock Data Simulation ---

/**
 * Simulates fetching historical BTC prices at regular intervals.
 * In a real application, this would be an asynchronous call to a service like CoinAPI or CCXT.
 *
 * This mock data covers a year, with prices simulating volatility (in USD).
 * Format: { date: string, price: number }
 */

interface Transaction {
  date: string;
  btcPrice: number;
  fiatInvested: number;
  btcAcquired: number;
  buyLogic: string;
}

/**
 * Runs the conditional DCA simulation based on the configured parameters.
 */
function runSimulation() {
  console.log('====================================================');
  console.log('🚀 Conditional BTC DCA Simulation Initiated');
  console.log('====================================================');

  if (realBtcPrices.length < 2) {
    console.error('Error: Mock data must contain at least two data points (start and end).');
    return;
  }

  const startPrice: number = realBtcPrices[0].price;
  const finalPrice: number = realBtcPrices[realBtcPrices.length - 1].price;

  let totalFiatInvested: number = 0;
  let totalBtcAcquired: number = 0;
  let previousBtcPrice: number = startPrice; // Used to track the price from the *last* buy
  const transactions: Transaction[] = [];

  console.log(`SCENARIO PERIOD: ${START_DATE_STR} to ${END_DATE_STR}`);
  console.log(`BASE BTC START PRICE: $${startPrice.toFixed(2)}`);
  console.log(`BASE BTC END PRICE: $${finalPrice.toFixed(2)}`);
  console.log('---');
  console.log(`Buy Interval: ${BUY_INTERVAL_DAYS} days`);
  console.log(`Base Buy: $${BASE_FIAT_BUY_AMOUNT}`);
  console.log(`Dip Multiplier (x): ${DROP_MULTIPLIER}`);
  console.log('====================================================');

  // 2. Simulation Loop (using the mock data points as buy opportunities)
  realBtcPrices.forEach((currentPoint, index) => {
    if (index === 0) {
      // First transaction (initial buy)
      const fiatInvested = BASE_FIAT_BUY_AMOUNT;
      const btcAcquired = fiatInvested / currentPoint.price;
      totalFiatInvested += fiatInvested;
      totalBtcAcquired += btcAcquired;
      previousBtcPrice = currentPoint.price;

      transactions.push({
        date: currentPoint.date,
        btcPrice: currentPoint.price,
        fiatInvested,
        btcAcquired,
        buyLogic: 'INITIAL BUY (Base $500)',
      });

      console.log(
        `[${currentPoint.date}] - Price: $${currentPoint.price.toFixed(2)} | Buy: $${fiatInvested.toFixed(2)} (Initial) | BTC Acquired: ${btcAcquired.toFixed(8)}`,
      );
      return;
    }

    // Logic for subsequent transactions
    const currentPrice = currentPoint.price;
    let fiatInvested = BASE_FIAT_BUY_AMOUNT; // Start with base buy amount
    let buyLogic: string;

    if (currentPrice < previousBtcPrice) {
      // Price dropped since the last purchase: Trigger conditional buy
      const priceDropPercentage = (previousBtcPrice - currentPrice) / previousBtcPrice;
      const extraBuyAmount = BASE_FIAT_BUY_AMOUNT * priceDropPercentage * DROP_MULTIPLIER;
      fiatInvested += extraBuyAmount;
      buyLogic = `DIP BUY (+${(priceDropPercentage * 100).toFixed(1)}% drop, extra $${extraBuyAmount.toFixed(2)})`;
    } else {
      // Price increased or stayed the same: Standard DCA buy
      buyLogic = 'STANDARD DCA (Price Increased)';
    }

    const btcAcquired = fiatInvested / currentPrice;

    // Update overall totals
    totalFiatInvested += fiatInvested;
    totalBtcAcquired += btcAcquired;
    previousBtcPrice = currentPrice; // Update the previous price for the next comparison

    transactions.push({
      date: currentPoint.date,
      btcPrice: currentPrice,
      fiatInvested,
      btcAcquired,
      buyLogic,
    });

    // Log transaction details
    console.log(
      `[${currentPoint.date}] - Price: $${currentPrice.toFixed(2)} | Buy: $${fiatInvested.toFixed(2)} (${buyLogic}) | BTC Acquired: ${btcAcquired.toFixed(8)}`,
    );
  });

  // 3. Final Calculation and Results
  console.log('\n====================================================');
  console.log('📊 SIMULATION SUMMARY');
  console.log('====================================================');

  const finalPortfolioValue = totalBtcAcquired * finalPrice;
  const profitLoss = finalPortfolioValue - totalFiatInvested;
  const percentageReturn = (profitLoss / totalFiatInvested) * 100;
  const averageCostPerBtc = totalFiatInvested / totalBtcAcquired;

  console.log(`Total Fiat Invested:    $${totalFiatInvested.toFixed(2)}`);
  console.log(`Total BTC Acquired:     ${totalBtcAcquired.toFixed(8)} BTC`);
  console.log(`Average Cost Per BTC:   $${averageCostPerBtc.toFixed(2)}`);
  console.log('---');
  console.log(`Final BTC Price:        $${finalPrice.toFixed(2)}`);
  console.log(`Final Portfolio Value:  $${finalPortfolioValue.toFixed(2)}`);
  console.log('---');
  console.log(`Total Profit / (Loss):  $${profitLoss.toFixed(2)}`);
  console.log(`Percentage Return (ROI): ${percentageReturn.toFixed(2)}%`);
  console.log('====================================================');

  // Optional: Log all detailed transactions
  // console.log('\n--- DETAILED TRANSACTION LOG ---');
  // console.log(transactions);
}

// Execute the simulation
runSimulation();

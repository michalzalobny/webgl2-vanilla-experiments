import { realBtcPrices } from './realBtcPrices';

/**
 * CONFIGURATION VARIABLES
 */
const START_DATE_STR: string = '2022-11-06';
const END_DATE_STR: string = '2023-04-03';

const BUY_INTERVAL_DAYS: number = 30; // Buy every 30 days
const BASE_FIAT_BUY_AMOUNT: number = 500; // USD
const DROP_MULTIPLIER: number = 4; // Extra buy multiplier on dips

/**
 * Transaction interface
 */
interface Transaction {
  date: string;
  btcPrice: number;
  fiatInvested: number;
  btcAcquired: number;
  buyLogic: string;
}

/**
 * Run the conditional DCA simulation
 */
function runSimulation() {
  console.log('====================================================');
  console.log('🚀 Conditional BTC DCA Simulation Initiated');
  console.log('====================================================');

  // Filter prices within the scenario period
  const filteredPrices = realBtcPrices.filter((p) => p.date >= START_DATE_STR && p.date <= END_DATE_STR);

  if (filteredPrices.length < 2) {
    console.error('Error: Not enough data points for simulation.');
    return;
  }

  const startPrice = filteredPrices[0].price;
  const finalPrice = filteredPrices[filteredPrices.length - 1].price;

  let totalFiatInvested = 0;
  let totalBtcAcquired = 0;
  let previousBtcPrice = startPrice;
  const transactions: Transaction[] = [];

  console.log(`SCENARIO PERIOD: ${START_DATE_STR} to ${END_DATE_STR}`);
  console.log(`BASE BTC START PRICE: $${startPrice.toFixed(2)}`);
  console.log(`BASE BTC END PRICE: $${finalPrice.toFixed(2)}`);
  console.log('---');
  console.log(`Buy Interval: ${BUY_INTERVAL_DAYS} days`);
  console.log(`Base Buy: $${BASE_FIAT_BUY_AMOUNT}`);
  console.log(`Dip Multiplier (x): ${DROP_MULTIPLIER}`);
  console.log('====================================================');

  filteredPrices.forEach((currentPoint, index) => {
    // Enforce buy interval
    if (index % BUY_INTERVAL_DAYS !== 0 && index !== 0) return;

    let fiatInvested = BASE_FIAT_BUY_AMOUNT;
    let buyLogic: string;

    if (index === 0) {
      buyLogic = `INITIAL BUY (Base $${BASE_FIAT_BUY_AMOUNT})`;
    } else if (currentPoint.price < previousBtcPrice) {
      const priceDropPercentage = (previousBtcPrice - currentPoint.price) / previousBtcPrice;
      const extraBuyAmount = BASE_FIAT_BUY_AMOUNT * priceDropPercentage * DROP_MULTIPLIER;
      fiatInvested += extraBuyAmount;
      buyLogic = `DIP BUY (+${(priceDropPercentage * 100).toFixed(1)}% drop, extra $${extraBuyAmount.toFixed(2)})`;
    } else {
      buyLogic = 'STANDARD DCA (Price Increased)';
    }

    const btcAcquired = fiatInvested / currentPoint.price;

    totalFiatInvested += fiatInvested;
    totalBtcAcquired += btcAcquired;
    previousBtcPrice = currentPoint.price;

    transactions.push({
      date: currentPoint.date,
      btcPrice: currentPoint.price,
      fiatInvested,
      btcAcquired,
      buyLogic,
    });

    console.log(
      `[${currentPoint.date}] - Price: $${currentPoint.price.toFixed(2)} | Buy: $${fiatInvested.toFixed(2)} (${buyLogic}) | BTC Acquired: ${btcAcquired.toFixed(8)}`,
    );
  });

  // Summary
  console.log('\n====================================================');
  console.log('📊 SIMULATION SUMMARY');
  console.log('====================================================');

  const finalPortfolioValue = totalBtcAcquired * finalPrice;
  const profitLoss = finalPortfolioValue - totalFiatInvested;
  const percentageReturn = (profitLoss / totalFiatInvested) * 100;
  const averageCostPerBtc = totalFiatInvested / totalBtcAcquired;

  console.log(`Total Fiat Invested:    $${totalFiatInvested.toFixed(2)}`);
  // console.log(`Total BTC Acquired:     ${totalBtcAcquired.toFixed(8)} BTC`);
  // console.log(`Average Cost Per BTC:   $${averageCostPerBtc.toFixed(2)}`);
  // console.log('---');
  // console.log(`Final BTC Price:        $${finalPrice.toFixed(2)}`);
  console.log(`Final Portfolio Value:  $${finalPortfolioValue.toFixed(2)}`);
  console.log('---');
  console.log(`Total Profit / (Loss):  $${profitLoss.toFixed(2)}`);
  console.log(`Percentage Return (ROI): ${percentageReturn.toFixed(2)}%`);
  console.log('====================================================');

  // Optional: Log all detailed transactions
  // console.log('\n--- DETAILED TRANSACTION LOG ---');
  // console.log(transactions);
}

// Execute simulation
runSimulation();

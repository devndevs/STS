import { stockInfo, capital } from "./finnhub.js";

let buyingPower = capital;
const recommendedStocks = [];
const stockTransactions = [];
const ownedStocks = [];
// console.log(firstAppData);

//TODO: sell stocks that below 6% eps
function sellUnderPerformers(stocks) {
  let accumulatedCash = 0;
  stocks.forEach((stock) => {
    //TODO: remember to reverse owned statement
    if (stock.epsEstimate < 0.06 && stock.owned) {
      console.log(`Selling ${stock.symbol} for ${stock.price}`);
      accumulatedCash += stock.price - 15;
      stockTransactions.push(stock);
      return;
    } else if (stock.epsEstimate > 0.06 && !stock.owned) {
      recommendedStocks.push(stock);
      return;
    }
  });
  return accumulatedCash;
}
buyingPower += sellUnderPerformers(stockInfo);
console.log("buying power: ", buyingPower);

function buyStocks(stocks) {
  let startingCash = buyingPower;
  let accumulatedCash = 0;
  stocks.forEach((stock) => {
    if (
      stock.strongSell - stock.strongBuy - 1 > 0.2 &&
      !stock.owned &&
      stock.sell - stock.buy - 1 < 0.2
    ) {
      if (accumulatedCash < stock.price && startingCash < stock.price) {
        console.log(`Not enough cash to buy ${stock.symbol}`);
        return;
      }
      console.log(`Buying ${stock.symbol} for ${stock.price}`);
      accumulatedCash -= stock.price - 15;
      stock.owned = !stock.owned;
      ownedStocks.push(stock);
      stockTransactions.push(stock);
      return accumulatedCash;
    } else if (stock.owned) {
      console.log(`Selling ${stock.symbol} for ${stock.price}`);
      accumulatedCash += stock.currentPrice - 15;
      stockTransactions.push(stock);
      return accumulatedCash;
    }
  });
  return (accumulatedCash += startingCash);
}

buyStocks(recommendedStocks);
// console.log("recommendedStocks", recommendedStocks);
// console.log("stockTransactions", stockTransactions);
// console.log("ownedStocks", ownedStocks);
console.log("buyingPower", buyingPower);

// - TODO Track all stocks purchased
// - TODO Track all transactions */

import { stockInfo, capital } from "./finnhub.js";
import fs from "fs/promises";

const ownedStocksFromDb = fs.readFile("dataBases/ownedStocks.json", {
  encoding: "utf8",
});
let stonks =
  ownedStocksFromDb.length > 0
    ? [...JSON.parse(ownedStocksFromDb), ...stockInfo]
    : stockInfo;
let buyingPower = capital;
const recommendedStocks = [];
const stockTransactions = [];
const ownedStocks = [];

//TODO: sell stocks that below 6% eps
function sellUnderPerformers(stocks) {
  let startingCash = buyingPower;
  let accumulatedCash = 0;
  stocks.forEach((stock) => {
    if (stock.epsEstimate < 0.06 && stock.owned) {
      console.log(`Selling ${stock.symbol} for ${stock.price}`);
      accumulatedCash += stock.price;
      accumulatedCash -= 15;
      stockTransactions.push(stock);
      return;
    } else if (stock.epsEstimate > 0.06 && !stock.owned) {
      recommendedStocks.push(stock);
      return;
    }
  });
  return (accumulatedCash += startingCash);
}
buyingPower = sellUnderPerformers(stonks);

function buyStocks(stocks) {
  let startingCash = buyingPower;
  let accumulatedCash = 0;
  stocks.forEach((stock) => {
    if (
      stock.strongSell - stock.strongBuy - 1 > 0.2 &&
      !stock.owned &&
      stock.sell - stock.buy - 1 < 0.2
    ) {
      if (stock.price > startingCash + accumulatedCash) {
        console.log(`Not enough cash to buy ${stock.symbol}`);
        return;
      }
      console.log(`Buying ${stock.symbol} for ${stock.price}`);
      accumulatedCash -= stock.price;
      accumulatedCash -= 15;

      stock.owned = !stock.owned;
      ownedStocks.push(stock);
      stockTransactions.push(stock);
      return;
    } else if (stock.owned) {
      console.log(`Selling ${stock.symbol} for ${stock.price}`);
      accumulatedCash += stock.currentPrice;
      accumulatedCash -= 15;
      stockTransactions.push(stock);
      return;
    }
  });
  return (accumulatedCash += startingCash);
}

buyingPower = buyStocks(recommendedStocks);

console.log(`Your buying power is: ${buyingPower}`);
console.log("Your stock transactions are:", stockTransactions);
console.log("Your owned stocks are:", ownedStocks);

fs.writeFile("dataBases/ownedStocks.json", JSON.stringify(ownedStocks));
fs.writeFile("dataBases/money.json", JSON.stringify(buyingPower));

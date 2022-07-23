import { randomUUID } from "node:crypto";
import { finnhubClient } from "./finnhubKey.js";
import fs from "fs/promises";

class Stock {
  constructor({
    symbol,
    date,
    epsActual,
    epsEstimate,
    buy,
    sell,
    strongBuy,
    strongSell,
    price,
  }) {
    this.id = randomUUID();
    this.symbol = symbol;
    this.date = date;
    this.epsActual = epsActual;
    this.epsEstimate = epsEstimate;
    this.buy = buy;
    this.sell = sell;
    this.strongBuy = strongBuy;
    this.strongSell = strongSell;
    this.price = price;
    this.owned = false;
  }
}

let currentDate = new Date();
let cday = currentDate.getDate();
let cMonth = currentDate.getMonth() + 1;
let cYear = currentDate.getFullYear();
let today = `${cYear}-${cMonth}-${cday}`;
let pastWeek = cYear + "-" + cMonth + "-" + (cday - 7);

// getStockDataEveryMin()

/**
 *
 * @param {}
 * @returns {promise[array]}
 */

async function companyEarningsCal() {
  const earningsApiCall = await new Promise((resolve, reject) => {
    finnhubClient.earningsCalendar(
      { from: pastWeek, to: today },
      (error, data) => {
        if (error) {
          return reject(error);
        }
        return resolve(data.earningsCalendar.slice(150, 165));
      }
    );
  });
  return earningsApiCall;
}

const companyEarnings = await companyEarningsCal();
/**
 *
 * @param {array, key} array, key
 * @returns {array}
 *
 */
function removeDuplicateObjectFromArray(array, key) {
  var check = new Set();
  return array.filter((obj) => !check.has(obj[key]) && check.add(obj[key]));
}
const filteredCompanyEarnings = removeDuplicateObjectFromArray(
  companyEarnings,
  "symbol"
);
/**
 *
 * @param {array} getStockSymbol
 * @returns {promise[array]}
 */

const getStockSymbol = filteredCompanyEarnings.map((stock) => {
  return stock.symbol;
});

/**
 *
 * @param {} getStockSymbol
 * @returns {promise[array]}
 */
async function estimatedPriceApiCall() {
  const mappedPrice = await getStockSymbol.map((symbol) => {
    return new Promise((resolve, reject) => {
      finnhubClient.quote(symbol, (error, data) => {
        if (error) {
          return reject(error);
        }
        return resolve(data.c);
      });
    });
  });
  return await Promise.all(mappedPrice);
}

/**
 *
 * @param {} getStockSymbol
 * @returns {promise[array]}
 */
async function recommendationTrendsApiCall() {
  const mappedRecommendation = await getStockSymbol.map((symbol) => {
    return new Promise((resolve, reject) => {
      finnhubClient.recommendationTrends(symbol, (error, data) => {
        if (error) {
          return reject(error);
        }
        return resolve(Object.assign({}, ...data));
      });
    });
  });
  return await Promise.all(mappedRecommendation);
}

async function createStockInstance() {
  try {
    const estimatedPrice = await estimatedPriceApiCall();
    const recommendationTrends = await recommendationTrendsApiCall();
    const stockInstance = filteredCompanyEarnings.map((stock, index) => {
      return new Stock({
        symbol: stock.symbol,
        date: stock.date,
        epsActual: stock.epsActual,
        epsEstimate: stock.epsEstimate,
        buy: recommendationTrends[index].buy,
        sell: recommendationTrends[index].sell,
        strongBuy: recommendationTrends[index].strongBuy,
        strongSell: recommendationTrends[index].strongSell,
        price: estimatedPrice[index],
      });
    });
    return stockInstance;
  } catch (error) {
    console.log("error");
  }
}

export const stockInfo = await createStockInstance();

// async function hydrateAppFromApi() {
//   try {
//     const getDataApi = await stockInfo;
//     const getDataDb = await fs.readFile("./rawStockData.json");
//     const writeData = await fs.writeFile(
//       "./rawStockData.json",
//       JSON.stringify(getDataApi)
//     );
//     if (getDataDb.length === 0) {
//       await writeData;
//       await getDataDb;
//       return JSON.parse(getDataDb);
//     } else {
//       await getDataDb;
//       return JSON.parse(getDataDb);
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }

async function capitalBank() {
  try {
    const data = await fs.readFile("money.json", { encoding: "utf8" });
    return JSON.parse(data);
  } catch (err) {
    console.log(err);
  }
}

export const capital = await capitalBank();

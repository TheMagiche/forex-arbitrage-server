/*
 *   Denote weight of edge 1 = W1, edge 2 = W2, edge 3 = W3 ...edge n = Wn
 *   Arbitrage opportunity arises when a cycle2 is found in the graph and the edge weights satisfy
 *   the edge weights in the following equation:
 *       W1*W2*W3*...*Wn > 1
 *   But in order to apply Graph Algorithms and avoid complexity we transform the equation by taking
 *    natural logarithm on both sides of the equation
 *      log(W1)+log(W2)+log(W3)+...+log(Wn) > 0
 *   Now negating the above equation(Multiplying it by(-1)), we get:
 *       (-log(W1))+(-log(W2)+(-log(W3))+...+(-llog(Wn)) < 0
 *   Therefore, if we can find a cycle of vertices such that the sum of their weights is negative
 *    then a situation of arbitrage is possible
 *
 */

/*
 *  BELLMAN-FORD ALGORITHM
 *  Let Wu denote the weight of vertex u and Wux denote the weight edge from source
 *  vertex u to destination vertex v.
 *  1. List down all the edges of the graph. This can be performed using Adjacency-List
 *     Representation of the graph
 *  2. Calculate Number of Iteration which is equal to 'V-1' where V is the number of vertices
 *  3. Choose any Source vertex and assign the distance value of the source 0^3 and other vertices to
 *     infinity
 *  4. Start iterations
 *  5. In each iternation if Wu + Wu,v < Wv, then Wv = Wu + Wuv. Therefore every edge is relaxed and the
 *      weight of each vertec is updated accordingly
 *  6. By the end of the last iteration, we will end up with some shortest paht from the Source to every
 *     vertex
 *
 */

import Axios from 'axios'
import fs from 'fs'
import {Graph} from './graph'

interface IExchangeRateResponse {
  base: string
  results: {
    [key: string]: number
  }
  updated: string
  ms: number
}

export async function getArbitrageData(api_key: string) {
  console.log('Fetching arbitrage data ....')
  let arbitrageData: any = {}
  const currencies = [
    'AED',
    'AFN',
    'ALL',
    'AMD',
    'ANG',
    'AOA',
    'ARS',
    'AUD',
    'AWG',
    'AZN',
    'BAM',
    'BBD',
    'BDT',
    'BGN',
    'BHD',
    'BIF',
    'BMD',
    'BND',
    'BOB',
    'BRL',
    'BSD',
    'BTN',
    'BWP',
    'BZD',
    'CAD',
    'CDF',
    'CHF',
    'CLF',
    'CLP',
    'CNH',
    'CNY',
    'COP',
    'CUP',
    'CVE',
    'CZK',
    'DJF',
    'DKK',
    'DOP',
    'DZD',
    'EGP',
    'ERN',
    'ETB',
    'EUR',
    'FJD',
    'FKP',
    'GBP',
    'GEL',
    'GHS',
    'GIP',
    'GMD',
    'GNF',
    'GTQ',
    'GYD',
    'HKD',
    'HNL',
    'HRK',
    'HTG',
    'HUF',
    'IDR',
    'ILS',
    'INR',
    'IQD',
    'IRR',
    'ISK',
    'JMD',
    'JOD',
    'JPY',
    'KES',
    'KGS',
    'KHR',
    'KMF',
    'KPW',
    'KRW',
    'KWD',
    'KYD',
    'KZT',
    'LAK',
    'LBP',
    'LKR',
    'LRD',
    'LSL',
    'LYD',
    'MAD',
    'MDL',
    'MGA',
    'MKD',
    'MMK',
    'MNT',
    'MOP',
    'MRU',
    'MUR',
    'MVR',
    'MWK',
    'MXN',
    'MYR',
    'MZN',
    'NAD',
    'NGN',
    'NOK',
    'NPR',
    'NZD',
    'OMR',
    'PAB',
    'PEN',
    'PGK',
    'PHP',
    'PKR',
    'PLN',
    'PYG',
    'QAR',
    'RON',
    'RSD',
    'RUB',
    'RWF',
    'SAR',
    'SCR',
    'SDG',
    'SEK',
    'SGD',
    'SHP',
    'SLL',
    'SOS',
    'SRD',
    'SYP',
    'SZL',
    'THB',
    'TJS',
    'TMT',
    'TND',
    'TOP',
    'TRY',
    'TTD',
    'TWD',
    'TZS',
    'UAH',
    'UGX',
    'USD',
    'UYU',
    'UZS',
    'VND',
    'VUV',
    'WST',
    'XAF',
    'XCD',
    'XDR',
    'XOF',
    'XPF',
    'YER',
    'ZAR',
    'ZMW'
  ]
  for (let i in currencies) {
    await Axios.get<IExchangeRateResponse>(
      `https://api.fastforex.io/fetch-all?from=${currencies[i]}&api_key=${api_key}`
    )
      .then(response => {
        arbitrageData[currencies[i]] = response.data.results
        console.log('saved ', currencies[i])
      })
      .catch(error => {
        console.log(error.response)
      })
  }
  fs.writeFile(
    './src/data/arbitrage.json',
    JSON.stringify(arbitrageData),
    error => {
      if (error) {
        throw error
      }
      console.log('Arbitrage file saved')
    }
  )
  console.log('Data fetch complete .....')
}

export default function ArbitrageCalculator(
  base_currency: string,
  exchangeRates: any
) {
  // generate graph
  let graph = new Graph()
  for (const source in exchangeRates) {
    for (const destination in exchangeRates[source]) {
      graph.setEdge(source, destination, exchangeRates[source][destination])
    }
  }
  let results = graph.getMaxNegativeCycle(exchangeRates, base_currency)
  return results
}

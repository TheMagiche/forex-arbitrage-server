import {Request, Response} from 'express'
import Axios from 'axios'
import ArbitrageCalculator, {getArbitrageData} from '../helpers/arbitrage'
import * as sample from '../data/sampleRate.json'
import * as arbitrage from '../data/arbitrage.json'
interface IExchangeRateResponse {
  base: string
  results: {
    [key: string]: number
  }
  updated: string
  ms: number
}

export async function computeArbitrage(req: Request, res: Response) {
  try {
    const args: {apiKey: string; baseCurrency: string} = {
      apiKey: req.body.apiKey,
      baseCurrency: req.body.baseCurrency
    }
    const exchangeRates = await Axios.get<IExchangeRateResponse>(
      `https://api.fastforex.io/fetch-all?from=${args.baseCurrency}&api_key=${args.apiKey}`
    )
      .then(response => response.data)
      .catch(e => {
        console.log(e.response.data)
      })
    if (exchangeRates) {
      // save arbitrage data if null use saved data
      let arbitrageData = arbitrage
      //ts-ignore
      const rates = exchangeRates['results']
      const computedArbitrage = ArbitrageCalculator(
        args.baseCurrency,
        arbitrageData
      )
      const serializedExchange = Object.keys(rates).map(rate => ({
        code: rate,
        value: rates[rate]
      }))

      //ts-ignore
      res.send({
        rates: serializedExchange,
        date: exchangeRates['updated'],
        arbitrage: computedArbitrage
      })
    } else {
      // save arbitrage data if null use saved data
      let arbitrageData: any = sample
      //ts-ignore
      const rates = arbitrageData[args.baseCurrency]
      const computedArbitrage = ArbitrageCalculator(
        args.baseCurrency,
        arbitrageData
      )
      const serializedExchange = Object.keys(rates).map(rate => ({
        code: rate,
        value: rates[rate]
      }))

      const today = new Date()
      //ts-ignore
      res.send({
        rates: serializedExchange,
        date: today.toISOString().toString(),
        arbitrage: computedArbitrage
      })
    }
  } catch {
    res.status(400).json({msg: 'Something went wrong'})
  }
}

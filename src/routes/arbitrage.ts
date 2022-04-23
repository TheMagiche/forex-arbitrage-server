import {Request, Response} from 'express'
import Axios from 'axios'
import ArbitrageCalculator, {getArbitrageData} from '../helpers/arbitrage'
import * as sample from '../data/sampleRate.json'
import * as arbitrage from '../data/arbitrage.json'

interface IExchangeRateResponse {
  meta: {last_updated_at: Date}
  data: {
    [key: string]: {
      code: string
      value: number
    }
  }
}

export async function computeArbitrage(req: Request, res: Response) {
  const args: {apiKey: string; baseCurrency: string} = {
    apiKey: req.body.apiKey,
    baseCurrency: req.body.baseCurrency
  }

  const exchangeRates = await Axios.get<IExchangeRateResponse>(
    `https://api.currencyapi.com/v3/latest?apiKey=${args.apiKey}&base_currency=${args.baseCurrency}`
  )
    .then(response => response.data)
    .catch(e => {
      console.log(e.response.data)
    })
  console.log(exchangeRates)
  if (exchangeRates) {
    // save arbitrage data if null use saved data
    let arbitrageData = arbitrage
    //ts-ignore
    const rates = exchangeRates['data']
    const computedArbitrage = ArbitrageCalculator(
      args.baseCurrency,
      arbitrageData
    )
    const serializedExchange = Object.keys(rates).map(rate => ({
      code: rate,
      value: rates[rate].value
    }))

    //ts-ignore
    res.send({
      rates: serializedExchange,
      date: exchangeRates['meta'],
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
}

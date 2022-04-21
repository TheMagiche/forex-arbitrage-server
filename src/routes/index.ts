import {Request, Response} from 'express'
import Axios from 'axios'

interface ICurrencyResponse {
  [key: string]: string
}

interface IExchangeRateResponse {
  meta: {last_updated_at: Date}
  data: {
    [key: string]: {
      code: string
      value: number
    }
  }
}

export async function getAllCurrencyCodes(req: Request, res: Response) {
  const currencies = await Axios.get<ICurrencyResponse>(
    'https://openexchangerates.org/api/currencies.json'
  ).then(response => {
    return response.data
  })
  const serializedCurrency = Object.keys(currencies).map(currency => ({
    name: currencies[currency],
    code: currency
  }))
  res.send(serializedCurrency)
}

export async function computeArbitrage(req: Request, res: Response) {
  const args: {apiKey: string; baseCurrency: string} = {
    apiKey: req.body.apiKey,
    baseCurrency: req.body.baseCurrency
  }
  const exchangeRates = await Axios.get<IExchangeRateResponse>(
    `https://api.currencyapi.com/v3/latest?apiKey=${args.apiKey}&base_currency=${args.baseCurrency}`
  ).then(response => response.data)
  //ts-ignore
  const rates = exchangeRates['data']
  const serializedExchange = Object.keys(rates).map(rate => ({
    code: rate,
    value: rates[rate].value
  }))
  //ts-ignore
  res.send({rates: serializedExchange, date: exchangeRates['meta']})
}

import fs from 'fs'
import {Request, Response} from 'express'
import Axios from 'axios'
import { getArbitrageData } from '../helpers/arbitrage'

interface ICurrencyResponse {
  currencies: {[key: string]: string}
  ms: string
}

export async function getAllCurrencyCodes(req: Request, res: Response) {
  const currencies = await Axios.get<ICurrencyResponse>(
    `https://api.fastforex.io/currencies?api_key=ce56d9f0c3-c89df90123-rasg3h`
  ).then(response => {
    return response.data.currencies
  })

  let expectedCurrencies: string[] = []

  const serializedCurrency = Object.keys(currencies).map(currency => {
    expectedCurrencies.push(currency)
    return {
      name: currencies[currency],
      code: currency
    }
  })

  fs.writeFile(
    './src/data/currencies.json',
    JSON.stringify(expectedCurrencies),
    error => {
      if (error) {
        throw error
      }
      console.log('Currency file saved')
    }
  )
  res.send(serializedCurrency)
}

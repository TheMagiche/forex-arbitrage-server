import fs from 'fs'
import {Request, Response} from 'express'
import Axios from 'axios'

interface ICurrencyResponse {
  [key: string]: string
}

export async function getAllCurrencyCodes(req: Request, res: Response) {
  const currencies = await Axios.get<ICurrencyResponse>(
    'https://openexchangerates.org/api/currencies.json'
  ).then(response => {
    return response.data
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

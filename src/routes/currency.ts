import fs from 'fs'
import {Request, Response} from 'express'
import Axios from 'axios'
interface ICurrencyResponse {
  currencies: {[key: string]: string}
  ms: string
}

export async function getAllCurrencyCodes(req: Request, res: Response) {
  try {
    const currencies = await Axios.get<ICurrencyResponse>(
      `https://api.fastforex.io/currencies?api_key=${process.env.API_KEY}`
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
    res.status(200).json(serializedCurrency)
  } catch {
    res.status(400).json({msg: 'Something went wrong'})
  }
}

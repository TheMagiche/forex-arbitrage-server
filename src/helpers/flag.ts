import * as countries from '../data/countries.json'

export function generateFlag(currency: string) {
  for (const country in countries) {
    if (countries[country].currency_code == currency) {
      return `https://countryflagsapi.com/png/${countries[
        country
      ].country.toLowerCase()}`
    }
  }

  return `https://assets.bwbx.io/images/users/iqjWHBFdfxIU/iVrOVSSrq9OE/v1/1200x-1.jpg`
}

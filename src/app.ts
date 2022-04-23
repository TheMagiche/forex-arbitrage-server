import cors from 'cors'
import express from 'express'
import {createServer, Server} from 'http'
import {computeArbitrage} from './routes/arbitrage'
import {getAllCurrencyCodes} from './routes/currency'
import cron from 'node-cron'
import {getArbitrageData} from './helpers/arbitrage'
export default class App {
  private app: express.Express
  private server: Server
  private port: number | string

  constructor() {
    this.port = process.env.PORT || 4000
    this.app = express()
    this.server = createServer(this.app)
    this.configs()
    this.routes()
  }

  public getApp(): express.Express {
    return this.app
  }

  public async start(): Promise<void> {
    const port = this.normalizePort(this.port)
    this.server.listen(port, () => {
      console.log(`Server process: ${process.pid} listening on port: ${port}`)
    })
  }
  private configs() {
    this.app.use(express.urlencoded({extended: true}))
    this.app.use(express.json())
    this.app.use(
      cors({origin: true, credentials: true, preflightContinue: true})
    )
    //get arbitrage data after one day
    cron.schedule('* * 1 * * *', () => {
      getArbitrageData()
    })
  }

  private routes() {
    this.app.get('/api/currencies', getAllCurrencyCodes)
    this.app.post('/api/arbitrage', computeArbitrage)
  }

  private normalizePort(port: string | number): number {
    if (typeof port !== 'string' && typeof port !== 'number') {
      throw new TypeError(
        `Argument of type ${typeof port} cannot be used as port!`
      )
    }
    return Number(port)
  }
}

new App().start()

import dotenv from 'dotenv'
import cors from 'cors'
import cron from 'node-cron'
import express, {Express, Request, Response, NextFunction} from 'express'
import {createServer, Server} from 'http'
import {computeArbitrage} from './routes/arbitrage'
import {getAllCurrencyCodes} from './routes/currency'
import {getArbitrageData} from './helpers/arbitrage'
export default class App {
  private app: Express
  private server: Server
  private port: number | string

  constructor() {
    this.port = process.env.PORT || 4000
    this.app = express()
    this.server = createServer(this.app)
    this.configs()
    this.routes()
  }

  public getApp(): Express {
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
    dotenv.config()
    this.app.use(
      cors({origin: true, credentials: true, preflightContinue: true})
    )
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE'
      )
      res.header(
        'Access-Control-Allow-Headers',
        'x-access-token, Origin, X-Requested-With, Content-Type, Accept'
      )
      next()
    })
  }

  private routes() {
    // set up cron job to update currency data after every 10 minutes
    cron.schedule(`*/10 * * * *`, () => {
      getArbitrageData(process.env.API_KEY as string)
    })
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

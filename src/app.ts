import cors from 'cors';
import express from 'express';
import { createServer, Server } from 'http';

export default class App {

    private app: express.Application;
    private server: Server;
    private port: number | string;

    constructor() {
        this.port = process.env.PORT || 5000;
        this.app = express();
        this.server = createServer(this.app);
        this.configs();
    }

    public async start(): Promise<void> {
        const port = this.normalizePort(this.port);
        this.server.listen(port, () => {
            console.log(`Server process: ${process.pid} listening on port: ${port}`);
        });
    }
    private configs() {
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
        this.app.use(cors({ origin: true, credentials: true, preflightContinue: true }));
    }

    private normalizePort(port: string | number): number {
        if (typeof port !== 'string' && typeof port !== 'number') {
            throw new TypeError(`Argument of type ${typeof port} cannot be used as port!`);
        }
        return Number(port);
    }
}

new App().start();

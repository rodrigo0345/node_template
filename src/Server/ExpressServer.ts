import express from "express";
import MiddlewareInterface from "../interfaces/Server/Middleware";
import ServerInterface from "../interfaces/Server/Server";
import ServerConfigInterface from "../interfaces/Server/ServerConfig";

export default class ExpressServer implements ServerInterface {
    private readonly server: any;
    
    constructor() {
        this.server = express();
    }
    getServer() {
        return this.server;
    }
    
    start(config: ServerConfigInterface): void {
        config.setup(this);
        config.middlewares.forEach(middleware => {this.server.use(middleware.execute)});
        config.controllers.forEach(controller => {controller.start()});

        this.server.listen(config.port, config.host, () => {
            console.log(`Server listening on ${config.host}:${config.port}`);
        });

        process.on('SIGTERM', () => {
            console.info('SIGTERM signal received.');
            console.log('Closing http server.');
            this.stop();
        });
    }
    stop(): void {
        /*
        this.server.close((err: any) => {
            console.log('server closed')
            process.exit(err ? 1 : 0)
        });
        */
    }
}
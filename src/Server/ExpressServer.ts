import express from "express";
import MiddlewareInterface from "../Interfaces/Server/Middleware";
import ServerInterface from "../Interfaces/Server/Server";
import ServerConfigInterface from "../Interfaces/Server/ServerConfig";
import isDevMode from "../Common/DevMode";

export default class ExpressServer implements ServerInterface {
    private readonly server: any;
    
    constructor() {
        this.server = express();
    }
    getServer() {
        return this.server;
    }

    configAndStart(callback: () => ServerConfigInterface): void {
        this.start(callback());
    }
    
    start(config: ServerConfigInterface): void {
        config.setup(this);
        config.middlewares.forEach(middleware => {this.server.use(middleware.execute)});
        config.controllers.forEach(controller => {controller.start()});

        this.server.listen(config.port, config.host, () => {
            console.log(`Server listening on ${config.host}:${config.port}`);
        });

        if(!isDevMode())
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
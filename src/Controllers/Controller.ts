import { Router } from 'express';
import ControllerInterface from '../Interfaces/Controller/Controller';
import ControllerConfigInterface from '../Interfaces/Controller/ControllerConfig';
import ServerInterface from '../Interfaces/Server/Server';
import dev_log from '../Common/DevLog';
import DatabaseService from '../Databases/DatabaseService';
import DatabaseTableImpl from '../Interfaces/Database/DatabaseTableInterface';

export default class Controller
    implements ControllerInterface
{
    private router: Router;
    private server: ServerInterface;
    private config: ControllerConfigInterface[];

    constructor(
        server: ServerInterface,
        config: ControllerConfigInterface[],
    ) {
        this.router = Router();
        this.server = server;
        this.config = config;
    }
    setServer(
        server: ServerInterface,
    ): void {
        this.server = server;
    }
    setConfig(
        config: ControllerConfigInterface[],
    ): void {
        this.config = config;
    }
    start(): void {
        if (!this.server)
            throw new Error(
                'Auth Controller: Server not set',
            );
        if (!this.config)
            throw new Error(
                'Auth Controller: Config not set',
            );

        this.config.forEach(
            (
                config: ControllerConfigInterface,
            ) => {
                config.exec =
                    config.exec.bind(
                        config,
                    );
                switch (config.type) {
                    case 'get':
                        this.router.get(
                            config.relativePath,
                            config.middleware
                                ? config.middleware
                                : (
                                      req,
                                      res,
                                      next,
                                  ) => {
                                      next();
                                  },
                            config.exec,
                        );
                        break;
                    case 'post':
                        this.router.post(
                            config.relativePath,
                            config.middleware
                                ? config.middleware
                                : (
                                      req,
                                      res,
                                      next,
                                  ) => {
                                      next();
                                  },
                            config.exec,
                        );
                        break;
                    case 'put':
                        this.router.put(
                            config.relativePath,
                            config.middleware
                                ? config.middleware
                                : (
                                      req,
                                      res,
                                      next,
                                  ) => {
                                      next();
                                  },
                            config.exec,
                        );
                        break;
                    case 'delete':
                        this.router.delete(
                            config.relativePath,
                            config.middleware
                                ? config.middleware
                                : (
                                      req,
                                      res,
                                      next,
                                  ) => {
                                      next();
                                  },
                            config.exec,
                        );
                        break;
                }
            },
        );

        this.server
            .getServer()
            .use(this.router);
        this.config.forEach(
            (
                config: ControllerConfigInterface,
            ) => {
                dev_log(
                    'Controller added:',
                    config.relativePath,
                );
            },
        );
    }
}

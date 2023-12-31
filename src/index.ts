import initial_config from './Common/InitialConfig';
import MySQL from './Databases/MySQL';
import { DatabaseConfig } from './Interfaces/Database/Database';
import { getTablesDefinition } from './Types/db';
import DatabaseService from './Databases/DatabaseService';
import Middleware from './Middleware/Middleware';
import ServerInterface from './Interfaces/Server/Server';
import { authConfig } from './Controllers/auth/Auth';
import Controller from './Controllers/Controller';
import DatabaseServiceImpl from './Interfaces/Database/DatabaseServiceInterface';
import { imageConfig } from './Controllers/image/Image';
import Redis from './Databases/Redis';
import { postsConfig } from './Controllers/posts/Post';
import dotenv from 'dotenv';
import ExpressServer from './Server/ExpressServer';
/* 
    Here is the entry point of the application.
    I have laid out some working examples of how to use the database and the router.
    The public folder is used to serve static files, such as images, html, etc...
    To test functionallity such as the database and the file uploads, use:
    - localhost:8000/public/file.html
    - localhost:8000/public/index.html
    This is also a good way to test if everything is working properly
    To run the app in containers simply run 'docker-compose up' in the root directory of the project and the app will be available on localhost:8000. Once you are done, run 'docker-compose down' to stop the containers.
    If you need to change the code, there is no need to restart the containers, just save the file and the changes will be applied automatically.
    The benefit of using containers is that you don't need to install anything on your machine, everything is done inside the container and it brings already configured a mysql database and a redis cache.
*/

dotenv.config();

console.log(
    'Node mode:',
    process.env.NODE_ENV ?? 'not set',
);

const envVariables = process.env;
console.log(
    'Environment variables:',
    envVariables,
);

export let AVAILABLE_DATABASE_SERVICES: {
    main: DatabaseServiceImpl | null;
    cache: DatabaseServiceImpl | null;
} = { main: null, cache: null };

export const EXPRESS_SERVER: ExpressServer =
    new ExpressServer();

// configure and start the server
EXPRESS_SERVER.configAndStart(() => {
    // Setup MySQL
    const offsetDelay = Number.parseInt(
        process.env
            .M_DATABASE_OFFSET_TIME ??
            '10000',
    );
    const mysqlConfig: DatabaseConfig =
        {
            port: Number.parseInt(
                process.env
                    .M_DATABASE_PORT ??
                    '3306',
            ),
            host:
                process.env
                    .M_DATABASE_HOST ??
                'localhost',
            user:
                process.env
                    .M_DATABASE_USER ??
                'root',
            password:
                process.env
                    .M_DATABASE_PASSWORD ??
                'password',
            database:
                process.env
                    .M_DATABASE_NAME ??
                'main',
            testTimer: Number.parseInt(
                process.env
                    .M_DATABASE_TIME_TO_CHECK ??
                    '10000',
            ),
            idleTimeout:
                Number.parseInt(
                    process.env
                        .M_DATABASE_IDLE_TIMEOUT ??
                        '10000',
                ),
        };
    const mysqlTables =
        getTablesDefinition();
    const mysql = new MySQL(
        mysqlConfig,
        mysqlTables,
    );
    const mainDatabaseService =
        new DatabaseService(mysql);

    // Setup Redis
    const redisConfig: DatabaseConfig =
        {
            port: Number.parseInt(
                process.env
                    .C_DATABASE_PORT ??
                    '6379',
            ),
            host:
                process.env
                    .C_DATABASE_HOST ??
                'localhost',
            user:
                process.env
                    .C_DATABASE_USER ??
                'root',
            password:
                process.env
                    .C_DATABASE_PASSWORD ??
                'password',
            database:
                process.env
                    .C_DATABASE_NAME ??
                'cache',
            testTimer: Number.parseInt(
                process.env
                    .C_DATABASE_TIME_TO_CHECK ??
                    '10000',
            ),
            idleTimeout:
                Number.parseInt(
                    process.env
                        .C_DATABASE_IDLE_TIMEOUT ??
                        '10000',
                ),
        };
    const redis = new Redis(
        redisConfig,
        undefined,
    );
    const cacheService =
        new DatabaseService(redis);

    // Setup app global variables
    AVAILABLE_DATABASE_SERVICES = {
        main: mainDatabaseService,
        cache: cacheService,
    };

    // Spin up all the databases
    mainDatabaseService.connect(
        offsetDelay,
    );
    cacheService.connect(offsetDelay);

    // Setup global middleware
    const cookieControlMiddleware: Middleware =
        new Middleware(
            (req, res, next) => {
                res.header(
                    'Access-Control-Allow-Headers',
                    'Origin, X-Requested-With, Content-Type, Accept, Set-Cookie, Authorization, Access-Control-Allow-Credentials, X-CSRF-Token',
                );
                res.header(
                    'Access-Controll-Allow-Methods',
                    'GET, POST, PUT, DELETE',
                );
                res.header(
                    'Access-Control-Allow-Credentials',
                    'true',
                );

                next();
            },
        );

    // Setup Controllers
    const authController =
        new Controller(
            EXPRESS_SERVER,
            authConfig,
        );
    const imageController =
        new Controller(
            EXPRESS_SERVER,
            imageConfig,
        );
    const postsController =
        new Controller(
            EXPRESS_SERVER,
            postsConfig,
        );

    return {
        setup: (
            server: ServerInterface,
        ) => {
            initial_config(
                server.getServer(),
            );
        },
        port: process.env.PORT
            ? Number.parseInt(
                  process.env.PORT,
              )
            : 8000,
        host: process.env.HOST
            ? process.env.HOST
            : 'localhost',
        middlewares: [
            cookieControlMiddleware,
        ],
        controllers: [
            authController,
            imageController,
            postsController,
        ],
    };
});

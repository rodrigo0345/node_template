import express from 'express';
import initial_config from './common/initial_config';
import MySQL from './databases/MySQL';
import { DatabaseConfig } from './interfaces/Database/Database';
import { getActiveTables, getTablesDefinition } from './types/db';
import DatabaseService from './databases/DatabaseService';
import { off } from 'process';
import ExpressServer from './Server/ExpressServer';
import ServerConfigInterface from './interfaces/Server/ServerConfig';
import MiddlewareInterface from './interfaces/Server/Middleware';
import cookieParser from 'cookie-parser';
import Middleware from './Middleware/Middleware';
import ServerInterface from './interfaces/Server/Server';
import  { authConfig } from './controllers/auth/Auth';
import Controller from './controllers/Controller';
import DatabaseServiceImpl from './interfaces/Database/DatabaseServiceImpl';

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
    The benefit of using containers is that you don't need to install anything on your machine, everything is done inside the container and it brings already configured database and cache.
*/

console.log('Node mode:', process.env.NODE_ENV ?? 'not set');

const offsetDelay = Number.parseInt(process.env.M_DATABASE_OFFSET_TIME ?? '10000');
const mysqlConfig: DatabaseConfig = {
  port: Number.parseInt(process.env.M_DATABASE_PORT ?? '3306'),
  host: process.env.M_DATABASE_HOST ?? 'localhost',
  user: process.env.M_DATABASE_USER ?? 'root',
  password: process.env.M_DATABASE_PASSWORD ?? 'password',
  database: process.env.M_DATABASE_NAME ?? 'main',
  testTimer: Number.parseInt(process.env.M_DATABASE_TIME_TO_CHECK ?? '10000'),
  idleTimeout: Number.parseInt(process.env.M_DATABASE_IDLE_TIMEOUT ?? '10000'),
}

const mysqlTables = getTablesDefinition();
const mysql = new MySQL(mysqlConfig, mysqlTables); 
const mainDatabaseService = new DatabaseService(mysql);


export const AVAILABLE_DATABASE_SERVICES: {
  main: DatabaseServiceImpl | null,
  cache: DatabaseServiceImpl | null,
} = {main: mainDatabaseService, cache: null};

mainDatabaseService.connect(offsetDelay);

const cookieControlMiddleware: Middleware = new Middleware((req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Set-Cookie, Authorization, Access-Control-Allow-Credentials, X-CSRF-Token',
  );
  res.header('Access-Controll-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Credentials', 'true');

  next();
});

export const EXPRESS_SERVER: ExpressServer = new ExpressServer();

// controllers
const authController = new Controller(EXPRESS_SERVER, authConfig);

const init: ServerConfigInterface = {
  setup: (server: ServerInterface) => {
    initial_config(server.getServer());
  },
  port: process.env.PORT ? Number.parseInt(process.env.PORT) : 8000,
  host: '0.0.0.0',
  middlewares: [cookieControlMiddleware],
  controllers: [authController],
};

EXPRESS_SERVER.start(init);


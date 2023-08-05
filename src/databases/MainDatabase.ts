import mysql, { Pool, ResultSetHeader, RowDataPacket } from 'mysql2';
import dev_log from '../common/dev_log';
import { ApiError, ApiResponse, ApiSuccess } from '../common/api_response';
import fs from 'fs';
import tables from '../types/db';
import path from 'path';

/*
    What is this file?
    This file contains a database class that is used to connect to a MySQL database or any other database.
    The class is used to execute queries and return the result without worrying about the connection and catching errors.
*/
export default class M_Database {
  connection: any | undefined;
  port;
  host;
  user;
  password;
  database;
  timeToCheck: number;

  constructor(
    db_port: string | undefined,
    db_host: string | undefined,
    db_user: string | undefined,
    db_password: string | undefined,
    db_name: string | undefined,
    db_offset_time: number | undefined,
    db_time_to_check: string | undefined,
  ) {
    this.timeToCheck = Number.parseInt(db_time_to_check ?? '10000') + (db_offset_time ?? 0);
    this.port = Number.parseInt(db_port ?? '3306');
    this.host = db_host || 'localhost'; // Use the service name 'db' here
    this.user = db_user || 'root';
    this.password = db_password || 'password';
    this.database = db_name || 'main';

    // ONLY CALL THIS ONCE
    this.#checkConnection();

    dev_log({ host: this.host, post: this.port, user: this.user, password: this.password, database: this.database, time_to_check: this.timeToCheck, offset_time: db_offset_time });

    this.connect(
      this.host,
      this.port,
      this.user,
      this.password,
      this.database,
    );
  }

  async _createTables(
    types: {
      filename: string;
      name: string;
      createTable: string;
      insertTable: string;
    }[],
  ) {
    if(!this.isConnected()) {
      // also log in prod
      console.log('Main Database not connected');
      return;
    };
    for (const type of types) {
      // first check if the type exists
      if (!fs.existsSync(path.join(__dirname, '..', 'types', type.filename)))
        throw Error(`File at <project_dir>/types/${type.filename} does not exist`);
      await this.connection?.query(type.createTable);
    }
  }

  close() {
    if(!this.isConnected()) {
      // also log in prod
      console.error('Main database not connected');
      return;
    };
    this.connection?.end();
  }

  /* exec automatically catches errors and returns the result,
  // in case of an error, check the status of the result
  // .status === 'error'
  // in case of undefined result, that means the query was
   successful but there was no result */
  async exec(
    fn: (connection: any) => any,
  ): Promise<undefined | ApiResponse<null> | any> {
    if(!this.isConnected()) {
      // also log in prod
      console.log('MySQL not connected');
      return;
    };
    try {
      const result = await fn(this.connection);
      return result;
    } catch (error: any) {
      dev_log(error);
      return ApiError(error.message);
    }
  }

  isConnected() {
    return !(this.connection === undefined);
  }

  retryConnection(): boolean {
    this.connect(
      this.host,
      this.port,
      this.user,
      this.password,
      this.database,
    )

    return this.isConnected();
  }

  async connect(host: string,
    port: number,
    user: string,
    password: string,
    database: string,
    ) {
      if(this.connection) this.connection.end();
      try {
        this.connection = mysql
        .createPool({
          host: host,
          port: port,
          user: user,
          password: password,
          idleTimeout: 5000,
        })
        .promise();
      } catch(error: unknown) {
        console.error(error);
        return;
      }
    
      // CREATE DATABASE IF NOT EXISTS redis_mysql

      try{  
        await this.connection.query(`CREATE DATABASE IF NOT EXISTS ${database}`);
  
        await this.connection.query(`USE ${database}`);
      } catch(error: unknown) {
        console.error(error);
        return;
      }
    
      // only for development
      // this.connection.query('DROP TABLE IF EXISTS posts');
  
      // wait for the database to be created, 300ms should be enough
      await setTimeout(() => {
        this._createTables(tables);
      }, 300);
  
      console.log('Main database connected');
  }

  async #checkConnection() {
    setInterval(() => {
      if(!this.connection) return;
      this.#testConnection();
    }, this.timeToCheck);
  } 

  async #testConnection() {

    if(!this.isConnected()) {
      return;
    };

    try {
      await this.connection.query('SELECT 1 + 1 AS solution');
    } catch(error: unknown) {
      this.connection = undefined;

      // this log message also appears on production
      console.error(error);
      dev_log("Main database working as expected");
      return;
    }

    dev_log("Main database working as expected");
  }
}

import mysql, { Pool, ResultSetHeader, RowDataPacket } from 'mysql2';
import dev_log from '../common/dev_log';
import { ApiError, ApiResponse } from '../common/api_response';
import fs from 'fs';
import tables from '../types/db';
import path from 'path';

/*
    What is this file?
    This file contains a database class that is used to connect to a MySQL database or any other database.
    The class is used to execute queries and return the result without worrying about the connection and catching errors.
*/
export default class M_Database {
  connection;

  constructor(
    db_port: string | undefined,
    db_host: string | undefined,
    db_user: string | undefined,
    db_password: string | undefined,
    db_name: string | undefined,
  ) {
    const port = Number.parseInt(db_port ?? '3306');
    const host = db_host || 'localhost'; // Use the service name 'db' here
    const user = db_user || 'root';
    const password = db_password || 'password';
    const database = db_name || 'main';

    dev_log({ host, port, user, password, database });

    this.connection = mysql
      .createPool({
        host: host,
        port: port,
        user: user,
        password: password,
        database: database,
      })
      .promise();

    // CREATE DATABASE IF NOT EXISTS redis_mysql
    this.connection.query(`CREATE DATABASE IF NOT EXISTS ${database}`);

    this.connection.query(`USE ${database}`);

    // only for development
    this.connection.query('DROP TABLE IF EXISTS posts');

    // wait for the database to be created, 1000ms should be enough
    setTimeout(() => {
      this._createTables(tables);
    }, 1000);

    console.log('MySQL connected');
  }

  async _createTables(
    types: {
      filename: string;
      name: string;
      createTable: string;
      insertTable: string;
    }[],
  ) {
    for (const type of types) {
      // first check if the type exists
      if (!fs.existsSync(path.join(__dirname, '..', 'types', type.filename)))
        throw Error(`File at @types/${type.filename} does not exist`);
      await this.connection.query(type.createTable);
    }
  }

  close() {
    this.connection.end();
  }

  // exec automatically catches errors and returns the result,
  // in case of an error, check the status of the result
  // .status === 'error'
  // in case of undefined result, that means the query was
  // successful but there was no result
  async exec(
    fn: (connection: any) => any,
  ): Promise<undefined | ApiResponse<null> | any> {
    try {
      const result = await fn(this.connection);
      return result;
    } catch (error: any) {
      dev_log(error);
      return ApiError(error.message);
    }
  }
}

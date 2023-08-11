import { ApiError, ApiResponse } from "../Common/ApiResponse";
import dev_log from "../Common/DevLog";
import Database, { DatabaseConfig } from "../Interfaces/Database/Database";
import DatabaseTable from "../Interfaces/Database/DatabaseTable";
import mysql, { Pool, ResultSetHeader, RowDataPacket } from 'mysql2';

export default class MySQL implements Database {
    private config: DatabaseConfig;
    private connection: any | undefined;
    private tables: DatabaseTable[];

    constructor(config: DatabaseConfig, tables: DatabaseTable[]) {
        this.config = config;
        this.tables = tables;
        this.recursiveTesting();
    }
    
    async connect(): Promise<void> {
        try{
            this.connection = mysql
                .createPool({
                    port: this.config.port,
                    host: this.config.host,
                    user: this.config.user,
                    database: this.config.database,
                    password: this.config.password,
                    idleTimeout: this.config.idleTimeout,
                })
                .promise();
            await this.initialSetup();
            await Promise.all(this.tables.map(async table => await this.createTable(table)));
            dev_log('MySQL connected');
        } catch(error: unknown) {
            this.connection = undefined;
            console.error("MySQL Error: " + (error as Error).message);
            return;
        }    
    }
    
    disconnect(): void {
        if(!this.connection) return;
        this.connection.end();
    }
    
    async execute(callback: (connection: any) => unknown): Promise<mysql.OkPacketParams | mysql.ResultSetHeader | mysql.RowDataPacket | mysql.RowDataPacket[] |  ApiResponse<null>> {
        if(!this.connection) return ApiError('MySQL not connected') as ApiResponse<null>;
        try {
            // This can return way too much stuff
            return await callback(this.connection) as any;
        } catch(error: unknown){
            return ApiError((error as Error).message) as ApiResponse<null>;
        }
    }

    async test(): Promise<boolean> {
        try {
            if(!this.connection) return false;
            await this.connection.query('SELECT 1 + 1 AS solution');
        } catch(error: unknown) {
            this.connection = undefined;
            console.error(error);
            return false;
        }
        return true;
    }

    isConnected(): boolean {
        return this.connection !== undefined;
    }

    async createTable(table: DatabaseTable): Promise<void> {
        if(!this.connection) {
            dev_log('MySQL not connected');
            return;
        }
        const numberParams = table.parameters.length;

        if(numberParams === 0) return;

        let stringQuery = `CREATE TABLE IF NOT EXISTS ${table.name} (`;
        for(let i = 0; i < numberParams; i++) {
            stringQuery += ` ${table.parameters[i].name} ${table.parameters[i].type} `;
            if(i !== numberParams - 1) {
                stringQuery += ',';
            }
        }
        stringQuery += ');';

        await this.connection.query(stringQuery);

        dev_log(`Created table ${table.name}`);
    }

    // this enables us to detect when the 
    // database is online and ready to be used
    private async recursiveTesting() {
        setInterval(async () => {
            if(!this.connection) {
                dev_log(`No connection to MySQL, retrying in ${(this.config.testTimer * 2)/1000.00}s...`);
                await this.connect();
            }
            else if(!await this.test()) this.connection = undefined;
        }, this.config.testTimer * 2);
    }

    private async initialSetup() {
        if(!this.connection) return;
        try{  
            await this.connection.query(`CREATE DATABASE IF NOT EXISTS ${this.config.database}`);
            await this.connection.query(`USE ${this.config.database}`);
        } catch(error: unknown) {
            console.error(error);
            return;
        }
        // only for development
        // this.connection.query(`DROP TABLE IF EXISTS ${this.config.database}`);
    }
}
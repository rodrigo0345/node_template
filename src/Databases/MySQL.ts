import { ApiError, ApiResponse } from "../common/ApiResponse";
import dev_log from "../common/DevLog";
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
    }
    
    async connect(): Promise<void> {
        this.recursiveTesting();

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
        } catch(error: unknown) {
            console.error(error);
            return;
        }
        await this.initialSetup();
        
        this.tables.forEach(table => this.createTable(table));
        dev_log('MySQL connected');
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

    createTable(table: DatabaseTable): void {
        if(!this.connection) throw new Error('MySQL not connected');
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

        this.connection.query(stringQuery);

        dev_log(`Created table ${table.name}`);
    }

    // this enables us to detect when the 
    // database is online and ready to be used
    private async recursiveTesting() {
        setInterval(async () => {
            if(!this.connection) return;
            if(!await this.test()) this.connection = undefined;
        }, this.config.testTimer);
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
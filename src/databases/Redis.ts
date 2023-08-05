import { createClient } from "redis";
import { ApiError, ApiResponse } from "../common/api_response";
import Database, { DatabaseConfig } from "../interfaces/Database/Database";
import DatabaseTable from "../interfaces/Database/DatabaseTable";
import mysql, { Pool, ResultSetHeader, RowDataPacket } from 'mysql2';

export default class Redis implements Database {
    private config: DatabaseConfig;
    private connection: any | undefined;
    private tables: DatabaseTable[];

    constructor(config: DatabaseConfig, tables: DatabaseTable[]) {
        this.config = config;
        this.tables = tables;
    }
    
    connect(): void {
        this.recursiveTesting();

        try{
            this.connection = createClient({
                socket: {
                    host: this.config.host,
                    port: this.config.port,
                },
                password: this.config.password,
                username: this.config.user,
            })
        } catch(error: unknown) {
            console.error(error);
            return;
        }

        this.tables.forEach(table => this.createTable(table));
        this.initialSetup();
    }
    
    disconnect(): void {
        if(!this.connection) return;
        this.connection.quit();
    }
    
    async execute(callback: (connection: any) => unknown): Promise<mysql.OkPacketParams | mysql.ResultSetHeader | mysql.RowDataPacket | mysql.RowDataPacket[] |  ApiResponse<null>> {
        if(!this.connection) return ApiError('Redis not connected') as ApiResponse<null>;
        try {
            // This can return way too much stuff
            return await callback(this.connection) as any;
        } catch(error: unknown){
            return ApiError((error as Error).message) as ApiResponse<null>;
        }
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
    }

    // this enables us to detect when the 
    // database is online and ready to be used
    // never run more than one instance of this
    private async recursiveTesting() {
        setInterval(async () => {
            if(!this.connection) return;
            if(await this.test()) this.connection = undefined;
        }, this.config.testTimer);
    }

    async test(): Promise<boolean> {
        setInterval(() => {
            this.connection.ping((err: unknown) => {
                if (err) {
                    console.error("Redis error: " + err);
                    this.connection = undefined
                };
            });
        }, this.config.testTimer);
        return true;
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
        // this.connection.query('DROP TABLE IF EXISTS posts');
    
        // wait for the database to be created, 300ms should be enough
        await setTimeout(() => {
        }, 300);
    }
}
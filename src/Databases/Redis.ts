import { createClient } from "redis";
import { ApiError, ApiResponse } from "../Common/ApiResponse";
import Database, { DatabaseConfig } from "../Interfaces/Database/Database";
import DatabaseTable from "../Interfaces/Database/DatabaseTable";
import dev_log from "../Common/DevLog";

export default class Redis implements Database {
    private config: DatabaseConfig;
    private connection: any | undefined;
    private tables: DatabaseTable[] | undefined;

    constructor(config: DatabaseConfig, tables: DatabaseTable[] | undefined) {
        this.config = config;
        this.tables = tables;
        this.recursiveTesting();
        console.log("Redis:", {
            host: this.config.host,
            port: this.config.port,
            password: this.config.password,
        })
    }
    
    async connect(): Promise<void> {    
        try{
            this.connection = createClient({
                    url: `redis://${this.config.host}:${this.config.port}`,
            });
            this.connection.on('error', (err: any) =>{
                this.connection = undefined;
                console.error('Redis Client Error', err);
            });
            process.on('exit', () => {
                console.log('Closing redis...');
                if (!this.connection) return;
                this.connection.quit();
            });

            this.connection.connect();
            this.initialSetup();

            console.log("Redis connected");
        } catch(error: unknown) {
            this.connection = undefined;
            console.error(error);
            return;
        }
    }
    
    disconnect(): void {
        if(!this.connection) return;
        this.connection.quit();
    }
    
    async execute(callback: (connection: any) => unknown): Promise<unknown> {
        if(!this.connection) return ApiError('Redis not connected') as ApiError;
        try {
            // This can return way too much stuff
            return await callback(this.connection) as any;
        } catch(error: unknown){
            return ApiError((error as Error).message) as ApiError;
        }
    }

    isConnected(): boolean {
        return this.connection !== undefined;
    }

    createTable(table: DatabaseTable): void {
        throw new Error("Redis Error: Method not implemented.");
    }

    // this enables us to detect when the 
    // database is online and ready to be used
    // never run more than one instance of this
    private async recursiveTesting() {
        setInterval(async () => {
            if(!this.connection) {
                dev_log(`No connection to Redis, retrying in ${(this.config.testTimer * 2)/1000}s...`);
                await this.connect();
            }
            else if(!(await this.test())) this.connection = undefined;
        }, this.config.testTimer * 2);
    }

    async test(): Promise<boolean> {
        try{
            await this.connection.get("test");
        } catch(error: any) {
            console.error("Redis is down!", error.message);
            return false;
        }
        return true;
    }

    private async initialSetup() {
        // nothing to do here
    }
}
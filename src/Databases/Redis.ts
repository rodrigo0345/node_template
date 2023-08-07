import { createClient } from "redis";
import { ApiError, ApiResponse } from "../common/ApiResponse";
import Database, { DatabaseConfig } from "../Interfaces/Database/Database";
import DatabaseTable from "../Interfaces/Database/DatabaseTable";

export default class Redis implements Database {
    private config: DatabaseConfig;
    private connection: any | undefined;
    private tables: DatabaseTable[] | undefined;

    constructor(config: DatabaseConfig, tables: DatabaseTable[] | undefined) {
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

        // no need to create tables in redis
        // this.tables.forEach(table => this.createTable(table));

        this.initialSetup();
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
        // nothing to do here
    }
}
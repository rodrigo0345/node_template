import Database, { DatabaseConfig } from "../interfaces/Database";
import DatabaseServiceImpl from "../interfaces/DatabaseServiceImpl";
import DatabaseTable from "../interfaces/DatabaseTable";

export default class DatabaseService implements DatabaseServiceImpl {
    private database: Database;
    private tables: DatabaseTable[];
    private config: DatabaseConfig;
    
    constructor(database: Database, tables: DatabaseTable[], config: DatabaseConfig){
        this.database = database;
        this.tables = tables;
        this.config = config;
    }
    connect(): void {
        this.database.connect();
    }
    query(callback: (connection: any) => unknown): Promise<unknown> {
        return this.database.execute(callback);
    }
    test(): boolean {
        return this.database.isConnected();
    }
    disconnect(): void {
        this.database.disconnect();
    }
}
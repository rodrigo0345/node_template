import Database, { DatabaseConfig } from "../interfaces/Database/Database";
import DatabaseServiceImpl from "../interfaces/Database/DatabaseServiceImpl";
import DatabaseTable from "../interfaces/Database/DatabaseTable";

export default class DatabaseService implements DatabaseServiceImpl {
    private database: Database;
    
    constructor(database: Database){
        this.database = database;
    }
    async connect(offsetDelay: number) {
        await setTimeout(() => {
            this.database.connect();
        }, offsetDelay);
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
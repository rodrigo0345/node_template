import Database, {
    DatabaseConfig,
} from '../Interfaces/Database/Database';
import DatabaseServiceInterface from '../Interfaces/Database/DatabaseServiceInterface';
import DatabaseTable from '../Interfaces/Database/DatabaseTable';

export default class DatabaseService
    implements DatabaseServiceInterface
{
    private database: Database;
    private dbtype: string;

    constructor(database: Database) {
        this.database = database;
        this.dbtype = database.type;
    }
    async connect(offsetDelay: number) {
        function sleep(ms: number) {
            return new Promise(
                (resolve) => {
                    setTimeout(
                        resolve,
                        ms,
                    );
                },
            );
        }
        await sleep(offsetDelay);
        this.database.connect();
    }
    query(
        callback: (
            connection: any,
        ) => unknown,
    ): Promise<unknown> {
        return this.database.execute(
            callback,
        );
    }
    test(): boolean {
        return this.database.isConnected();
    }
    disconnect(): void {
        this.database.disconnect();
    }
    get getDbtype(): string {
        return this.dbtype;
    }
    set setDbtype(dbtype: string) {
        this.dbtype = dbtype;
    }
}

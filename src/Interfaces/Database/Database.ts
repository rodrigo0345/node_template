import DatabaseTable from './DatabaseTable';

export default interface Database {
    type: string;
    connect(): void;
    disconnect(): void;

    execute(
        callback: (
            connection: any,
        ) => unknown,
    ): Promise<any>;
    test(): Promise<boolean>;
    createTable(
        table: DatabaseTable,
    ): void;

    isConnected(): boolean;
}

export interface DatabaseConfig {
    port: number;
    host: string;
    user: string;
    password: string;
    database: string;

    // The time in milliseconds to wait before attempting to retest the connection.
    // This is useful for when the database is not online bc of some error.
    testTimer: number;
    idleTimeout: number;
}

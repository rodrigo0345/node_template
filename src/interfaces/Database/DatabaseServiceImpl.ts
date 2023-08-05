import Database, { DatabaseConfig } from "./Database";
import DatabaseTable from "./DatabaseTable";

export default  interface DatabaseServiceImpl {
    connect(offsetDelay: number): void;
    query(callback: (connection: any) => unknown): Promise<unknown>;
    test(): boolean;
    disconnect(): void;
}
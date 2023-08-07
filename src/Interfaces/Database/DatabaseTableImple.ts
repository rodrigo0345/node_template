import { ApiResponse } from "../../common/ApiResponse";
import DatabaseService from "../../Databases/DatabaseService";
import DatabaseTable from "./DatabaseTable";

export default interface DatabaseTableImpl<T> {
    getName(): string;
    setDatabase(database: DatabaseService): void;
    getOne(where: string): Promise<ApiResponse<T>>
    getAll(where: string): Promise<ApiResponse<T[]>>
    insertOne(data: T): Promise<ApiResponse<number>>
    insertMany(data: T[]): Promise<ApiResponse<number[]>>
    updateOne(where: string, data: T): Promise<ApiResponse<number>>;
    deleteOne(where: string, data: T): Promise<ApiResponse<T>>
}
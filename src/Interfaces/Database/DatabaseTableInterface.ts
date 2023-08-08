import { z } from "zod";
import { ApiResponse } from "../../Common/ApiResponse";
import DatabaseService from "../../Databases/DatabaseService";
import DatabaseTable from "./DatabaseTable";

export default interface DatabaseTableInterface<T> {
    typeInst: z.ZodType<T>;
    getName(): string;
    setDatabase(database: DatabaseService): void;
    getOne(): Promise<ApiResponse<T>>
    getAll(): Promise<ApiResponse<T[]>>
    insertOne(data: T): Promise<ApiResponse<number>>
    insertMany(data: T[]): Promise<ApiResponse<number[]>>
    updateOne(data: T): Promise<ApiResponse<number>>;
    deleteOne(data: T): Promise<ApiResponse<T>>
}
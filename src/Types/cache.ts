import DatabaseService from "../Databases/DatabaseService";
import DatabaseServiceImpl from "../Interfaces/Database/DatabaseServiceInterface";
import DatabaseTableImpl from "../Interfaces/Database/DatabaseTableInterface";
import { ApiResponse } from "../common/ApiResponse";


// this is the weirder DatabaseTableImpl but it is needed to maintain the type safety
export default class Cache implements DatabaseTableImpl<string> {
    private database: DatabaseServiceImpl | null = null;
    
    getName(): string {
        return "cache";
    }
    setDatabase(database: DatabaseService): void {
        this.database = database;
    }
    async getOne(where: string): Promise<ApiResponse<string>> {
        if (this.redis_url === undefined || !this.connection) return false;
        try {
            const obj = await this.connection.get(key);
            return obj ? JSON.parse(obj) : undefined;
        } catch (error: any) {
            dev_log(error);
            return ApiError(error.message);
        }
    }
    getAll(where: string): Promise<ApiResponse<string[]>> {
        throw new Error("Method not implemented.");
    }
    insertOne(data: string): Promise<ApiResponse<number>> {
        throw new Error("Method not implemented.");
    }
    insertMany(data: string[]): Promise<ApiResponse<number[]>> {
        throw new Error("Method not implemented.");
    }
    updateOne(where: string, data: string): Promise<ApiResponse<number>> {
        throw new Error("Method not implemented.");
    }
    deleteOne(where: string, data: string): Promise<ApiResponse<string>> {
        throw new Error("Method not implemented.");
    }

}
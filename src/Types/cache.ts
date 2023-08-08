import DatabaseService from "../Databases/DatabaseService";
import CacheInterface from "../Interfaces/Database/CacheInterface";
import DatabaseServiceInterface from "../Interfaces/Database/DatabaseServiceInterface";
import DatabaseServiceImpl from "../Interfaces/Database/DatabaseServiceInterface";
import DatabaseTableInterface from "../Interfaces/Database/DatabaseTableInterface";
import DatabaseTableImpl from "../Interfaces/Database/DatabaseTableInterface";
import { ApiError, ApiResponse, ApiSuccess } from "../Common/ApiResponse";


// this is the weirder DatabaseTableImpl but it is needed to maintain the type safety
export default class Cache implements CacheInterface {
    private readonly database: DatabaseServiceInterface;
    constructor(database: DatabaseServiceInterface) {
        this.database = database;
    }
    async get<T, Y extends DatabaseTableInterface<any>>(key: string, model: Y): Promise<ApiResponse<T>> {
        const result = await this.database.query(async (connection) => {
            const result = await connection.get(key);
            return ApiSuccess<string>(result);
        }) as ApiResponse<string>;

        if(result.status === "error") return result;
        const data: T = JSON.parse(result.data);

        try{
            model.typeInst.parse(data);
        } catch(err: any){
            return ApiError("Redis Error: " + err.message);
        }
        
        return ApiSuccess<T>(data);
    }

    async getAll<T, Y extends DatabaseTableInterface<any>>(key: string, model: Y): Promise<ApiResponse<T[]>> {
        const result = await this.database.query(async (connection) => {
            const result = await connection.get(key);
            return ApiSuccess<string>(result);
        }) as ApiResponse<string>;

        if(result.status === "error") return result;
        const data: T[] = JSON.parse(result.data);

        try{
            data.forEach((item: T) => {
                model.typeInst.parse(item);
            });
        } catch(err: any){
            return ApiError("Redis Error: " + err.message);
        }
        
        return ApiSuccess<T[]>(data);
    }


    async save(key: string, data: unknown, timeout: number): Promise<ApiResponse<boolean>> {
        const result = await this.database.query(async (connection) => {
            const stringifiedData = JSON.stringify(data);
            await connection.set(key, stringifiedData, {
                EX: timeout,
            });
            return ApiSuccess<boolean>(true);
        }) as ApiResponse<unknown>;
        if(result.status === 'success') return ApiSuccess<boolean>(true);
        else return ApiSuccess<boolean>(false);
    }
    async delete(key: string): Promise<ApiResponse<boolean>> {
        const result = await this.database.query(async (connection) => {
            const result = await connection.del(key);
            return ApiSuccess<boolean>(true);
        }) as ApiResponse<unknown>;
        if(result.status === 'success') return ApiSuccess<boolean>(true);
        else return ApiSuccess<boolean>(false);
    }
}
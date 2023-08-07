import { ApiResponse } from "../../common/ApiResponse";
import DatabaseTableInterface from "./DatabaseTableInterface";


export default interface CacheInterface {
    get<T  extends DatabaseTableInterface<any>>(key: string, model: T): Promise<ApiResponse<T>>;
    save(key: string, data: unknown, timeout: number): Promise<ApiResponse<boolean>>;
    delete(key: string): Promise<ApiResponse<boolean>>;
}
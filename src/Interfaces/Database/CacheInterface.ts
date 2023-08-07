import { ApiResponse } from "../../common/ApiResponse";


export default interface CacheInterface {
    get(key: string): Promise<ApiResponse<unknown>>
    save(key: string, data: unknown, timeout: number): Promise<ApiResponse<boolean>>
    delete(key: string): Promise<ApiResponse<unknown>>
}
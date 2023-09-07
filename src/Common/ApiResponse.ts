export enum Status {
    Success = 'success',
    Error = 'error',
}

export type ApiResponse<T> =
    | ApiSuccess<T>
    | ApiError;

export const ApiSuccess = <T>(
    data: T,
): ApiSuccess<T> => {
    return {
        status: Status.Success,
        data,
        timestamp: new Date(),
    } as ApiSuccess<T>;
};

export const ApiError = (
    message: string,
): ApiError => {
    const error: ApiError = {
        status: Status.Error,
        message,
        timestamp: new Date(),
    };
    return error;
};

export type ApiSuccess<T> = {
    status: 'success';
    data: T;
    timestamp: Date;
};
export type ApiError = {
    status: 'error';
    message: string;
    timestamp: Date;
};

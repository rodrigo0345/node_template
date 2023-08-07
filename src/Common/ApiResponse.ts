export type ApiResponse<T> =
  | ApiSuccess<T>
  | ApiError;

export const ApiSuccess = <T>(data: T): ApiSuccess<T> => {
  return {
    status: 'success',
    data,
    timestamp: new Date(),
  } as ApiSuccess<T>;
};

export const ApiError = (message: string): ApiError => {
  const error: ApiError = {
    status: 'error',
    message,
    timestamp: new Date(),
  }
  return error;
};

export type ApiSuccess<T> = { status: 'success'; data: T; timestamp: Date };
export type ApiError = { status: 'error'; message: string; timestamp: Date };

import { AggregateGroupByReducers, AggregateSteps, createClient } from 'redis';
import dev_log from '../common/dev_log';
import { ApiError } from '../common/api_response';

export default class Cache {
  connection;
  redis_url?: string;

  constructor(redis_url?: string | undefined) {
    dev_log({ redis_url });

    this.redis_url = redis_url;
    if (!redis_url) return;

    this.connection = redis_url
      ? createClient({
          url: redis_url,
        })
      : createClient();
    this.connection.on('error', (err) =>
      console.log('Redis Client Error', err),
    );
    process.on('exit', () => {
      console.log('closing redis...');
      if (!this.connection) return;
      this.connection.quit();
    });
    this.connection.connect();

    console.log('Redis connected');
  }

  async save(key: string, value: {}): Promise<boolean> {
    if (this.redis_url === undefined || !this.connection) return false;
    try {
      await this.connection.set(key, JSON.stringify(value), {
        EX: 60, // The cache is valid for 60 seconds
      });
      return true;
    } catch (error: any) {
      dev_log(error);
      return false;
    }
  }

  async get(key: string) {
    if (this.redis_url === undefined || !this.connection) return false;
    try {
      const obj = await this.connection.get(key);
      return obj ? JSON.parse(obj) : undefined;
    } catch (error: any) {
      dev_log(error);
      return ApiError(error.message);
    }
  }

  async delete(key: string) {
    if (this.redis_url === undefined || !this.connection) return false;
    try {
      return await this.connection.del(key);
    } catch (error: any) {
      dev_log(error);
      return ApiError(error.message);
    }
  }
}

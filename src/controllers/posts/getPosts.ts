import mysql from 'mysql2';
import { mDatabase, cache } from '../..';
import { Request, Response } from 'express';

export default async function getPosts(req: Request, res: Response) {
  const result = await mDatabase.exec(async (connection) => {
    // check cache
    const cached = await cache.get('g_posts');

    if (typeof cached === 'string') return cached;

    // if not in cache, get from database
    const [rows] = await connection.query('SELECT * FROM posts');

    const result: mysql.RowDataPacket[] = rows as mysql.RowDataPacket[];

    // save to cache
    await cache.save('g_posts', result);

    return result;
  });

  if (result.status === 'error') {
    return res.status(500).json(result);
  }

  return res.json(result);
}

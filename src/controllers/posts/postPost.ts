import { cache, mDatabase } from '../..';
import { Request, Response } from 'express';
import tables from '../../Types/db';
import { ApiSuccess } from '../../common/ApiResponse';
import { ResultSetHeader } from 'mysql2';
import dev_log from '../../common/DevLog';

export default async function postPost(req: Request, res: Response) {
  const { title, content } = req.body;

  let author = 'dunno';

  if (req.user) {
    author = (req.user as any).email;
  }

  const result = await mDatabase.exec(async (connection) => {
    return await connection.query(
      tables.find((entity) => entity.name === 'posts')?.insertTable,
      [title, content, author],
    );
  });

  dev_log({ result });

  if (result.status === 'error') {
    return res.status(500).json(result);
  }

  // clean cache
  await cache.delete('g_posts');

  const [data] = result;
  dev_log({ data });

  const resp = ApiSuccess<number>((data as ResultSetHeader).insertId);
  return res.json(resp);
}

import mysql from 'mysql2';
import { AVAILABLE_DATABASE_SERVICES } from '../..';
import { Request, Response } from 'express';
import Cache from '../../Types/cache';
import Post, { PostType } from '../../Types/post';

export default async function getPosts(req: Request, res: Response) {
  if(!AVAILABLE_DATABASE_SERVICES.main) {
    return res.status(500).json({ status: 'error', message: 'Database service not available' });
  }
  const postTable = new Post(AVAILABLE_DATABASE_SERVICES.main);

  let cache: Cache | null = null;
  if(AVAILABLE_DATABASE_SERVICES.cache) {
    cache = new Cache(AVAILABLE_DATABASE_SERVICES.cache);
  }
  
  // check cache
  const cachedPostsKey = 'g_posts';
  const cached = cache? await cache?.get<PostType, Post>(cachedPostsKey, postTable): null;

  if(cached) {
    return res.json(cached);
  }

  // if not in cache, get from database
  const result = await postTable.getAll("");

  if (result.status === 'error') {
    return res.status(500).json(result);
  }

  if (!result.data) {
    return res.json([]);
  }

  // set cache
  if(cache) {
    await cache?.save("g_posts", result.data, 1000)
  }

  return res.json(result);
}

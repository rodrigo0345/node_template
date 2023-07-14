import { Request, Response } from 'express';
import { ApiError, ApiSuccess } from '../../common/api_response';
import { userSchema } from '../../types/user';
import { mDatabase } from '../../..';
import tables from '../../types/db';
import { ResultSetHeader } from 'mysql2';
import bcrypt from 'bcrypt';

export default async function postRegister(req: Request, res: Response) {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json(ApiError('Missing required fields'));
  }

  try {
    userSchema.parse({
      email,
      password,
      name,
      role,
    });
  } catch (err: any) {
    return res.status(400).json(ApiError(err.message));
  }

  let hashedPassword: string;
  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (err: any) {
    return res.status(500).json(ApiError(err.message));
  }

  const sqlCommand = tables.find(
    (table) => table.name === 'users',
  )?.insertTable;

  const result = await mDatabase.exec(async (connection) => {
    return await connection.query(sqlCommand, [
      name,
      role,
      email,
      hashedPassword,
    ]);
  });

  if (result.status === 'error') {
    return res.status(500).json(result);
  }

  return res.json(ApiSuccess<number>((result[0] as ResultSetHeader).insertId));
}
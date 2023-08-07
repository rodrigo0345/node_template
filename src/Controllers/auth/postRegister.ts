import { Request, Response } from 'express';
import { ApiError, ApiSuccess } from '../../Common/ApiResponse';
import bcrypt from 'bcrypt';
import dev_log from '../../Common/DevLog';
import User from '../../Types/user';
import { AVAILABLE_DATABASE_SERVICES } from '../..';


export default async function register(req: Request, res: Response) {
  dev_log({ body: req.body });
  const { username, password, name, role } = req.body;
  const email = username;

  if(!AVAILABLE_DATABASE_SERVICES.main) {
    return res.status(500).json(ApiError('Database service not available'));
  }
  const userTable = new User(AVAILABLE_DATABASE_SERVICES.main);

  if (!email || !password || !name || !role) {
    return res.status(400).json(ApiError('Missing required fields'));
  }

  try {
    User.type.parse({
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

  const result = await userTable.insertOne({
    name,
    role,
    email,
    password: hashedPassword,
  });

  console.log("result", result);


  if (result.status === 'error') {
    return res.status(500).json(result);
  }

  return res.json(result);
}




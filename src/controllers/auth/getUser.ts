import { Request, Response } from 'express';
import { ApiSuccess } from '../../common/api_response';
import ControllerConfigInterface from '../../interfaces/Controller/ControllerConfig';

export default function getUser(req: Request, res: Response) {
  const result = ApiSuccess<Express.User | undefined>(req.user);
  return res.json(result);
}

export const getUserConfig: ControllerConfigInterface = {
  relativePath: '/auth/getUser',
  type: 'get',
  exec: getUser
};

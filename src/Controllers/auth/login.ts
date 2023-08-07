import { Request, Response } from 'express';
import { ApiSuccess } from '../../Common/ApiResponse';
import ControllerConfigInterface from '../../Interfaces/Controller/ControllerConfig';

export default function login(req: Request, res: Response) {
  const result = ApiSuccess<Express.User | undefined>(req.user);
  return res.json(result);
}

import { Request, Response, Router } from 'express';
import DatabaseTableImpl from '../Database/DatabaseTableInterface';

export default interface ControllerConfigInterface {
    relativePath: string;
    type: "get" | "post" | "put" | "delete";
    middleware?: (req: Request, res: Response, next: () => void) => void;
    exec: (req: Request, res: Response) => void;
}
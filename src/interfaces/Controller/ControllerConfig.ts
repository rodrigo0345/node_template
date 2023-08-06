import { Request, Response, Router } from 'express';

export default interface ControllerConfigInterface {
    relativePath: string;
    type: "get" | "post" | "put" | "delete";
    middleware?: (req: Request, res: Response, next: () => void) => void;
    exec: (req: Request, res: Response) => void;
}
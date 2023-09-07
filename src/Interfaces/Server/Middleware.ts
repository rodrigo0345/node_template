import ServerInterface from './Server';
import { Request } from 'express';

export default interface MiddlewareInterface {
    execute: (
        req: Request,
        res: Response,
        next: () => void,
    ) => void;
    setState(
        state: 'active' | 'notactive',
    ): void;
}

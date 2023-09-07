import ControllerInterface from '../Controller/Controller';
import MiddlewareInterface from './Middleware';
import ServerInterface from './Server';

export default interface ServerConfigInterface {
    setup(
        server: ServerInterface,
    ): unknown;
    port: number;
    host: string;
    middlewares: MiddlewareInterface[];
    controllers: ControllerInterface[];
}

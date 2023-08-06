import MiddlewareInterface from "./Middleware";
import ServerConfigInterface from "./ServerConfig";

export default interface ServerInterface {
    start(config: ServerConfigInterface, middlewares: MiddlewareInterface[]): void;
    stop(): void;
    getServer(): any;
}
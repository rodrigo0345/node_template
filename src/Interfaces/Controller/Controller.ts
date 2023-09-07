import ServerInterface from '../Server/Server';
import ControllerConfigInterface from './ControllerConfig';

export default interface ControllerInterface {
    setServer(
        server: ServerInterface,
    ): void;
    setConfig(
        config: ControllerConfigInterface[],
    ): void;
    start(): void;
}

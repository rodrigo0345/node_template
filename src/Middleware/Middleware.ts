import MiddlewareInterface from "../Interfaces/Server/Middleware";
import ServerInterface from "../Interfaces/Server/Server";

export default class Middleware implements MiddlewareInterface {
    private state: "active" | "notactive";
    private exec: (req: any, res: any, next: any) => void;
    private boundServer: Set<ServerInterface> | null = null;

    constructor(exec: (req: any, res: any, next: any) => void){
        this.state = "active";
        this.exec = exec;
    }
    execute = (req: any, res: any, next: any) => {
        if(this.state === "active") this.exec(req, res, next);
        else next();
    };
    setState(state: "active" | "notactive"): void {
        this.state = state;
    }
}
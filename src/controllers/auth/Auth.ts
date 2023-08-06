import { expressServer } from "../..";
import ControllerConfigInterface from "../../interfaces/Controller/ControllerConfig";
import Controller from "../Controller"

export const authConfig: ControllerConfigInterface[] = [
    {
        relativePath: "/auth/login",
        type: "post",
        exec: (req, res) => { res.send("login");}
    },
    {
        relativePath: "/auth/register",
        type: "post",
        exec: (req, res) => { res.send("register");}
    },
]
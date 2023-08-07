import passport from "passport";
import ControllerConfigInterface from "../../Interfaces/Controller/ControllerConfig";
import login from "./login";
import register from "./postRegister";

export const authConfig: ControllerConfigInterface[] = [
    {
        relativePath: "/auth/login",
        type: "post",
        middleware: passport.authenticate("local"),
        exec: login
    },
    {
        relativePath: "/auth/register",
        type: "post",
        exec: register
    },
]
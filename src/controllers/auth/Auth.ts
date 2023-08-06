import ControllerConfigInterface from "../../interfaces/Controller/ControllerConfig";
import Controller from "../Controller"
import getUser from "./getUser";
import postRegister from "./postRegister";

export const authConfig: ControllerConfigInterface[] = [
    {
        relativePath: "/auth/login",
        type: "post",
        exec: getUser
    },
    {
        relativePath: "/auth/register",
        type: "post",
        exec: postRegister
    },
]
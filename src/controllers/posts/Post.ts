import multer from "multer";
import ControllerConfigInterface from "../../Interfaces/Controller/ControllerConfig";
import path from "path";

export const imageConfig: ControllerConfigInterface[] = [
    {
        relativePath: "/auth/login",
        type: "post",
        exec: postPost
    },
]
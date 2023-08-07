import multer from "multer";
import ControllerConfigInterface from "../../Interfaces/Controller/ControllerConfig";
import path from "path";
import getPosts from "./getPosts";
import postPost from "./postPost";

export const imageConfig: ControllerConfigInterface[] = [
    {
        relativePath: "/posts",
        type: "post",
        exec: postPost
    },
    {
        relativePath: "/posts",
        type: "get",
        exec: getPosts
    },
]

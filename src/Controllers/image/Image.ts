import multer from "multer";
import ControllerConfigInterface from "../../Interfaces/Controller/ControllerConfig";
import postImage from "./postImage";
import path from "path";

const storageConfig = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve('public/images'));
    },
    filename: function (req, file, cb) {
        const time = new Date().getTime();
        cb(null, `${time}_${file.originalname}`);
    },
});

const fileUploadSettings = multer({
    storage: storageConfig,
    limits: { fileSize: 5 * 1000 * 1000 }, // 5MB limit
});

export const imageConfig: ControllerConfigInterface[] = [
    {
        relativePath: "/image",
        type: "post",
        middleware: fileUploadSettings.single("image"),
        exec: postImage
    },
]
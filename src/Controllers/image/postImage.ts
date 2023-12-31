import { Router } from 'express';
import {
    Request,
    Response,
} from 'express';
import {
    ApiError,
    ApiSuccess,
} from '../../Common/ApiResponse';
import sharp from 'sharp';
import fs from 'fs';

export default function postImage(
    req: Request,
    res: Response,
) {
    const file = req.file;

    if (!file) {
        return res
            .status(400)
            .json(
                ApiError(
                    'No file uploaded',
                ),
            );
    }

    if (!req.file?.path) {
        return res
            .status(500)
            .json(
                ApiError(
                    'No file path',
                ),
            );
    }

    // optional but recommended
    // to make the photos in .webp format
    const finalWebpPath =
        req.file?.path + '.webp';
    const finalFilename =
        file.filename + '.webp';
    const imageWidth = 1000;
    const imageHeight = 500;

    try {
        sharp(req.file?.path)
            .resize(
                imageWidth,
                imageHeight,
                {
                    fit: 'cover',
                },
            )
            .webp()
            .toFile(
                finalWebpPath ?? '',
                (err: any, _: any) => {
                    if (err) {
                        return res
                            .status(500)
                            .json(
                                ApiError(
                                    err.message,
                                ),
                            );
                    }
                    fs.unlinkSync(
                        req.file
                            ?.path ??
                            '',
                    );
                    return res.json(
                        ApiSuccess(
                            finalFilename,
                        ),
                    );
                },
            );
    } catch (err: any) {
        return res
            .status(500)
            .json(
                ApiError(err.message),
            );
    }
}

import { Router } from 'express';
import { Request, Response } from 'express';
import { ApiError, ApiSuccess } from '../../common/api_response';
import sharp from 'sharp';
import fs from 'fs';
import ControllerConfigInterface from '../../interfaces/Controller/ControllerConfig';

export default function postImage(req: Request, res: Response) {
  const file = req.file;

  if (!file) {
    return res.status(400).json(ApiError('No file uploaded'));
  }

  if (!req.file?.path) {
    return res.status(500).json(ApiError('No file path'));
  }

  // optional but recommended
  // to make the photos in .webp format
  const finalWebpPath = req.file?.path + '.webp';
  const finalFilename = req.file.filename + '.webp';
  const imageWidth = 1000;
  const imageHeight = 500;

  try {
    sharp(req.file?.path)
      .resize(imageWidth, imageHeight, {
        fit: 'cover',
      })
      .webp()
      .toFile(finalWebpPath ?? '', (err: any, info: any) => {
        if (err) {
          throw err;
        }
        fs.unlinkSync(req.file?.path ?? '');
        return res.json(ApiSuccess(finalFilename));
      });
  } catch (err: any) {
    return res.status(500).json(ApiError(err.message));
  }
}

export const postImageConfig: ControllerConfigInterface = {
  relativePath: '/image/post',
  type: 'post',
  middleware: (req: Request, res: Response, next: () => void) => {
    next();
  },
  exec: postImage,
};

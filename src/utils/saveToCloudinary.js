import { v2 as cloudinary } from 'cloudinary';
import { SMTP } from '../constants/index.js';
import { env } from '../utils/env.js';
import fs from 'node:fs/promises';

cloudinary.config({
  cloud_name: env(SMTP.CLOUDINARY_NAME),
  api_key: env(SMTP.CLOUDINARY_API_KEY),
  api_secret: env(SMTP.CLOUDINARY_API_SECRET),
});

export const saveToCloudinary = async (file) => {
  const res = await cloudinary.uploader.upload(file.path);
  await fs.unlink(file.path);

  return res.secure_url;
};

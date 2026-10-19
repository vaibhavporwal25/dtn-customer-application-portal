import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Secure private upload directory outside public web root
export const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_BYTES || '5242880', 10); // 5 MB

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/pdf'
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Generate secure randomized storage name
    const ext = path.extname(file.originalname).toLowerCase();
    const randomizedName = `${uuidv4()}${ext}`;
    cb(null, randomizedName);
  }
});

export const multerUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5 // max 5 files in a single request
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error(`Unsupported file extension "${ext}". Allowed types: JPG, PNG, PDF.`));
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
      return cb(new Error(`Unsupported MIME type "${file.mimetype}". Allowed types: JPG, PNG, PDF.`));
    }
    cb(null, true);
  }
});

// Magic bytes content validator middleware to verify actual binary signatures
export function validateFileSignatures(req: Request, res: Response, next: NextFunction): void {
  const files: Express.Multer.File[] = [];

  if (req.file) {
    files.push(req.file);
  }
  if (req.files) {
    if (Array.isArray(req.files)) {
      files.push(...req.files);
    } else {
      Object.values(req.files).forEach(fArr => files.push(...fArr));
    }
  }

  for (const file of files) {
    try {
      const buffer = Buffer.alloc(16);
      const fd = fs.openSync(file.path, 'r');
      fs.readSync(fd, buffer, 0, 16, 0);
      fs.closeSync(fd);

      const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
      const isPdf = buffer.toString('utf8', 0, 5) === '%PDF-';

      if (!isJpg && !isPng && !isPdf) {
        // Discard rejected file immediately
        try { fs.unlinkSync(file.path); } catch {}
        res.status(400).json({
          success: false,
          message: `File content verification failed for "${file.originalname}". The binary signature does not match an authentic JPG, PNG, or PDF document.`
        });
        return;
      }
    } catch (err) {
      try { fs.unlinkSync(file.path); } catch {}
      res.status(500).json({
        success: false,
        message: `Error verifying upload file content: ${err instanceof Error ? err.message : 'Unknown error'}`
      });
      return;
    }
  }

  next();
}

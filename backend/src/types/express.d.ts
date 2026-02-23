import "express";
import { File } from 'multer';

declare global {
    namespace Express {
      interface Request {
        user?: {
          id: number;
          email: string;
          name: string;
          profileImage: string | null;
        };
        file?: {
          fieldname: string;
          originalname: string;
          encoding: string;
          mimetype: string;
          size: number;
          destination?: string;
          filename?: string;
          path?: string;
          buffer?: Buffer;
          secure_url?: string;
          url?: string;
        };
        files?: Array<{
          fieldname: string;
          originalname: string;
          encoding: string;
          mimetype: string;
          size: number;
          destination?: string;
          filename?: string;
          path?: string;
          buffer?: Buffer;
          secure_url?: string;
          url?: string;
        }>;
      }
    }
  }
export {};
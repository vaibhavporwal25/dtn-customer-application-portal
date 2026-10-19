import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { queryOne } from '../db/database.js';

export interface AuthRequest extends Request {
  admin?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'dtn_india_secure_jwt_token_secret_key_demo_2026_change_in_production';

export function generateToken(payload: { id: number; username: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export async function requireAdminAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token && typeof req.query.token === 'string') {
      token = req.query.token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Missing or malformed authorization header.'
      });
      return;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      username: string;
      email: string;
      role: string;
    };

    // Verify admin still exists in DB
    const admin = await queryOne('SELECT id, username, email, full_name, role FROM admins WHERE id = ?', [decoded.id]);
    if (!admin) {
      res.status(401).json({
        success: false,
        message: 'Invalid session. Administrator account not found.'
      });
      return;
    }

    req.admin = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed. Session expired or invalid token.'
    });
  }
}

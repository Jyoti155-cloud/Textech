import { Request, Response, NextFunction } from 'express';
import { db } from '../services/dbService.js';
import { User } from '../../src/types.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const user = db.getUserByToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.',
    });
  }

  const token = authHeader.substring(7).trim();
  const user = db.getUserByToken(token);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.',
    });
  }

  req.user = user;
  next();
}

import express, { Response, NextFunction } from 'express';
import AuthRequest from '../dto/AuthRequest';
import pool from '../db/Pool';

const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    token = req.headers['x-user-id'] as string;
  }
  
  if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }
  
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [token]);
    if (rows.length === 0) return res.status(403).json({ error: 'User not found' });
    
    req.user = rows[0];
    next();
  } catch (e) {
    console.error('[Auth Middleware] Error:', e);
    res.status(500).json({ error: 'Auth DB Error' });
  }
};

export default authenticateToken;
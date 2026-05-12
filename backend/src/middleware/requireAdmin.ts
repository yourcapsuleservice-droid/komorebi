import express, { Response, NextFunction } from 'express';
import AuthRequest from '../dto/AuthRequest';

const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
};

export default requireAdmin;    
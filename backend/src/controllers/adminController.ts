import { Request, Response } from 'express';
import pool from '../db/Pool';

const adminController = {
    getStats: async (req: Request, res: Response) => {
        try {
            const usersCount = await pool.query('SELECT COUNT(*) FROM users');
            const readsSum = await pool.query('SELECT SUM(manga_read) FROM user_stats');
            const reportsCount = await pool.query("SELECT COUNT(*) FROM reports WHERE status = 'pending'");
            const libraryCount = await pool.query('SELECT COUNT(*) FROM mangas');

            res.json({
                totalUsers: parseInt(usersCount.rows[0].count),
                totalReads: parseInt(readsSum.rows[0].sum) || 0,
                pendingReports: parseInt(reportsCount.rows[0].count),
                librarySize: parseInt(libraryCount.rows[0].count),
                weeklyActivity: [100, 120, 90, 150, 200, 180, 220],
                genreDistribution: [30, 20, 15, 35]
            });
        } catch (e) {
            res.status(500).json({ error: 'Stats failed' });
        }
    },

    getReports: async (req: Request, res: Response) => {
        try {
            const { rows } = await pool.query(`
                SELECT r.*, m.title as "mangaTitle" 
                FROM reports r 
                JOIN mangas m ON r.manga_id = m.id
                ORDER BY r.date DESC
            `);
            res.json(rows.map(r => ({
                id: r.id,
                mangaId: r.manga_id,
                mangaTitle: r.mangaTitle,
                userId: r.user_id,
                reason: r.reason,
                date: r.date,
                status: r.status
            })));
        } catch (e) {
            res.status(500).json({ error: 'Reports failed' });
        }
    },

    resolveReport: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await pool.query("UPDATE reports SET status = 'resolved' WHERE id = $1", [id]);
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ error: 'Resolution failed' });
        }
    }
};

export default adminController;
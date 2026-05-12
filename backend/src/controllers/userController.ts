import { Response } from 'express';
import pool from '../db/Pool';
import AuthRequest from '../dto/AuthRequest';
import { mapManga } from './mapManga';
import authController from './authController';

const userController = {
    getProfile: async (req: AuthRequest, res: Response) => {
        authController.me(req, res);
    },

    updateProfile: async (req: AuthRequest, res: Response) => {
        const user = req.user;
        const { bio, avatar } = req.body;
        try {
            await pool.query('UPDATE users SET bio = COALESCE($1, bio), avatar = COALESCE($2, avatar) WHERE id = $3', [bio, avatar, user.id]);
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ error: 'Update failed' });
        }
    },

    getBookmarks: async (req: AuthRequest, res: Response) => {
        const user = req.user;
        try {
            const { rows } = await pool.query(`
                SELECT m.* FROM bookmarks b 
                JOIN mangas m ON b.manga_id = m.id 
                WHERE b.user_id = $1
            `, [user.id]);
            
            const results = await Promise.all(rows.map(mapManga));
            res.json(results);
        } catch (e) {
            res.status(500).json({ error: 'Failed to get bookmarks' });
        }
    },

    getHistory: async (req: AuthRequest, res: Response) => {
        const user = req.user;
        try {
            const { rows } = await pool.query(`
                SELECT rh.*, m.title as manga_title, c.title as chapter_title 
                FROM read_history rh 
                JOIN mangas m ON rh.manga_id = m.id 
                LEFT JOIN chapters c ON rh.chapter_id = c.id
                WHERE rh.user_id = $1 
                ORDER BY rh.date DESC
            `, [user.id]);

            res.json(rows.map(r => ({
                mangaId: r.manga_id,
                chapterId: r.chapter_id,
                mangaTitle: r.manga_title,
                chapterTitle: r.chapter_title,
                date: r.date
            })));
        } catch (e) {
            res.status(500).json({ error: 'Failed to get history' });
        }
    },

    toggleBookmark: async (req: AuthRequest, res: Response) => {
        const { mangaId } = req.body;
        const userId = req.user.id;

        try {
            const check = await pool.query('SELECT * FROM bookmarks WHERE user_id = $1 AND manga_id = $2', [userId, mangaId]);
            if (check.rows.length > 0) {
                await pool.query('DELETE FROM bookmarks WHERE user_id = $1 AND manga_id = $2', [userId, mangaId]);
            } else {
                await pool.query('INSERT INTO bookmarks (user_id, manga_id) VALUES ($1, $2)', [userId, mangaId]);
            }
            
            const all = await pool.query('SELECT manga_id FROM bookmarks WHERE user_id = $1', [userId]);
            res.json({ bookmarks: all.rows.map(r => r.manga_id) });
        } catch (e) {
            res.status(500).json({ error: 'Bookmark error' });
        }
    },

    updateHistory: async (req: AuthRequest, res: Response) => {
        const { mangaId, chapterId } = req.body;
        const userId = req.user.id;

        try {
            await pool.query(
                `INSERT INTO read_history (user_id, manga_id, chapter_id, date) 
                 VALUES ($1, $2, $3, NOW())
                 ON CONFLICT (user_id, manga_id, chapter_id) DO UPDATE SET date = NOW()`,
                [userId, mangaId, chapterId]
            );
            await pool.query(`UPDATE user_stats SET manga_read = manga_read + 1 WHERE user_id = $1`, [userId]);
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ error: 'History update failed' });
        }
    }
};

export default userController;
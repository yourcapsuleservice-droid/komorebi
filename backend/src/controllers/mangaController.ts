import { Request, Response } from 'express';
import pool from '../db/Pool';
import { v4 as uuidv4 } from 'uuid';
import AuthRequest from '../dto/AuthRequest';
import { mapManga } from './mapManga';
import { S3Service }  from '../services/S3Service'; 

const s3Service = new S3Service();

const mangaController = {
  // PUBLIC: Anyone can view list
  getAll: async (req: Request, res: Response) => {
    try {
      const { search, tag, sort } = req.query;
      
      let query = 'SELECT * FROM mangas WHERE 1=1';
      const params: any[] = [];
      let pIdx = 1;

      if (search) {
        query += ` AND (LOWER(title) LIKE $${pIdx} OR LOWER(author) LIKE $${pIdx})`;
        params.push(`%${(search as string).toLowerCase()}%`);
        pIdx++;
      }
      
      if (tag) {
        query += ` AND $${pIdx} = ANY(tags)`;
        params.push(tag);
        pIdx++;
      }

      if (sort === 'newest') query += ' ORDER BY added_date DESC';
      else if (sort === 'rating') query += ' ORDER BY rating DESC';
      else query += ' ORDER BY views DESC';

      const { rows } = await pool.query(query, params);
      
      const results = await Promise.all(rows.map(mapManga));

      res.json(results);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // PUBLIC: Anyone can view details
  getById: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const mangaRes = await pool.query('SELECT * FROM mangas WHERE id = $1', [id]);
        if (mangaRes.rows.length === 0) return res.status(404).json({ error: 'Manga not found' });
        
        const manga = mangaRes.rows[0];
        const mapped = await mapManga(manga);
        res.json(mapped);
    } catch (e) {
        res.status(500).json({ error: 'Failed to get manga' });
    }
  },

  // PUBLIC: View chapters
  getChapters: async (req: Request, res: Response) => {
      try {
          const { id } = req.params;
          const { rows } = await pool.query('SELECT * FROM chapters WHERE manga_id = $1 ORDER BY upload_date ASC', [id]);
          const chapters = await Promise.all(rows.map(async c => ({
              id: c.id,
              title: c.title,
              pages: c.pages,
              uploadDate: c.upload_date,
              fileKey: c.file_key 
          })));
          res.json(chapters);
      } catch (e) {
          res.status(500).json({ error: 'Failed to get chapters' });
      }
  },

  // PUBLIC: Read chapter
  getChapterFile: async (req: Request, res: Response) => {
      try {
          const { chapterId } = req.params;
          const { rows } = await pool.query('SELECT file_key FROM chapters WHERE id = $1', [chapterId]);
          if (rows.length === 0) return res.status(404).json({ error: 'Chapter not found' });
          
          const url = await s3Service.getFileUrl(rows[0].file_key);
          res.json({ url });
      } catch (e) {
          res.status(500).json({ error: 'Failed to get chapter file' });
      }
  },

  // PUBLIC: View comments
  getComments: async (req: Request, res: Response) => {
      try {
          const { id } = req.params;
          const { rows } = await pool.query(`
            SELECT c.*, u.username, u.avatar 
            FROM comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.manga_id = $1 
            ORDER BY c.date DESC`, [id]);

          res.json(rows.map(c => ({
              id: c.id,
              userId: c.user_id,
              userName: c.username,
              userAvatar: c.avatar,
              text: c.text,
              date: c.date
          })));
      } catch (e) {
          res.status(500).json({ error: 'Failed to get comments' });
      }
  },

  // ADMIN ONLY: Moved create/addChapter logic to be protected
  create: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Cover required' });
      
      const { title, description, author, status, tags, language } = req.body;
      const coverKey = await s3Service.uploadFile(req.file.buffer, req.file.originalname, 'covers', req.file.mimetype);
      
      const id = uuidv4();
      const tagsArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : []);

      await pool.query(
        `INSERT INTO mangas (id, title, description, author, cover_key, status, tags, language, rating, views, added_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 0, NOW())`,
        [id, title, description, author, coverKey, status, tagsArray, language]
      );

      res.status(201).json({ id, title, status });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Create failed' });
    }
  },

  addChapter: async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, pages } = req.body;
        if (!req.file) return res.status(400).json({ error: 'PDF required' });

        const fileKey = await s3Service.uploadFile(req.file.buffer, req.file.originalname, `chapters/${id}`, req.file.mimetype);
        const chapterId = uuidv4();

        await pool.query(
            `INSERT INTO chapters (id, manga_id, title, file_key, pages, upload_date)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [chapterId, id, title, fileKey, parseInt(pages) || 0]
        );

        res.status(201).json({ id: chapterId, title });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Upload failed' });
    }
  },

  // ADMIN ONLY: Delete Manga
  deleteManga: async (req: AuthRequest, res: Response) => {
      try {
          const { id } = req.params;
          // Note: ON DELETE CASCADE handled by DB for chapters, comments, etc.
          const result = await pool.query('DELETE FROM mangas WHERE id = $1 RETURNING id', [id]);
          
          if (result.rowCount === 0) {
              return res.status(404).json({ error: 'Manga not found' });
          }

          res.json({ success: true, message: 'Manga deleted successfully' });
      } catch (e) {
          console.error('[Delete Manga] Error:', e);
          res.status(500).json({ error: 'Failed to delete manga' });
      }
  },

  // ADMIN ONLY: Delete Chapter
  deleteChapter: async (req: AuthRequest, res: Response) => {
      try {
          const { chapterId } = req.params;
          const result = await pool.query('DELETE FROM chapters WHERE id = $1 RETURNING id', [chapterId]);
          
          if (result.rowCount === 0) {
              return res.status(404).json({ error: 'Chapter not found' });
          }

          res.json({ success: true, message: 'Chapter deleted successfully' });
      } catch (e) {
          console.error('[Delete Chapter] Error:', e);
          res.status(500).json({ error: 'Failed to delete chapter' });
      }
  },

  // USER: Add comment
  addComment: async (req: AuthRequest, res: Response) => {
      try {
        const { id } = req.params;
        const { text } = req.body;
        const user = req.user;
        const commentId = uuidv4();

        await pool.query(
            `INSERT INTO comments (id, manga_id, user_id, text, date) VALUES ($1, $2, $3, $4, NOW())`,
            [commentId, id, user.id, text]
        );

        res.status(201).json({ id: commentId, text });
      } catch (e) {
          res.status(500).json({ error: 'Comment failed' });
      }
  },

  // USER/ADMIN: Delete comment (User: own, Admin: any)
  deleteComment: async (req: AuthRequest, res: Response) => {
      try {
          const { id } = req.params;
          const user = req.user;

          const check = await pool.query('SELECT user_id FROM comments WHERE id = $1', [id]);
          if (check.rows.length === 0) return res.status(404).json({ error: 'Comment not found' });
          
          // Allow if it's the user's own comment OR if user is admin
          if (check.rows[0].user_id !== user.id && user.role !== 'admin') {
              return res.status(403).json({ error: 'Forbidden' });
          }

          await pool.query('DELETE FROM comments WHERE id = $1', [id]);
          res.json({ success: true });
      } catch (e) {
          res.status(500).json({ error: 'Delete failed' });
      }
  },

  // USER: Report
  reportManga: async (req: AuthRequest, res: Response) => {
      try {
        const { id } = req.params;
        const { reason } = req.body;
        const user = req.user;
        const reportId = uuidv4();

        await pool.query(
            `INSERT INTO reports (id, manga_id, user_id, reason, date, status) VALUES ($1, $2, $3, $4, NOW(), 'pending')`,
            [reportId, id, user.id, reason]
        );
        res.status(201).json({ message: 'Reported' });
      } catch (e) {
          res.status(500).json({ error: 'Report failed' });
      }
  }
};

export default mangaController;
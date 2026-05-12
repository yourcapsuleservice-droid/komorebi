import { Request, Response } from 'express';
import pool from '../db/Pool';
import { v4 as uuidv4 } from 'uuid';
import AuthRequest from '../dto/AuthRequest';

const authController = {
  login: async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
        
        if (rows.length > 0) {
            const user = rows[0];
            const statsRes = await pool.query('SELECT * FROM user_stats WHERE user_id = $1', [user.id]);
            const stats = statsRes.rows[0] || { manga_read: 0, pages_read: 0, hours_spent: 0 };

            res.json({ 
                token: user.id,
                user: { 
                    id: user.id, 
                    email: user.email, 
                    username: user.username, 
                    role: user.role, 
                    avatar: user.avatar,
                    stats: {
                        mangaRead: stats.manga_read,
                        pagesRead: stats.pages_read,
                        hoursSpent: stats.hours_spent
                    }
                } 
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Login failed' });
    }
  },

  register: async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const check = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) return res.status(400).json({ error: 'User already exists' });

        const id = uuidv4();
        const username = email.split('@')[0];
        // Hardcode role to 'reader' for public registration. Admins created manually or via DB seed.
        const role = 'reader'; 
        const avatar = 'https://via.placeholder.com/150';

        await pool.query(
            'INSERT INTO users (id, email, username, password, role, avatar) VALUES ($1, $2, $3, $4, $5, $6)',
            [id, email, username, password, role, avatar]
        );
        
        await pool.query('INSERT INTO user_stats (user_id) VALUES ($1)', [id]);

        res.status(201).json({ user: { id, email, username, role, avatar } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Registration failed' });
    }
  },

  me: async (req: AuthRequest, res: Response) => {
      try {
          const user = req.user;
          const statsRes = await pool.query('SELECT * FROM user_stats WHERE user_id = $1', [user.id]);
          const stats = statsRes.rows[0] || { manga_read: 0, pages_read: 0, hours_spent: 0 };

          res.json({
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role,
              avatar: user.avatar,
              bio: user.bio,
              stats: {
                  mangaRead: stats.manga_read,
                  pagesRead: stats.pages_read,
                  hoursSpent: stats.hours_spent
              }
          });
      } catch (e) {
          res.status(500).json({ error: 'Failed to fetch user' });
      }
  }
};

export default authController;
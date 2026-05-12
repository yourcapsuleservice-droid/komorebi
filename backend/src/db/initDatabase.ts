import pool from './Pool';
import { v4 as uuidv4 } from 'uuid';

async function initDatabase() {
    try {
        console.log('[DB] Initializing Tables...');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                username TEXT NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                avatar TEXT,
                bio TEXT
            );
            
            CREATE TABLE IF NOT EXISTS mangas (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                author TEXT,
                cover_key TEXT,
                status TEXT,
                tags TEXT[],
                language TEXT,
                rating DECIMAL DEFAULT 0,
                views INTEGER DEFAULT 0,
                added_date TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS chapters (
                id TEXT PRIMARY KEY,
                manga_id TEXT REFERENCES mangas(id) ON DELETE CASCADE,
                title TEXT,
                file_key TEXT,
                pages INTEGER,
                upload_date TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS comments (
                id TEXT PRIMARY KEY,
                manga_id TEXT REFERENCES mangas(id) ON DELETE CASCADE,
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                text TEXT,
                date TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS reports (
                id TEXT PRIMARY KEY,
                manga_id TEXT REFERENCES mangas(id) ON DELETE CASCADE,
                user_id TEXT REFERENCES users(id),
                reason TEXT,
                date TIMESTAMP DEFAULT NOW(),
                status TEXT DEFAULT 'pending'
            );

            CREATE TABLE IF NOT EXISTS bookmarks (
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                manga_id TEXT REFERENCES mangas(id) ON DELETE CASCADE,
                PRIMARY KEY (user_id, manga_id)
            );

            CREATE TABLE IF NOT EXISTS read_history (
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                manga_id TEXT REFERENCES mangas(id) ON DELETE CASCADE,
                chapter_id TEXT,
                date TIMESTAMP DEFAULT NOW(),
                PRIMARY KEY (user_id, manga_id, chapter_id)
            );

            CREATE TABLE IF NOT EXISTS user_stats (
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
                manga_read INTEGER DEFAULT 0,
                pages_read INTEGER DEFAULT 0,
                hours_spent INTEGER DEFAULT 0
            );
        `);

        // Check and Seed Users
        const userCheck = await pool.query('SELECT count(*) FROM users');
        const userCount = parseInt(userCheck.rows[0].count);

        if (userCount === 0) {
            console.log('[DB] Seeding Users...');
            
            // Seed Admin
            const adminId = uuidv4();
            await pool.query(
                `INSERT INTO users (id, email, username, password, role, avatar) VALUES ($1, $2, $3, $4, $5, $6)`,
                [adminId, 'admin@komorebi.com', 'AdminSama', 'admin', 'admin', null]
            );
            await pool.query(`INSERT INTO user_stats (user_id) VALUES ($1)`, [adminId]);

            // Seed Reader
            const readerId = uuidv4();
            await pool.query(
                `INSERT INTO users (id, email, username, password, role, avatar) VALUES ($1, $2, $3, $4, $5, $6)`,
                [readerId, 'reader@komorebi.com', 'ReaderSan', 'reader', 'reader', null]
            );
            await pool.query(`INSERT INTO user_stats (user_id) VALUES ($1)`, [readerId]);
            
            console.log('[DB] Users Seeded.');

            /* ================== SEED MANGAS ================== */
            const mangaCheck = await pool.query('SELECT COUNT(*) FROM mangas');
            if (Number(mangaCheck.rows[0].count) === 0) {
                console.log('[DB] Seeding Mangas...');

                const mangaIds = [
                    uuidv4(),
                    uuidv4(),
                    uuidv4()
                ];

                await pool.query(
                    `INSERT INTO mangas 
                    (id, title, description, author, cover_key, status, tags, language, rating, views)
                    VALUES
                    ($1,'Komorebi Nights','Slice of life manga','Akiro','','ongoing',ARRAY['slice','drama'],'en',4.5,1200),
                    ($2,'Steel Blossom','Action fantasy manga','Ren Ito','','ongoing',ARRAY['action','fantasy'],'en',4.2,980),
                    ($3,'Last Signal','Sci-fi thriller','M. Kato','','completed',ARRAY['sci-fi','thriller'],'jp',4.8,2100)
                    `,
                    mangaIds
                );
            }

            /* ================== SEED COMMENTS ================== */
            const commentCheck = await pool.query('SELECT COUNT(*) FROM comments');
            if (Number(commentCheck.rows[0].count) === 0) {
                console.log('[DB] Seeding Comments...');

                const users = await pool.query('SELECT id FROM users ORDER BY role');
                const mangas = await pool.query('SELECT id FROM mangas');

                await pool.query(
                    `INSERT INTO comments (id, manga_id, user_id, text)
                    VALUES
                    ($1,$2,$3,'Great manga, really enjoyed it'),
                    ($4,$5,$6,'Art style is amazing'),
                    ($7,$8,$9,'Story pacing is very good')
                    `,
                    [
                        uuidv4(), mangas.rows[0].id, users.rows[1].id,
                        uuidv4(), mangas.rows[1].id, users.rows[1].id,
                        uuidv4(), mangas.rows[2].id, users.rows[0].id
                    ]
                );
            }

            /* ================== SEED REPORTS ================== */
            const reportCheck = await pool.query('SELECT COUNT(*) FROM reports');
            if (Number(reportCheck.rows[0].count) === 0) {
                console.log('[DB] Seeding Reports...');

                const users = await pool.query('SELECT id FROM users');
                const mangas = await pool.query('SELECT id FROM mangas');

                await pool.query(
                    `INSERT INTO reports (id, manga_id, user_id, reason, status)
                    VALUES ($1,$2,$3,'Incorrect tags','pending')`,
                    [uuidv4(), mangas.rows[0].id, users.rows[1].id]
                );
            }

            /* ================== UPDATE USER STATS ================== */
            await pool.query(`
                UPDATE user_stats
                SET manga_read = 2,
                    pages_read = 120,
                    hours_spent = 3
                WHERE user_id IN (SELECT id FROM users WHERE role = 'reader')
            `);

        }

        console.log('[DB] Initialization Complete.');
    } catch (e) {
        console.error('[DB] Initialization Failed:', e);
    }
}

export default initDatabase;
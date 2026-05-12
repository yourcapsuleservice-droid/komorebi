import express from 'express';
import cors from 'cors';
import multer from 'multer';
import swaggerUi from 'swagger-ui-express';

import 'dotenv/config';
import authenticateToken from './middleware/authenticateToken';
import requireAdmin from './middleware/requireAdmin';
import initDatabase from './db/initDatabase';
import authController from './controllers/authController';
import userController from './controllers/userController';
import mangaController from './controllers/mangaController';
import adminController from './controllers/adminController';
import swaggerSpec from './swagger/swaggerSpec';

const PORT = process.env.VITE_PORT;

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Auth Routes
app.post('/api/auth/login', authController.login);
app.post('/api/auth/register', authController.register);
app.get('/api/auth/me', authenticateToken, authController.me);

// User Routes (Protected by Auth)
app.get('/api/user/profile', authenticateToken, userController.getProfile);
app.put('/api/user/profile', authenticateToken, userController.updateProfile);
app.get('/api/user/bookmarks', authenticateToken, userController.getBookmarks);
app.post('/api/user/bookmarks', authenticateToken, userController.toggleBookmark);
app.get('/api/user/history', authenticateToken, userController.getHistory);
app.post('/api/user/history', authenticateToken, userController.updateHistory);

// Manga Routes (Public Read, Admin Write)
app.get('/api/manga', mangaController.getAll);
app.get('/api/manga/:id', mangaController.getById);
app.get('/api/manga/:id/chapters', mangaController.getChapters);
app.get('/api/chapters/:chapterId/file', mangaController.getChapterFile);
app.get('/api/manga/:id/comments', mangaController.getComments);

// PROTECTED MANGA ROUTES (ADMIN ONLY)
app.post('/api/manga', authenticateToken, requireAdmin, upload.single('cover'), mangaController.create);
app.post('/api/manga/:id/chapters', authenticateToken, requireAdmin, upload.single('file'), mangaController.addChapter);
app.delete('/api/manga/:id', authenticateToken, requireAdmin, mangaController.deleteManga);
app.delete('/api/chapters/:chapterId', authenticateToken, requireAdmin, mangaController.deleteChapter);

// INTERACTION ROUTES (User Auth Required)
app.post('/api/manga/:id/comments', authenticateToken, mangaController.addComment);
app.delete('/api/comments/:id', authenticateToken, mangaController.deleteComment);
app.post('/api/manga/:id/report', authenticateToken, mangaController.reportManga);

// Admin Routes (Admin Only)
app.get('/api/admin/reports', authenticateToken, requireAdmin, adminController.getReports);
app.post('/api/admin/reports/:id/resolve', authenticateToken, requireAdmin, adminController.resolveReport);
app.get('/api/admin/stats', authenticateToken, requireAdmin, adminController.getStats);

/**
 * ==========================================
 * API DOCUMENTATION (SWAGGER)
 * ==========================================
 *
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: UUID
 *
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in user (UUID-based token)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: User ID used as auth token
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new reader
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: User already exists
 *
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Unauthorized
 * 
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 *
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *
 * @swagger
 * /api/user/bookmarks:
 *   get:
 *     summary: Get user bookmarks
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookmarked mangas
 *
 *   post:
 *     summary: Toggle bookmark
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mangaId]
 *             properties:
 *               mangaId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated bookmarks
 *
 * @swagger
 * /api/user/history:
 *   get:
 *     summary: Get reading history
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Reading history
 *
 *   post:
 *     summary: Update reading history
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mangaId, chapterId]
 *             properties:
 *               mangaId:
 *                 type: string
 *               chapterId:
 *                 type: string
 *     responses:
 *       200:
 *         description: History updated
 *
 * @swagger
 * /api/manga:
 *   get:
 *     summary: Get manga list
 *     tags: [Manga]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, rating, popular]
 *     responses:
 *       200:
 *         description: List of mangas
 *
 * @swagger
 * /api/manga/{id}:
 *   get:
 *     summary: Get manga by ID
 *     tags: [Manga]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Manga details
 *
 * @swagger
 * /api/manga/{id}/chapters:
 *   get:
 *     summary: Get manga chapters
 *     tags: [Manga]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Chapters list
 *
 * @swagger
 * /api/chapters/{chapterId}/file:
 *   get:
 *     summary: Get chapter file URL (S3 signed)
 *     tags: [Manga]
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *     responses:
 *       200:
 *         description: Signed URL
 *
 * @swagger
 * /api/manga/{id}/comments:
 *   get:
 *     summary: Get manga comments
 *     tags: [Manga]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Comments list
 *
 *   post:
 *     summary: Add comment
 *     tags: [Manga]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 *
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete comment (own or admin)
 *     tags: [Manga]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Comment deleted
 *
 * @swagger
 * /api/manga/{id}/report:
 *   post:
 *     summary: Report manga
 *     tags: [Manga]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report submitted
 *
 * @swagger
 * /api/chapters/{chapterId}:
 *   delete:
 *     summary: Delete chapter
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chapter deleted
 *       404:
 *         description: Chapter not found
 * 
 * @swagger
 * /api/manga/{id}:
 *   delete:
 *     summary: Delete manga
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Manga deleted
 *       404:
 *         description: Manga not found
 * 
 * @swagger
 * /api/manga/{id}/chapters:
 *   post:
 *     summary: Add chapter to manga
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, file]
 *             properties:
 *               title:
 *                 type: string
 *               pages:
 *                 type: integer
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF file
 *     responses:
 *       201:
 *         description: Chapter uploaded
 *       403:
 *         description: Admin access required
 * 
 * @swagger
 * /api/manga:
 *   post:
 *     summary: Create new manga
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, cover]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               author:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ongoing, completed]
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *               language:
 *                 type: string
 *               cover:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Manga created
 *       403:
 *         description: Admin access required
 * 
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Get all reports
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Reports list
 *
 * @swagger
 * /api/admin/reports/{id}/resolve:
 *   post:
 *     summary: Resolve report
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Report resolved
 *
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics data
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, async () => {
  await initDatabase();
  console.log(`🌸 Komorebi Backend running on port ${PORT}`);
});
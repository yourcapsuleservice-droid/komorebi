import swaggerJsdoc from 'swagger-jsdoc';

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Komorebi API',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'UUID',
        },
      },

      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'reader'] },
            avatar: { type: 'string', nullable: true },
            bio: { type: 'string', nullable: true },
            stats: {
              type: 'object',
              properties: {
                mangaRead: { type: 'integer' },
                pagesRead: { type: 'integer' },
                hoursSpent: { type: 'integer' },
              },
            },
          },
        },

        Manga: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            author: { type: 'string' },
            cover: { type: 'string', nullable: true },
            status: { type: 'string' },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
            language: { type: 'string' },
            rating: { type: 'number' },
            views: { type: 'integer' },
            addedDate: { type: 'string', format: 'date-time' },
          },
        },

        Chapter: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            pages: { type: 'integer' },
            uploadDate: { type: 'string', format: 'date-time' },
            fileKey: { type: 'string' },
          },
        },

        Comment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            userName: { type: 'string' },
            userAvatar: { type: 'string' },
            text: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
          },
        },

        Report: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            mangaId: { type: 'string' },
            mangaTitle: { type: 'string' },
            userId: { type: 'string' },
            reason: { type: 'string' },
            status: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/index.ts'],
});

export default swaggerSpec;
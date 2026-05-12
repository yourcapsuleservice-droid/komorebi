import { S3Service } from '../services/S3Service';

const s3Service = new S3Service();

const mapManga = (row: any) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  author: row.author,
  cover: s3Service.getPublicUrl(row.cover_key),
  status: row.status,
  tags: row.tags || [],
  language: row.language,
  rating: parseFloat(row.rating),
  views: parseInt(row.views),
  addedDate: row.added_date,
});

export { mapManga };
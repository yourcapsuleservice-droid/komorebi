import Language from './Language';
import Chapter from './Chapter';
import Comment from './Comment';

interface Manga {
  id: string;
  title: string;
  description: string;
  cover: string | null;
  author: string;
  status: 'ongoing' | 'completed';
  tags: string[];
  language: Language;
  rating: number;
  views: number;
  addedDate: string;
  chapters?: Chapter[];
  comments?: Comment[];
}

export default Manga;
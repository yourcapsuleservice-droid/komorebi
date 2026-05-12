import Role from './Role';

interface UserData {
  id: string;
  username: string;
  role: Role;
  avatar: string;
  email: string; 
  bio: string; 
  bookmarks?: string[];
  readHistory?: any[];
  stats: {
    mangaRead: number;
    pagesRead: number;
    hoursSpent: number;
  };
}

export default UserData;   
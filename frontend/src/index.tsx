// src/index.tsx

import './styles/globals.css';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { createContext, useState, useContext } from 'react';

interface AppContextType {
  user: any;
  theme: 'light' | 'dark';
  lang: 'ua' | 'en';
  toggleTheme: () => void;
  toggleLang: () => void;
  bookmarks: Set<number>;
  toggleBookmark: (id: number) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [lang, setLang] = useState<'ua' | 'en'>('ua');
  const [bookmarks, setBookmarks] = useState(new Set([2, 5]));
  const [user, _setUser] = useState(null);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleLang = () => setLang(prev => prev === 'ua' ? 'en' : 'ua');
  
  const toggleBookmark = (id: number) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <AppContext.Provider value={{ user, theme, lang, toggleTheme, toggleLang, bookmarks, toggleBookmark }}>
      {children}
    </AppContext.Provider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
)

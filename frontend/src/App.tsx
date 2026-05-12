import { useState, useEffect, useCallback } from 'react';
import { Flower, LogOut, Heart } from 'lucide-react';
import GlobalStyles from './styles/GlobalStyles';
import IMAGES from './utils/Images';
import TRANSLATIONS from './utils/Translation';
import Manga from './interfaces/Manga';
import Toast from './interfaces/Toast';
import Language from './interfaces/Language';
import UserData from './interfaces/UserData';
import Chapter from './interfaces/Chapter';
import apiCall from './utils/apiCall';
import LandingView from './views/LandingView';
import AuthView from './views/AuthView';
import LibraryView from './views/LibraryView';
import MangaDetailView from './views/MangaDetailView';
import AdminView from './views/AdminView';
import ReaderView from './views/ReaderView';
import ProfileView from './views/ProfileView';
import ToastContainer from './components/ToastContainer';

export default function App() {
  const [lang, setLang] = useState<Language>('ua');
  const [user, setUser] = useState<UserData | null>(null);
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'library' | 'admin' | 'reader' | 'details' | 'profile'>('landing');
  const [selectedManga, setSelectedManga] = useState<Manga | null>(null);
  const [readingChapter, setReadingChapter] = useState<{ manga: Manga, chapter: Chapter, url: string } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const t = (key: keyof typeof TRANSLATIONS['ua']) => TRANSLATIONS[lang][key];

  useEffect(() => {
      const checkAuth = async () => {
          const token = localStorage.getItem('token');
          if(token) {
              try {
                  const userData = await apiCall('/auth/me');
                  setUser(userData);
                  const bookmarksRes = await apiCall('/user/bookmarks');
                  setUser(prev => prev ? { ...prev, bookmarks: bookmarksRes.map((b: Manga) => b.id) } : null);
              } catch (e) {
                  localStorage.removeItem('token');
              }
          }
      }
      checkAuth();
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    showToast('Sayonara! See you soon.', 'info');
    setUser(null);
    setView('landing');
    setSelectedManga(null);
    setReadingChapter(null);
  };

  const toggleBookmark = async (mangaId: string) => {
    if (!user) {
        showToast('Please login to bookmark', 'error');
        return setView('login');
    }
    
    try {
        const res = await apiCall('/user/bookmarks', 'POST', { mangaId });
        setUser(prev => prev ? { ...prev, bookmarks: res.bookmarks } : null);
        showToast(user.bookmarks?.includes(mangaId) ? 'Removed from bookmarks' : 'Added to bookmarks', 'info');
    } catch (e) {
        showToast('Failed to update bookmark', 'error');
    }
  };

  const handleReport = async (manga: Manga) => {
      const reason = prompt("Describe the issue (e.g., bad translation, inappropriate content):");
      if (reason) {
          try {
              await apiCall(`/manga/${manga.id}/report`, 'POST', { reason });
              showToast('Report submitted. Thank you!', 'success');
          } catch (e) {
              showToast('Failed to submit report', 'error');
          }
      }
  };

  const startReading = async (manga: Manga, chapter: Chapter) => {
    try {
        const res = await apiCall(`/chapters/${chapter.id}/file`);
        setReadingChapter({ manga, chapter, url: res.url });
        setView('reader');
        showToast(`Opened ${chapter.title}`, 'info');
        
        if(user) {
            await apiCall('/user/history', 'POST', { mangaId: manga.id, chapterId: chapter.id });
        }
    } catch (e) {
        showToast('Could not load chapter file', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-rose-200 selection:text-rose-900">
        <GlobalStyles />
        
        {view !== 'reader' && (
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${view === 'landing' ? 'bg-white/80 backdrop-blur-md border-b border-white/20' : 'bg-white border-b border-stone-200'}`}>
              <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="flex justify-between h-20 items-center">
                  <div className="flex items-center cursor-pointer group" onClick={() => setView(user ? (user.role === 'admin' ? 'admin' : 'library') : 'landing')}>
                    <div className="relative">
                        <Flower className={`h-7 w-7 mr-3 transition-colors ${view === 'landing' ? 'text-rose-500' : 'text-emerald-600'}`} />
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></span>
                    </div>
                    <span className="text-2xl font-serif font-bold text-stone-900 tracking-tight">Komorebi</span>
                  </div>
                  
                  <div className="hidden md:flex items-center space-x-8">
                    {user ? (
                      <div className="flex items-center space-x-6 lowercase">
                        <button onClick={() => setView('library')} className={`font-medium hover:text-rose-500 transition ${view === 'library' ? 'text-rose-500' : 'text-stone-600'}`}>{t('library')}</button>
                        {user.role === 'admin' && <button onClick={() => setView('admin')} className={`font-medium hover:text-rose-500 transition ${view === 'admin' ? 'text-rose-500' : 'text-stone-600'}`}>{t('adminPanel')}</button>}
                        <div className="h-6 w-px bg-stone-200"></div>
                        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setView('profile')}>
                            <span className="text-sm font-bold text-stone-800">{user.username}</span>
                            <img src={user.avatar || IMAGES.defaultAvatar} alt="Avatar" className={`h-10 w-10 rounded-full border-2 border-transparent transition object-cover ${view === 'profile' ? 'border-rose-400' : 'group-hover:border-rose-300'}`} />
                        </div>
                        <button onClick={handleLogout} className="text-stone-400 hover:text-rose-500 transition">
                          <LogOut size={20} />
                        </button>
                      </div>
                    ) : (
                       <div className="flex items-center space-x-4">
                         <div className="flex bg-stone-100 rounded-full p-1 mr-4">
                            {(['ua', 'en', 'jp'] as Language[]).map(l => (
                                <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition ${lang === l ? 'bg-white shadow-sm text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}>{l}</button>
                            ))}
                         </div>
                         <button onClick={() => setView('login')} className="text-stone-600 font-bold hover:text-stone-900 transition">{t('login')}</button>
                         <button onClick={() => setView('register')} className="px-6 py-2.5 bg-stone-900 text-white rounded-full font-bold hover:bg-rose-600 transition shadow-lg transform hover:-translate-y-0.5">{t('register')}</button>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            </nav>
        )}
        
        <main className={view !== 'reader' ? 'pt-20' : ''}>
            {view === 'landing' && <LandingView setView={setView} lang={lang} />}
            {view === 'login' && <AuthView mode="login" setView={setView} setUser={setUser} showToast={showToast} lang={lang} />}
            {view === 'register' && <AuthView mode="register" setView={setView} setUser={setUser} showToast={showToast} lang={lang} />}
            {view === 'library' && <LibraryView setView={setView} setSelectedManga={setSelectedManga} showToast={showToast} lang={lang} />}
            {view === 'details' && <MangaDetailView selectedManga={selectedManga} user={user} setView={setView} startReading={startReading} showToast={showToast} toggleBookmark={toggleBookmark} handleReport={handleReport} lang={lang} />}
            {view === 'admin' && <AdminView showToast={showToast} lang={lang} />}
            {view === 'reader' && <ReaderView readingChapter={readingChapter} setView={setView} toggleBookmark={toggleBookmark} user={user} />}
            {view === 'profile' && <ProfileView user={user} setUser={setUser} setView={setView} setSelectedManga={setSelectedManga} showToast={showToast} lang={lang} />}
        </main>

        <ToastContainer toasts={toasts} removeToast={removeToast} />
        
        {view !== 'reader' && view !== 'login' && view !== 'register' && (
            <footer className="bg-stone-900 text-stone-400 py-20 border-t-4 border-rose-500">
                <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-1">
                        <h2 className="text-3xl font-serif font-bold text-white mb-6">Komorebi</h2>
                        <p className="text-sm leading-relaxed mb-6 opacity-80">{t('heroSubtitle')}</p>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-white/10 text-center text-xs opacity-50 font-mono">
                    © 2024 Komorebi Project. Designed with <Heart size={10} className="inline text-rose-500 mx-1" /> for manga lovers.
                </div>
            </footer>
        )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { ChevronRight, Bookmark, Flag, Star, BookOpen, MessageSquare, Loader } from 'lucide-react';
import TRANSLATIONS from '../utils/Translation';
import Language from '../interfaces/Language';
import Manga from '../interfaces/Manga';
import Comment from '../interfaces/Comment';
import IMAGES from '../utils/Images';
import apiCall from '../utils/apiCall';

const MangaDetailView = ({ selectedManga, user, setView, startReading, showToast, toggleBookmark, handleReport, lang }: any) => {
    const [fullManga, setFullManga] = useState<Manga | null>(selectedManga);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);
    const isBookmarked = fullManga && user?.bookmarks?.includes(fullManga.id);
    const t = (key: keyof typeof TRANSLATIONS['ua']) => TRANSLATIONS[lang as Language][key];

    useEffect(() => {
        if(selectedManga) {
            setLoading(true);
            Promise.all([
                apiCall(`/manga/${selectedManga.id}/chapters`),
                apiCall(`/manga/${selectedManga.id}/comments`)
            ]).then(([chapters, comments]) => {
                setFullManga({ ...selectedManga, chapters, comments });
            }).finally(() => setLoading(false));
        }
    }, [selectedManga]);

    const handleAddComment = async () => {
        if (!commentText.trim() || !fullManga) return;
        try {
            const res = await apiCall(`/manga/${fullManga.id}/comments`, 'POST', { text: commentText });
            const newComment: Comment = {
                id: res.id,
                userId: user!.id,
                userName: user!.username,
                text: res.text,
                date: new Date().toISOString()
            };
            setFullManga((prev: any) => prev ? { ...prev, comments: [newComment, ...(prev.comments || [])] } : null);
            setCommentText('');
            showToast('Comment posted', 'success');
        } catch (e) {
            showToast('Failed to post comment', 'error');
        }
    };

    if (!fullManga) return null;

    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-20 relative font-sans">
        <div className="absolute inset-0 z-0 h-[60vh] w-full overflow-hidden pointer-events-none">
             <img src={IMAGES.detailBg} className="w-full h-full object-cover opacity-30" alt="Detail Background" />
             <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7]/30 via-[#FDFBF7]/70 to-[#FDFBF7]"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 md:px-12 py-8 relative z-10">
            <button onClick={() => setView('library')} className="mb-6 flex items-center text-stone-500 hover:text-stone-800 transition group">
                <ChevronRight className="rotate-180 h-4 w-4 mr-2" /> {t('back')}
            </button>

            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-stone-100">
                <div className="relative h-64 bg-stone-900 overflow-hidden">
                    <img src={fullManga.cover || IMAGES.defaultCover} className="w-full h-full object-cover opacity-40 blur-xl scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                </div>
                
                <div className="px-8 pb-8 md:flex relative -mt-32">
                    <div className="md:w-64 flex-shrink-0 relative z-10 mx-auto md:mx-0">
                        <img src={fullManga.cover || IMAGES.defaultCover} className="w-64 h-96 object-cover rounded-xl shadow-2xl border-4 border-white" alt={fullManga.title} />
                        <div className="mt-4 flex space-x-2 justify-center">
                             <button 
                                onClick={() => toggleBookmark(fullManga.id)}
                                className={`flex-1 py-2 rounded-lg font-medium text-sm transition flex items-center justify-center ${isBookmarked ? 'bg-rose-100 text-rose-600' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                            >
                                <Bookmark size={18} className={`mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                                {isBookmarked ? t('bookmarked') : t('bookmark')}
                            </button>
                            <button className="p-2 bg-stone-100 rounded-lg text-stone-600 hover:text-red-500 hover:bg-red-50" onClick={() => handleReport(fullManga)} title={t('report')}>
                                <Flag size={18} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="md:ml-10 mt-6 md:mt-32 flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-4xl font-serif font-bold text-stone-900 mb-1">{fullManga.title}</h1>
                                <p className="text-lg text-emerald-700 font-medium mb-4">{fullManga.author}</p>
                            </div>
                            <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                                <Star className="text-yellow-500 fill-current h-5 w-5 mr-1" />
                                <span className="font-bold text-yellow-700 text-lg">{fullManga.rating}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {fullManga.tags.map(t => <span key={t} className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-bold uppercase tracking-wide">{t}</span>)}
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold uppercase tracking-wide">{fullManga.language}</span>
                        </div>

                        <p className="text-stone-600 leading-relaxed mb-10 text-lg">{fullManga.description}</p>

                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-stone-800 flex items-center"><BookOpen className="mr-2 h-5 w-5" /> {t('chapters')}</h3>
                                <div className="space-y-2 bg-stone-50 p-4 rounded-xl max-h-[400px] overflow-y-auto">
                                    {loading ? <Loader className="animate-spin mx-auto text-stone-300" /> : fullManga.chapters?.map((chapter) => (
                                        <div key={chapter.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-stone-100 hover:border-emerald-300 transition group">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded bg-stone-100 flex items-center justify-center text-stone-400 mr-3 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition">
                                                    <span className="font-bold text-xs">PDF</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-stone-800 truncate">{chapter.title}</p>
                                                    <p className="text-xs text-stone-400">{chapter.pages} {t('pages')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button 
                                                    onClick={() => startReading(fullManga, chapter)}
                                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-emerald-200 shadow-md hover:bg-emerald-700 hover:shadow-lg transition"
                                                >
                                                    {t('read')}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!fullManga.chapters || fullManga.chapters.length === 0) && !loading && <div className="text-center py-8 text-stone-400">{t('noChapters')}</div>}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-stone-800 flex items-center mb-4"><MessageSquare className="mr-2 h-5 w-5" /> {t('comments')}</h3>
                                {user && (
                                    <div className="mb-6 bg-stone-50 p-4 rounded-xl">
                                        <textarea 
                                            className="w-full border border-stone-200 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white resize-none" 
                                            rows={3} 
                                            placeholder={t('addComment')}
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                        ></textarea>
                                        <div className="flex justify-end mt-2">
                                            <button 
                                                onClick={handleAddComment}
                                                className="px-4 py-2 bg-stone-800 text-white text-xs font-bold rounded-lg hover:bg-stone-900 transition"
                                            >
                                                Post
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {fullManga.comments?.map(c => (
                                        <div key={c.id} className="flex space-x-3 p-3 rounded-lg hover:bg-stone-50 transition">
                                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex-shrink-0 flex items-center justify-center text-emerald-700 text-xs font-bold">{c.userName[0]}</div>
                                            <div>
                                                <div className="flex items-baseline">
                                                    <p className="text-sm font-bold text-stone-800 mr-2">{c.userName}</p>
                                                    <span className="text-stone-400 text-[10px]">{new Date(c.date).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-stone-600 text-sm mt-1">{c.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
};

export default MangaDetailView;
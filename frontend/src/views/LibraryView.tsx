import { useEffect, useState } from 'react';
import { Search, Star, BarChart2, Loader } from 'lucide-react';
import apiCall from '../utils/apiCall';
import Manga from '../interfaces/Manga';
import Language from '../interfaces/Language';
import IMAGES from '../utils/Images';
import TRANSLATIONS from '../utils/Translation';

const LibraryView = ({ setView, setSelectedManga, showToast, lang }: any) => {
    const [mangaList, setMangaList] = useState<Manga[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular');
    const [loading, setLoading] = useState(false);
    const t = (key: keyof typeof TRANSLATIONS['ua']) => TRANSLATIONS[lang as Language][key];

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if(searchQuery) params.append('search', searchQuery);
        if(selectedTag) params.append('tag', selectedTag);
        params.append('sort', sortBy);

        apiCall(`/manga?${params.toString()}`)
            .then(data => setMangaList(data))
            .catch(() => showToast('Failed to load manga', 'error'))
            .finally(() => setLoading(false));
    }, [searchQuery, selectedTag, sortBy]);

    const allTags = Array.from(new Set(mangaList.flatMap(m => m.tags)));

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans relative">
            <div className="absolute inset-0 z-0 h-[60vh] w-full overflow-hidden pointer-events-none">
                <img src={IMAGES.libraryBg} className="w-full h-full object-cover opacity-40" alt="Library Background" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7]/20 via-[#FDFBF7]/60 to-[#FDFBF7]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 pt-28 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 pb-6 border-b border-stone-200/50 gap-6">
                    <div className="w-full md:w-auto">
                        <h2 className="text-4xl font-serif text-stone-900 mb-2">{t('library')}</h2>
                        <p className="text-stone-600 font-medium">{t('exploreCatalog')}</p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                         <div className="relative">
                            <Search className="absolute left-4 top-3 text-stone-400 h-5 w-5" />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('searchPlaceholder')} 
                                className="pl-12 pr-6 py-2.5 w-full md:w-80 border border-stone-200 bg-white/80 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm" 
                            />
                        </div>
                        
                        <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-stone-200 rounded-xl px-3">
                             <span className="text-xs font-bold text-stone-400 uppercase mr-2">{t('sortBy')}</span>
                             <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="bg-transparent border-none text-sm font-bold text-stone-800 focus:ring-0 cursor-pointer py-2.5 outline-none"
                             >
                                 <option value="popular">{t('popular')}</option>
                                 <option value="rating">{t('rating')}</option>
                                 <option value="newest">{t('newest')}</option>
                             </select>
                        </div>
                    </div>
                </div>

                <div className="mb-10 flex flex-wrap gap-2">
                    <button 
                        onClick={() => setSelectedTag(null)}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold border transition shadow-sm ${!selectedTag ? 'bg-stone-800 text-white border-stone-800' : 'bg-white/80 backdrop-blur-sm text-stone-600 border-stone-200 hover:border-stone-400 hover:bg-white'}`}
                    >
                        All
                    </button>
                    {allTags.map(tag => (
                        <button 
                            key={tag}
                            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition shadow-sm ${selectedTag === tag ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white/80 backdrop-blur-sm text-stone-600 border-stone-200 hover:border-stone-400 hover:bg-white'}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader className="animate-spin text-stone-400" /></div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {mangaList.map(manga => (
                        <div key={manga.id} onClick={() => { setSelectedManga(manga); setView('details'); }} className="group flex flex-col cursor-pointer bg-white/50 backdrop-blur-sm p-3 rounded-2xl hover:bg-white transition-all duration-300 shadow-sm hover:shadow-xl border border-transparent hover:border-stone-100">
                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300 mb-4 bg-stone-200">
                                <img src={manga.cover || IMAGES.defaultCover} alt={manga.title} className="w-full h-full object-cover transition transform group-hover:scale-105" />
                                <div className="absolute top-2 right-2 flex space-x-1">
                                    <div className="bg-black/70 backdrop-blur-md text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                        {manga.language}
                                    </div>
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-stone-800 truncate text-lg group-hover:text-emerald-700 transition px-1">{manga.title}</h3>
                            <p className="text-sm text-stone-500 px-1">{manga.author}</p>
                            <div className="flex items-center justify-between mt-2 px-1">
                                <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100">
                                    <Star size={12} className="text-yellow-500 fill-current" />
                                    <span className="text-xs font-bold text-yellow-700">{manga.rating}</span>
                                </div>
                                <div className="text-[10px] text-stone-400 flex items-center">
                                    <BarChart2 size={10} className="mr-1" /> {manga.views.toLocaleString()}
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LibraryView;
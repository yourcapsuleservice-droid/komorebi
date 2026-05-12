import { X, Bookmark, Settings } from 'lucide-react';

const ReaderView = ({ readingChapter, setView, toggleBookmark, user }: any) => {
    if (!readingChapter) return null;
    const { manga, chapter, url } = readingChapter;
    const isBookmarked = user?.bookmarks?.includes(manga.id);

    return (
        <div className="fixed inset-0 bg-[#1a1a1a] z-[100] flex flex-col text-stone-300 animate-fade-in">
            <div className="h-14 bg-black/90 flex items-center justify-between px-6 border-b border-stone-800 shadow-xl">
                <div className="flex items-center">
                    <button onClick={() => setView('details')} className="mr-4 text-stone-400 hover:text-white transition transform hover:rotate-90"><X /></button>
                    <div>
                        <h1 className="text-sm font-bold text-white tracking-wide">{manga.title}</h1>
                        <p className="text-[10px] text-emerald-500 font-mono uppercase">CH: {chapter.title}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                     <button onClick={() => toggleBookmark(manga.id)} className={`text-stone-400 hover:text-white transition ${isBookmarked ? 'text-rose-500' : ''}`}>
                         <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
                     </button>
                     <Settings className="h-5 w-5 cursor-pointer hover:text-white transition hover:spin-slow" />
                </div>
            </div>
            <iframe src={url} className="w-full h-full border-none bg-[#111]" title="Manga Reader"></iframe>
        </div>
    );
};

export default ReaderView;
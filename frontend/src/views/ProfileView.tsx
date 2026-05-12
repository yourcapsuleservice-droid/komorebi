import { useState, useEffect } from 'react';
import { BookOpen, FileText, Bookmark } from 'lucide-react';
import Manga from '../interfaces/Manga';
import getUserRank from '../utils/getUserRank';
import TRANSLATIONS from '../utils/Translation';
import Language from '../interfaces/Language';
import apiCall from '../utils/apiCall';
import IMAGES from '../utils/Images';

const ProfileView = ({ user, setUser, setView, setSelectedManga, showToast, lang }: any) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'bookmarks' | 'settings'>('overview');
    const [bookmarksList, setBookmarksList] = useState<Manga[]>([]);
    const rank = getUserRank(user.stats.mangaRead);
    const t = (key: keyof typeof TRANSLATIONS['ua']) => TRANSLATIONS[lang as Language][key];

    useEffect(() => {
        if(activeTab === 'bookmarks') {
            apiCall('/user/bookmarks').then(setBookmarksList);
        }
    }, [activeTab]);

    return (
      <div className="min-h-screen bg-[#FDFBF7] font-sans relative">
          <div className="absolute inset-0 z-0 h-[60vh] w-full overflow-hidden pointer-events-none">
             <img src={IMAGES.profileBg} className="w-full h-full object-cover opacity-40" alt="Profile Background" />
             <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7]/10 via-[#FDFBF7]/60 to-[#FDFBF7]"></div>
          </div>

          <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 pt-28 relative z-10">
              <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-stone-100 p-8 mb-8 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                   <div className="relative group">
                       <div className={`absolute -inset-1 bg-gradient-to-r ${rank.title.includes('Gold') ? 'from-yellow-400 to-yellow-200' : rank.title.includes('Silver') ? 'from-stone-300 to-stone-100' : 'from-orange-700 to-orange-400'} rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000`}></div>
                       <img src={user.avatar || IMAGES.defaultAvatar} className={`relative w-32 h-32 rounded-full object-cover border-4 ${rank.border} shadow-lg`} alt="Profile" />
                       <div className={`absolute -bottom-2 -right-2 ${rank.bg} ${rank.color} p-2 rounded-full border-4 border-white shadow`}>
                           {rank.icon}
                       </div>
                   </div>
                   <div className="flex-1 text-center md:text-left">
                       <h1 className="text-3xl font-serif font-bold text-stone-900 flex items-center justify-center md:justify-start gap-2">
                           {user.username}
                           <span className={`text-xs px-2 py-1 rounded-full border ${rank.border} ${rank.bg} ${rank.color} uppercase tracking-wider font-sans`}>{rank.title}</span>
                       </h1>
                       <p className="text-stone-500 mb-4">{user.email}</p>
                       <p className="text-stone-600 max-w-lg italic">"{user.bio || 'Just a manga enthusiast.'}"</p>
                       
                       <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                           <div className="flex items-center px-4 py-2 bg-stone-50/80 rounded-lg border border-stone-100">
                               <BookOpen size={18} className="text-emerald-500 mr-2" />
                               <span className="font-bold text-stone-800">{user.stats.mangaRead}</span>
                               <span className="text-stone-400 text-sm ml-1">Titles</span>
                           </div>
                           <div className="flex items-center px-4 py-2 bg-stone-50/80 rounded-lg border border-stone-100">
                               <FileText size={18} className="text-yellow-500 mr-2" />
                               <span className="font-bold text-stone-800">{user.stats.pagesRead}</span>
                               <span className="text-stone-400 text-sm ml-1">Pages</span>
                           </div>
                       </div>
                   </div>
              </div>

              <div className="flex space-x-6 border-b border-stone-200 mb-8 lowercase">
                  {['overview', 'bookmarks', 'settings'].map((tab) => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-4 text-sm font-bold tracking-wider transition ${activeTab === tab ? 'text-rose-500 border-b-2 border-rose-500' : 'text-stone-400 hover:text-stone-600'}`}
                      >
                          {tab === 'settings' ? t('settings') : (tab === 'overview' ? t('achievements') : t('bookmark'))}
                      </button>
                  ))}
              </div>

              <div>
                  {activeTab === 'overview' && (
                      <div className="grid md:grid-cols-1 gap-8">
                          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-stone-100">
                              <h3 className="text-lg font-bold font-serif mb-6">{t('achievements')}</h3>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className={`p-4 rounded-xl border-2 flex flex-col items-center text-center ${rank.bg} ${rank.border}`}>
                                      <div className="mb-2">{rank.icon}</div>
                                      <p className={`font-bold ${rank.color}`}>{rank.title}</p>
                                      <p className="text-xs text-stone-500 mt-1">{t('currentRank')}</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {activeTab === 'bookmarks' && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {bookmarksList.map(manga => (
                              <div key={manga.id} onClick={() => { setSelectedManga(manga); setView('details'); }} className="group cursor-pointer bg-white rounded-xl p-2 shadow-sm hover:shadow-md transition">
                                  <div className="aspect-[2/3] rounded-lg overflow-hidden mb-3 relative">
                                      <img src={manga.cover || IMAGES.defaultCover} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                      <div className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-md"><Bookmark size={12} fill="currentColor" /></div>
                                  </div>
                                  <h4 className="font-bold text-stone-800 truncate px-1">{manga.title}</h4>
                                  <p className="text-xs text-stone-500 px-1">{manga.author}</p>
                              </div>
                          ))}
                          {bookmarksList.length === 0 && (
                              <div className="col-span-full py-12 text-center text-stone-400">
                                  <Bookmark size={48} className="mx-auto mb-4 opacity-20" />
                                  <p>No bookmarks yet. Go explore!</p>
                              </div>
                          )}
                      </div>
                  )}

                  {activeTab === 'settings' && (
                      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-stone-100 max-w-2xl">
                          <h3 className="text-lg font-bold font-serif mb-6">{t('settings')}</h3>
                          <form className="space-y-4" onSubmit={async (e) => { 
                                e.preventDefault(); 
                                const form = e.target as HTMLFormElement;
                                const bio = (form.elements.namedItem('bio') as HTMLTextAreaElement).value;
                                await apiCall('/user/profile', 'PUT', { bio });
                                setUser({...user, bio});
                                showToast('Profile updated!', 'success');
                              }}>
                              <div>
                                  <label className="block text-sm font-bold text-stone-500 mb-1">{t('username')}</label>
                                  <input type="text" defaultValue={user.username} disabled className="w-full border border-stone-300 rounded p-2 text-sm bg-stone-100" />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-stone-500 mb-1">Bio</label>
                                  <textarea name="bio" defaultValue={user.bio} className="w-full border border-stone-300 rounded p-2 text-sm" rows={3} />
                              </div>
                              <button className="px-6 py-2 bg-stone-900 text-white rounded hover:bg-stone-800 transition">{t('save')}</button>
                          </form>
                      </div>
                  )}
              </div>
          </div>
      </div>
    );
};

export default ProfileView;
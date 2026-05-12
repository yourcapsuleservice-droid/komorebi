import React, { useEffect, useState } from 'react';
import { Users, BookOpen, AlertTriangle, FileText, CheckCircle, Plus, Trash2, Edit3, X, Upload, ImageIcon } from 'lucide-react';
import apiCall from '../utils/apiCall';
import Manga from '../interfaces/Manga';
import AdminStats from '../interfaces/AdminStats';
import Report from '../interfaces/Report';
import Language from '../interfaces/Language';
import StandardBarChart from '../components/StandardBarChart';
import SimplePieChart from '../components/SimplePieChart';
import IMAGES from '../utils/Images';
import TRANSLATIONS from '../utils/Translation';

const AdminView = ({ showToast, lang }: any) => {
    const [adminTab, setAdminTab] = useState<'dashboard' | 'manga' | 'reports'>('dashboard');
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [editingManga, setEditingManga] = useState<Manga | null>(null);
    const [allManga, setAllManga] = useState<Manga[]>([]);
    const [showChapterModal, setShowChapterModal] = useState(false);
    const t = (key: keyof typeof TRANSLATIONS['ua']) => TRANSLATIONS[lang as Language][key];

    useEffect(() => {
        if(adminTab === 'dashboard') {
            apiCall('/admin/stats').then(setStats);
        } else if (adminTab === 'reports') {
            apiCall('/admin/reports').then(setReports);
        } else if (adminTab === 'manga') {
            apiCall('/manga?sort=newest').then(setAllManga);
        }
    }, [adminTab]);

    const handleResolveReport = async (id: string) => {
        try {
            await apiCall(`/admin/reports/${id}/resolve`, 'POST');
            setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
            showToast('Report resolved', 'success');
        } catch(e) { showToast('Error resolving', 'error'); }
    };

    const handleCreateManga = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        if(!formData.get('language')) formData.append('language', 'en');

        try {
            await apiCall('/manga', 'POST', formData, true); 
            showToast('Series saved', 'success');
            setEditingManga(null);
            setAdminTab('manga'); // Stay on manga tab to see changes
            apiCall('/manga?sort=newest').then(setAllManga); // Refresh list
        } catch (e: any) {
            showToast(e.message, 'error');
        }
    };
    
    const handleChapterUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingManga || !editingManga.id) return;

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        try {
            await apiCall(`/manga/${editingManga.id}/chapters`, 'POST', formData, true);

            const chapters = await apiCall(`/manga/${editingManga.id}/chapters`);

            setEditingManga(prev =>
            prev ? { ...prev, chapters } : prev
            );

            showToast('Chapter uploaded', 'success');
            form.reset();
            setShowChapterModal(false);
        } catch (e: any) {
            showToast(e.message, 'error');
        }
    };


    const handleDeleteManga = async (id: string) => {
        if(!window.confirm('Delete this manga?')) return;
        try {
            await apiCall(`/manga/${id}`, 'DELETE');
            setAllManga(prev => prev.filter(m => m.id !== id));
            showToast('Manga deleted', 'success');
        } catch(e) { showToast('Error deleting', 'error'); }
    };

    return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans relative">
        <div className="absolute inset-0 z-0 h-[60vh] w-full overflow-hidden pointer-events-none">
             <img src={IMAGES.adminBg} className="w-full h-full object-cover opacity-20" alt="Admin Background" />
             <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7]/20 via-[#FDFBF7]/70 to-[#FDFBF7]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 pt-28 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                 <h2 className="text-3xl font-serif text-stone-800 border-l-4 border-emerald-500 pl-4">{t('adminPanel')}</h2>
                 <div className="flex space-x-2 bg-white/80 backdrop-blur-sm p-1 rounded-lg border border-stone-200 lowercase">
                     <button onClick={() => setAdminTab('dashboard')} className={`px-4 py-2 rounded-md transition text-sm font-bold ${adminTab === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-stone-500 hover:bg-stone-50'}`}>{t('dashboard')}</button>
                     <button onClick={() => setAdminTab('manga')} className={`px-4 py-2 rounded-md transition text-sm font-bold ${adminTab === 'manga' ? 'bg-emerald-600 text-white' : 'text-stone-500 hover:bg-stone-50'}`}>{t('mangaManagement')}</button>
                     <button onClick={() => setAdminTab('reports')} className={`px-4 py-2 rounded-md transition text-sm font-bold ${adminTab === 'reports' ? 'bg-emerald-600 text-white' : 'text-stone-500 hover:bg-stone-50'}`}>{t('reports')}</button>
                 </div>
            </div>
            
            {adminTab === 'dashboard' && stats && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t('totalUsers')}</p>
                                <p className="text-2xl font-bold text-stone-800 mt-1">{stats.totalUsers}</p>
                            </div>
                            <div className="p-3 bg-stone-100 rounded-full text-stone-500"><Users size={20} /></div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t('totalReads')}</p>
                                <p className="text-2xl font-bold text-stone-800 mt-1">{stats.totalReads}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full text-blue-600"><BookOpen size={20} /></div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t('pendingReports')}</p>
                                <p className="text-2xl font-bold text-rose-600 mt-1">{stats.pendingReports}</p>
                            </div>
                            <div className="p-3 bg-rose-100 rounded-full text-rose-600"><AlertTriangle size={20} /></div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t('librarySize')}</p>
                                <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.librarySize}</p>
                            </div>
                            <div className="p-3 bg-emerald-100 rounded-full text-emerald-600"><FileText size={20} /></div>
                        </div>
                    </div>

                    {/* Charts Row - ADDED BACK */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm p-8 rounded-xl border border-stone-200 shadow-sm">
                            <StandardBarChart 
                                title={t('weeklyActivity')}
                                data={stats.weeklyActivity || [10,20,30,5,10,30,60]} 
                                labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']} 
                            />
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-center">
                            <h4 className="text-sm font-bold text-stone-500 mb-6 uppercase tracking-wider">{t('genreDist')}</h4>
                            <SimplePieChart 
                                data={stats.genreDistribution || [1]} 
                                labels={['Fantasy', 'Action', 'SoL', 'Sci-Fi']}
                                colors={['#059669', '#e11d48', '#3b82f6', '#d97706']}
                            />
                        </div>
                    </div>
                </div>
            )}

            {adminTab === 'reports' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-stone-200 bg-stone-50/50">
                        <h3 className="font-bold text-lg text-stone-800">User Reports</h3>
                    </div>
                    <div className="divide-y divide-stone-100">
                        {reports.map(r => (
                            <div key={r.id} className="p-6 flex justify-between items-center hover:bg-stone-50 transition">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`w-2 h-2 rounded-full ${r.status === 'pending' ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                                        <span className="font-bold text-stone-800">{r.mangaTitle}</span>
                                        <span className="text-xs text-stone-400">ID: {r.mangaId}</span>
                                    </div>
                                    <p className="text-stone-600 mt-1">{r.reason}</p>
                                    <p className="text-xs text-stone-400 mt-2">By User {r.userId} • {new Date(r.date).toLocaleDateString()}</p>
                                </div>
                                {r.status === 'pending' && (
                                    <button onClick={() => handleResolveReport(r.id)} className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition text-sm font-bold flex items-center">
                                        <CheckCircle size={16} className="mr-2" /> {t('resolve')}
                                    </button>
                                )}
                            </div>
                        ))}
                        {reports.length === 0 && <div className="p-8 text-center text-stone-400">No reports found.</div>}
                    </div>
                </div>
            )}

            {adminTab === 'manga' && (
                <div className="space-y-6">
                    {!editingManga ? (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-stone-200 bg-stone-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-stone-800">{t('libraryCatalog')}</h3>
                                <button onClick={() => setEditingManga({} as Manga)} className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-lg hover:bg-emerald-800 transition"><Plus size={16} className="mr-2" /> {t('newSeries')}</button>
                            </div>
                            <div className="divide-y divide-stone-100">
                                {allManga.map(m => (
                                    <div key={m.id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition">
                                        <div className="flex items-center">
                                            <img src={m.cover || IMAGES.defaultCover} className="w-12 h-16 object-cover rounded shadow-sm mr-4" />
                                            <div>
                                                <p className="font-bold text-stone-800">{m.title}</p>
                                                <p className="text-xs text-stone-500">
                                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${m.status === 'ongoing' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                                                    {m.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={async () => {
                                                    const chapters = await apiCall(`/manga/${m.id}/chapters`);
                                                    setEditingManga({ ...m, chapters });
                                                }}
                                                className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-white hover:shadow-sm text-sm font-medium transition"
                                                >
                                                {t('edit')}
                                            </button>
                                            <button onClick={() => handleDeleteManga(m.id)} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // IMPROVED MANGA EDITOR (Original 2-column layout restored)
                        <div className="bg-white rounded-xl border border-stone-200 shadow-lg overflow-hidden animate-fade-in relative">
                            <div className="p-6 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
                                <h3 className="font-bold text-xl text-stone-800 flex items-center">
                                    <Edit3 className="mr-2" size={20} />
                                    {editingManga.id ? `${t('editing')}: ${editingManga.title}` : t('createSeries')}
                                </h3>
                                <button onClick={() => setEditingManga(null)} className="text-stone-400 hover:text-stone-800 transition"><X /></button>
                            </div>
                            
                            <div className="p-8">
                                <form onSubmit={handleCreateManga} className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Left Column: Cover & Status */}
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">{t('coverImage')}</label>
                                                <div className="aspect-[2/3] bg-stone-100 rounded-lg border-2 border-dashed border-stone-300 flex flex-col items-center justify-center relative overflow-hidden group hover:border-emerald-400 transition cursor-pointer">
                                                    {editingManga.cover ? (
                                                        <img src={editingManga.cover} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-center p-4">
                                                            <ImageIcon className="mx-auto text-stone-300 mb-2" size={32} />
                                                            <span className="text-xs text-stone-400">{t('pasteUrl')}</span>
                                                        </div>
                                                    )}
                                                    <input type="file" name="cover" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">{t('status')}</label>
                                                <select name="status" defaultValue={editingManga.status || 'ongoing'} className="w-full border border-stone-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none">
                                                    <option value="ongoing">🟢 {t('ongoing')}</option>
                                                    <option value="completed">🔵 {t('completed')}</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Middle & Right Column: Details */}
                                        <div className="lg:col-span-2 space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">{t('title')}</label>
                                                    <input name="title" defaultValue={editingManga.title} required className="w-full border border-stone-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. The Forest Spirit" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">{t('author')}</label>
                                                    <input name="author" defaultValue={editingManga.author} required className="w-full border border-stone-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Hiroshi T." />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">{t('description')}</label>
                                                <textarea name="description" defaultValue={editingManga.description} rows={4} className="w-full border border-stone-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" placeholder="Synopsis..." />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">{t('tagsInput')}</label>
                                                <input name="tags" defaultValue={editingManga.tags?.join(', ')} className="w-full border border-stone-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Fantasy, Action, Drama" />
                                            </div>

                                            {/* Chapter List Area */}
                                            {editingManga.id && (
                                                <div className="pt-6 border-t border-stone-100">
                                                    <div className="flex justify-between items-end mb-4">
                                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">{t('chapterManagement')}</label>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setShowChapterModal(true)} 
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center transition shadow-sm"
                                                        >
                                                            <Upload size={14} className="mr-2" /> {t('uploadPDF')}
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="bg-stone-50 rounded-lg border border-stone-200 overflow-hidden">
                                                    {editingManga.chapters && editingManga.chapters.length > 0 ? (
                                                        editingManga.chapters.map((ch: any) => (
                                                        <div
                                                            key={ch.id}
                                                            className="flex justify-between items-center px-4 py-3 border-b border-stone-200 last:border-b-0"
                                                        >
                                                            <div>
                                                            <p className="text-sm font-bold text-stone-700">{ch.title}</p>
                                                            <p className="text-xs text-stone-400">
                                                                {ch.pages} pages • {new Date(ch.uploadDate).toLocaleDateString()}
                                                            </p>
                                                            </div>

                                                            <button
                                                            onClick={async () => {
                                                                if (!window.confirm('Delete this chapter?')) return;

                                                                await apiCall(`/chapters/${ch.id}`, 'DELETE');

                                                                const chapters = await apiCall(
                                                                `/manga/${editingManga.id}/chapters`
                                                                );

                                                                setEditingManga(prev =>
                                                                prev ? { ...prev, chapters } : prev
                                                                );

                                                                showToast('Chapter deleted', 'success');
                                                            }}
                                                            className="text-rose-600 hover:text-rose-800 text-xs font-bold"
                                                            >
                                                            Delete
                                                            </button>
                                                        </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-4 text-center text-stone-400 text-xs italic">
                                                        No chapters yet
                                                        </div>
                                                    )}
                                                    </div>

                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-4 pt-6 border-t border-stone-200">
                                        <button type="button" onClick={() => setEditingManga(null)} className="px-6 py-3 text-stone-600 font-bold hover:bg-stone-100 rounded-lg transition">{t('cancel')}</button>
                                        <button type="submit" className="px-8 py-3 bg-stone-900 text-white rounded-lg font-bold hover:bg-emerald-800 transition shadow-lg">{t('save')}</button>
                                    </div>
                                </form>
                            </div>

                            {/* CHAPTER UPLOAD MODAL OVERLAY */}
                            {showChapterModal && (
                                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-stone-200 animate-fade-in-up">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="font-bold text-lg text-stone-800">{t('uploadChapter')}</h3>
                                            <button onClick={() => setShowChapterModal(false)} className="text-stone-400 hover:text-stone-800"><X /></button>
                                        </div>
                                        <form onSubmit={handleChapterUpload} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">{t('chapterTitle')}</label>
                                                <input name="title" required className="w-full border border-stone-300 p-3 rounded-lg text-sm" placeholder="Chapter 1: The Beginning" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">{t('pages')}</label>
                                                <input name="pages" type="number" defaultValue={20} className="w-full border border-stone-300 p-3 rounded-lg text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">PDF File</label>
                                                <input name="file" type="file" required accept="application/pdf" className="w-full text-sm border border-stone-300 p-2 rounded-lg" />
                                            </div>
                                            <div className="pt-4 flex space-x-3">
                                                <button type="button" onClick={() => setShowChapterModal(false)} className="flex-1 py-3 rounded-lg border border-stone-200 font-bold text-stone-600 hover:bg-stone-50">{t('cancel')}</button>
                                                <button className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-lg">{t('uploadChapter')}</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
    );
};

export default AdminView;
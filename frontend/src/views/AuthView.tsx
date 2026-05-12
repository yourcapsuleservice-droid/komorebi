import { useState } from 'react';
import { ArrowRight, Loader } from 'lucide-react';
import apiCall from '../utils/apiCall';
import Language from '../interfaces/Language';
import TRANSLATIONS from '../utils/Translation';
import IMAGES from '../utils/Images';

const AuthView = ({ mode, setView, setUser, showToast, lang }: any) => {
    const t = (key: keyof typeof TRANSLATIONS['ua']) => TRANSLATIONS[lang as Language][key];
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        const form = e.target as HTMLFormElement;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        try {
            const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
            const data = await apiCall(endpoint, 'POST', { email, password });
            
            if (mode === 'login') {
                localStorage.setItem('token', data.token);
                setUser({ ...data.user, bookmarks: [] });
                // Async fetch bookmarks
                apiCall('/user/bookmarks').then(bookmarks => {
                   setUser((prev: any) => prev ? { ...prev, bookmarks: bookmarks.map((b: any) => b.id) } : null);
                });
                showToast(`${t('welcome')}, ${data.user.username}!`, 'success');
                if(data.user.role === 'admin') setView('admin');
                else setView('library');
            } else {
                showToast('Registration successful! Please login.', 'success');
                setView('login');
            }
        } catch (e: any) {
            showToast(e.message, 'error');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 relative overflow-hidden">
       <div className="absolute inset-0 z-0">
          <img src={IMAGES.loginBg} className="w-full h-full object-cover opacity-20" alt="Auth BG" />
       </div>
      
      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white relative z-10 animate-fade-in-up">
        <div className="text-center mb-10">
           <h2 className="text-4xl font-serif font-bold text-stone-800 mb-2">{mode === 'login' ? t('login') : t('register')}</h2>
           <p className="text-stone-500">Enter the world of Komorebi</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">{t('email')}</label>
            <input name="email" type="email" required className="w-full px-5 py-4 rounded-xl bg-stone-50 border-2 border-transparent focus:border-rose-200 focus:bg-white focus:ring-0 outline-none transition font-medium" placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">{t('password')}</label>
            <input name="password" type="password" required className="w-full px-5 py-4 rounded-xl bg-stone-50 border-2 border-transparent focus:border-rose-200 focus:bg-white focus:ring-0 outline-none transition font-medium" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={isLoggingIn} className="w-full bg-stone-900 text-white py-4 rounded-xl hover:bg-rose-600 transition duration-300 font-bold shadow-lg flex justify-center items-center group disabled:opacity-70 disabled:cursor-not-allowed">
            {isLoggingIn ? (
                <>
                    <Loader className="animate-spin mr-2" size={18} /> {t('loggingIn')}
                </>
            ) : (
                <>
                    {mode === 'login' ? t('login') : t('register')} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center">
            <button onClick={() => setView(mode === 'login' ? 'register' : 'login')} className="text-stone-500 hover:text-rose-600 text-sm font-medium transition">
                {mode === 'login' ? 'New here? Create account' : 'Already have an account? Login'}
            </button>
        </div>
      </div>
    </div>
    );
};

export default AuthView;
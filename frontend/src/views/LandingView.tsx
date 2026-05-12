import { Flower, Leaf, ArrowRight } from 'lucide-react';
import Language from '../interfaces/Language';
import IMAGES from '../utils/Images';
import TRANSLATIONS from '../utils/Translation';
import SakuraEffect from '../components/SakuraEffect';

const LandingView = ({ setView, lang }: { setView: any, lang: Language }) => {
    const t = (key: keyof typeof TRANSLATIONS['ua']) => TRANSLATIONS[lang][key];
    return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans">
      <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
             <img src={IMAGES.landingHero} className="w-full h-full object-cover opacity-90" alt="Hero Background" />
             <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-[#FDFBF7]"></div>
             <SakuraEffect />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
             <div className="inline-block animate-float">
                <Flower className="text-rose-500 w-16 h-16 mx-auto mb-6 drop-shadow-lg" />
             </div>
             
             <h1 className="text-7xl md:text-9xl font-serif text-stone-900 mb-6 drop-shadow-sm tracking-tight leading-none">
                 {lang === 'jp' ? '木漏れ日' : 'Komorebi'}
             </h1>
             
             <p className="text-2xl md:text-3xl font-serif text-stone-700 italic mb-12 max-w-2xl mx-auto leading-relaxed text-shadow-sm">
                 "{t('heroSubtitle')}"
             </p>
             
             <div className="flex flex-col sm:flex-row justify-center gap-6">
                 <button 
                    onClick={() => setView('register')} 
                    className="px-10 py-5 bg-stone-900 text-[#FDFBF7] rounded-full text-lg font-bold hover:bg-rose-900 transition-all duration-300 transform hover:-translate-y-1 shadow-2xl flex items-center justify-center group"
                 >
                   {t('startReading')} <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                 </button>
             </div>
        </div>
      </div>

      <div className="py-32 bg-[#FDFBF7] relative overflow-hidden">
           <div className="absolute -left-20 top-20 text-[20rem] text-stone-100 font-serif opacity-50 select-none z-0">
               光
           </div>
           <div className="max-w-6xl mx-auto px-6 relative z-10">
               <div className="grid md:grid-cols-2 gap-16 items-center">
                   <div className="order-2 md:order-1 relative">
                       <div className="absolute inset-0 bg-rose-200 transform rotate-6 rounded-2xl z-0"></div>
                       <img 
                            src={IMAGES.detailBg} 
                            className="relative z-10 rounded-2xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000 object-cover h-96 w-full"
                            alt="Philosophy"
                       />
                   </div>
                   <div className="order-1 md:order-2 space-y-6">
                       <h2 className="text-4xl md:text-5xl font-serif text-stone-800">{t('philosophyTitle')}</h2>
                       <div className="w-20 h-1 bg-rose-400"></div>
                       <p className="text-xl text-stone-600 leading-loose font-light">
                           {t('philosophyText1')}
                       </p>
                       <p className="text-lg text-stone-500 leading-relaxed">
                           {t('philosophyText2')}
                       </p>
                   </div>
               </div>
           </div>
      </div>
      
      <div className="py-32 bg-[#ffffff] text-center relative overflow-hidden">
         <div className="relative z-10 max-w-2xl mx-auto px-4">
             <Leaf className="w-12 h-12 text-emerald-600 mx-auto mb-6" />
             <h2 className="text-5xl font-serif font-bold text-stone-900 mb-8">{t('beginJourney')}</h2>
             <p className="text-xl text-stone-600 mb-10">{t('joinThousands')}</p>
             <button onClick={() => setView('register')} className="px-12 py-5 bg-stone-900 text-white rounded-full shadow-2xl hover:bg-emerald-800 transition text-lg font-bold">{t('createFreeAccount')}</button>
         </div>
      </div>
    </div>
    );
};

export default LandingView;
import { Leaf, AlertTriangle, Wind } from 'lucide-react';
import Toast from '../interfaces/Toast';

const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: number) => void }) => (
  <div className="fixed bottom-5 right-5 z-[100] flex flex-col space-y-3 pointer-events-none">
    {toasts.map(toast => (
      <div 
        key={toast.id} 
        className={`
          pointer-events-auto px-6 py-4 rounded-xl shadow-2xl text-white transform transition-all duration-300 animate-slide-in flex items-center space-x-3 backdrop-blur-md border border-white/10
          ${toast.type === 'success' ? 'bg-emerald-800/90' : toast.type === 'error' ? 'bg-rose-800/90' : 'bg-stone-800/90'}
        `}
        onClick={() => removeToast(toast.id)}
      >
        {toast.type === 'success' && <Leaf size={20} className="text-emerald-300" />}
        {toast.type === 'error' && <AlertTriangle size={20} className="text-rose-300" />}
        {toast.type === 'info' && <Wind size={20} className="text-blue-300" />}
        <span className="font-medium text-sm tracking-wide">{toast.message}</span>
      </div>
    ))}
  </div>
);

export default ToastContainer;
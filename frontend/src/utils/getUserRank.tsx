import { Crown, Medal, Award } from 'lucide-react';

const getUserRank = (mangaRead: number) => {
    if (mangaRead >= 50) return { title: 'Kin (Gold)', color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200', icon: <Crown size={20} className="text-yellow-600" /> };
    if (mangaRead >= 20) return { title: 'Gin (Silver)', color: 'text-stone-500', bg: 'bg-stone-200', border: 'border-stone-300', icon: <Medal size={20} className="text-stone-500" /> };
    return { title: 'Seidō (Bronze)', color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200', icon: <Award size={20} className="text-orange-700" /> };
};

export default getUserRank;
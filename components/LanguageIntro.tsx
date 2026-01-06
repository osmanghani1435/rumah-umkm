import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe, ArrowRight, Sparkles, Languages } from 'lucide-react';

interface LanguageIntroProps {
  onComplete: () => void;
}

export const LanguageIntro: React.FC<LanguageIntroProps> = ({ onComplete }) => {
  const { setLanguage } = useLanguage();
  const [hovered, setHovered] = useState<'en' | 'id' | null>(null);

  const handleSelect = (lang: 'en' | 'id') => {
    setLanguage(lang);
    onComplete();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden text-white font-sans selection:bg-cyan-500/30">
        
        {/* Cinematic Background Ambience */}
        <div className="absolute inset-0 bg-cyber-grid bg-grid-pattern opacity-10 animate-pulse-slow pointer-events-none"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen opacity-30 animate-pulse-slow pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-teal-500/10 rounded-full blur-[120px] mix-blend-screen opacity-20 pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-5xl p-6 flex flex-col items-center">
            
            <div className="mb-16 text-center space-y-6 animate-slide-up">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/30 border border-cyan-500/20 text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <Sparkles size={12} />
                    <span>System Initialization</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-white drop-shadow-2xl">
                    Rumah <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400">UMKM</span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
                    Select your interface language to begin.
                    <br/>
                    <span className="text-slate-500 text-base italic mt-2 block">Pilih bahasa antarmuka Anda untuk memulai.</span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl animate-fade-in delay-100 px-4">
                
                {/* English Option */}
                <button
                    onClick={() => handleSelect('en')}
                    onMouseEnter={() => setHovered('en')}
                    onMouseLeave={() => setHovered(null)}
                    className="group relative h-72 rounded-[2rem] border border-white/5 bg-[#0B0F19]/60 backdrop-blur-xl p-8 flex flex-col justify-between hover:border-cyan-500/50 hover:bg-[#0B0F19]/80 transition-all duration-500 text-left overflow-hidden shadow-2xl hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] hover:-translate-y-1"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${hovered === 'en' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)] rotate-12 scale-110' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                             <Globe size={28} strokeWidth={1.5} />
                         </div>
                         <h3 className="text-3xl font-display font-bold text-white mb-2">English</h3>
                         <p className="text-slate-400 font-medium text-sm tracking-wide">International Interface</p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between mt-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-cyan-400 transition-colors">Select Region</span>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${hovered === 'en' ? 'bg-cyan-500 text-black border-cyan-500 translate-x-0' : 'bg-transparent text-slate-500 border-white/10'}`}>
                            <ArrowRight size={18} />
                        </div>
                    </div>
                </button>

                {/* Indonesian Option */}
                <button
                    onClick={() => handleSelect('id')}
                    onMouseEnter={() => setHovered('id')}
                    onMouseLeave={() => setHovered(null)}
                    className="group relative h-72 rounded-[2rem] border border-white/5 bg-[#0B0F19]/60 backdrop-blur-xl p-8 flex flex-col justify-between hover:border-emerald-500/50 hover:bg-[#0B0F19]/80 transition-all duration-500 text-left overflow-hidden shadow-2xl hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:-translate-y-1"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${hovered === 'id' ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)] -rotate-12 scale-110' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                             <span className="font-display font-bold text-lg">ID</span>
                         </div>
                         <h3 className="text-3xl font-display font-bold text-white mb-2">Indonesia</h3>
                         <p className="text-slate-400 font-medium text-sm tracking-wide">Bahasa Indonesia</p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between mt-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-emerald-400 transition-colors">Pilih Wilayah</span>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${hovered === 'id' ? 'bg-emerald-500 text-black border-emerald-500 translate-x-0' : 'bg-transparent text-slate-500 border-white/10'}`}>
                            <ArrowRight size={18} />
                        </div>
                    </div>
                </button>

            </div>
            
            <div className="mt-16 flex items-center gap-2 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 hover:opacity-100 transition-opacity">
                <Languages size={12} />
                <span>Language settings can be changed later</span>
            </div>
        </div>
    </div>
  );
};
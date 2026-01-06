
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { User, Code, Instagram, Heart, Cpu, Globe } from 'lucide-react';

export const DeveloperSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0B0F19] p-8 md:p-12 shadow-xl border border-slate-200 dark:border-white/5">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-indigo-500/20 to-purple-500/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
            <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-slate-900 dark:text-white">
                    {t('dev.title')}
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 font-light">
                    {t('dev.subtitle')}
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Developer Card */}
            <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-transparent shadow-sm hover:shadow-glow transition-all duration-500 group">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                        <User size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('dev.aboutDev')}</h3>
                        <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">{t('dev.name')}</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <a 
                        href="https://www.instagram.com/ziddi.heart.143" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:border-pink-200 dark:hover:border-pink-500/30 transition-all cursor-pointer group/insta"
                    >
                        <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 group-hover/insta:scale-110 transition-transform">
                            <Instagram size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('dev.contact')}</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover/insta:text-pink-600 dark:group-hover/insta:text-pink-400 transition-colors">@ziddi.heart.143</p>
                        </div>
                    </a>
                    
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                            <Code size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Full Stack Engineer & AI Specialist</p>
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 text-center">
                    <p className="text-xs font-medium text-slate-400 italic">"Building the future with intelligent code."</p>
                </div>
            </div>

            {/* App Info Card */}
            <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-transparent shadow-sm hover:shadow-glow transition-all duration-500">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                        <Cpu size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('dev.aboutApp')}</h3>
                        <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">Rumah UMKM AI Pro Suite</p>
                    </div>
                </div>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    {t('dev.desc')}
                </p>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span>Google Gemini 2.5 Flash Integration</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span>Real-time Market Search Grounding</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span>5-Layer Agentic Reasoning Engine</span>
                    </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                     <span>v2.5.0 Stable</span>
                     <span className="flex items-center gap-1">Made with <Heart size={10} className="text-red-500 fill-red-500" /> by Osman Ghani</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { generateCurriculum, generateLessonContent } from '../services/geminiService';
import { CourseModule } from '../types';
import { saveActivity } from '../services/firestoreService';
import { BookOpen, Clock, Lightbulb, PlayCircle, Loader2, ArrowRight, Briefcase, Award, ChevronLeft, CheckCircle2, Star, Zap, X, Download, Square, GraduationCap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import html2canvas from 'html2canvas';

// Same helper as other files
const parseFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const content = part.slice(2, -2);
            return <strong key={index} className="text-cyan-400 font-bold">{content}</strong>;
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
};

const FormattedLessonText = ({ text }: { text: string }) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
        <div className="space-y-6 text-slate-300 leading-relaxed text-lg font-light tracking-wide w-full">
            {lines.map((line, i) => {
                const trimmed = line.trim();
                if (trimmed.startsWith('### ')) {
                    return <h3 key={i} className="text-2xl font-display font-bold text-white mt-8 mb-4 border-l-4 border-cyan-500 pl-4">{parseFormatting(trimmed.substring(4))}</h3>;
                }
                if (trimmed.startsWith('## ')) {
                    return <h2 key={i} className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400 mt-12 mb-6">{parseFormatting(trimmed.substring(3))}</h2>;
                }
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    return (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-colors">
                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                            <span className="font-medium text-slate-200">{parseFormatting(trimmed.substring(2))}</span>
                        </div>
                    );
                }
                if (trimmed.match(/^\d+\./)) {
                     const dotIndex = trimmed.indexOf('.');
                     return (
                         <div key={i} className="flex items-start gap-4 ml-1 my-3 group w-full">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 font-bold font-mono text-sm shrink-0 border border-cyan-500/30">{trimmed.split('.')[0]}</span>
                            <span className="py-1 text-slate-200 font-medium">{parseFormatting(trimmed.substring(dotIndex + 1))}</span>
                        </div>
                    );
                }
                if (trimmed === '') return <div key={i} className="h-4"></div>;
                return <p key={i}>{parseFormatting(line)}</p>;
            })}
        </div>
    );
};

export const EducationHub: React.FC = () => {
  const { t, language } = useLanguage();
  const [businessType, setBusinessType] = useState('');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [curriculum, setCurriculum] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeModule, setActiveModule] = useState<CourseModule | null>(null);
  const [lessonContent, setLessonContent] = useState<string>('');
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const lessonRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessType) return;
    setLoading(true);
    setCurriculum([]);
    const modules = await generateCurriculum(businessType, skillLevel, language);
    setCurriculum(modules);
    setLoading(false);
    if (modules.length > 0) await saveActivity('EDUCATION', `Curriculum: ${businessType}`, `${businessType} - ${skillLevel}`, modules);
  };

  const startLesson = async (module: CourseModule) => {
      setActiveModule(module);
      setLoadingLesson(true);
      setLessonContent('');
      const content = await generateLessonContent(module.moduleTitle, businessType, language);
      setLessonContent(content);
      setLoadingLesson(false);
  };

  const handleDownloadLesson = async () => {
      if (!lessonRef.current) return;
      setDownloading(true);
      try {
          const canvas = await html2canvas(lessonRef.current, { scale: 2, useCORS: true, backgroundColor: '#020617' });
          const link = document.createElement('a'); link.href = canvas.toDataURL('image/png'); link.download = `Lesson_${Date.now()}.png`; link.click();
      } catch (err) { console.error(err); } finally { setDownloading(false); }
  };

  if (activeModule) {
      return (
          <div className="h-full w-full flex flex-col bg-[#020617] relative z-20 overflow-hidden">
               {/* Lesson Header */}
               <div className="h-16 border-b border-white/10 bg-[#0B0F19]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20">
                   <div className="flex items-center gap-4">
                        <button onClick={() => { setActiveModule(null); setLessonContent(''); }} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-500 mb-0.5">Active Module</p>
                             <h3 className="font-bold text-white text-sm truncate max-w-[200px]">{activeModule.moduleTitle}</h3>
                        </div>
                   </div>
                   <div className="flex items-center gap-3">
                       <span className="flex items-center gap-1.5 text-xs font-bold font-mono text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                           <Clock size={12} /> {activeModule.duration}
                       </span>
                       <button onClick={handleDownloadLesson} disabled={downloading || loadingLesson} className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
                           {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                       </button>
                   </div>
               </div>

               {/* Lesson Content */}
               <div ref={lessonRef} className="flex-1 overflow-y-auto custom-scrollbar bg-[#020617] relative">
                   {/* Cinematic Header */}
                   <div className="relative h-64 w-full flex items-end p-8 md:p-12 overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent z-10"></div>
                       <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale mix-blend-screen"></div>
                       <div className="relative z-20 max-w-4xl animate-slide-up">
                           <span className="inline-block px-3 py-1 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-4 backdrop-blur-sm">Interactive Learning</span>
                           <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">{activeModule.moduleTitle}</h1>
                           <p className="text-slate-400 max-w-2xl text-lg font-light">{activeModule.description}</p>
                       </div>
                   </div>

                   <div className="p-8 md:p-12 w-full max-w-5xl mx-auto">
                      {loadingLesson ? (
                          <div className="flex flex-col items-center justify-center py-20 space-y-6">
                              <div className="relative">
                                  <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin"></div>
                                  <div className="absolute inset-0 flex items-center justify-center"><Zap size={20} className="text-cyan-400 animate-pulse" /></div>
                              </div>
                              <p className="font-mono text-cyan-500/60 animate-pulse text-sm">DOWNLOADING_NEURAL_PACKET...</p>
                          </div>
                      ) : (
                          <div className="animate-fade-in">
                               <FormattedLessonText text={lessonContent} />
                               <div className="mt-16 pt-8 border-t border-white/10 flex justify-end">
                                   <button onClick={() => { setActiveModule(null); setLessonContent(''); }} className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-black font-bold rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all transform hover:scale-105 active:scale-95">
                                       <CheckCircle2 size={20} /> {t('edu.complete')}
                                   </button>
                               </div>
                          </div>
                      )}
                   </div>
               </div>
          </div>
      );
  }

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar p-4 md:p-6">
      <div className="space-y-10 animate-fade-in pb-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="relative overflow-hidden rounded-[32px] bg-[#0B0F19] p-8 md:p-12 border border-white/10 shadow-2xl">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-500/10 to-purple-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-30"></div>
            
            <div className="relative z-10 w-full max-w-3xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-cyan-400"><GraduationCap size={24} /></div>
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Education Module</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 text-white leading-tight">
                    {t('edu.title').split('.')[0]}<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">{t('edu.title').split('.')[1] || 'Market Niche.'}</span>
                </h2>
                
                <form onSubmit={handleGenerate} className="flex flex-col xl:flex-row gap-4 p-2 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm mt-8">
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                            <Briefcase size={20} />
                        </div>
                        <input
                            type="text"
                            value={businessType}
                            onChange={(e) => setBusinessType(e.target.value)}
                            placeholder={t('edu.placeholder')}
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-transparent text-white placeholder:text-slate-600 focus:outline-none focus:bg-white/5 transition-all font-medium"
                        />
                    </div>
                    <div className="w-full xl:w-64 relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                            <Award size={20} />
                        </div>
                        <select
                            value={skillLevel}
                            onChange={(e) => setSkillLevel(e.target.value)}
                            className="w-full pl-12 pr-10 py-4 rounded-xl bg-transparent text-white focus:outline-none focus:bg-white/5 border-l border-white/5 appearance-none cursor-pointer font-medium"
                        >
                            <option value="Beginner" className="bg-[#0B0F19]">Startup</option>
                            <option value="Intermediate" className="bg-[#0B0F19]">Growth</option>
                            <option value="Advanced" className="bg-[#0B0F19]">Enterprise</option>
                        </select>
                    </div>
                    <button
                        type={loading ? "button" : "submit"}
                        onClick={loading ? (e) => { e.preventDefault(); setLoading(false); } : undefined}
                        disabled={!loading && !businessType}
                        className={`
                            px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap
                            ${loading 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                                : 'bg-cyan-600 hover:bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                            }
                        `}
                    >
                        {loading ? <Square fill="currentColor" size={20} /> : <Zap size={20} fill="currentColor" />}
                        <span>{loading ? "STOP" : t('edu.btn.generate')}</span>
                    </button>
                </form>
            </div>
        </div>

        {/* Loading State */}
        {loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {[1,2,3].map(i => (
                    <div key={i} className="h-80 rounded-[24px] bg-white/5 border border-white/5 flex flex-col p-6">
                        <div className="w-12 h-12 rounded-full bg-white/10 mb-6"></div>
                        <div className="h-6 w-3/4 bg-white/10 rounded mb-4"></div>
                        <div className="h-4 w-full bg-white/5 rounded mb-2"></div>
                        <div className="h-4 w-2/3 bg-white/5 rounded"></div>
                    </div>
                ))}
            </div>
        )}

        {/* Modules Grid */}
        {!loading && curriculum.length > 0 && (
            <div className="space-y-6 animate-slide-up">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('edu.pathTitle')}</span>
                <div className="h-px flex-1 bg-white/10"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {curriculum.map((module, idx) => (
                  <div key={idx} className="group relative rounded-[24px] bg-[#131722]/50 border border-white/5 overflow-hidden hover:border-cyan-500/30 transition-all duration-500 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="p-8 relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                             <div className="text-5xl font-display font-bold text-white/5 group-hover:text-cyan-500/20 transition-colors">0{idx + 1}</div>
                             <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 border border-white/10 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                                <Clock size={12} /> {module.duration}
                             </div>
                        </div>
                        <h4 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-cyan-400 transition-colors">{module.moduleTitle}</h4>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">{module.description}</p>
                        
                        <button 
                            onClick={() => startLesson(module)}
                            className="w-full py-4 rounded-xl bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-widest text-slate-300 group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-500 transition-all flex items-center justify-center gap-2"
                        >
                            {t('edu.startModule')} <ArrowRight size={14} />
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        )}
      </div>
    </div>
  );
};
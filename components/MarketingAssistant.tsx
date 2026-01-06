import React, { useState, useRef } from 'react';
import { generateMarketingCopy } from '../services/geminiService';
import { saveActivity } from '../services/firestoreService';
import { Megaphone, Copy, Check, Sparkles, Share2, Type, Users, Layout, Zap, Wand2, Instagram, Facebook, MessageCircle, PenTool, ArrowRight, Download, Loader2, Square, Command } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import html2canvas from 'html2canvas';

// Same utils
const stripMarkdown = (text: string) => {
  if (!text) return '';
  return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/^###\s+/gm, '').replace(/^##\s+/gm, '').replace(/^#\s+/gm, '').replace(/^\*\s+/gm, '• ').replace(/^-\s+/gm, '• ').replace(/`/g, '');
};
const parseFormatting = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**')) return <span key={index} className="font-bold text-white bg-white/10 px-1 rounded">{part.slice(2, -2)}</span>;
        if (part.startsWith('*')) return <span key={index} className="italic text-cyan-300">{part.slice(1, -1)}</span>;
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};
const FormattedText = ({ text }: { text: string }) => {
  if (!text) return null;
  return (
    <div className="space-y-4 font-sans text-lg leading-relaxed text-slate-300">
      {text.split('\n').map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('### ')) return <h3 key={i} className="text-xl font-bold text-cyan-400 mt-6 mb-2 border-b border-cyan-500/30 pb-1 inline-block">{parseFormatting(trimmed.substring(4))}</h3>;
        if (trimmed.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-white mt-8 mb-4">{parseFormatting(trimmed.substring(3))}</h2>;
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) return <div key={i} className="flex gap-3 pl-1"><div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0"></div><p>{parseFormatting(trimmed.substring(2))}</p></div>;
        if (trimmed === '') return <div key={i} className="h-2" />;
        return <p key={i}>{parseFormatting(line)}</p>;
      })}
    </div>
  );
};

export const MarketingAssistant: React.FC = () => {
  const { t, language } = useLanguage();
  const [productName, setProductName] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [targetAudience, setTargetAudience] = useState('');
  const [generatedCopy, setGeneratedCopy] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadingImg, setDownloadingImg] = useState(false);
  const [mobileTab, setMobileTab] = useState<'input' | 'output'>('input');
  const contentRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !targetAudience) return;
    setLoading(true);
    setMobileTab('output'); 
    const result = await generateMarketingCopy(productName, platform, targetAudience, language);
    setGeneratedCopy(result);
    setLoading(false);
    setCopied(false);
    if (result && !result.startsWith("Could not")) await saveActivity('MARKETING', `Ad Copy: ${productName}`, `${platform} for ${targetAudience}`, result);
  };

  const handleCopy = () => { navigator.clipboard.writeText(stripMarkdown(generatedCopy)); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleDownloadImage = async () => {
      if (!contentRef.current) return;
      setDownloadingImg(true);
      try {
          const canvas = await html2canvas(contentRef.current, { scale: 2, useCORS: true, backgroundColor: '#0B0F19' });
          const link = document.createElement('a'); link.href = canvas.toDataURL('image/png'); link.download = `Ad_Copy_${Date.now()}.png`; link.click();
      } catch (err) { console.error(err); } finally { setDownloadingImg(false); }
  };

  const platforms = [{ id: 'Instagram', icon: Instagram }, { id: 'WhatsApp', icon: MessageCircle }, { id: 'Facebook', icon: Facebook }];

  return (
    <div className="flex flex-col h-full w-full p-2 md:p-6 gap-4 animate-fade-in">
      {/* Mobile Tab */}
      <div className="lg:hidden flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
          <button onClick={() => setMobileTab('input')} className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${mobileTab === 'input' ? 'bg-cyan-600 text-black shadow-lg' : 'text-slate-400'}`}><PenTool size={14} /> {t('mkt.brief')}</button>
          <button onClick={() => setMobileTab('output')} className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 relative ${mobileTab === 'output' ? 'bg-cyan-600 text-black shadow-lg' : 'text-slate-400'}`}><Sparkles size={14} /> {t('mkt.result')}{generatedCopy && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}</button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full w-full overflow-hidden">
        {/* Input Panel */}
        <div className={`w-full lg:w-[420px] flex-col h-full shrink-0 transition-all ${mobileTab === 'input' ? 'flex' : 'hidden lg:flex'}`}>
            <div className="glass-panel rounded-[32px] p-8 h-full flex flex-col border border-white/10 bg-[#0B0F19]/60 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="mb-8 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg shadow-lg shadow-pink-500/20 text-white"><Megaphone size={20} /></div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Campaign Generator</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-white">{t('mkt.title')}</h2>
            </div>

            <form onSubmit={handleGenerate} className="space-y-6 flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-1">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Product</label>
                    <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder={t('mkt.productPlaceholder')} className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:border-pink-500/50 focus:bg-black/50 transition-all text-white placeholder:text-slate-600 font-medium" />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Platform</label>
                    <div className="grid grid-cols-3 gap-2">
                        {platforms.map((p) => (
                            <button key={p.id} type="button" onClick={() => setPlatform(p.id)} className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all ${platform === p.id ? 'bg-pink-500/20 border-pink-500 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'bg-black/30 border-white/5 text-slate-500 hover:bg-white/5'}`}>
                                <p.icon size={18} />
                                <span className="text-[9px] font-bold uppercase">{p.id}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2 flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Brief</label>
                    <textarea value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder={t('mkt.audiencePlaceholder')} className="w-full h-full min-h-[150px] px-5 py-4 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:border-pink-500/50 focus:bg-black/50 transition-all text-white placeholder:text-slate-600 resize-none font-medium leading-relaxed" />
                </div>

                <button type={loading ? "button" : "submit"} onClick={loading ? () => setLoading(false) : undefined} disabled={!loading && (!productName || !targetAudience)} className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${loading ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:brightness-110 shadow-pink-500/20'}`}>
                    {loading ? <Square size={16} fill="currentColor" /> : <Wand2 size={16} />}
                    <span>{loading ? "Abort" : t('mkt.btn.generate')}</span>
                </button>
            </form>
            </div>
        </div>

        {/* Output Panel */}
        <div className={`flex-1 h-full min-w-0 transition-all ${mobileTab === 'output' ? 'flex' : 'hidden lg:flex'}`}>
            <div className="glass-panel rounded-[32px] h-full w-full flex flex-col border border-white/10 bg-[#0B0F19]/80 backdrop-blur-xl relative overflow-hidden">
                {!generatedCopy && !loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-30 p-10">
                        <Command size={64} className="text-slate-500 mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-2">Awaiting Instructions</h3>
                        <p className="text-slate-400 font-mono text-sm">Fill the brief to initialize generation sequence.</p>
                    </div>
                )}
                
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                        <div className="w-24 h-24 rounded-full border-4 border-pink-500/20 border-t-pink-500 animate-spin mb-6"></div>
                        <p className="text-pink-400 font-bold font-mono animate-pulse">GENERATING_CREATIVE_ASSETS...</p>
                    </div>
                )}

                {generatedCopy && (
                    <div className="flex flex-col h-full w-full animate-fade-in">
                        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Generated Output</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleDownloadImage} disabled={downloadingImg} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">{downloadingImg ? <Loader2 size={16} className="animate-spin"/> : <Download size={16} />}</button>
                                <button onClick={handleCopy} className={`p-2 rounded-lg transition-colors ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white hover:bg-white/10'}`}>{copied ? <Check size={16} /> : <Copy size={16} />}</button>
                            </div>
                        </div>
                        
                        <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
                            <div ref={contentRef} className="max-w-3xl mx-auto bg-[#0B0F19] rounded-2xl p-8 border border-white/10 shadow-2xl relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500"></div>
                                <FormattedText text={generatedCopy} />
                                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center opacity-50">
                                     <div className="flex items-center gap-2">
                                         <div className="w-6 h-6 rounded bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-[10px] font-bold text-white">AI</div>
                                         <span className="text-[10px] font-mono text-slate-400">RUMAH_UMKM_ENGINE_V2</span>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
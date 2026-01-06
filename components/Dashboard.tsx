import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, ArrowUpRight, Loader2, Sparkles, Building2, Search, ArrowRight, Layers, ShieldCheck, ExternalLink, Globe, Cpu, Terminal, ChevronDown, CheckCircle, Download, Square, XCircle } from 'lucide-react';
import { generateDashboardData } from '../services/geminiService';
import { DashboardData } from '../types';
import { saveActivity } from '../services/firestoreService';
import { useLanguage } from '../contexts/LanguageContext';
import html2canvas from 'html2canvas';

// Agentic HUD Component - Updated Colors
const AgentProcessingView = ({ logs, onAbort }: { logs: string[], onAbort: () => void }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-[#020617] text-cyan-400 font-mono p-4 relative overflow-hidden rounded-3xl border border-white/5">
             <div className="absolute inset-0 z-0 opacity-20" 
                  style={{
                      backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
                      backgroundSize: '40px 40px'
                  }}>
             </div>
             
             <div className="relative z-10 mb-12">
                 <div className="w-32 h-32 rounded-full border-2 border-cyan-500/30 flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                     <div className="w-24 h-24 rounded-full border-t-2 border-r-2 border-cyan-400 animate-spin"></div>
                 </div>
                 <div className="absolute inset-0 flex items-center justify-center">
                     <Cpu size={40} className="text-cyan-400 animate-pulse" />
                 </div>
             </div>

             <div className="w-full max-w-2xl bg-black/40 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-md relative z-10 shadow-[0_0_20px_rgba(6,182,212,0.1)] h-64 flex flex-col">
                 <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-4">
                     <div className="flex items-center gap-2">
                        <Terminal size={16} />
                        <span className="text-xs font-bold tracking-widest uppercase text-cyan-200">System_Core // Processing</span>
                     </div>
                     <button 
                        onClick={onAbort}
                        className="text-[10px] font-bold text-white flex items-center gap-1 bg-red-500/20 border border-red-500/50 px-2.5 py-1 rounded hover:bg-red-500/40 transition-all"
                     >
                        <Square size={8} fill="currentColor" /> ABORT
                     </button>
                 </div>
                 
                 <div className="flex-1 overflow-hidden flex flex-col justify-end space-y-2">
                     {logs.map((log, idx) => (
                         <div key={idx} className="flex items-start gap-3 animate-slide-up text-sm font-medium">
                             <span className="text-cyan-700">[{new Date().toLocaleTimeString()}]</span>
                             <span className="text-cyan-300/80">
                                 {idx === logs.length - 1 ? (
                                     <span className="flex items-center gap-2 text-cyan-400">
                                         <span className="w-2 h-2 bg-cyan-400 animate-ping rounded-full"></span>
                                         {log}
                                     </span>
                                 ) : (
                                     <span className="flex items-center gap-2 opacity-50">
                                          <CheckCircle size={12} /> {log}
                                     </span>
                                 )}
                             </span>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    );
};


const StatCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
  <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300 bg-[#0B0F19]/60">
    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
    
    <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="p-3 rounded-2xl bg-white/5 text-cyan-400 border border-white/5 shadow-sm group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all">
            <Icon size={22} strokeWidth={2} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`}>
            <ArrowUpRight size={12} />
            <span>{subtext}</span>
        </div>
    </div>
    
    <div className="relative z-10">
      <h3 className="text-3xl font-display font-bold text-white mb-1 tracking-tight drop-shadow-lg">{value}</h3>
      <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">{title}</p>
    </div>
  </div>
);

interface DashboardProps {
    isDarkMode?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ isDarkMode }) => {
  const { t, language } = useLanguage();
  const [businessDesc, setBusinessDesc] = useState('');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [timeRange, setTimeRange] = useState<'6M' | '1Y'>('6M');
  const [downloadingImg, setDownloadingImg] = useState(false);
  
  const insightRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        setLoading(false);
        setLogs(prev => [...prev, "PROCESS ABORTED BY USER"]);
    }
  };

  const handleGenerateData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessDesc.trim()) return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setHasSearched(true);
    setData(null);
    setShowSources(false);
    setLogs([t('dash.loading')]);

    try {
        const result = await generateDashboardData(
            businessDesc, 
            language, 
            (step) => setLogs(prev => [...prev, step]),
            abortControllerRef.current.signal
        );
        
        if (result) {
            setData(result);
            await saveActivity('DASHBOARD', `Simulation: ${businessDesc}`, businessDesc, result);
        }
    } catch (error: any) {
        if (error.name !== 'AbortError') {
             console.error("Simulation failed", error);
             setLogs(prev => [...prev, "ERROR: SIMULATION FAILED"]);
        }
    } finally {
        if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
            setLoading(false);
        }
    }
  };
  
  const handleDownloadImage = async () => {
    if (!insightRef.current) return;
    setDownloadingImg(true);
    try {
        const canvas = await html2canvas(insightRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: null,
            ignoreElements: (element) => element.classList.contains('no-capture')
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `Business_Insight_${Date.now()}.png`;
        link.click();
    } catch (err) {
        console.error("Failed to capture image", err);
    } finally {
        setDownloadingImg(false);
    }
  };
  
  const getFilteredData = (historyData: any[]) => {
      if (!historyData) return [];
      if (timeRange === '6M') return historyData.slice(-6);
      return historyData;
  };

  const revenueData = getFilteredData(data?.revenueHistory || []);
  const customerData = getFilteredData(data?.customerHistory || []);

  const contentClass = "h-full w-full overflow-y-auto custom-scrollbar p-2 md:p-4";

  if (loading) {
      return (
          <div className={contentClass}>
              <AgentProcessingView logs={logs} onAbort={handleStopGeneration} />
          </div>
      );
  }

  if (!hasSearched && !data) {
    return (
      <div className={contentClass}>
        <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in relative">
          <div className="text-center space-y-8 max-w-4xl relative z-10 px-4">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-bold text-cyan-400 mb-4 animate-slide-up shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Sparkles size={14} /> <span>Next-Gen Business Intelligence</span>
            </div>

            <h2 className="text-6xl md:text-8xl font-display font-bold tracking-tighter text-white leading-none drop-shadow-2xl">
              Business
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400">
                  Simulated.
              </span>
            </h2>
            
            <p className="text-slate-400 text-lg md:text-xl font-normal max-w-2xl mx-auto leading-relaxed">
              {t('dash.subtitle')}
            </p>

            <form onSubmit={handleGenerateData} className="w-full max-w-xl mx-auto mt-12 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                  <div className="relative flex items-center p-2 bg-[#0B0F19] border border-white/10 rounded-3xl shadow-2xl transition-all focus-within:border-cyan-500/50">
                      <div className="pl-4 text-cyan-500">
                          <Building2 size={24} />
                      </div>
                      <input 
                          type="text" 
                          value={businessDesc}
                          onChange={(e) => setBusinessDesc(e.target.value)}
                          placeholder={t('dash.placeholder')}
                          className="w-full px-4 py-4 bg-transparent text-lg font-semibold text-white placeholder:text-slate-600 focus:outline-none"
                      />
                      <button 
                          type="submit"
                          disabled={loading || !businessDesc}
                          className={`
                            p-4 rounded-2xl font-bold transition-all duration-300 shadow-lg flex items-center justify-center
                            ${loading 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                                : 'bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-105 disabled:opacity-50 disabled:scale-100 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                            }
                          `}
                          onClick={(e) => {
                              if (loading) {
                                  e.preventDefault();
                                  handleStopGeneration();
                              }
                          }}
                      >
                          {loading ? <Square fill="currentColor" size={24} /> : <ArrowRight size={24} />}
                      </button>
                  </div>
            </form>
            
            <div className="flex items-center justify-center gap-6 mt-8 text-xs font-bold uppercase tracking-wider text-slate-500">
                <span className="flex items-center gap-1.5"><Layers size={14} /> 5-Layer Analysis</span>
                <span className="flex items-center gap-1.5"><Globe size={14} /> Live Web Search</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Fact Checked</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={contentClass}>
      <div className="space-y-8 animate-fade-in pb-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <h2 className="text-4xl font-display font-bold text-white mb-2">{t('dash.execOverview')}</h2>
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck size={16} className="text-cyan-400"/>
              <span className="text-sm font-bold uppercase tracking-wider">{t('dash.verified')}: {businessDesc}</span>
            </div>
          </div>
          <button 
            onClick={() => { setHasSearched(false); setData(null); setBusinessDesc(''); }}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Search size={16} /> {t('dash.newSim')}
          </button>
        </div>

        {/* AI Insight & Sources */}
        {data?.metrics?.aiInsight && (
          <div ref={insightRef} className="glass-panel p-[1px] rounded-3xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <div className="bg-[#0B0F19] rounded-[23px] p-6 md:p-8 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
                      <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                          <Sparkles size={28} fill="currentColor" className="opacity-80" />
                      </div>
                      <div className="flex-1 w-full">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-cyan-400">{t('dash.stratIntel')}</h4>
                            
                            <div className="flex items-center gap-2 no-capture">
                                <button
                                    onClick={handleDownloadImage}
                                    disabled={downloadingImg}
                                    className={`
                                        p-2 rounded-xl text-black transition-all
                                        bg-cyan-400 hover:bg-cyan-300
                                        shadow-[0_0_15px_rgba(6,182,212,0.4)]
                                        hover:scale-105 active:scale-95
                                    `}
                                    title={t('dash.downloadImg')}
                                >
                                    {downloadingImg ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                </button>
                                {data.simulationSources && data.simulationSources.length > 0 && (
                                    <button 
                                        onClick={() => setShowSources(!showSources)}
                                        className={`
                                            flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider text-black
                                            bg-gradient-to-r from-teal-400 to-emerald-400
                                            shadow-[0_0_15px_rgba(20,184,166,0.5)]
                                            hover:scale-105 active:scale-95
                                        `}
                                    >
                                        {showSources ? t('dash.hideSources') : t('dash.viewSources')}
                                        <ExternalLink size={12} />
                                    </button>
                                )}
                            </div>
                          </div>
                          <p className="text-xl md:text-2xl font-display font-bold text-white leading-relaxed">
                              {data.metrics.aiInsight.replace(/^"|"$/g, '')}
                          </p>
                      </div>
                  </div>

                  {showSources && data.simulationSources && (
                      <div className="mt-6 pt-6 border-t border-white/10 animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-3 no-capture">
                          {data.simulationSources.map((source, idx) => (
                              <a 
                                key={idx} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group border border-white/5 hover:border-cyan-500/30"
                              >
                                  <div className="p-2 rounded-full bg-white/10 text-slate-400 group-hover:text-cyan-400 transition-colors">
                                      <Globe size={14} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-slate-200 truncate">{source.title}</p>
                                      <p className="text-xs text-slate-500 truncate">{source.uri}</p>
                                  </div>
                              </a>
                          ))}
                      </div>
                  )}
              </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title={t('dash.totalRev')} value={data?.metrics.totalRevenue || "0"} subtext={data?.metrics.revenueGrowth || "0%"} icon={DollarSign} trend="up"/>
          <StatCard title={t('dash.activeCust')} value={data?.metrics.activeCustomers || "0"} subtext={data?.metrics.customerGrowth || "0%"} icon={Users} trend="up"/>
          <StatCard title={t('dash.nps')} value={data?.metrics.satisfaction || "0"} subtext="Customer Love" icon={TrendingUp} trend="up"/>
          <StatCard title={t('dash.health')} value="98.5" subtext="Excellent" icon={Activity} trend="up"/>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <div className="glass-panel p-8 rounded-3xl shadow-lg border border-white/5 flex flex-col h-[450px] bg-[#0B0F19]/60">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-display font-bold text-white">{t('dash.finPerf')}</h3>
              <div className="relative">
                  <select 
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as '6M' | '1Y')}
                    className="appearance-none bg-white/5 pl-4 pr-8 py-2 rounded-lg text-sm font-bold text-slate-300 border border-white/10 cursor-pointer focus:outline-none hover:bg-white/10 transition-colors"
                  >
                      <option value="6M" className="bg-[#020617]">Last 6 Months</option>
                      <option value="1Y" className="bg-[#020617]">Last Year</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
              </div>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='rgba(255,255,255,0.05)' />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                  <Area type="monotone" dataKey="expenses" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Chart */}
          <div className="glass-panel p-8 rounded-3xl shadow-lg border border-white/5 flex flex-col h-[450px] bg-[#0B0F19]/60">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-display font-bold text-white">{t('dash.userAcq')}</h3>
              <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
                  <span className="text-xs font-bold text-slate-500">{t('dash.newUsers')}</span>
              </div>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerData} barGap={0}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='rgba(255,255,255,0.05)' />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#020617', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22d3ee" />
                          <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                  </defs>
                  <Bar dataKey="customers" fill="url(#barGradient)" radius={[6, 6, 6, 6]} barSize={32} name="Active Users" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

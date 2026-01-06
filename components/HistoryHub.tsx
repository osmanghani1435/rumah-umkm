import React, { useEffect, useState } from 'react';
import { subscribeToActivities } from '../services/firestoreService';
import { ActivityLog } from '../types';
import { Clock, LayoutDashboard, GraduationCap, Megaphone, Calendar, ChevronRight, Database, Search } from 'lucide-react';

export const HistoryHub: React.FC = () => {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToActivities((logs) => {
            setActivities(logs);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'DASHBOARD': return <LayoutDashboard size={18} className="text-cyan-400" />;
            case 'EDUCATION': return <GraduationCap size={18} className="text-teal-400" />;
            case 'MARKETING': return <Megaphone size={18} className="text-pink-400" />;
            default: return <Clock size={18} className="text-slate-400" />;
        }
    };

    return (
        <div className="h-full w-full overflow-y-auto custom-scrollbar p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
                {/* Header */}
                <div className="relative overflow-hidden rounded-[24px] bg-[#0B0F19] p-8 border border-white/10 shadow-lg">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-cyan-500/10 to-teal-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="relative z-10 flex items-end justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-cyan-500">
                                <Database size={20} />
                                <span className="text-xs font-bold uppercase tracking-[0.2em]">System Logs</span>
                            </div>
                            <h2 className="text-3xl font-display font-bold text-white">
                                Primary Archive
                            </h2>
                        </div>
                        <div className="hidden md:block text-right">
                             <p className="text-2xl font-mono font-bold text-white">{activities.length}</p>
                             <p className="text-xs text-slate-500 uppercase tracking-widest">Total Records</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                     <div className="space-y-4 animate-pulse">
                         {[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl border border-white/5"></div>)}
                     </div>
                ) : activities.length === 0 ? (
                    <div className="glass-panel p-12 rounded-[24px] text-center border border-white/10 bg-[#0B0F19]/50">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                            <Clock size={32} className="text-slate-600" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Archive Empty</h3>
                        <p className="text-slate-500 text-sm mt-2">System awaiting operational data.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activities.map((activity) => (
                            <div key={activity.id} className="group relative rounded-xl border border-white/5 bg-[#0B0F19]/40 hover:bg-[#0B0F19]/80 hover:border-cyan-500/30 transition-all duration-300 overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex items-center gap-4 p-4">
                                    <div className="p-3 rounded-lg bg-black/30 border border-white/5 shrink-0 group-hover:border-cyan-500/30 transition-colors">
                                        {getIcon(activity.type)}
                                    </div>
                                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                        <div className="md:col-span-1">
                                            <h4 className="font-bold text-sm text-slate-200 truncate group-hover:text-cyan-400 transition-colors">{activity.title}</h4>
                                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{activity.type}</p>
                                        </div>
                                        <div className="md:col-span-1 hidden md:block">
                                            <p className="text-xs text-slate-400 truncate font-mono">{activity.inputSummary}</p>
                                        </div>
                                        <div className="md:col-span-1 flex items-center justify-end gap-4">
                                            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                                                <Calendar size={10} />
                                                {new Date(activity.timestamp).toLocaleDateString()}
                                            </span>
                                            <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
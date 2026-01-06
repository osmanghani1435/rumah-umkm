import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, MessageSquareText, GraduationCap, Megaphone, Settings, Sparkles, PanelLeft, Code, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isDarkMode: boolean;
  userDisplayName?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setView, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  isCollapsed,
  setIsCollapsed,
  userDisplayName
}) => {
  const { t } = useLanguage();

  const navItems = [
    { id: ViewState.DASHBOARD, label: t('nav.overview'), icon: LayoutDashboard },
    { id: ViewState.CONSULTANT, label: t('nav.consultant'), icon: MessageSquareText },
    { id: ViewState.EDUCATION, label: t('nav.education'), icon: GraduationCap },
    { id: ViewState.MARKETING, label: t('nav.marketing'), icon: Megaphone },
    { id: ViewState.HISTORY, label: 'Primary History', icon: Clock },
    { id: ViewState.DEVELOPER, label: t('nav.developer'), icon: Code },
    { id: ViewState.SETTINGS, label: t('nav.settings'), icon: Settings },
  ];

  const handleNavClick = (id: ViewState) => {
    setView(id);
    setIsMobileMenuOpen(false);
  };

  const displayName = userDisplayName || "User";
  const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-24' : 'w-80'}
        md:translate-x-0 md:static
        transition-all duration-300 ease-in-out
        flex flex-col
        py-4 pl-4
      `}>
        {/* Glass Panel - Dark Theme Force */}
        <div className="h-full w-full rounded-[32px] glass-panel shadow-2xl flex flex-col relative bg-[#020617]/80 border border-white/10 transition-all duration-300 group overflow-hidden backdrop-blur-2xl">
            
            {/* Header */}
            <div className={`
                flex items-center relative z-10 transition-all duration-300 min-h-[5.5rem] px-6 py-6
                ${isCollapsed ? 'flex-col justify-center gap-6' : 'justify-between'}
            `}>
                {/* Logo Group */}
                <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/10">
                        <Sparkles className="text-white h-5 w-5" fill="currentColor" />
                    </div>
                    
                    <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                        <span className="font-display font-bold text-xl leading-tight tracking-tight text-white whitespace-nowrap">
                            Rumah<span className="text-cyan-400">UMKM</span>
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap mt-0.5">
                            AI Pro Suite
                        </span>
                    </div>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`
                        rounded-xl p-2 transition-all hidden md:flex items-center justify-center
                        bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10
                        ${isCollapsed ? 'mt-2' : ''}
                    `}
                >
                    <PanelLeft size={18} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar relative z-10 mt-4">
                {!isCollapsed && (
                    <div className="px-4 mb-4 animate-fade-in">
                        <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">{t('nav.mainMenu')}</p>
                    </div>
                )}
                
                {navItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`
                                group w-full flex items-center relative
                                ${isCollapsed ? 'justify-center px-0 py-4' : 'justify-start px-4 py-3.5'} 
                                rounded-2xl transition-all duration-300
                                ${isActive 
                                    ? 'bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.1)] border border-cyan-500/20' 
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                                }
                            `}
                        >
                            <div className="relative flex items-center justify-center z-10">
                                <item.icon 
                                    size={22} 
                                    className={`
                                        transition-all duration-300
                                        ${isActive ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' : 'text-slate-500 group-hover:text-slate-300'}
                                    `}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {isActive && isCollapsed && (
                                    <span className="absolute -right-2 top-0 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></span>
                                )}
                            </div>
                            
                            <span className={`
                                ml-3.5 font-semibold text-[15px] whitespace-nowrap transition-all duration-300 origin-left
                                ${isCollapsed ? 'w-0 opacity-0 overflow-hidden ml-0' : 'w-auto opacity-100'}
                            `}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            {/* Footer - Minimized User Profile */}
            <div className="p-4 mt-auto border-t border-white/5 relative z-10 bg-[#020617]/50 backdrop-blur-md rounded-b-[32px]">
                <div className={`
                    flex items-center gap-3.5 rounded-2xl bg-white/5 border border-white/5
                    ${isCollapsed ? 'justify-center p-2.5' : 'p-3'}
                `}>
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyan-900 to-teal-900 p-[2px] shrink-0 shadow-sm relative border border-white/10">
                         <div className="h-full w-full rounded-full bg-[#020617] flex items-center justify-center">
                             <span className="font-bold text-xs text-cyan-400">{initials}</span>
                         </div>
                         <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#020617] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                    </div>
                    
                    <div className={`flex-1 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 ml-0 hidden' : 'w-auto opacity-100'}`}>
                        <p className="text-sm font-bold truncate text-slate-200 leading-none mb-1">{displayName}</p>
                        <p className="text-[10px] text-cyan-500/80 truncate font-bold uppercase tracking-wide">{t('nav.proPlan')}</p>
                    </div>
                </div>
            </div>
        </div>
      </aside>
    </>
  );
};

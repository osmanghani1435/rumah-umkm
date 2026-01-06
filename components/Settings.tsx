import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { keyManager, verifyApiKey } from '../services/geminiService';
import { ApiKey } from '../types';
import { Key, ShieldCheck, Plus, Trash2, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2, Lock, Unlock, Server, Settings as SettingsIcon, Moon, Sun, Languages, User, LogOut } from 'lucide-react';
import { auth } from '../services/firebase';

interface SettingsProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ isDarkMode, toggleTheme, onLogout }) => {
  const { t, language, setLanguage } = useLanguage();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState('');
  const [keyLabel, setKeyLabel] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    refreshKeys();
    // Get current user details
    if (auth.currentUser) {
      setUserEmail(auth.currentUser.email);
      setDisplayName(auth.currentUser.displayName || "User");
    }
  }, []);

  const refreshKeys = () => {
    setKeys([...keyManager.getKeys()]);
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    setIsVerifying(true);
    setError(null);
    setSuccess(null);

    // 1. Verify Key
    const isValid = await verifyApiKey(newKey);

    if (isValid) {
      // 2. Save Key
      keyManager.addKey(newKey, keyLabel || `API Key ${keys.length + 1}`);
      setNewKey('');
      setKeyLabel('');
      setSuccess(t('settings.verifySuccess'));
      refreshKeys();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(t('settings.verifyError'));
    }
    
    setIsVerifying(false);
  };

  const handleDeleteKey = (id: string) => {
    keyManager.removeKey(id);
    refreshKeys();
  };

  // Mask key utility: First 4 chars visible, rest hidden, last 4 chars visible
  const maskKey = (k: string) => {
    if (k.length < 10) return "••••••••";
    return `${k.substring(0, 4)}••••••••••••••••${k.substring(k.length - 4)}`;
  };

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0B0F19] p-8 md:p-12 shadow-xl border border-slate-200 dark:border-white/5">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-indigo-500/20 to-cyan-500/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
            <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-slate-900 dark:text-white">
                    {t('settings.title')}
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 font-light max-w-2xl">
                    {t('settings.subtitle')}
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left Column: Preferences & Account */}
            <div className="xl:col-span-1 space-y-6">
                
                {/* Preferences */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#131722]/60 shadow-lg">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <SettingsIcon size={20} className="text-slate-400" />
                        {t('settings.preferences')}
                    </h3>
                    
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-black/20 mb-4 border border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-100 text-amber-600'}`}>
                                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{isDarkMode ? t('settings.dark') : t('settings.light')}</span>
                        </div>
                        <button 
                            onClick={toggleTheme}
                            className={`w-12 h-7 rounded-full transition-colors relative ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${isDarkMode ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>

                    {/* Language Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-black/20 mb-2 border border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                                <Languages size={20} />
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{t('settings.lang')}</span>
                        </div>
                        <div className="flex bg-slate-200 dark:bg-white/10 rounded-lg p-1 gap-1">
                            <button 
                                onClick={() => setLanguage('en')}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all uppercase ${language === 'en' ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >EN</button>
                            <button 
                                onClick={() => setLanguage('id')}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all uppercase ${language === 'id' ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >ID</button>
                        </div>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#131722]/60 shadow-lg">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <User size={20} className="text-slate-400" />
                        {t('settings.account')}
                    </h3>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {displayName ? displayName.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{displayName || "User"}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{userEmail || "No Email"}</p>
                        </div>
                    </div>

                    <button 
                        onClick={onLogout}
                        className="w-full py-3.5 rounded-xl border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <LogOut size={18} />
                        {t('settings.logout')}
                    </button>
                </div>
                
                {/* Add Key Form (Moved here for better layout balance) */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#131722]/60 shadow-lg">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Plus size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('settings.addKey')}</h3>
                    </div>

                    <form onSubmit={handleAddKey} className="space-y-4">
                        <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Label (Optional)</label>
                             <input 
                                type="text"
                                value={keyLabel}
                                onChange={(e) => setKeyLabel(e.target.value)}
                                placeholder="My Pro Key"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:bg-[#1A1F2E] transition-all text-sm font-medium"
                             />
                        </div>

                        <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">API Key</label>
                             <div className="relative group">
                                <input 
                                    type={showInput ? "text" : "password"}
                                    value={newKey}
                                    onChange={(e) => setNewKey(e.target.value)}
                                    placeholder="AIzaSy..."
                                    className="w-full px-4 py-3 pr-10 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:bg-[#1A1F2E] transition-all text-sm font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowInput(!showInput)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                                >
                                    {showInput ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                             </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold animate-fade-in">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-fade-in">
                                <CheckCircle2 size={16} /> {success}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isVerifying || !newKey}
                            className={`
                                w-full py-3.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all mt-2
                                ${isVerifying || !newKey
                                    ? 'bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98]'
                                }
                            `}
                        >
                            {isVerifying ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                            {isVerifying ? 'Verifying...' : t('settings.verifySave')}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Column: Key List & Info */}
            <div className="xl:col-span-2 space-y-6">
                
                {/* Info Card */}
                <div className="p-6 rounded-3xl bg-indigo-5 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 flex items-start gap-4">
                    <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0">
                         <Server size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">{t('settings.autoSwitch')}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {t('settings.autoSwitchDesc')}
                        </p>
                    </div>
                </div>

                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    {t('settings.yourKeys')} 
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-500">{keys.length}</span>
                </h3>

                {keys.length === 0 ? (
                    <div className="glass-panel p-12 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center text-center opacity-70 min-h-[400px]">
                        <Key size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                        <p className="font-bold text-slate-500 dark:text-slate-400">No User Keys Added</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500">Using System Default (Restricted Quota)</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {keys.map((k) => (
                            <div key={k.id} className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white/40 dark:bg-[#131722]/40 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/10 shrink-0">
                                        <Key size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-slate-800 dark:text-white truncate">{k.label}</h4>
                                            {k.isValid && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                                                    <CheckCircle2 size={10} /> Verified
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <code className="text-xs font-mono bg-slate-100 dark:bg-black/30 px-2 py-1 rounded text-slate-500 dark:text-slate-400">
                                                {maskKey(k.key)}
                                            </code>
                                            <Lock size={12} className="text-slate-300" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pl-16 md:pl-0 shrink-0">
                                    <span className="text-xs font-medium text-slate-400">Added: {new Date(k.addedAt).toLocaleDateString()}</span>
                                    <button 
                                        onClick={() => handleDeleteKey(k.id)}
                                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                        title="Delete Key"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
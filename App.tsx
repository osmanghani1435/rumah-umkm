import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { BusinessConsultant } from './components/BusinessConsultant';
import { EducationHub } from './components/EducationHub';
import { MarketingAssistant } from './components/MarketingAssistant';
import { DeveloperSection } from './components/DeveloperSection';
import { Settings } from './components/Settings';
import { AuthPage } from './components/AuthPage';
import { LanguageIntro } from './components/LanguageIntro';
import { HistoryHub } from './components/HistoryHub';
import { ViewState } from './types';
import { Menu, Loader2 } from 'lucide-react';
import { LanguageProvider } from './contexts/LanguageContext';
import { auth } from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { syncUserProfile, subscribeToApiKeys } from './services/firestoreService';
import { keyManager } from './services/geminiService';

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  // Language Selection State
  const [hasLanguageSelected, setHasLanguageSelected] = useState(false);

  useEffect(() => {
    // Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      setIsLoadingAuth(false);
      
      if (currentUser) {
          await syncUserProfile();
          subscribeToApiKeys((keys) => {
             keyManager.setKeys(keys);
          });
      }
    });

    // Force dark mode
    setIsDarkMode(true);
    document.documentElement.classList.add('dark');

    const langSelected = localStorage.getItem('umkm_has_selected_language');
    if (langSelected === 'true') {
        setHasLanguageSelected(true);
    }

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
  };

  const handleLanguageComplete = () => {
    localStorage.setItem('umkm_has_selected_language', 'true');
    setHasLanguageSelected(true);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard isDarkMode={isDarkMode} />;
      case ViewState.CONSULTANT:
        return <BusinessConsultant />;
      case ViewState.EDUCATION:
        return <EducationHub />;
      case ViewState.MARKETING:
        return <MarketingAssistant />;
      case ViewState.HISTORY:
        return <HistoryHub />;
      case ViewState.DEVELOPER:
        return <DeveloperSection />;
      case ViewState.SETTINGS:
        return <Settings isDarkMode={isDarkMode} toggleTheme={() => {}} onLogout={handleLogout} />;
      default:
        return <Dashboard isDarkMode={isDarkMode} />;
    }
  };
  
  if (isLoadingAuth) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#020617] text-white">
          <Loader2 className="animate-spin text-cyan-500" size={48} />
        </div>
      ); 
  }

  if (!hasLanguageSelected) {
      return <LanguageIntro onComplete={handleLanguageComplete} />;
  }

  if (!isAuthenticated) {
    return <AuthPage onLogin={() => {}} />;
  }

  return (
    <div className="relative h-screen w-screen flex font-sans overflow-hidden bg-[#020617] text-white">
      
      {/* Cinematic Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020617]">
         <div className="absolute inset-0 bg-cyber-grid bg-grid-pattern opacity-[0.03]"></div>
         <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen opacity-30 animate-pulse-slow"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-teal-500/10 rounded-full blur-[100px] mix-blend-screen opacity-20"></div>
      </div>

      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isDarkMode={isDarkMode}
        userDisplayName={user?.displayName}
      />

      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden transition-all duration-300">
        <header className="md:hidden flex items-center justify-between p-4 glass-panel border-b border-white/10 shrink-0 mx-2 mt-2 rounded-2xl">
          <div className="font-display font-bold text-xl tracking-tight text-white">Rumah<span className="text-cyan-400">UMKM</span></div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-white/10 text-slate-200"
          >
            <Menu size={24} strokeWidth={2} />
          </button>
        </header>

        <main className="flex-1 overflow-hidden relative p-2 md:p-3">
            {renderContent()}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;

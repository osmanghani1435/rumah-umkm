import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatSession } from '../types';
import { createChatSession, runAgenticWorkflow, generateChatTitle } from '../services/geminiService';
import { subscribeToChatSessions, saveChatSession, deleteChatSession, restoreChatSession } from '../services/firestoreService';
import { Send, Bot, User, Sparkles, RotateCcw, MoreHorizontal, Globe, ShieldCheck, Zap, Layers, ChevronDown, ChevronUp, Link as LinkIcon, BrainCircuit, Clock, Timer, BadgeCheck, Download, Loader2, Square, History, Plus, Trash2, ArchiveRestore, X, MessageSquare, Code2, Terminal } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import html2canvas from 'html2canvas';

// Advanced Text Formatter to strip symbols and apply styles
const FormattedText = ({ text }: { text: string }) => {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className="space-y-3 font-sans text-[15px] leading-relaxed tracking-wide w-full max-w-full overflow-hidden">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        
        // Handle Headers (###)
        if (trimmed.startsWith('### ')) {
           return (
             <h3 key={i} className="text-lg font-bold text-cyan-400 mt-5 mb-2 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
               {parseFormatting(trimmed.substring(4))}
             </h3>
           );
        }

        // Handle Headers (##)
        if (trimmed.startsWith('## ')) {
           return (
             <h2 key={i} className="text-xl font-bold text-white mt-6 mb-3 border-b border-white/10 pb-2">
               {parseFormatting(trimmed.substring(3))}
             </h2>
           );
        }
        
        // Handle Bullet Points (* )
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <div key={i} className="flex items-start gap-3 pl-1 group my-1.5">
              <div className="mt-2 w-1 h-1 rounded-full bg-slate-500 group-hover:bg-cyan-400 transition-colors shrink-0"></div>
              <p className="text-slate-300 group-hover:text-slate-200 transition-colors">
                {parseFormatting(trimmed.substring(2))}
              </p>
            </div>
          );
        }

        // Handle Numbered Lists
        if (trimmed.match(/^\d+\./)) {
             const dotIndex = trimmed.indexOf('.');
             return (
                 <div key={i} className="flex items-start gap-3 ml-1 my-2">
                    <span className="font-mono text-cyan-500 font-bold min-w-[20px]">{trimmed.split('.')[0]}.</span>
                    <span className="text-slate-300">{parseFormatting(trimmed.substring(dotIndex + 1))}</span>
                </div>
            );
        }
        
        // Empty lines
        if (trimmed === '') {
            return <div key={i} className="h-2" />;
        }

        // Standard Paragraph
        return (
          <p key={i} className="text-slate-300 break-words">
            {parseFormatting(line)}
          </p>
        );
      })}
    </div>
  );
};

// Parser to handle bold text (**text**) without showing asterisks
const parseFormatting = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const content = part.slice(2, -2);
          return (
            <span key={index} className="font-bold text-white bg-white/10 px-1 rounded mx-0.5 border border-white/10">
              {content}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

// Heuristic to check if source is official
const isOfficialSource = (uri: string) => {
    const u = uri.toLowerCase();
    return u.includes('.gov') || u.includes('.go.') || u.includes('.edu') || u.includes('.ac.') || u.includes('.org');
};

const SourcesPanel = ({ sources }: { sources: { title: string; uri: string }[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLanguage();
    
    if (!sources || sources.length === 0) return null;

    return (
        <div className="mt-4 border-t border-white/10 pt-3 w-full">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider w-full py-2 rounded-lg text-white transition-all
                    ${isOpen ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'}
                    border border-white/5
                `}
            >
                {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {isOpen ? t('dash.hideSources') : t('dash.viewSources')} 
                <span className="bg-cyan-500/20 text-cyan-400 px-1.5 rounded text-[9px] border border-cyan-500/30">{sources.length}</span>
            </button>
            
            {isOpen && (
                <div className="mt-3 grid grid-cols-1 gap-2 animate-fade-in w-full overflow-hidden">
                    {sources.map((source, idx) => {
                        const isOfficial = isOfficialSource(source.uri);
                        return (
                            <a 
                                key={idx}
                                href={source.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`
                                    flex items-center gap-3 p-2.5 rounded-lg border transition-all group w-full
                                    ${isOfficial 
                                        ? 'bg-emerald-950/30 border-emerald-500/20 hover:border-emerald-500/40' 
                                        : 'bg-black/20 border-white/5 hover:border-white/20'
                                    }
                                `}
                            >
                                <div className={`
                                    p-1.5 rounded-full shrink-0 transition-colors
                                    ${isOfficial ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500 group-hover:text-cyan-400'}
                                `}>
                                    {isOfficial ? <BadgeCheck size={10} /> : <LinkIcon size={10} />}
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <p className="text-xs font-bold text-slate-200 truncate">{source.title || "Untitled Source"}</p>
                                    <p className="text-[10px] text-slate-500 truncate font-mono">{source.uri}</p>
                                </div>
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const AgentProgress = ({ step }: { step: string }) => (
    <div className="flex items-center gap-3 p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl animate-pulse my-2">
        <div className="relative shrink-0">
            <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide">{step}</span>
    </div>
);

// --- History Sidebar Component ---
interface HistorySidebarProps {
    isOpen: boolean;
    sessions: ChatSession[];
    activeSessionId: string;
    onSelectSession: (id: string) => void;
    onDeleteSession: (id: string) => void;
    onRestoreSession: (id: string) => void;
    viewMode: 'active' | 'trash';
    setViewMode: (mode: 'active' | 'trash') => void;
    onNewChat: () => void;
    setIsOpen: (open: boolean) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
    isOpen, sessions, activeSessionId, onSelectSession, onDeleteSession, onRestoreSession, viewMode, setViewMode, onNewChat, setIsOpen
}) => {
    
    // Filter sessions based on view mode
    const filteredSessions = sessions
        .filter(s => viewMode === 'active' ? !s.isDeleted : s.isDeleted)
        .sort((a, b) => b.lastModified - a.lastModified);

    return (
        <div className={`
            absolute top-0 left-0 bottom-0 z-20 bg-[#020617]/95 backdrop-blur-xl border-r border-white/10 transition-all duration-300 flex flex-col
            ${isOpen ? 'w-full md:w-80 translate-x-0' : 'w-0 -translate-x-full opacity-0 pointer-events-none'}
        `}>
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-cyan-400">
                    <Terminal size={18} />
                    <h3 className="font-mono font-bold text-sm tracking-wider">SESSION_LOGS</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Toggle Active/Trash */}
            <div className="p-3 grid grid-cols-2 gap-2 shrink-0">
                <button 
                    onClick={() => setViewMode('active')}
                    className={`
                        flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border
                        ${viewMode === 'active' 
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                            : 'bg-white/5 text-slate-500 border-transparent hover:bg-white/10'}
                    `}
                >
                    <MessageSquare size={12} /> Active
                </button>
                <button 
                    onClick={() => setViewMode('trash')}
                     className={`
                        flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border
                        ${viewMode === 'trash' 
                            ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                            : 'bg-white/5 text-slate-500 border-transparent hover:bg-white/10'}
                    `}
                >
                    <Trash2 size={12} /> Trash
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {viewMode === 'active' && (
                    <button 
                        onClick={() => {
                            onNewChat();
                            setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/20 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all mb-4 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                            <Plus size={16} />
                        </div>
                        <span className="font-bold text-xs uppercase tracking-wider">Initialize New Session</span>
                    </button>
                )}

                {filteredSessions.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <History className="mx-auto mb-2 text-slate-600" size={32} />
                        <p className="text-xs font-mono text-slate-500">NO_DATA_FOUND</p>
                    </div>
                ) : (
                    filteredSessions.map(session => (
                        <div 
                            key={session.id}
                            onClick={() => viewMode === 'active' && onSelectSession(session.id)}
                            className={`
                                group relative p-3 rounded-xl border transition-all cursor-pointer hover:shadow-lg hover:shadow-cyan-500/5
                                ${activeSessionId === session.id && viewMode === 'active'
                                    ? 'bg-white/5 border-cyan-500/50' 
                                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
                                }
                            `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`font-bold text-xs line-clamp-1 ${activeSessionId === session.id ? 'text-cyan-400' : 'text-slate-300 group-hover:text-white'}`}>
                                    {session.title}
                                </h4>
                                <span className="text-[9px] text-slate-500 whitespace-nowrap ml-2 font-mono">
                                    {new Date(session.lastModified).toLocaleDateString(undefined, {month: '2-digit', day: '2-digit'})}
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-1 pr-6 font-medium">
                                {session.messages[session.messages.length - 1]?.text || "Empty stream"}
                            </p>

                            {/* Actions */}
                            <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                {viewMode === 'active' ? (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                                        className="p-1.5 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20"
                                        title="Archive"
                                    >
                                        <Trash2 size={10} />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onRestoreSession(session.id); }}
                                        className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                                        title="Restore"
                                    >
                                        <ArchiveRestore size={10} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};


export const BusinessConsultant: React.FC = () => {
  const { t, language } = useLanguage();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyViewMode, setHistoryViewMode] = useState<'active' | 'trash'>('active');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAgenticMode, setIsAgenticMode] = useState(false);
  const [currentAgentStep, setCurrentAgentStep] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Firestore Sync & Chat Logic remains identical (hidden for brevity, using same logic as previous file)
  useEffect(() => {
    const unsubscribe = subscribeToChatSessions((fetchedSessions) => {
        setSessions(fetchedSessions);
        if (!activeSessionId && fetchedSessions.length > 0) {
             const active = fetchedSessions.find(s => !s.isDeleted);
             if (active) setActiveSessionId(active.id);
        }
    });
    return () => unsubscribe();
  }, [activeSessionId]);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];

  useEffect(() => {
    chatSessionRef.current = createChatSession(language);
  }, [activeSessionId, language]);

  const createNewSession = async () => {
      const newId = Date.now().toString();
      const newSession: ChatSession = {
          id: newId,
          title: language === 'id' ? 'Percakapan Baru' : 'New Session',
          messages: [{
              id: 'welcome',
              role: 'model',
              text: t('chat.welcome'),
              timestamp: Date.now()
          }],
          lastModified: Date.now(),
          isDeleted: false
      };
      await saveChatSession(newSession);
      setActiveSessionId(newId);
      setIsHistoryOpen(false);
  };

  const deleteSession = async (id: string) => { await deleteChatSession(id); if (activeSessionId === id) setActiveSessionId(''); };
  const restoreSession = async (id: string) => { await restoreChatSession(id); };

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages, currentAgentStep]);

  const handleStop = () => {
      if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
          setIsTyping(false);
          setCurrentAgentStep('');
      }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    let currentId = activeSessionId;
    let currentSession = sessions.find(s => s.id === currentId);
    if (!currentId || !currentSession || currentSession.isDeleted) {
        // Just creates logic locally, firestore sync handles rest
        const newId = Date.now().toString(); 
        currentId = newId;
        currentSession = { id: newId, title: 'New Session', messages: [], lastModified: Date.now(), isDeleted: false };
        await saveChatSession(currentSession);
        setActiveSessionId(newId);
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputText, timestamp: Date.now() };
    const updatedMessages = [...currentSession.messages, userMsg];
    await saveChatSession({ ...currentSession, messages: updatedMessages, lastModified: Date.now() });
    
    setInputText('');
    setIsTyping(true);
    setCurrentAgentStep('');
    
    // Title Gen logic same as before
    const userMessagesCount = updatedMessages.filter(m => m.role === 'user').length;
    if (userMessagesCount === 1) {
        generateChatTitle(userMsg.text, language).then(async (newTitle) => {
            const fresh = sessions.find(s => s.id === currentId);
            if (fresh) await saveChatSession({ ...fresh, title: newTitle });
        });
    }

    try {
        if (isAgenticMode) {
            const botMsgId = (Date.now() + 1).toString();
            const placeholderMsg: ChatMessage = { id: botMsgId, role: 'model', text: '', timestamp: Date.now(), isTyping: true, isAgentic: true };
            await saveChatSession({ ...currentSession, messages: [...updatedMessages, placeholderMsg] });

            const result = await runAgenticWorkflow(userMsg.text, language, (step) => setCurrentAgentStep(step), abortControllerRef.current.signal);
            
            if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
                const finalMsg: ChatMessage = { ...placeholderMsg, text: result.text, sources: result.sources, isTyping: false };
                await saveChatSession({ ...currentSession, messages: [...updatedMessages, finalMsg], lastModified: Date.now() });
            }
        } else {
            const result = await chatSessionRef.current.sendMessageStream({ message: userMsg.text });
            let fullResponse = '';
            const botMsgId = (Date.now() + 1).toString();
            // Optimistic update omitted for brevity, logic same
            for await (const chunk of result) { if (abortControllerRef.current?.signal.aborted) break; if (chunk.text) fullResponse += chunk.text; }
            if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
                 const finalMsg: ChatMessage = { id: botMsgId, role: 'model', text: fullResponse, timestamp: Date.now(), isTyping: false };
                 await saveChatSession({ ...currentSession, messages: [...updatedMessages, finalMsg], lastModified: Date.now() });
            }
        }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
          console.error(error);
          const errorMsg: ChatMessage = { id: Date.now().toString(), role: 'model', text: "Connection interruption.", timestamp: Date.now() };
          await saveChatSession({ ...currentSession, messages: [...updatedMessages, errorMsg] });
      }
    } finally {
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) { setIsTyping(false); setCurrentAgentStep(''); }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };
  const handleDownloadMessage = async (msgId: string) => {
      const element = document.getElementById(`message-${msgId}`);
      if (!element) return;
      setDownloadingId(msgId);
      try {
          const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#020617', ignoreElements: (el) => el.classList.contains('no-capture') });
          const link = document.createElement('a'); link.href = canvas.toDataURL('image/png'); link.download = `Consultant_Advice.png`; link.click();
      } catch (err) { console.error(err); } finally { setDownloadingId(null); }
  };

  return (
    <div className="flex flex-row h-full w-full glass-panel rounded-[32px] overflow-hidden shadow-2xl relative border border-white/10 bg-[#020617]/50 backdrop-blur-2xl">
      
      {/* History Sidebar */}
      <HistorySidebar 
        isOpen={isHistoryOpen} 
        setIsOpen={setIsHistoryOpen}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => { setActiveSessionId(id); setIsHistoryOpen(false); }}
        onDeleteSession={deleteSession}
        onRestoreSession={restoreSession}
        viewMode={historyViewMode}
        setViewMode={setHistoryViewMode}
        onNewChat={createNewSession}
      />

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full relative z-10 w-full min-w-0">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
                 <button 
                    onClick={() => setIsHistoryOpen(true)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5"
                 >
                    <History size={20} />
                 </button>

                <div className={`
                    h-10 w-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 relative overflow-hidden group
                    ${isAgenticMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'}
                `}>
                     {/* Inner Glow */}
                     <div className={`absolute inset-0 opacity-50 blur-lg ${isAgenticMode ? 'bg-emerald-500' : 'bg-cyan-500'}`}></div>
                     <div className="relative z-10">
                        {isAgenticMode ? <BrainCircuit size={20} /> : <Sparkles size={20} />}
                     </div>
                </div>
                <div>
                    <h2 className="font-display font-bold text-lg text-white leading-none flex items-center gap-2">
                        {isAgenticMode ? 'Research_Agent' : 'Strategic_Advisor'}
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isAgenticMode ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]'}`}></div>
                    </h2>
                    <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-wider">
                        {isAgenticMode ? '5-Layer Reasoning Active' : 'Standard Inference Model'}
                    </p>
                </div>
            </div>

            <div className="flex gap-2">
                 <button
                    onClick={() => setIsAgenticMode(!isAgenticMode)}
                    disabled={isTyping}
                    className={`
                        hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all
                        ${isAgenticMode 
                            ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                            : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                        }
                    `}
                 >
                    <Globe size={12} />
                    {isAgenticMode ? 'Deep Research On' : 'Enable Research'}
                 </button>
            </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-[#020617]/50">
            {messages.map((msg) => (
            <div
                key={msg.id}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in group`}
            >
                <div className={`flex w-full ${msg.role === 'user' ? 'max-w-[85%]' : 'max-w-full md:max-w-[85%]'} gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className="flex-shrink-0 mt-1">
                    {msg.role === 'user' ? (
                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
                            <User size={16} />
                        </div>
                    ) : (
                        <div className={`
                            w-9 h-9 rounded-full flex items-center justify-center border shadow-[0_0_15px_rgba(0,0,0,0.3)]
                            ${msg.isAgentic 
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10' 
                                : 'bg-cyan-950 text-cyan-400 border-cyan-500/30 shadow-cyan-500/10'
                            }
                        `}>
                            {msg.isAgentic ? <BrainCircuit size={16} /> : <Bot size={16} />}
                        </div>
                    )}
                </div>
                
                {/* Bubble */}
                <div 
                    id={`message-${msg.id}`}
                    className={`
                    p-5 md:p-6 rounded-2xl text-sm leading-relaxed relative transition-all duration-300 w-full overflow-hidden
                    ${msg.role === 'user' 
                    ? 'bg-gradient-to-br from-cyan-600 to-teal-700 text-white rounded-tr-sm shadow-[0_5px_20px_rgba(8,145,178,0.3)] border border-cyan-400/20' 
                    : 'bg-[#0B0F19]/80 border border-white/10 text-slate-200 rounded-tl-sm shadow-xl backdrop-blur-sm'
                    }
                `}>
                    {msg.role !== 'user' && !msg.isTyping && (
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                {msg.isAgentic ? (
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                        <ShieldCheck size={10} /> Verified Data
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                                        <Zap size={10} /> Fast Inference
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2 no-capture opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                    onClick={() => handleDownloadMessage(msg.id)}
                                    disabled={downloadingId === msg.id}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                >
                                    {downloadingId === msg.id ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {msg.role === 'user' ? (
                        <div className="whitespace-pre-wrap font-medium text-[15px] drop-shadow-sm">{msg.text}</div>
                    ) : (
                        <>
                            {msg.isTyping && isAgenticMode && currentAgentStep ? (
                                <AgentProgress step={currentAgentStep} />
                            ) : (
                                <FormattedText text={msg.text} />
                            )}
                            {msg.sources && msg.sources.length > 0 && <SourcesPanel sources={msg.sources} />}
                        </>
                    )}

                    {msg.isTyping && !isAgenticMode && (
                         <div className="flex gap-1 h-4 items-center">
                            <span className="w-1 h-4 bg-cyan-400 animate-[pulse_1s_ease-in-out_infinite]"></span>
                            <span className="w-1 h-3 bg-cyan-400 animate-[pulse_1s_ease-in-out_0.2s_infinite]"></span>
                            <span className="w-1 h-2 bg-cyan-400 animate-[pulse_1s_ease-in-out_0.4s_infinite]"></span>
                         </div>
                    )}
                </div>
                </div>
            </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#020617] border-t border-white/10 shrink-0 relative z-20">
            <div className="relative flex items-end gap-3 w-full max-w-5xl mx-auto">
                <div className="relative flex-1 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={isAgenticMode ? t('chat.agentPlaceholder') : t('chat.inputPlaceholder')}
                        className={`
                            relative w-full border rounded-xl px-5 py-4 pr-10 font-medium focus:outline-none transition-all resize-none text-white placeholder:text-slate-600 text-sm leading-normal custom-scrollbar shadow-inner
                            ${isAgenticMode 
                                ? 'bg-emerald-950/20 border-emerald-500/30 focus:border-emerald-500/60 focus:bg-emerald-950/40' 
                                : 'bg-[#0B0F19] border-white/10 focus:border-cyan-500/50 focus:bg-[#0B0F19]'
                            }
                        `}
                        rows={1}
                        style={{ minHeight: '60px', maxHeight: '150px' }}
                    />
                </div>
                
                <button
                    onClick={isTyping ? handleStop : handleSendMessage}
                    disabled={!isTyping && !inputText.trim()}
                    className={`
                        h-[60px] w-[60px] flex items-center justify-center rounded-xl transition-all duration-300 shrink-0 shadow-lg group
                        ${isTyping
                        ? 'bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500/20'
                        : !inputText.trim() 
                            ? 'bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed' 
                            : isAgenticMode
                                ? 'bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-105 shadow-emerald-500/20'
                                : 'bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-105 shadow-cyan-500/20'
                        }
                    `}
                >
                    {isTyping ? <Square size={20} fill="currentColor" /> : <Send size={20} className={!inputText.trim() ? "" : "group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"} />}
                </button>
            </div>
            <div className="text-center mt-3">
                 <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-white/5 bg-white/5 text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                    {isAgenticMode ? <ShieldCheck size={10} className="text-emerald-500" /> : <Code2 size={10} className="text-cyan-500" />}
                    {isAgenticMode ? 'Encrypted Research Tunnel' : 'Secure Chat Protocol'}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};
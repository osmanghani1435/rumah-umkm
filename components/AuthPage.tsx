import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle, AlertCircle, Loader2, Globe, Shield, Activity } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { auth } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';

interface AuthPageProps {
  onLogin: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false); // false = Login Mode, true = Register Mode
  const [isForgot, setIsForgot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Clear state on toggle
  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
    setShowPassword(false);
    if (isSignUp) setIsForgot(false);
  }, [isSignUp]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    
    try {
      if (isForgot) {
        await sendPasswordResetEmail(auth, email);
        setSuccessMsg("Recovery link sent to your email.");
        setIsLoading(false);
        return;
      }

      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
        onLogin();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onLogin();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message.replace('Firebase:', '').trim());
      setIsLoading(false);
    }
  };

  // Logos - Using high reliability CDN
  const logos = [
      "https://www.svgrepo.com/show/475656/google-color.svg",
      "https://www.svgrepo.com/show/475684/spotify-color.svg",
      "https://www.svgrepo.com/show/452263/microsoft.svg",
      "https://www.svgrepo.com/show/349266/amazon.svg"
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-cyber-grid bg-grid-pattern opacity-10 animate-pulse-slow pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-teal-500/10 rounded-full blur-[120px] mix-blend-screen opacity-20 pointer-events-none"></div>

      {/* Main Container */}
      <div className="relative bg-[#0B0F19] rounded-[30px] shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden w-full max-w-[1100px] min-h-[650px] border border-white/10 m-4 flex">

          {/* --- SIGN UP FORM (Left Side) --- */}
          {/* It is technically always on the left, but covered by overlay when !isSignUp */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center items-center relative z-10 transition-all duration-700 bg-[#0B0F19]">
               <div className={`w-full max-w-sm transition-all duration-700 ${isSignUp ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20 pointer-events-none fixed'}`}>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-display font-bold text-white mb-2">{t('auth.createAccount')}</h2>
                        <div className="flex justify-center gap-4 my-4">
                             {logos.map((logo, i) => (
                                 <div key={i} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center p-2 cursor-pointer hover:scale-110 transition-transform">
                                     <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                                 </div>
                             ))}
                        </div>
                        <p className="text-slate-500 text-xs">or use your email for registration</p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="bg-[#131722] border border-white/10 rounded-xl flex items-center px-4 py-3 gap-3 focus-within:border-cyan-500/50 transition-colors">
                            <User size={18} className="text-slate-500" />
                            <input type="text" placeholder="Name" className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-600" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="bg-[#131722] border border-white/10 rounded-xl flex items-center px-4 py-3 gap-3 focus-within:border-cyan-500/50 transition-colors">
                            <Mail size={18} className="text-slate-500" />
                            <input type="email" placeholder="Email" className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-600" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="bg-[#131722] border border-white/10 rounded-xl flex items-center px-4 py-3 gap-3 focus-within:border-cyan-500/50 transition-colors">
                            <Lock size={18} className="text-slate-500" />
                            <input type="password" placeholder="Password" className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-600" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>

                        {error && <div className="text-red-400 text-xs text-center font-bold">{error}</div>}

                        <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform">
                            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : t('auth.btnRegister')}
                        </button>
                    </form>

                    {/* Mobile Toggle */}
                    <div className="mt-6 text-center lg:hidden">
                        <p className="text-slate-400 text-sm">Already have an account? <button onClick={() => setIsSignUp(false)} className="text-cyan-400 font-bold">Sign In</button></p>
                    </div>
               </div>
          </div>

          {/* --- SIGN IN FORM (Right Side) --- */}
          {/* Always on right, covered by overlay when isSignUp */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center items-center relative z-10 bg-[#0B0F19]">
               <div className={`w-full max-w-sm transition-all duration-700 ${!isSignUp ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20 pointer-events-none fixed'}`}>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-display font-bold text-white mb-2">{isForgot ? t('auth.forgotTitle') : t('auth.loginTitle')}</h2>
                        
                        {!isForgot && (
                            <>
                                <div className="flex justify-center gap-4 my-4">
                                     {logos.map((logo, i) => (
                                         <div key={i} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center p-2 cursor-pointer hover:scale-110 transition-transform">
                                             <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                                         </div>
                                     ))}
                                </div>
                                <p className="text-slate-500 text-xs">or use your email account</p>
                            </>
                        )}
                        {isForgot && <p className="text-slate-400 text-sm">{t('auth.forgotSubtitle')}</p>}
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="bg-[#131722] border border-white/10 rounded-xl flex items-center px-4 py-3 gap-3 focus-within:border-cyan-500/50 transition-colors">
                            <Mail size={18} className="text-slate-500" />
                            <input type="email" placeholder="Email" className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-600" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        
                        {!isForgot && (
                            <div className="bg-[#131722] border border-white/10 rounded-xl flex items-center px-4 py-3 gap-3 focus-within:border-cyan-500/50 transition-colors">
                                <Lock size={18} className="text-slate-500" />
                                <input type={showPassword ? "text" : "password"} placeholder="Password" className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-600" value={password} onChange={e => setPassword(e.target.value)} required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-white">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        )}

                        {!isForgot && (
                             <div className="flex justify-end">
                                 <button type="button" onClick={() => setIsForgot(true)} className="text-xs text-slate-400 hover:text-cyan-400 font-bold">{t('auth.forgotPass')}</button>
                             </div>
                        )}

                        {error && <div className="text-red-400 text-xs text-center font-bold">{error}</div>}
                        {successMsg && <div className="text-emerald-400 text-xs text-center font-bold">{successMsg}</div>}

                        <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform">
                            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : (isForgot ? t('auth.btnRecover') : t('auth.btnLogin'))}
                        </button>
                        
                        {isForgot && <button type="button" onClick={() => setIsForgot(false)} className="w-full text-xs text-slate-400 font-bold uppercase hover:text-white">{t('auth.backLogin')}</button>}
                    </form>

                    {/* Trigger to Slide to Sign Up */}
                    {!isForgot && (
                        <div className="mt-8 text-center">
                            <p className="text-slate-400 text-sm">
                                {t('auth.newHere')} <button onClick={() => setIsSignUp(true)} className="text-cyan-400 font-bold ml-1 hover:underline">{t('auth.createAccount')}</button>
                            </p>
                        </div>
                    )}
                    
                    {/* Mobile Toggle */}
                    <div className="mt-4 text-center lg:hidden">
                        <p className="text-slate-400 text-sm">Don't have an account? <button onClick={() => setIsSignUp(true)} className="text-cyan-400 font-bold">Sign Up</button></p>
                    </div>
               </div>
          </div>

          {/* --- OVERLAY CONTAINER --- */}
          {/* Slides from Left (covering SignUp) to Right (covering SignIn) */}
          <div className={`hidden lg:block absolute top-0 left-0 h-full w-1/2 overflow-hidden transition-transform duration-700 ease-in-out z-50 ${isSignUp ? 'translate-x-full' : 'translate-x-0'}`}>
               <div className="bg-gradient-to-br from-cyan-900 via-slate-900 to-teal-900 h-full w-full relative border-r border-white/10">
                   {/* Background Effects */}
                   <div className="absolute inset-0 bg-cyber-grid opacity-20"></div>
                   <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/40"></div>
                   
                   {/* Left Panel Content (Visible when Overlay is on Left -> Standard Login View) */}
                   {/* Wait, if overlay is on LEFT, it covers the LEFT side (Sign Up). We see Right Side (Sign In). */}
                   {/* So this panel should entice user to SIGN UP? No, if we see Sign In form, the overlay usually sits next to it. */}
                   {/* If I am on the Login Page (Right Form Visible), the Overlay is on the Left. The text on the overlay should say "Hello Friend, Enter your personal details". */}
                   <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-12 transition-transform duration-700 ${isSignUp ? 'translate-x-[-20%]' : 'translate-x-0'}`}>
                        {/* Content shown when overlay is on the Left (Default) */}
                        <div className={`transition-opacity duration-500 ${!isSignUp ? 'opacity-100 delay-200' : 'opacity-0 absolute'}`}>
                            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20 shadow-2xl mx-auto">
                                <Sparkles size={40} className="text-white" />
                            </div>
                            <h1 className="text-4xl font-display font-bold text-white mb-4">{t('auth.heroTitle1')}</h1>
                            <p className="text-slate-300 mb-8 max-w-xs mx-auto leading-relaxed">
                                {t('auth.heroDesc')}
                            </p>
                            
                            <div className="flex justify-center gap-2">
                                <div className="px-4 py-2 rounded-lg bg-black/20 border border-white/10 backdrop-blur-md">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Security</p>
                                    <p className="text-emerald-400 font-bold text-sm">Enterprise</p>
                                </div>
                                <div className="px-4 py-2 rounded-lg bg-black/20 border border-white/10 backdrop-blur-md">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Uptime</p>
                                    <p className="text-cyan-400 font-bold text-sm">99.9%</p>
                                </div>
                            </div>
                            
                            {/* Standard Sliding Login often has a button here to switch, but user asked for trigger inside the form. 
                                We can keep a secondary trigger here or just decor. Let's add a "Sign Up" button as alternative trigger. */}
                             <div className="mt-8 pt-8 border-t border-white/10 w-full">
                                <p className="text-slate-400 text-sm mb-4">Don't have an account?</p>
                                <button onClick={() => setIsSignUp(true)} className="px-8 py-3 rounded-full border border-white/30 hover:bg-white hover:text-black transition-all text-white font-bold uppercase text-xs tracking-widest">
                                    Sign Up
                                </button>
                             </div>
                        </div>

                        {/* Content shown when overlay is on the Right (Register Mode) */}
                        <div className={`transition-opacity duration-500 ${isSignUp ? 'opacity-100 delay-200' : 'opacity-0 absolute'}`}>
                            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20 shadow-2xl mx-auto">
                                <Globe size={40} className="text-white" />
                            </div>
                            <h1 className="text-4xl font-display font-bold text-white mb-4">Welcome Back!</h1>
                            <p className="text-slate-300 mb-8 max-w-xs mx-auto leading-relaxed">
                                To keep connected with us please login with your personal info
                            </p>
                            
                            <div className="mt-8 pt-8 border-t border-white/10 w-full">
                                <p className="text-slate-400 text-sm mb-4">Already have an account?</p>
                                <button onClick={() => setIsSignUp(false)} className="px-8 py-3 rounded-full border border-white/30 hover:bg-white hover:text-black transition-all text-white font-bold uppercase text-xs tracking-widest">
                                    Sign In
                                </button>
                             </div>
                        </div>
                   </div>
               </div>
          </div>

      </div>
    </div>
  );
};


import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'id';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Sidebar
    'nav.overview': 'Overview',
    'nav.consultant': 'AI Consultant',
    'nav.education': 'Education Hub',
    'nav.marketing': 'Marketing Suite',
    'nav.mainMenu': 'Main Menu',
    'nav.developer': 'Developer Info',
    'nav.settings': 'Settings',
    'nav.proPlan': 'Pro Plan',
    
    // Settings & Preferences
    'settings.title': 'Settings & Keys',
    'settings.subtitle': 'Manage your application preferences and API keys.',
    'settings.preferences': 'Preferences',
    'settings.account': 'Account',
    'settings.dark': 'Dark Mode',
    'settings.light': 'Light Mode',
    'settings.lang': 'Language',
    'settings.logout': 'Sign Out',
    'settings.profile': 'Profile',
    'settings.keys': 'API Key Manager',
    'settings.addKey': 'Add New API Key',
    'settings.verifySave': 'Verify & Securely Save',
    'settings.verifySuccess': 'Key verified and activated successfully!',
    'settings.verifyError': 'Verification failed. Please check the key.',
    'settings.yourKeys': 'Your Secure Keys',
    'settings.autoSwitch': 'Smart Quota Rotation',
    'settings.autoSwitchDesc': 'When an API key reaches its usage limit (Error 429), the system automatically switches to the next available verified key in your list to ensure uninterrupted service.',

    // Dashboard
    'dash.welcome': 'Business Simulated.',
    'dash.subtitle': 'Experience the future of strategic planning. Enter your business concept and watch our 5-Layer Agentic AI generate a comprehensive operational simulation.',
    'dash.placeholder': 'e.g. Specialty Coffee Shop in Jakarta',
    'dash.btn.simulate': 'Simulate',
    'dash.loading': 'INITIALIZING_SYSTEM...',
    'dash.execOverview': 'Executive Overview',
    'dash.verified': 'Verified Simulation',
    'dash.newSim': 'New Simulation',
    'dash.stratIntel': 'Strategic Intelligence',
    'dash.viewSources': 'View Verified Sources',
    'dash.hideSources': 'Hide Sources',
    'dash.totalRev': 'Total Revenue',
    'dash.activeCust': 'Active Customers',
    'dash.nps': 'NPS Score',
    'dash.health': 'Health Index',
    'dash.finPerf': 'Financial Performance',
    'dash.userAcq': 'User Acquisition',
    'dash.newUsers': 'New Users',
    'dash.downloadImg': 'Download Image',
    
    // Consultant
    'chat.title': 'Strategic Advisor',
    'chat.agentTitle': 'Deep Research Agent',
    'chat.subtitle': 'Online • Standard Mode',
    'chat.agentSubtitle': 'Online • 5-Layer Reasoning',
    'chat.enableAgent': 'Enable Research',
    'chat.agentActive': 'Agent Active',
    'chat.inputPlaceholder': 'Ask your strategic question...',
    'chat.agentPlaceholder': 'Ask a complex question requiring research...',
    'chat.disclaimer': 'AI can make mistakes. Please verify important information.',
    'chat.agentDisclaimer': 'Multi-Layer Research Mode Active. Responses may take longer.',
    'chat.welcome': '**Hello, Executive.** I am your strategic AI advisor.\n\nI can assist with:\n* Market Analysis & Strategy\n* Financial Forecasting\n* Operational Efficiency',
    
    // Education
    'edu.title': 'Master Your Market Niche.',
    'edu.subtitle': 'Generate a personalized MBA-level curriculum tailored specifically to your business.',
    'edu.placeholder': 'e.g. Sustainable Fashion Brand',
    'edu.btn.generate': 'Generate Path',
    'edu.pathTitle': 'Your Learning Path',
    'edu.modules': 'Modules',
    'edu.startModule': 'Start Module',
    'edu.complete': 'Complete Lesson',
    'edu.generating': 'Generating personalized lesson content...',
    'edu.view': 'Curriculum View',
    
    // Marketing
    'mkt.title': 'Content Studio',
    'mkt.subtitle': 'Viral marketing generator',
    'mkt.product': 'Product / Brand',
    'mkt.productPlaceholder': 'e.g. Neon Energy Drink',
    'mkt.platform': 'Platform',
    'mkt.audience': 'Target Audience & Vibe',
    'mkt.audiencePlaceholder': 'Describe ideal customer and tone (e.g. Gen Z, energetic)...',
    'mkt.btn.generate': 'Generate Copy',
    'mkt.btn.generating': 'Generating Magic...',
    'mkt.emptyTitle': 'Canvas Empty',
    'mkt.emptyDesc': 'Fill out the creative brief to invoke the AI copywriting engine.',
    'mkt.brief': 'Brief',
    'mkt.result': 'Result',
    'mkt.response': 'AI Response',
    'mkt.copy': 'Copy Text',
    'mkt.copied': 'Copied',
    'mkt.downloadImg': 'Save Image',

    // Developer
    'dev.title': 'Developer Information',
    'dev.subtitle': 'About the creator and the application',
    'dev.aboutDev': 'About the Developer',
    'dev.aboutApp': 'About This App',
    'dev.name': 'Osman Ghani',
    'dev.contact': 'Contact / Social',
    'dev.desc': 'This application is a comprehensive AI-powered platform designed to educate, mentor, and empower Micro, Small, and Medium Enterprises (MSMEs).',

    // Auth Page
    'auth.heroTitle1': 'Business Intelligence',
    'auth.heroTitle2': 'Reimagined.',
    'auth.heroDesc': 'Join thousands of MSMEs using 5-layer agentic AI to predict trends, generate content, and scale operations.',
    'auth.securityTitle': 'Enterprise-Grade Security',
    'auth.securityDesc': 'Your business data is encrypted and protected with state-of-the-art protocols.',
    'auth.trusted': 'Trusted by 10,000+ Businesses',
    'auth.registerTitle': 'Create Account',
    'auth.loginTitle': 'Welcome Back',
    'auth.forgotTitle': 'Reset Password',
    'auth.registerSubtitle': 'Start your 14-day free trial. No credit card required.',
    'auth.loginSubtitle': 'Enter your credentials to access your dashboard.',
    'auth.forgotSubtitle': 'Enter your email to receive a recovery link.',
    'auth.labelName': 'Full Name',
    'auth.labelEmail': 'Email Address',
    'auth.labelPassword': 'Password',
    'auth.forgotPass': 'Forgot Password?',
    'auth.btnRegister': 'Create Free Account',
    'auth.btnLogin': 'Sign In',
    'auth.btnRecover': 'Send Recovery Link',
    'auth.haveAccount': 'Already have an account?',
    'auth.signIn': 'Sign In',
    'auth.newHere': 'New to Rumah UMKM?',
    'auth.createAccount': 'Create Account',
    'auth.backLogin': 'Back to Login',
  },
  id: {
    // Sidebar
    'nav.overview': 'Ringkasan',
    'nav.consultant': 'Konsultan AI',
    'nav.education': 'Pusat Edukasi',
    'nav.marketing': 'Suite Pemasaran',
    'nav.mainMenu': 'Menu Utama',
    'nav.developer': 'Info Pengembang',
    'nav.settings': 'Pengaturan',
    'nav.proPlan': 'Paket Pro',
    
    // Settings
    'settings.title': 'Pengaturan & Kunci',
    'settings.subtitle': 'Kelola preferensi aplikasi dan kunci API Anda.',
    'settings.preferences': 'Preferensi',
    'settings.account': 'Akun',
    'settings.dark': 'Mode Gelap',
    'settings.light': 'Mode Terang',
    'settings.lang': 'Bahasa',
    'settings.logout': 'Keluar',
    'settings.profile': 'Profil',
    'settings.keys': 'Manajer Kunci API',
    'settings.addKey': 'Tambah Kunci API Baru',
    'settings.verifySave': 'Verifikasi & Simpan Aman',
    'settings.verifySuccess': 'Kunci berhasil diverifikasi dan diaktifkan!',
    'settings.verifyError': 'Verifikasi gagal. Mohon periksa kunci.',
    'settings.yourKeys': 'Kunci Aman Anda',
    'settings.autoSwitch': 'Rotasi Kuota Pintar',
    'settings.autoSwitchDesc': 'Ketika kunci API mencapai batas penggunaan (Error 429), sistem otomatis beralih ke kunci terverifikasi berikutnya dalam daftar Anda untuk memastikan layanan tanpa gangguan.',

    // Dashboard
    'dash.welcome': 'Simulasi Bisnis.',
    'dash.subtitle': 'Rasakan masa depan perencanaan strategis. Masukkan konsep bisnis Anda dan saksikan AI Agentic 5-Lapis kami menghasilkan simulasi operasional yang komprehensif.',
    'dash.placeholder': 'misal: Kedai Kopi Spesial di Jakarta',
    'dash.btn.simulate': 'Simulasi',
    'dash.loading': 'MEMULAI_SISTEM...',
    'dash.execOverview': 'Ringkasan Eksekutif',
    'dash.verified': 'Simulasi Terverifikasi',
    'dash.newSim': 'Simulasi Baru',
    'dash.stratIntel': 'Intelijen Strategis',
    'dash.viewSources': 'Lihat Sumber Terverifikasi',
    'dash.hideSources': 'Sembunyikan Sumber',
    'dash.totalRev': 'Total Pendapatan',
    'dash.activeCust': 'Pelanggan Aktif',
    'dash.nps': 'Skor NPS',
    'dash.health': 'Indeks Kesehatan',
    'dash.finPerf': 'Kinerja Keuangan',
    'dash.userAcq': 'Akuisisi Pengguna',
    'dash.newUsers': 'Pengguna Baru',
    'dash.downloadImg': 'Unduh Gambar',

    // Consultant
    'chat.title': 'Penasihat Strategis',
    'chat.agentTitle': 'Agen Riset Mendalam',
    'chat.subtitle': 'Online • Mode Standar',
    'chat.agentSubtitle': 'Online • Penalaran 5-Lapis',
    'chat.enableAgent': 'Aktifkan Riset',
    'chat.agentActive': 'Agen Aktif',
    'chat.inputPlaceholder': 'Tanyakan pertanyaan strategis Anda...',
    'chat.agentPlaceholder': 'Tanyakan pertanyaan kompleks yang butuh riset...',
    'chat.disclaimer': 'AI bisa membuat kesalahan. Harap verifikasi informasi penting.',
    'chat.agentDisclaimer': 'Mode Riset Multi-Lapis Aktif. Respon mungkin lebih lama.',
    'chat.welcome': '**Halo, Eksekutif.** Saya penasihat strategi AI Anda.\n\nSaya dapat membantu dengan:\n* Analisis Pasar & Strategi\n* Perkiraan Keuangan\n* Efisiensi Operasional',

    // Education
    'edu.title': 'Kuasai Ceruk Pasar Anda.',
    'edu.subtitle': 'Hasilkan kurikulum setara MBA yang dipersonalisasi khusus untuk bisnis Anda.',
    'edu.placeholder': 'misal: Merek Mode Berkelanjutan',
    'edu.btn.generate': 'Buat Jalur Belajar',
    'edu.pathTitle': 'Jalur Pembelajaran Anda',
    'edu.modules': 'Modul',
    'edu.startModule': 'Mulai Modul',
    'edu.complete': 'Selesaikan Pelajaran',
    'edu.generating': 'Membuat konten pelajaran yang dipersonalisasi...',
    'edu.view': 'Tampilan Kurikulum',

    // Marketing
    'mkt.title': 'Studio Konten',
    'mkt.subtitle': 'Generator pemasaran viral',
    'mkt.product': 'Produk / Merek',
    'mkt.productPlaceholder': 'misal: Minuman Energi Neon',
    'mkt.platform': 'Platform',
    'mkt.audience': 'Target Audiens & Suasana',
    'mkt.audiencePlaceholder': 'Jelaskan pelanggan ideal dan nada yang diinginkan (misal: Gen Z, energik)...',
    'mkt.btn.generate': 'Buat Salinan',
    'mkt.btn.generating': 'Sedang Membuat...',
    'mkt.emptyTitle': 'Kanvas Kosong',
    'mkt.emptyDesc': 'Isi brief kreatif untuk memanggil mesin copywriting AI.',
    'mkt.brief': 'Brief',
    'mkt.result': 'Hasil',
    'mkt.response': 'Respon AI',
    'mkt.copy': 'Salin Teks',
    'mkt.copied': 'Disalin',
    'mkt.downloadImg': 'Simpan Gambar',

    // Developer
    'dev.title': 'Informasi Pengembang',
    'dev.subtitle': 'Tentang pembuat dan aplikasi',
    'dev.aboutDev': 'Tentang Pengembang',
    'dev.aboutApp': 'Tentang Aplikasi Ini',
    'dev.name': 'Osman Ghani',
    'dev.contact': 'Kontak / Sosial',
    'dev.desc': 'Aplikasi ini adalah platform komprehensif berbasis AI yang dirancang untuk mendidik, membimbing, dan memberdayakan Usaha Mikro, Kecil, dan Menengah (UMKM).',

    // Auth Page
    'auth.heroTitle1': 'Kecerdasan Bisnis',
    'auth.heroTitle2': 'Ditata Ulang.',
    'auth.heroDesc': 'Bergabunglah dengan ribuan UMKM yang menggunakan AI agentic 5-lapis untuk memprediksi tren, membuat konten, dan mengembangkan operasi.',
    'auth.securityTitle': 'Keamanan Tingkat Perusahaan',
    'auth.securityDesc': 'Data bisnis Anda dienkripsi dan dilindungi dengan protokol tercanggih.',
    'auth.trusted': 'Dipercaya oleh 10.000+ Bisnis',
    'auth.registerTitle': 'Buat Akun',
    'auth.loginTitle': 'Selamat Datang Kembali',
    'auth.forgotTitle': 'Atur Ulang Kata Sandi',
    'auth.registerSubtitle': 'Mulai uji coba gratis 14 hari Anda. Tidak perlu kartu kredit.',
    'auth.loginSubtitle': 'Masukkan kredensial Anda untuk mengakses dasbor.',
    'auth.forgotSubtitle': 'Masukkan email Anda untuk menerima tautan pemulihan.',
    'auth.labelName': 'Nama Lengkap',
    'auth.labelEmail': 'Alamat Email',
    'auth.labelPassword': 'Kata Sandi',
    'auth.forgotPass': 'Lupa Kata Sandi?',
    'auth.btnRegister': 'Buat Akun Gratis',
    'auth.btnLogin': 'Masuk',
    'auth.btnRecover': 'Kirim Tautan Pemulihan',
    'auth.haveAccount': 'Sudah punya akun?',
    'auth.signIn': 'Masuk',
    'auth.newHere': 'Baru di Rumah UMKM?',
    'auth.createAccount': 'Buat Akun',
    'auth.backLogin': 'Kembali ke Masuk',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('umkm_app_language');
      return (saved === 'en' || saved === 'id') ? saved : 'en';
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('umkm_app_language', lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

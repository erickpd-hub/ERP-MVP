import React from 'react';
import { Sidebar } from './Sidebar';
import { CommandPalette } from './CommandPalette';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../lib/i18n';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      <main className="flex-1 relative">
        <header className="h-16 border-b border-neutral-200 flex items-center justify-between px-8 sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center text-xs text-neutral-400 uppercase tracking-widest font-medium">
            <span>Nexus</span>
            <span className="mx-2">/</span>
            <span className="text-black">{t(`nav.${location.pathname.substring(1) || 'dashboard'}`)}</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="px-3 py-1.5 hover:bg-neutral-50 transition-colors rounded-none border border-neutral-200"
              title={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest">{language === 'en' ? 'ES' : 'EN'}</span>
            </button>
            <button className="text-[10px] border border-neutral-200 bg-white px-3 py-1.5 rounded-none font-semibold uppercase tracking-widest hover:border-neutral-400 transition-all">
              Ctrl + K
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="p-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>
        
        <CommandPalette />
      </main>
    </div>
  );
}

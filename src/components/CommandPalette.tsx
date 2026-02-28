import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { Search, Package, ShoppingCart, FileText, Users, Settings, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../lib/i18n';

export function CommandPalette() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/10 backdrop-blur-sm"
    >
      <div className="w-full max-w-xl bg-white border border-neutral-200 rounded-none overflow-hidden">
        <div className="flex items-center px-4 border-b border-neutral-100">
          <Search className="w-4 h-4 text-neutral-400 mr-3" />
          <Command.Input
            placeholder={t('cmd.search_placeholder')}
            className="w-full py-4 text-sm outline-none placeholder:text-neutral-400"
          />
        </div>
        <Command.List className="max-h-[400px] overflow-y-auto p-2">
          <Command.Empty className="py-12 text-center text-sm text-neutral-400">{t('cmd.no_results')}</Command.Empty>
          
          <Command.Group heading={t('cmd.navigation')} className="px-2 py-2 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
            <Command.Item onSelect={() => runCommand(() => navigate('/inventory'))} className="flex items-center px-3 py-2 text-sm font-medium rounded-none cursor-pointer hover:bg-neutral-50 aria-selected:bg-neutral-100 transition-colors">
              <Package className="w-4 h-4 mr-3 text-neutral-400" />
              <span>{t('nav.inventory')}</span>
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => navigate('/pos'))} className="flex items-center px-3 py-2 text-sm font-medium rounded-none cursor-pointer hover:bg-neutral-50 aria-selected:bg-neutral-100 transition-colors">
              <ShoppingCart className="w-4 h-4 mr-3 text-neutral-400" />
              <span>{t('nav.pos')}</span>
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => navigate('/payroll'))} className="flex items-center px-3 py-2 text-sm font-medium rounded-none cursor-pointer hover:bg-neutral-50 aria-selected:bg-neutral-100 transition-colors">
              <Users className="w-4 h-4 mr-3 text-neutral-400" />
              <span>{t('nav.payroll')}</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading={t('cmd.settings')} className="px-2 py-2 text-[10px] uppercase tracking-widest text-neutral-400 font-bold mt-2">
            <Command.Item onSelect={() => runCommand(() => navigate('/admin'))} className="flex items-center px-3 py-2 text-sm font-medium rounded-none cursor-pointer hover:bg-neutral-50 aria-selected:bg-neutral-100 transition-colors">
              <Settings className="w-4 h-4 mr-3 text-neutral-400" />
              <span>{t('nav.admin')}</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
        <div className="p-2 border-t border-neutral-100 bg-neutral-50 flex justify-end">
          <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest">{t('cmd.esc_close')}</span>
        </div>
      </div>
    </Command.Dialog>
  );
}

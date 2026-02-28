import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, ShoppingBag, FileText, Users, Briefcase, History, LogOut, Settings, Languages } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';

export function Sidebar() {
  const [user, setUser] = useState<any>(null);
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/' },
    { icon: Package, label: t('nav.inventory'), path: '/inventory' },
    { icon: ShoppingCart, label: t('nav.pos'), path: '/pos' },
    { icon: ShoppingBag, label: t('nav.purchases'), path: '/purchases' },
    { icon: FileText, label: t('nav.billing'), path: '/billing' },
    { icon: Briefcase, label: t('nav.payroll'), path: '/payroll' },
    { icon: Settings, label: t('nav.admin'), path: '/admin' },
    { icon: History, label: t('nav.audit'), path: '/audit' },
  ];

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  return (
    <aside className="w-64 border-r border-neutral-200 flex flex-col h-screen sticky top-0 bg-white">
      <div className="p-8">
        <h1 className="text-xl font-bold tracking-tight uppercase">Nexus ERP</h1>
        <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1 font-medium">{t('common.enterprise_core')}</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "relative flex items-center px-4 py-2.5 text-sm font-medium transition-all rounded-none group",
              isActive 
                ? "text-white" 
                : "text-neutral-500 hover:text-black"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-black z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={cn("w-4 h-4 mr-3 relative z-10", isActive ? "text-white" : "text-neutral-500 group-hover:text-black")} />
                <span className="relative z-10">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center px-4 py-3 rounded-none bg-neutral-50 border border-neutral-100">
          <div className="w-8 h-8 bg-white border border-neutral-200 rounded-none flex items-center justify-center text-[10px] font-bold mr-3">
            {user?.name?.split(' ').map((n: any) => n[0]).join('') || '??'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name || t('common.loading')}</p>
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-medium">{user?.organization?.name || 'Nexus Org'}</p>
          </div>
          <button className="text-neutral-400 hover:text-black transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

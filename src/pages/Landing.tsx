import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Zap, Shield, BarChart3 } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

export function Landing() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 font-sans selection:bg-black selection:text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-8 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black rounded-none flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight uppercase">Nexus</span>
        </div>
        <div className="hidden md:flex items-center space-x-12 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          <a href="#features" className="hover:text-black transition-colors">{t('land.features')}</a>
          <a href="#pricing" className="hover:text-black transition-colors">{t('land.pricing')}</a>
          <a href="#about" className="hover:text-black transition-colors">{t('land.about')}</a>
        </div>
        <Link to="/onboarding" className="btn-primary px-8">{t('land.get_started')}</Link>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-block px-4 py-1.5 bg-neutral-100 rounded-none text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            {t('land.hero_tag')}
          </div>
          <h2 className="text-6xl md:text-8xl font-bold leading-[0.9] tracking-tight uppercase whitespace-pre-line">
            {t('land.hero_title')}
          </h2>
          <p className="text-lg text-neutral-500 font-medium max-w-md">
            {t('land.hero_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/onboarding" className="btn-primary px-12 py-4 text-center">{t('land.start_trial')}</Link>
            <button className="px-12 py-4 text-sm font-bold uppercase tracking-widest hover:bg-neutral-100 rounded-none transition-all">{t('land.view_demo')}</button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-black/5 rounded-none blur-2xl"></div>
          <div className="relative bg-white border border-neutral-200 rounded-none p-8">
            <div className="aspect-video bg-neutral-50 rounded-none flex items-center justify-center border border-neutral-100">
              <BarChart3 className="w-24 h-24 text-neutral-200" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-8 py-24 border-y border-neutral-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-16 tracking-tight uppercase">{t('land.core_modules')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Zap, title: t('land.pos_title'), desc: t('land.pos_desc') },
              { icon: Shield, title: t('land.audit_title'), desc: t('land.audit_desc') },
              { icon: BarChart3, title: t('land.kpi_title'), desc: t('land.kpi_desc') },
            ].map((f, i) => (
              <div key={i} className="space-y-4">
                <div className="w-12 h-12 bg-neutral-50 rounded-none flex items-center justify-center border border-neutral-100">
                  <f.icon className="w-6 h-6 text-black" />
                </div>
                <h4 className="text-lg font-bold uppercase tracking-tight">{f.title}</h4>
                <p className="text-sm text-neutral-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-8 py-24 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-16 tracking-tight text-center uppercase">{t('land.pricing')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-12">
            <div className="card-base space-y-8 flex flex-col">
              <div>
                <h4 className="text-xl font-bold uppercase tracking-tight">{t('billing.free_plan')}</h4>
                <p className="text-sm text-neutral-500 font-medium">{t('land.free_desc')}</p>
              </div>
              <div className="text-5xl font-black">$0<span className="text-lg font-bold text-neutral-400">/{t('billing.month')}</span></div>
              <ul className="space-y-4 text-sm font-medium text-neutral-500 flex-1">
                <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-emerald-500" /> 1 {t('onboarding.org_label')}</li>
                <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-emerald-500" /> 3 {t('admin.team_members')}</li>
                <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-emerald-500" /> {t('land.pos_title')}</li>
              </ul>
              <button className="w-full py-4 rounded-none text-sm font-bold uppercase tracking-widest bg-neutral-100 text-black hover:bg-neutral-200 transition-all">{t('land.current_plan')}</button>
            </div>
            <div className="card-base space-y-8 bg-black text-white border-none flex flex-col scale-105">
              <div>
                <h4 className="text-xl font-bold uppercase tracking-tight">{t('admin.pro_plan')}</h4>
                <p className="text-sm text-neutral-400 font-medium">{t('land.pro_desc')}</p>
              </div>
              <div className="text-5xl font-black">$49<span className="text-lg font-bold text-neutral-500">/{t('billing.month')}</span></div>
              <ul className="space-y-4 text-sm font-medium text-neutral-400 flex-1">
                <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-emerald-400" /> {t('admin.unlimited_users')}</li>
                <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-emerald-400" /> {t('land.audit_title')}</li>
                <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-emerald-400" /> {t('pay.title')}</li>
                <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-emerald-400" /> {t('admin.custom_domains')}</li>
              </ul>
              <button className="w-full py-4 rounded-none text-sm font-bold uppercase tracking-widest bg-white text-black hover:bg-neutral-100 transition-all active:scale-95">{t('land.go_pro')}</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 border-t border-neutral-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span className="text-lg font-bold tracking-tight uppercase">Nexus ERP</span>
          </div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">© 2024 NEXUS CORP. {t('land.rights')}</p>
          <div className="flex space-x-8 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

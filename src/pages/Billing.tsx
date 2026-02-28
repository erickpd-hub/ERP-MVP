import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Zap, Shield, Globe, Mail } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';

export function Billing() {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  const plans = [
    {
      name: t('billing.free_plan'),
      price: '$0',
      description: t('billing.free_desc'),
      features: [
        t('billing.feat.products_100'),
        t('billing.feat.user_1'),
        t('billing.feat.basic_analytics'),
        t('billing.feat.community_support')
      ],
      current: user?.organization?.plan === 'FREE'
    },
    {
      name: t('admin.pro_plan'),
      price: '$49',
      description: t('billing.pro_desc'),
      features: [
        t('billing.feat.unlimited_products'),
        t('billing.feat.unlimited_users'),
        t('billing.feat.advanced_audit'),
        t('billing.feat.priority_support'),
        t('billing.feat.custom_domains')
      ],
      current: user?.organization?.plan === 'PRO'
    }
  ];

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight uppercase">{t('billing.title')}</h2>
        <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1 font-medium">{t('billing.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <div key={plan.name} className={cn(
            "card-base p-8 space-y-6 relative overflow-hidden",
            plan.current ? "border-black border-2" : "border-neutral-200"
          )}>
            {plan.current && (
              <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
                {t('billing.current_plan')}
              </div>
            )}
            <div className="space-y-2">
              <h3 className="text-xl font-bold uppercase tracking-tight">{plan.name}</h3>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-black tracking-tighter">{plan.price}</span>
                <span className="text-neutral-400 text-xs font-bold uppercase tracking-widest">/ {t('billing.month')}</span>
              </div>
              <p className="text-xs text-neutral-500 font-medium">{plan.description}</p>
            </div>

            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center text-xs font-bold uppercase tracking-widest">
                  <Check className="w-3 h-3 mr-3 text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <button className={cn(
              "w-full py-4 text-sm font-bold uppercase tracking-widest transition-all rounded-none",
              plan.current 
                ? "bg-neutral-100 text-neutral-400 cursor-default" 
                : "bg-black text-white hover:bg-neutral-800 active:scale-95"
            )}>
              {plan.current ? t('billing.active') : t('billing.upgrade')}
            </button>
          </div>
        ))}
      </div>

      <div className="card-base p-8 space-y-6">
        <h3 className="text-lg font-bold uppercase tracking-tight flex items-center">
          <CreditCard className="w-5 h-5 mr-3" />
          {t('billing.payment_method')}
        </h3>
        <div className="flex items-center justify-between p-4 border border-neutral-100 bg-neutral-50 rounded-none">
          <div className="flex items-center">
            <div className="w-10 h-6 bg-neutral-200 rounded-none mr-4"></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest">{t('billing.visa_ending')} 4242</p>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{t('billing.expires')} 12/26</p>
            </div>
          </div>
          <button className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors">{t('admin.edit')}</button>
        </div>
      </div>
    </div>
  );
}

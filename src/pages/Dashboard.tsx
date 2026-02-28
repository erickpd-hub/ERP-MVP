import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Package, ShoppingCart, Users, TrendingUp, Activity, Clock, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { useLanguage } from '../lib/i18n';

const data = [
  { name: 'Mon', sales: 4000, profit: 2400 },
  { name: 'Tue', sales: 3000, profit: 1398 },
  { name: 'Wed', sales: 2000, profit: 9800 },
  { name: 'Thu', sales: 2780, profit: 3908 },
  { name: 'Fri', sales: 1890, profit: 4800 },
  { name: 'Sat', sales: 2390, profit: 3800 },
  { name: 'Sun', sales: 3490, profit: 4300 },
];

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <div className="card-base group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-neutral-50 rounded-none group-hover:bg-black group-hover:text-white transition-colors">
        <Icon className="w-4 h-4" />
      </div>
      <div className={cn("flex items-center text-xs font-semibold", trend === 'up' ? 'text-emerald-600' : 'text-rose-600')}>
        {change}
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
      </div>
    </div>
    <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1">{title}</p>
    <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
  </div>
);


export function Dashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>({ 
    revenue: 0, 
    activeOrders: 0, 
    inventoryItems: 0, 
    lowStockItems: 0,
    inventoryValue: 0,
    topProducts: [],
    recentInvoices: [],
    recentCashFlow: []
  });
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const isNew = localStorage.getItem('is_new_user') === 'true';
    setShowGuide(isNew);

    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  const dismissGuide = () => {
    localStorage.removeItem('is_new_user');
    setShowGuide(false);
  };

  return (
    <div className="space-y-8">
      {showGuide && (
        <div className="bg-white border border-black p-10 rounded-none relative overflow-hidden animate-in fade-in slide-in-from-top-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
          <div className="absolute top-0 right-0 p-6">
            <button onClick={dismissGuide} className="text-neutral-400 hover:text-black text-[10px] font-bold uppercase tracking-widest transition-colors">{t('dash.dismiss')}</button>
          </div>
          <div className="relative z-10 space-y-8">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-black text-white text-[8px] font-black uppercase tracking-[0.2em]">
                <Zap className="w-3 h-3" />
                <span>{t('dash.onboarding_active')}</span>
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{t('onboarding.guide.title')}</h2>
              <p className="text-sm text-neutral-500 font-medium max-w-xl">{t('onboarding.guide.welcome')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: 1, text: t('onboarding.guide.step1'), icon: ShoppingCart, link: '/pos', color: 'bg-emerald-50 text-emerald-600' },
                { step: 2, text: t('onboarding.guide.step2'), icon: Users, link: '/payroll', color: 'bg-blue-50 text-blue-600' },
                { step: 3, text: t('onboarding.guide.step3'), icon: Package, link: '/inventory', color: 'bg-amber-50 text-amber-600' },
              ].map((item) => (
                <a 
                  key={item.step}
                  href={item.link}
                  className="group p-6 border border-neutral-100 hover:border-black transition-all bg-neutral-50/50 hover:bg-white"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className={cn("w-10 h-10 flex items-center justify-center rounded-none", item.color)}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-neutral-200 group-hover:text-black transition-colors">{t('dash.step')} 0{item.step}</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest leading-relaxed group-hover:translate-x-1 transition-transform">{item.text}</p>
                  <div className="mt-4 flex items-center text-[8px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-black">
                    <span>{t('dash.go_to_module')}</span>
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('dash.revenue')} value={`$${stats.revenue.toLocaleString()}`} change="+12.5%" icon={DollarSign} trend="up" />
        <StatCard title={t('dash.inventory_value')} value={`$${stats.inventoryValue.toLocaleString()}`} change="+5.4%" icon={Package} trend="up" />
        <StatCard title={t('dash.active_orders')} value={stats.activeOrders.toString()} change="+4.2%" icon={ShoppingCart} trend="up" />
        <StatCard title={t('dash.low_stock')} value={stats.lowStockItems.toString()} change="-2.1%" icon={Activity} trend={stats.lowStockItems > 0 ? "down" : "up"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-base">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold tracking-tight uppercase">{t('dash.overview')}</h3>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">{t('dash.weekly_data')}</p>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E5E5', borderRadius: '0px', fontSize: '12px', boxShadow: 'none' }}
                  itemStyle={{ color: '#000' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#000" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-base">
          <h3 className="text-lg font-bold tracking-tight uppercase mb-8">{t('dash.top_selling')}</h3>
          <div className="space-y-6">
            {stats.topProducts.length > 0 ? stats.topProducts.map((product: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                  <span className="truncate max-w-[150px]">{product.name}</span>
                  <span>{product.quantity} {t('dash.sold')}</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-100 rounded-none overflow-hidden">
                  <div 
                    className="h-full bg-black transition-all duration-1000" 
                    style={{ width: `${(product.quantity / stats.topProducts[0].quantity) * 100}%` }} 
                  />
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-neutral-400 text-[10px] uppercase tracking-widest font-bold">
                {t('dash.no_sales')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-base">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold tracking-tight uppercase">{t('dash.recent_transactions')}</h3>
            <button className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors">{t('dash.view_all')}</button>
          </div>
          <div className="space-y-4">
            {stats.recentInvoices.length > 0 ? stats.recentInvoices.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between p-3 border border-neutral-100 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-neutral-100 flex items-center justify-center mr-3">
                    <Clock className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-tight">{inv.number}</p>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{format(new Date(inv.createdAt), 'MMM d, HH:mm')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black">${inv.total.toFixed(2)}</p>
                  <span className="text-[8px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 px-1.5 py-0.5 border border-emerald-100">
                    {inv.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-neutral-400 text-[10px] uppercase tracking-widest font-bold">
                {t('dash.no_transactions')}
              </div>
            )}
          </div>
        </div>

        <div className="card-base">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold tracking-tight uppercase">{t('dash.cash_flow')}</h3>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-4">
            {stats.recentCashFlow.length > 0 ? stats.recentCashFlow.map((cash: any) => (
              <div key={cash.id} className="flex items-center justify-between p-3 border border-neutral-100 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center">
                  <div className={cn(
                    "w-8 h-8 flex items-center justify-center mr-3",
                    cash.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  )}>
                    {cash.type === 'INCOME' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-tight truncate max-w-[200px]">{cash.description}</p>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{format(new Date(cash.createdAt), 'MMM d, HH:mm')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-xs font-black", cash.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600')}>
                    {cash.type === 'INCOME' ? '+' : '-'}${cash.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-neutral-400 text-[10px] uppercase tracking-widest font-bold">
                {t('dash.no_cashflow')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

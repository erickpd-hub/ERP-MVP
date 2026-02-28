import React, { useState, useEffect } from 'react';
import { ShoppingBag, Truck, CreditCard, Plus, Search, CheckCircle2, Clock, AlertCircle, ArrowRight, Package } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export function Purchases() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'orders' | 'providers' | 'payable'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [payables, setPayables] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [oRes, pRes, payRes, prodRes] = await Promise.all([
        fetch('/api/purchases'),
        fetch('/api/providers'),
        fetch('/api/accounts-payable'),
        fetch('/api/inventory')
      ]);
      setOrders(await oRes.json());
      setProviders(await pRes.json());
      setPayables(await payRes.json());
      setProducts(await prodRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleCreateOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const providerId = formData.get('providerId') as string;
    const items = products.filter(p => formData.get(`qty-${p.id}`)).map(p => ({
      productId: p.id,
      quantity: parseInt(formData.get(`qty-${p.id}`) as string),
      cost: parseFloat(formData.get(`cost-${p.id}`) as string)
    }));

    if (items.length === 0) return alert('Select at least one product');

    const res = await fetch('/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId, items })
    });

    if (res.ok) {
      setShowOrderModal(false);
      fetchData();
    }
  };

  const handleReceiveOrder = async (id: string) => {
    const order = orders.find(o => o.id === id);
    const items = order.items.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantityOrdered
    }));

    const res = await fetch(`/api/purchases/${id}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });

    if (res.ok) {
      setShowReceiveModal(null);
      fetchData();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">{t('purchases.title')}</h2>
          <p className="text-sm text-neutral-500 font-medium">{t('purchases.subtitle')}</p>
        </div>
        <div className="flex space-x-4">
          {activeTab === 'orders' && (
            <button onClick={() => setShowOrderModal(true)} className="btn-primary flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              {t('purchases.new_order')}
            </button>
          )}
          {activeTab === 'providers' && (
            <button onClick={() => setShowProviderModal(true)} className="btn-primary flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              {t('purchases.new_provider')}
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-neutral-100">
        {[
          { id: 'orders', label: t('purchases.orders'), icon: ShoppingBag },
          { id: 'providers', label: t('purchases.providers'), icon: Truck },
          { id: 'payable', label: t('purchases.payable'), icon: CreditCard },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center px-8 py-4 text-[10px] font-bold uppercase tracking-widest transition-all relative",
              activeTab === tab.id ? "text-black" : "text-neutral-400 hover:text-neutral-600"
            )}
          >
            <tab.icon className="w-3 h-3 mr-2" />
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black animate-in fade-in slide-in-from-left-2" />}
          </button>
        ))}
      </div>

      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <div key={order.id} className="card-base group hover:border-black transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-neutral-50 group-hover:bg-black group-hover:text-white transition-colors">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight">{order.number}</h4>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{order.provider.name} • {format(new Date(order.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-black">${order.total.toFixed(2)}</p>
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border",
                      order.status === 'RECEIVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                    )}>
                      {order.status}
                    </span>
                  </div>
                  {order.status !== 'RECEIVED' && (
                    <button 
                      onClick={() => setShowReceiveModal(order.id)}
                      className="p-2 hover:bg-neutral-100 transition-colors"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-50">
                {order.items.map((item: any) => (
                  <div key={item.id} className="text-[10px] font-bold uppercase tracking-widest">
                    <p className="text-neutral-400 truncate">{item.product.name}</p>
                    <p>{item.quantityOrdered} x ${item.cost.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'providers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <div key={provider.id} className="card-base hover:border-black transition-all">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 h-10 bg-neutral-50 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight">{provider.name}</h4>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{provider.email || t('purchases.no_email')}</p>
                </div>
              </div>
              <div className="flex justify-between pt-4 border-t border-neutral-50">
                <div className="text-center flex-1">
                  <p className="text-[8px] text-neutral-400 font-black uppercase tracking-widest">{t('purchases.orders_count')}</p>
                  <p className="text-sm font-black">{provider.purchaseOrders?.length || 0}</p>
                </div>
                <div className="text-center flex-1 border-l border-neutral-50">
                  <p className="text-[8px] text-neutral-400 font-black uppercase tracking-widest">{t('purchases.payable_count')}</p>
                  <p className="text-sm font-black text-rose-600">
                    ${provider.accountsPayable?.filter((ap: any) => ap.status === 'PENDING').reduce((sum: number, ap: any) => sum + ap.amount, 0).toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'payable' && (
        <div className="card-base p-0 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">{t('purchases.provider')}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">{t('purchases.amount')}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">{t('purchases.due_date')}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">{t('purchases.status')}</th>
              </tr>
            </thead>
            <tbody>
              {payables.map((ap) => (
                <tr key={ap.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold uppercase tracking-tight">{ap.provider.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-black text-rose-600">${ap.amount.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{ap.dueDate ? format(new Date(ap.dueDate), 'MMM d, yyyy') : '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border",
                      ap.status === 'PAID' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                    )}>
                      {ap.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl p-12 space-y-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black uppercase tracking-tight">{t('purchases.new_order')}</h3>
            <form onSubmit={handleCreateOrder} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{t('purchases.provider')}</label>
                <select name="providerId" className="input-base" required>
                  <option value="">{t('purchases.select_provider')}</option>
                  {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{t('purchases.items')}</label>
                {products.map(p => (
                  <div key={p.id} className="flex items-center space-x-4 p-4 border border-neutral-100">
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase tracking-tight">{p.name}</p>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Stock: {p.stock} • Avg Cost: ${p.averageCost.toFixed(2)}</p>
                    </div>
                    <div className="w-24">
                      <input 
                        type="number" 
                        name={`qty-${p.id}`} 
                        placeholder={t('purchases.qty_placeholder')} 
                        className="input-base text-center" 
                        min="0"
                      />
                    </div>
                    <div className="w-32">
                      <input 
                        type="number" 
                        name={`cost-${p.id}`} 
                        placeholder={t('purchases.cost_placeholder')} 
                        className="input-base text-center" 
                        step="0.01"
                        defaultValue={p.averageCost || 0}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-4 pt-8 border-t border-neutral-100">
                <button type="button" onClick={() => setShowOrderModal(false)} className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-50 transition-all">{t('purchases.cancel')}</button>
                <button type="submit" className="btn-primary px-12 py-4">{t('purchases.create_order')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-12 space-y-8 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Package className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight">{t('purchases.confirm_receive')}</h3>
              <p className="text-sm text-neutral-500 font-medium">{t('purchases.receive_msg')}</p>
            </div>
            <div className="flex flex-col space-y-4 pt-8">
              <button 
                onClick={() => handleReceiveOrder(showReceiveModal)}
                className="btn-primary py-4 w-full"
              >
                {t('purchases.confirm_receive')}
              </button>
              <button 
                onClick={() => setShowReceiveModal(null)}
                className="py-4 w-full text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-50 transition-all"
              >
                {t('purchases.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

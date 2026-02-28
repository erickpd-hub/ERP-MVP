import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { ShoppingCart, Search, Trash2, CreditCard, Plus, Minus, User, Tag, Percent, Calculator, X, Printer, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';

// POS State Management
interface CartItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  discount: number; // Percentage
}

interface POSContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  updateItemDiscount: (productId: string, discount: number) => void;
  globalDiscount: number;
  setGlobalDiscount: (val: number) => void;
  customer: string;
  setCustomer: (val: string) => void;
  clearCart: () => void;
  total: number;
  subtotal: number;
  discountAmount: number;
  session: any;
  setSession: (val: any) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

function POSProvider({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [customer, setCustomer] = useState(t('pos.walk_in'));
  const [session, setSession] = useState<any>(null);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, discount: 0 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const updateItemDiscount = (productId: string, discount: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        return { ...item, discount: Math.min(100, Math.max(0, discount)) };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    setGlobalDiscount(0);
    setCustomer(t('pos.walk_in'));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemDiscounts = cart.reduce((sum, item) => sum + (item.price * item.quantity * (item.discount / 100)), 0);
  const afterItemDiscounts = subtotal - itemDiscounts;
  const globalDiscountAmount = afterItemDiscounts * (globalDiscount / 100);
  const total = afterItemDiscounts - globalDiscountAmount;
  const discountAmount = itemDiscounts + globalDiscountAmount;

  return (
    <POSContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, updateItemDiscount,
      globalDiscount, setGlobalDiscount, customer, setCustomer, clearCart,
      total, subtotal, discountAmount, session, setSession
    }}>
      {children}
    </POSContext.Provider>
  );
}

function usePOS() {
  const context = useContext(POSContext);
  if (!context) throw new Error('usePOS must be used within a POSProvider');
  return context;
}

function POSContent() {
  const { t } = useLanguage();
  const { 
    cart, addToCart, removeFromCart, updateQuantity, updateItemDiscount,
    globalDiscount, setGlobalDiscount, customer, setCustomer, clearCart,
    total, subtotal, discountAmount, session, setSession
  } = usePOS();

  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [openingAmount, setOpeningAmount] = useState<number>(0);
  const [closingAmount, setClosingAmount] = useState<number>(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });

    fetch('/api/pos/session')
      .then(res => res.json())
      .then(data => {
        if (data) setSession(data);
        else setShowSessionModal(true);
      });
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'F8') {
        e.preventDefault();
        if (cart.length > 0) setShowCheckoutModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, total]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    try {
      const res = await fetch('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
          customer,
          total,
          paymentMethod,
          receivedAmount
        })
      });
      
      if (!res.ok) throw new Error('Checkout failed');
      
      alert(t('pos.success'));
      clearCart();
      setShowCheckoutModal(false);
      setReceivedAmount(0);
      
      // Refresh inventory
      const invRes = await fetch('/api/inventory');
      const invData = await invRes.json();
      setProducts(invData);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenSession = async () => {
    try {
      const res = await fetch('/api/pos/session/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openingAmount })
      });
      if (!res.ok) throw new Error('Failed to open session');
      const data = await res.json();
      setSession(data);
      setShowSessionModal(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCloseSession = async () => {
    if (!confirm(t('pos.confirm_close'))) return;
    try {
      const res = await fetch('/api/pos/session/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, closingAmount })
      });
      if (!res.ok) throw new Error('Failed to close session');
      setSession(null);
      setShowSessionModal(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const change = Math.max(0, receivedAmount - total);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)] relative">
      {/* Products Grid */}
      <div className="lg:col-span-2 flex flex-col space-y-6">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              ref={searchInputRef}
              placeholder={t('pos.search')} 
              className="input-base pl-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold whitespace-nowrap">
            {t('pos.shortcuts')}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center h-40 text-neutral-400 uppercase tracking-widest text-xs font-bold">{t('common.loading')}</div>
          ) : filteredProducts.map((product: any) => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={`card-base p-5 text-left transition-all group ${product.stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-black active:scale-95'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold bg-neutral-100 px-2 py-0.5 rounded-none uppercase tracking-widest text-neutral-500">{product.sku}</span>
                <span className="text-sm font-black">${product.price.toFixed(2)}</span>
              </div>
              <h4 className="font-bold text-sm mb-1 truncate">{product.name}</h4>
              <p className={cn(
                "text-[10px] uppercase tracking-widest font-bold",
                product.stock > 10 ? "text-emerald-600" : "text-rose-600"
              )}>{t('inv.stock')}: {product.stock}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="card-base flex flex-col h-full bg-white !p-0 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold tracking-tight flex items-center uppercase">
              <ShoppingCart className="w-5 h-5 mr-2" />
              {t('pos.cart')}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-none uppercase tracking-widest">{cart.length} {t('pos.items')}</span>
              {session && (
                <button onClick={() => setShowSessionModal(true)} className="p-1 hover:bg-neutral-200 transition-colors">
                  <LogOut className="w-4 h-4 text-neutral-500" />
                </button>
              )}
            </div>
          </div>
          
          {/* Customer Selection */}
          <div className="flex items-center space-x-2 bg-white border border-neutral-200 p-2 rounded-none">
            <User className="w-4 h-4 text-neutral-400" />
            <select 
              className="flex-1 text-xs font-bold uppercase tracking-widest outline-none bg-transparent"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
            >
              <option value={t('pos.walk_in')}>{t('pos.walk_in')}</option>
              <option value="John Smith">John Smith</option>
              <option value="Maria Garcia">Maria Garcia</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400 space-y-4 opacity-40">
              <ShoppingCart className="w-12 h-12" />
              <p className="text-[10px] uppercase tracking-widest font-bold">{t('pos.empty')}</p>
            </div>
          ) : cart.map((item: any) => (
            <div key={item.id} className="flex flex-col p-4 border border-neutral-100 rounded-none space-y-3 bg-neutral-50/30">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-xs font-bold truncate pr-4">{item.name}</h5>
                  <p className="text-[10px] text-neutral-400 font-mono mt-1">{item.sku}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-neutral-400 hover:text-rose-600 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center border border-neutral-200 rounded-none overflow-hidden bg-white">
                  <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 hover:bg-neutral-50"><Minus className="w-3 h-3" /></button>
                  <span className="px-3 py-1 text-xs font-bold border-x border-neutral-200">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 hover:bg-neutral-50"><Plus className="w-3 h-3" /></button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center border border-neutral-200 rounded-none px-2 py-1 bg-white">
                    <Percent className="w-3 h-3 text-neutral-400 mr-1" />
                    <input 
                      type="number" 
                      className="w-8 text-[10px] font-bold outline-none"
                      value={item.discount}
                      onChange={(e) => updateItemDiscount(item.id, parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <span className="text-xs font-black">${(item.price * item.quantity * (1 - item.discount/100)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-neutral-50 border-t border-neutral-100 space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-medium text-neutral-500 uppercase tracking-widest">
              <span>{t('pos.subtotal')}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs font-medium text-neutral-500 uppercase tracking-widest">
              <div className="flex items-center">
                <Tag className="w-3 h-3 mr-2" />
                <span>{t('pos.global_discount')}</span>
              </div>
              <input 
                type="number" 
                className="w-12 text-right bg-transparent border-b border-neutral-300 outline-none focus:border-black font-bold"
                value={globalDiscount}
                onChange={(e) => setGlobalDiscount(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-rose-600 uppercase tracking-widest">
              <span>{t('pos.discount')}</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center text-lg font-black tracking-tight pt-3 border-t border-neutral-200">
              <span>{t('pos.total')}</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={() => setShowCheckoutModal(true)}
            disabled={cart.length === 0 || !session}
            className="btn-primary w-full flex items-center justify-center py-4"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {t('pos.checkout')} (F8)
          </button>
        </div>
      </div>

      {/* Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white card-base w-full max-w-md !p-0 overflow-hidden">
            <div className="p-6 border-b border-neutral-100 bg-neutral-50 flex justify-between items-center">
              <h3 className="text-lg font-bold uppercase tracking-tight">{session ? t('pos.close_session') : t('pos.open_session')}</h3>
              <button onClick={() => setShowSessionModal(false)} className="hover:bg-neutral-200 p-1 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              {!session ? (
                <>
                  <p className="text-xs text-neutral-500 uppercase tracking-widest font-medium">{t('pos.session_required')}</p>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pos.opening_amount')}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-neutral-400">$</span>
                      <input 
                        autoFocus
                        type="number" 
                        className="input-base pl-8 text-lg font-black"
                        value={openingAmount}
                        onChange={(e) => setOpeningAmount(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <button onClick={handleOpenSession} className="btn-primary w-full py-4 text-sm uppercase tracking-widest font-bold">
                    {t('pos.open_session')}
                  </button>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-neutral-50 border border-neutral-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">{t('pos.opening_amount')}</p>
                      <p className="text-lg font-black">${session.openingAmount.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-neutral-50 border border-neutral-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">{t('pos.expected')}</p>
                      <p className="text-lg font-black">${(session.openingAmount + total).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pos.declared_amount')}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-neutral-400">$</span>
                      <input 
                        type="number" 
                        className="input-base pl-8 text-lg font-black"
                        value={closingAmount}
                        onChange={(e) => setClosingAmount(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <button onClick={handleCloseSession} className="btn-primary w-full py-4 text-sm uppercase tracking-widest font-bold bg-rose-600 hover:bg-rose-700">
                    {t('pos.close_session')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white card-base w-full max-w-2xl !p-0 overflow-hidden flex flex-col md:flex-row">
            <div className="flex-1 p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black uppercase tracking-tight">{t('pos.checkout')}</h3>
                <button onClick={() => setShowCheckoutModal(false)}><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pos.payment_method')}</label>
                <div className="grid grid-cols-3 gap-3">
                  {['CASH', 'CARD', 'TRANSFER'].map(method => (
                    <button 
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={cn(
                        "p-4 border text-[10px] font-bold uppercase tracking-widest transition-all",
                        paymentMethod === method ? "bg-black text-white border-black" : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
                      )}
                    >
                      {t(`pos.${method.toLowerCase()}`)}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'CASH' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pos.received')}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-neutral-400">$</span>
                      <input 
                        autoFocus
                        type="number" 
                        className="input-base pl-8 text-2xl font-black"
                        value={receivedAmount}
                        onChange={(e) => setReceivedAmount(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-emerald-50 border border-emerald-100">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">{t('pos.change')}</span>
                    <span className="text-2xl font-black text-emerald-700">${change.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="pt-6 flex space-x-4">
                <button className="btn-secondary flex-1 flex items-center justify-center py-4">
                  <Printer className="w-4 h-4 mr-2" />
                  {t('pos.print_ticket')}
                </button>
                <button 
                  onClick={handleCheckout}
                  className="btn-primary flex-1 py-4 text-sm uppercase tracking-widest font-bold"
                >
                  {t('pos.checkout')}
                </button>
              </div>
            </div>

            <div className="w-full md:w-72 bg-neutral-50 p-8 border-l border-neutral-200 space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pos.summary')}</h4>
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-neutral-500">{item.quantity}x {item.name}</span>
                    <span className="font-bold">${(item.price * item.quantity * (1 - item.discount/100)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-neutral-200 space-y-2">
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>{t('pos.subtotal')}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-rose-600 font-bold">
                  <span>{t('pos.discount')}</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-black pt-2">
                  <span>{t('pos.total')}</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function POS() {
  return (
    <POSProvider>
      <POSContent />
    </POSProvider>
  );
}

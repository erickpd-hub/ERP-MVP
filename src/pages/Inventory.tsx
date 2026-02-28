import React, { useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import { Search, Filter, Plus, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';

type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
};

export function Inventory() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ sku: '', name: '', category: '', price: '', stock: '', minStock: '5' });

  const columnHelper = createColumnHelper<Product>();

  const columns = [
    columnHelper.accessor('sku', { header: t('inv.sku'), cell: info => <span className="font-mono text-xs">{info.getValue()}</span> }),
    columnHelper.accessor('name', { header: t('inv.name'), cell: info => <span className="font-medium">{info.getValue()}</span> }),
    columnHelper.accessor('category', { header: t('inv.category'), cell: info => <span className="text-neutral-500 uppercase text-[10px] tracking-widest">{info.getValue() || 'N/A'}</span> }),
    columnHelper.accessor('price', { header: t('inv.price'), cell: info => <span>${info.getValue().toFixed(2)}</span> }),
    columnHelper.accessor('stock', { header: t('inv.stock'), cell: info => <span>{info.getValue()}</span> }),
    columnHelper.display({ 
      id: 'status',
      header: t('inv.status'), 
      cell: info => {
        const product = info.row.original;
        const statusKey = product.stock <= 0 ? 'inv.out_of_stock' : product.stock <= product.minStock ? 'inv.low_stock' : 'inv.in_stock';
        return (
          <span className={cn(
            "px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border",
            statusKey === 'inv.in_stock' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
            statusKey === 'inv.low_stock' ? 'border-amber-200 text-amber-600 bg-amber-50' :
            'border-rose-200 text-rose-600 bg-rose-50'
          )}>
            {t(statusKey)}
          </span>
        );
      }
    }),
    columnHelper.display({
      id: 'actions',
      cell: () => <button className="text-neutral-400 hover:text-black"><MoreHorizontal className="w-4 h-4" /></button>
    })
  ];

  const fetchProducts = () => {
    setLoading(true);
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock),
          minStock: parseInt(newProduct.minStock)
        })
      });
      if (!res.ok) throw new Error('Failed to add product');
      setShowAddModal(false);
      setNewProduct({ sku: '', name: '', category: '', price: '', stock: '', minStock: '5' });
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight uppercase">{t('inv.title')}</h2>
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1 font-medium">{t('inv.subtitle')}</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          {t('inv.add_product')}
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm p-4">
          <div className="bg-white border border-neutral-200 p-8 w-full max-w-md space-y-6">
            <h3 className="text-lg font-bold uppercase tracking-tight">{t('inv.add_new')}</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block text-neutral-400">{t('inv.sku')}</label>
                  <input required className="input-base" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block text-neutral-400">{t('inv.category')}</label>
                  <input className="input-base" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block text-neutral-400">{t('inv.name')}</label>
                <input required className="input-base" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block text-neutral-400">{t('inv.price')}</label>
                  <input required type="number" step="0.01" className="input-base" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block text-neutral-400">{t('inv.stock')}</label>
                  <input required type="number" className="input-base" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block text-neutral-400">{t('inv.min_stock')}</label>
                  <input required type="number" className="input-base" value={newProduct.minStock} onChange={e => setNewProduct({...newProduct, minStock: e.target.value})} />
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">{t('inv.cancel')}</button>
                <button type="submit" className="btn-primary flex-1">{t('inv.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4 py-6 border-y border-neutral-200">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input 
            placeholder={t('inv.search_placeholder')} 
            className="input-base pl-12"
          />
        </div>
        <button className="btn-secondary flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          {t('inv.filters')}
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-none overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-neutral-50 border-b border-neutral-200">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors cursor-pointer">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 text-sm font-medium">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { History, Search, Filter, User, Box, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';

export function AuditLog() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audit-logs')
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight uppercase">{t('audit.title')}</h2>
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1 font-medium">{t('audit.subtitle')}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4 py-6 border-y border-neutral-200">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input 
            placeholder={t('audit.search')} 
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
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('audit.timestamp')}</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('audit.user')}</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('audit.action')}</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('audit.entity')}</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('audit.changes')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-neutral-400 uppercase tracking-widest text-xs font-bold">{t('audit.loading')}</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-neutral-400 uppercase tracking-widest text-xs font-bold">{t('audit.no_logs')}</td>
              </tr>
            ) : logs.map((log: any) => (
              <tr key={log.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center text-xs font-medium">
                    <Clock className="w-3 h-3 mr-2 text-neutral-400" />
                    {format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-neutral-100 rounded-none flex items-center justify-center text-[8px] font-bold mr-2">
                      {log.user?.name?.split(' ').map((n: any) => n[0]).join('') || '??'}
                    </div>
                    <span className="text-xs font-bold">{log.user?.name || 'System'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold bg-neutral-100 px-2 py-0.5 rounded-none uppercase tracking-widest">
                    {log.action.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-neutral-500">
                  {log.entity} <span className="text-[10px] opacity-50">#{log.entityId.substring(0, 8)}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[10px] font-mono bg-neutral-50 p-2 border border-neutral-100 rounded-none max-w-xs truncate">
                    {log.newValue || log.oldValue || t('audit.no_data')}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

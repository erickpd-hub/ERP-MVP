import React, { useState, useEffect } from 'react';
import { Users, Settings, Globe, Shield, Mail, Plus, UserPlus } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

export function Admin() {
  const { t } = useLanguage();
  const [orgData, setOrgData] = useState({
    name: 'Nexus Corp',
    currency: 'USD',
    taxId: 'US123456789',
    address: '123 Brutalist Ave, NY'
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight uppercase">{t('admin.title')}</h2>
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1 font-medium">{t('admin.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Org Config */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card-base space-y-6">
            <h3 className="text-lg font-bold tracking-tight flex items-center uppercase">
              <Settings className="w-5 h-5 mr-2" />
              {t('admin.general_config')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block text-neutral-400">{t('admin.org_name')}</label>
                <input type="text" className="input-base" value={orgData.name} onChange={(e) => setOrgData({...orgData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block text-neutral-400">{t('onboarding.currency')}</label>
                <select className="input-base appearance-none" value={orgData.currency} onChange={(e) => setOrgData({...orgData, currency: e.target.value})}>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="MXN">MXN - Peso Mexicano</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block text-neutral-400">{t('admin.tax_id')}</label>
                <input type="text" className="input-base" value={orgData.taxId} onChange={(e) => setOrgData({...orgData, taxId: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block text-neutral-400">{t('admin.address')}</label>
                <input type="text" className="input-base" value={orgData.address} onChange={(e) => setOrgData({...orgData, address: e.target.value})} />
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button className="btn-primary">{t('admin.save_changes')}</button>
            </div>
          </div>

          <div className="card-base space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold tracking-tight flex items-center uppercase">
                <Users className="w-5 h-5 mr-2" />
                {t('admin.team_members')}
              </h3>
              <button className="btn-primary flex items-center py-2">
                <UserPlus className="w-4 h-4 mr-2" />
                {t('admin.invite')}
              </button>
            </div>
            <div className="border border-neutral-100 rounded-none overflow-hidden">
              {users.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-black text-white rounded-none flex items-center justify-center text-[10px] font-bold mr-3">
                      {user.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{user.name}</p>
                      <p className="text-[10px] text-neutral-400 font-bold">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-[10px] font-bold bg-neutral-100 px-2 py-0.5 rounded-none uppercase tracking-widest">{user.role}</span>
                    <button className="text-neutral-400 hover:text-black text-xs font-bold uppercase tracking-widest transition-colors">{t('admin.edit')}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="card-base bg-black text-white space-y-4 border-none">
            <h4 className="text-xl font-bold tracking-tight uppercase">{t('admin.pro_plan')}</h4>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">{t('admin.active_since')} Jan 2024</p>
            <div className="pt-4 border-t border-neutral-800">
              <ul className="space-y-2 text-[10px] font-bold uppercase tracking-widest">
                <li className="flex items-center"><Shield className="w-3 h-3 mr-2 text-neutral-400" /> {t('admin.unlimited_users')}</li>
                <li className="flex items-center"><Globe className="w-3 h-3 mr-2 text-neutral-400" /> {t('admin.custom_domains')}</li>
                <li className="flex items-center"><Mail className="w-3 h-3 mr-2 text-neutral-400" /> {t('admin.priority_support')}</li>
              </ul>
            </div>
            <button className="w-full bg-white text-black py-2.5 rounded-none text-sm font-bold uppercase tracking-widest hover:bg-neutral-100 transition-all active:scale-95 mt-4">{t('admin.manage_billing')}</button>
          </div>

          <div className="card-base space-y-4">
            <h4 className="text-lg font-bold tracking-tight uppercase">{t('admin.invitation_template')}</h4>
            <p className="text-xs text-neutral-500 font-medium">{t('admin.preview_email')}</p>
            <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-none font-mono text-[10px] overflow-hidden">
              <p className="text-neutral-400 mb-2">{t('admin.subject')}: {t('admin.welcome_msg')} {orgData.name}</p>
              <p>Hi [Name],</p>
              <p className="my-2">{t('admin.invited_msg')} {orgData.name} on Nexus ERP.</p>
              <p>{t('admin.accept_msg')}</p>
              <p className="text-blue-600 underline my-2">{t('admin.accept_link')}</p>
              <p>{t('admin.regards')},<br/>{t('admin.team')} Nexus</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

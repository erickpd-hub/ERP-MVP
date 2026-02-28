import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Globe, CreditCard, User, Mail, Lock, Link as LinkIcon, Percent, Upload, FileText, CheckCircle2, Zap } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { cn } from '../lib/utils';

export function Onboarding() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    orgName: '',
    slug: '',
    currency: 'USD',
    taxRate: 16,
    csvFile: null as File | null,
  });
  const navigate = useNavigate();

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  };

  const handleOrgNameChange = (name: string) => {
    setFormData({ ...formData, orgName: name, slug: generateSlug(name) });
  };

  const handleNext = async () => {
    if (step < 4) setStep(step + 1);
    else {
      try {
        // 1. Register Org and User
        const regRes = await fetch('/api/onboarding/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            orgName: formData.orgName,
            slug: formData.slug,
            currency: formData.currency,
            taxRate: formData.taxRate
          })
        });

        if (!regRes.ok) throw new Error('Failed to register organization');
        const { user, org } = await regRes.json();

        // 2. Import CSV if exists
        if (formData.csvFile) {
          const text = await formData.csvFile.text();
          const lines = text.split('\n').filter(l => l.trim());
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          const products = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const p: any = {};
            headers.forEach((h, i) => {
              if (h.includes('sku')) p.sku = values[i];
              if (h.includes('name')) p.name = values[i];
              if (h.includes('price')) p.price = values[i];
              if (h.includes('stock')) p.stock = values[i];
            });
            return p;
          }).filter(p => p.name);

          await fetch('/api/onboarding/import-csv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products })
          });
        }

        localStorage.setItem('is_new_user', 'true');
        navigate('/');
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      setFormData(prev => ({ ...prev, csvFile: file }));
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-8 font-sans">
      <div className="w-full max-w-2xl bg-white border border-neutral-200 rounded-none p-12 space-y-12">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight uppercase">Nexus</span>
          </div>
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={cn(
                "w-12 h-1 transition-all duration-500",
                step >= s ? "bg-black" : "bg-neutral-100"
              )} />
            ))}
          </div>
        </div>

        <div className="min-h-[400px]">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-2">
                <h3 className="text-3xl font-black uppercase tracking-tight">{t('onboarding.auth')}</h3>
                <p className="text-sm text-neutral-500 font-medium">{t('onboarding.trial_msg')}</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('onboarding.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                      type="email" 
                      className="input-base pl-12" 
                      placeholder="alex@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('onboarding.password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                      type="password" 
                      className="input-base pl-12" 
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-2">
                <h3 className="text-3xl font-black uppercase tracking-tight">{t('onboarding.company')}</h3>
                <p className="text-sm text-neutral-500 font-medium">{t('onboarding.infra_msg')}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('onboarding.company_name')}</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                      type="text" 
                      className="input-base pl-12" 
                      placeholder="Nexus Corp"
                      value={formData.orgName}
                      onChange={(e) => handleOrgNameChange(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('onboarding.slug')}</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                      type="text" 
                      className="input-base pl-12 bg-neutral-50" 
                      value={formData.slug}
                      readOnly
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400">.nexus-erp.com</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('onboarding.currency')}</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <select 
                      className="input-base pl-12 appearance-none"
                      value={formData.currency}
                      onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="MXN">MXN - Mexican Peso</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('onboarding.taxes')}</label>
                  <div className="relative">
                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                      type="number" 
                      className="input-base pl-12" 
                      value={formData.taxRate}
                      onChange={(e) => setFormData({...formData, taxRate: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-2">
                <h3 className="text-3xl font-black uppercase tracking-tight">{t('onboarding.ingestion')}</h3>
                <p className="text-sm text-neutral-500 font-medium">{t('onboarding.import_msg')}</p>
              </div>
              
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className={cn(
                  "border-2 border-dashed rounded-none p-12 flex flex-col items-center justify-center space-y-4 transition-all cursor-pointer",
                  formData.csvFile ? "border-black bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"
                )}
                onClick={() => document.getElementById('csv-upload')?.click()}
              >
                <input 
                  id="csv-upload"
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={(e) => setFormData({...formData, csvFile: e.target.files?.[0] || null})}
                />
                {formData.csvFile ? (
                  <>
                    <div className="w-12 h-12 bg-black text-white flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold uppercase">{formData.csvFile.name}</p>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">{(formData.csvFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-neutral-100 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-neutral-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold uppercase">{t('onboarding.csv_upload')}</p>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">{t('onboarding.csv_help')}</p>
                    </div>
                  </>
                )}
              </div>

              {formData.csvFile && (
                <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Column Mapping</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">SKU</span>
                      <span className="font-bold">Column A</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">Name</span>
                      <span className="font-bold">Column B</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">Price</span>
                      <span className="font-bold">Column C</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">Stock</span>
                      <span className="font-bold">Column D</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center justify-center text-center h-full">
              <div className="w-20 h-20 bg-black text-white flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black uppercase tracking-tight">{t('onboarding.activation')}</h3>
                <p className="text-sm text-neutral-500 font-medium max-w-sm">
                  {t('onboarding.ready_msg')}
                </p>
              </div>
              <div className="w-full max-w-sm p-6 border border-neutral-100 bg-neutral-50 text-left space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-black"></div>
                  <p className="text-[10px] font-bold uppercase tracking-widest">{t('onboarding.org_label')}: {formData.orgName}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-black"></div>
                  <p className="text-[10px] font-bold uppercase tracking-widest">{t('onboarding.plan_label')}: {t('onboarding.trial_label')}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-black"></div>
                  <p className="text-[10px] font-bold uppercase tracking-widest">{t('onboarding.currency')}: {formData.currency}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-neutral-100">
          <button 
            onClick={() => step > 1 && setStep(step - 1)}
            className={cn(
              "text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors",
              step === 1 ? "invisible" : ""
            )}
          >
            {t('onboarding.back')}
          </button>
          <button 
            onClick={handleNext} 
            className="btn-primary px-12 py-4 flex items-center"
          >
            {step === 4 ? t('onboarding.complete') : t('onboarding.next')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}

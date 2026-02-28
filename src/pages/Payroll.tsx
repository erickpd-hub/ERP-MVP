import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Plus, FileText, Download, CheckCircle2, AlertCircle, X, UserPlus, Wallet } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { cn } from '../lib/utils';

export function Payroll() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'payroll' | 'employees'>('payroll');
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);

  // Form states
  const [employeeForm, setEmployeeForm] = useState({ name: '', position: '', baseSalary: 0, bankAccount: '' });
  const [payrollForm, setPayrollForm] = useState({ employeeId: '', period: '2026-02', bonus: 0, deductions: 0 });

  const fetchData = async () => {
    setLoading(true);
    const [pRes, eRes] = await Promise.all([
      fetch('/api/payroll'),
      fetch('/api/employees')
    ]);
    const [pData, eData] = await Promise.all([pRes.json(), eRes.json()]);
    setPayrolls(pData);
    setEmployees(eData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeForm)
      });
      if (!res.ok) throw new Error('Failed to add employee');
      setShowEmployeeModal(false);
      setEmployeeForm({ name: '', position: '', baseSalary: 0, bankAccount: '' });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    const employee = employees.find(emp => emp.id === payrollForm.employeeId);
    if (!employee) return;

    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payrollForm,
          base: employee.baseSalary
        })
      });
      if (!res.ok) throw new Error('Failed to generate payroll');
      setShowPayrollModal(false);
      setPayrollForm({ employeeId: '', period: '2026-02', bonus: 0, deductions: 0 });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePayPayroll = async () => {
    if (!selectedPayroll) return;
    try {
      const res = await fetch(`/api/payroll/${selectedPayroll.id}/pay`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Payment failed');
      setShowConfirmModal(false);
      setSelectedPayroll(null);
      fetchData();
      alert(t('pay.success_paid'));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const totalPayout = payrolls.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight uppercase">{t('pay.title')}</h2>
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1 font-medium">{t('pay.subtitle')}</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowEmployeeModal(true)}
            className="btn-secondary flex items-center"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {t('pay.add_employee')}
          </button>
          <button 
            onClick={() => setShowPayrollModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('pay.generate')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200">
        <button 
          onClick={() => setActiveTab('payroll')}
          className={cn(
            "px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2",
            activeTab === 'payroll' ? "border-black text-black" : "border-transparent text-neutral-400 hover:text-neutral-600"
          )}
        >
          {t('pay.title')}
        </button>
        <button 
          onClick={() => setActiveTab('employees')}
          className={cn(
            "px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2",
            activeTab === 'employees' ? "border-black text-black" : "border-transparent text-neutral-400 hover:text-neutral-600"
          )}
        >
          {t('pay.employees_list')}
        </button>
      </div>

      {activeTab === 'payroll' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-base">
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1">{t('pay.total_payout')}</p>
              <h3 className="text-2xl font-bold tracking-tight">${totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="card-base">
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1">{t('pay.active_employees')}</p>
              <h3 className="text-2xl font-bold tracking-tight">{employees.length}</h3>
            </div>
            <div className="card-base">
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1">{t('pay.next_payment')}</p>
              <h3 className="text-2xl font-bold tracking-tight">28 FEB, 2026</h3>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-none overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pay.employee')}</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pay.period')}</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pay.net_salary')}</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pay.status')}</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right">{t('pay.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-400 uppercase tracking-widest text-xs font-bold">{t('common.loading')}</td>
                  </tr>
                ) : payrolls.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-400 uppercase tracking-widest text-xs font-bold">{t('pay.no_records')}</td>
                  </tr>
                ) : payrolls.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-black text-white rounded-none flex items-center justify-center text-[10px] font-bold mr-3">
                          {p.employee.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{p.employee.name}</p>
                          <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">{p.employee.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold uppercase">{p.period}</td>
                    <td className="px-6 py-4 text-sm font-black">${p.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-none uppercase tracking-widest",
                        p.status === 'PAID' ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"
                      )}>
                        {t(`pay.${p.status.toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        {p.status === 'DRAFT' && (
                          <button 
                            onClick={() => { setSelectedPayroll(p); setShowConfirmModal(true); }}
                            className="text-emerald-600 hover:text-emerald-700 transition-colors"
                            title={t('pay.pay_now')}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button className="text-neutral-400 hover:text-black transition-colors" title={t('pay.download_pdf')}>
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-none overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pay.employee')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pay.position')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pay.base')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pay.bank_account')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-neutral-400 uppercase tracking-widest text-xs font-bold">{t('common.loading')}</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-neutral-400 uppercase tracking-widest text-xs font-bold">{t('pay.no_records')}</td>
                </tr>
              ) : employees.map((e) => (
                <tr key={e.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-neutral-100 text-neutral-600 rounded-none flex items-center justify-center text-[10px] font-bold mr-3">
                        {e.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <p className="text-sm font-bold">{e.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold uppercase text-neutral-500">{e.position}</td>
                  <td className="px-6 py-4 text-xs font-black">${e.baseSalary.toFixed(2)}</td>
                  <td className="px-6 py-4 text-xs font-mono text-neutral-400">{e.bankAccount || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white card-base w-full max-w-md !p-0 overflow-hidden">
            <div className="p-6 border-b border-neutral-100 bg-neutral-50 flex justify-between items-center">
              <h3 className="text-lg font-bold uppercase tracking-tight">{t('pay.add_employee')}</h3>
              <button onClick={() => setShowEmployeeModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddEmployee} className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pay.name')}</label>
                <input 
                  required
                  className="input-base"
                  value={employeeForm.name}
                  onChange={e => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pay.position')}</label>
                <input 
                  required
                  className="input-base"
                  value={employeeForm.position}
                  onChange={e => setEmployeeForm({ ...employeeForm, position: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pay.base')}</label>
                  <input 
                    required
                    type="number"
                    className="input-base"
                    value={employeeForm.baseSalary}
                    onChange={e => setEmployeeForm({ ...employeeForm, baseSalary: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pay.bank_account')}</label>
                  <input 
                    className="input-base"
                    value={employeeForm.bankAccount}
                    onChange={e => setEmployeeForm({ ...employeeForm, bankAccount: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-4 text-sm uppercase tracking-widest font-bold">
                {t('pay.add_employee')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payroll Modal */}
      {showPayrollModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white card-base w-full max-w-md !p-0 overflow-hidden">
            <div className="p-6 border-b border-neutral-100 bg-neutral-50 flex justify-between items-center">
              <h3 className="text-lg font-bold uppercase tracking-tight">{t('pay.generate')}</h3>
              <button onClick={() => setShowPayrollModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleGeneratePayroll} className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pay.employee')}</label>
                <select 
                  required
                  className="input-base"
                  value={payrollForm.employeeId}
                  onChange={e => setPayrollForm({ ...payrollForm, employeeId: e.target.value })}
                >
                  <option value="">{t('pos.select_customer')}</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} (${emp.baseSalary})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pay.period')}</label>
                <input 
                  required
                  type="month"
                  className="input-base"
                  value={payrollForm.period}
                  onChange={e => setPayrollForm({ ...payrollForm, period: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pay.bonus')}</label>
                  <input 
                    type="number"
                    className="input-base text-emerald-600 font-bold"
                    value={payrollForm.bonus}
                    onChange={e => setPayrollForm({ ...payrollForm, bonus: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('pay.deductions')}</label>
                  <input 
                    type="number"
                    className="input-base text-rose-600 font-bold"
                    value={payrollForm.deductions}
                    onChange={e => setPayrollForm({ ...payrollForm, deductions: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-4 text-sm uppercase tracking-widest font-bold">
                {t('pay.calculate')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Payment Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white card-base w-full max-w-sm !p-0 overflow-hidden">
            <div className="p-6 border-b border-neutral-100 bg-neutral-50 flex justify-between items-center">
              <h3 className="text-lg font-bold uppercase tracking-tight">{t('pay.confirm_payment')}</h3>
              <button onClick={() => setShowConfirmModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-none flex items-center justify-center">
                  <Wallet className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold">{selectedPayroll?.employee.name}</p>
                  <p className="text-2xl font-black mt-1">${selectedPayroll?.amount.toFixed(2)}</p>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mt-2">{t('pay.confirm_msg')}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => setShowConfirmModal(false)} className="btn-secondary flex-1 py-3">{t('inv.cancel')}</button>
                <button onClick={handlePayPayroll} className="btn-primary flex-1 py-3 bg-emerald-600 hover:bg-emerald-700">{t('pay.pay_now')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

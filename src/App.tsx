/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Landing } from './pages/Landing';
import { Onboarding } from './pages/Onboarding';
import { POS } from './pages/POS';
import { Payroll } from './pages/Payroll';
import { Purchases } from './pages/Purchases';
import { Admin } from './pages/Admin';
import { AuditLog } from './pages/AuditLog';
import { Billing } from './pages/Billing';
import { LanguageProvider } from './lib/i18n';

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/landing" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* Protected Routes (Wrapped in Layout) */}
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
          <Route path="/pos" element={<Layout><POS /></Layout>} />
          <Route path="/payroll" element={<Layout><Payroll /></Layout>} />
          <Route path="/purchases" element={<Layout><Purchases /></Layout>} />
          <Route path="/admin" element={<Layout><Admin /></Layout>} />
          <Route path="/billing" element={<Layout><Billing /></Layout>} />
          <Route path="/audit" element={<Layout><AuditLog /></Layout>} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

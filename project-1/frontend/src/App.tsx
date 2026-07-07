import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore.js';
import { Navbar } from './components/layout/Navbar.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { FloatingAIBar } from './components/layout/FloatingAIBar.js';
import { AICommandModal } from './components/ai/AICommandModal.js';
import { AuthPage } from './components/auth/AuthPage.js';
import { DashboardPage } from './components/dashboard/DashboardPage.js';
import { BillingPage } from './components/billing/BillingPage.js';
import { InventoryPage } from './components/inventory/InventoryPage.js';
import { SuppliersPage } from './components/suppliers/SuppliersPage.js';
import { ReportsPage } from './components/reports/ReportsPage.js';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FAF9F6] via-[#FAF6F0] to-[#E8F5E9]">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6 min-w-0">
          {children}
        </main>
      </div>
      <FloatingAIBar />
      <AICommandModal />
    </div>
  );
};

export const App: React.FC = () => {
  const { isAuthenticated } = useStore();

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />
        
        <Route path="/" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
        <Route path="/billing" element={<ProtectedLayout><BillingPage /></ProtectedLayout>} />
        <Route path="/inventory" element={<ProtectedLayout><InventoryPage /></ProtectedLayout>} />
        <Route path="/suppliers" element={<ProtectedLayout><SuppliersPage /></ProtectedLayout>} />
        <Route path="/reports" element={<ProtectedLayout><ReportsPage /></ProtectedLayout>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

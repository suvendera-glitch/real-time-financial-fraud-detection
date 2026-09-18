import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Payment } from './pages/Payment';
import { AIAnalysis } from './pages/AIAnalysis';
import { RiskAlert } from './pages/RiskAlert';
import { Verification } from './pages/Verification';
import { Recheck } from './pages/Recheck';
import { Transactions } from './pages/Transactions';
import { TransactionDetails } from './pages/TransactionDetails';
import { SecurityCenter } from './pages/SecurityCenter';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminInvestigation } from './pages/AdminInvestigation';

// Wrapper to manage shell layout for application pages
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If on landing or login, render without full dashboard sidebar
  const isMinimalLayout = location.pathname === '/' || location.pathname === '/login';

  if (isMinimalLayout) {
    return (
      <div className="min-h-screen bg-[#040814] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 pt-16">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040814] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Fixed Navbar */}
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex pt-16">
        {/* Responsive Sidebar Navigation */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area: Offset by md:ml-64 so it cleanly clears the w-64 fixed sidebar */}
        <main className="flex-1 min-w-0 md:ml-64 px-4 sm:px-6 lg:px-8 py-6 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pay" element={<Payment />} />
            <Route path="/analysis" element={<AIAnalysis />} />
            <Route path="/risk-alert" element={<RiskAlert />} />
            <Route path="/verify" element={<Verification />} />
            <Route path="/recheck" element={<Recheck />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/:id" element={<TransactionDetails />} />
            <Route path="/security" element={<SecurityCenter />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/investigation/:id" element={<AdminInvestigation />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

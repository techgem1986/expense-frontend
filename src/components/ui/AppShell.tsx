import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  Plus,
  Wallet,
  Bell,
  Repeat,
  Tags,
} from 'lucide-react';
import AddExpenseDialog from './AddExpenseDialog';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: Receipt },
  { path: '/budgets', label: 'Budgets', icon: PiggyBank },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/accounts', label: 'Accounts', icon: Wallet },
  { path: '/recurring', label: 'Recurring', icon: Repeat },
  { path: '/categories', label: 'Categories', icon: Tags },
  { path: '/alerts', label: 'Alerts', icon: Bell },
];

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  const activePath =
    NAV_ITEMS.find(
      (item) => location.pathname === item.path || location.pathname.startsWith(item.path + '/'),
    )?.path || '/dashboard';

  return (
    <div className="min-h-screen bg-bg-deep relative overflow-hidden">
      {/* Ambient glowing blobs */}
      <div
        className="fixed -top-40 -right-40 w-96 h-96 rounded-full bg-neon-purple/20 blur-[120px] pointer-events-none -z-10 animate-float"
        style={{ animationDelay: '0s' }}
      />
      <div
        className="fixed -bottom-40 -left-40 w-96 h-96 rounded-full bg-neon-cyan/15 blur-[120px] pointer-events-none -z-10 animate-float"
        style={{ animationDelay: '-2s' }}
      />

      {/* Fixed Left Sidebar — 80px vertical dock */}
      <aside className="fixed inset-y-0 left-0 z-40 w-20 glass-panel border-r border-white/5 flex flex-col items-center py-6">
        {/* Logo */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan/30 to-neon-purple/30 border border-white/10 flex items-center justify-center mb-6">
          <span className="font-display font-bold text-neon-cyan text-2xl">Φ</span>
        </div>

        {/* Nav buttons */}
        <nav className="flex flex-col items-center gap-4 flex-1 overflow-y-auto scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const isActive = item.path === activePath;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative group w-10 h-10 flex items-center justify-center flex-shrink-0"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute -left-5 w-1 h-6 bg-neon-cyan rounded-r-full shadow-[0_0_10px_rgba(0,245,255,0.7)]"
                  />
                )}
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive ? 'text-neon-cyan' : 'text-white/30 hover:text-white/60'
                  }`}
                />
                {/* Tooltip */}
                <div className="absolute left-14 px-3 py-1.5 bg-surface border border-white/10 rounded-lg text-xs text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  {item.label}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Add Expense Button */}
        <button
          onClick={() => setDialogOpen(true)}
          className="w-10 h-10 rounded-full bg-neon-cyan flex items-center justify-center shadow-[0_0_20px_rgba(0,245,255,0.5)] hover:scale-110 transition-transform duration-200 flex-shrink-0 mt-4"
        >
          <Plus className="w-5 h-5 text-black" />
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="pl-24 sm:pl-28 pr-6 sm:pr-12 py-8 sm:py-12 max-w-[1600px] mx-auto min-h-screen">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </main>

      {/* Global Add Expense Dialog */}
      <AddExpenseDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
};

export default AppShell;

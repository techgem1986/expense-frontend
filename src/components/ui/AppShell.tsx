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
  ChevronLeft,
  ChevronRight,
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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

      {/* Fixed Left Sidebar — collapsible vertical dock */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          glass-panel border-r border-white/5
          flex flex-col items-center py-6
          transition-all duration-300 ease-in-out
          overflow-x-hidden overflow-y-auto
          ${isCollapsed ? 'w-20' : 'w-56'}
        `}
      >
        {/* Logo */}
        <div
          className={`
            flex items-center justify-center mb-6 transition-all duration-300
            ${isCollapsed ? 'w-12 h-12' : 'w-full px-4 gap-3'}
          `}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan/30 to-neon-purple/30 border border-white/10 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-neon-cyan text-2xl">Φ</span>
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="font-display font-bold text-neon-cyan text-xl whitespace-nowrap"
            >
              ExpenseHub
            </motion.span>
          )}
        </div>

        {/* Nav buttons */}
        <nav className="flex flex-col gap-1.5 flex-1 w-full px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = item.path === activePath;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  relative group flex items-center rounded-xl transition-all duration-200
                  ${isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'w-full px-3 py-2.5 gap-3'}
                  ${
                    isActive
                      ? 'bg-neon-cyan/10 text-neon-cyan'
                      : 'text-white/30 hover:text-white/60 hover:bg-white/[0.03]'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute -left-2.5 w-1 h-6 bg-neon-cyan rounded-r-full shadow-[0_0_10px_rgba(0,245,255,0.7)]"
                  />
                )}
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
                {/* Tooltip shown only in collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-14 px-3 py-1.5 bg-surface border border-white/10 rounded-lg text-xs text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom section: Add Expense + Toggle */}
        <div
          className={`
          flex flex-col items-center gap-3 mt-auto pt-4 w-full px-2
          ${isCollapsed ? '' : 'px-3'}
        `}
        >
          {/* Add Expense Button */}
          <button
            onClick={() => setDialogOpen(true)}
            className={`
              flex items-center justify-center rounded-full bg-neon-cyan
              shadow-[0_0_20px_rgba(0,245,255,0.5)] hover:scale-110 transition-transform duration-200 flex-shrink-0
              ${isCollapsed ? 'w-10 h-10' : 'w-full py-2.5 rounded-xl gap-2'}
            `}
          >
            <Plus className={isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-semibold text-black whitespace-nowrap"
              >
                Add Expense
              </motion.span>
            )}
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-colors duration-200"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className={`
          py-8 sm:py-12 pr-6 sm:pr-12 max-w-[1600px] mx-auto min-h-screen
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'pl-24 sm:pl-28' : 'pl-60 sm:pl-64'}
        `}
      >
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

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Wallet,
  Receipt,
  Repeat,
  Tags,
  PieChart,
  Bell,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface NavDivider {
  divider: true;
}

type NavItemOrDivider = NavItem | NavDivider;

const navItems: NavItemOrDivider[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { path: '/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { path: '/accounts', label: 'Accounts', icon: <Wallet className="w-5 h-5" /> },
  { divider: true },
  { path: '/transactions', label: 'Transactions', icon: <Receipt className="w-5 h-5" /> },
  { path: '/recurring-transactions', label: 'Recurring', icon: <Repeat className="w-5 h-5" /> },
  { path: '/categories', label: 'Categories', icon: <Tags className="w-5 h-5" /> },
  { divider: true },
  { path: '/budgets', label: 'Budgets', icon: <PieChart className="w-5 h-5" /> },
  { path: '/alerts', label: 'Alerts', icon: <Bell className="w-5 h-5" /> },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50
        bg-white dark:bg-gray-800
        border-r border-gray-200 dark:border-gray-700
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        hidden lg:flex lg:flex-col
      `}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ExpenseHub
          </span>
        )}
        {isCollapsed && (
          <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
            EH
          </span>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => {
          if ('divider' in item) {
            return (
              <div
                key={`divider-${index}`}
                className="my-4 border-t border-gray-200 dark:border-gray-700"
              />
            );
          }

          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
                ${isCollapsed ? 'justify-center' : 'gap-3'}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 ExpenseHub
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            v1.0.0
          </p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
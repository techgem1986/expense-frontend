import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeft,
  PanelLeftClose,
  PiggyBank,
  Plus,
  Receipt,
  Repeat,
  Search,
  Tags,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AddExpenseDialog from './AddExpenseDialog';
import CurrencySelector from '../CurrencySelector';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { path: '/transactions', label: 'Transactions', icon: Receipt },
      { path: '/budgets', label: 'Budgets', icon: PiggyBank },
      { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Manage',
    items: [
      { path: '/accounts', label: 'Accounts', icon: Wallet },
      { path: '/recurring', label: 'Recurring', icon: Repeat },
      { path: '/categories', label: 'Categories', icon: Tags },
    ],
  },
  {
    label: 'System',
    items: [{ path: '/alerts', label: 'Alerts', icon: Bell }],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

const USER_MENU_LINKS: NavItem[] = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/accounts', label: 'Accounts', icon: Wallet },
  { path: '/alerts', label: 'Alerts', icon: Bell },
];

const isItemActive = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Application shell: collapsible grouped sidebar, breadcrumb header with
 * workspace controls and a user menu, and a scrollable main content region.
 */
const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const activeItem = ALL_ITEMS.find((item) => isItemActive(location.pathname, item.path));
  const ActiveIcon = activeItem?.icon ?? LayoutDashboard;

  // Close transient UI whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close the user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials =
    `${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`.toUpperCase() || 'U';

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  const renderNav = (compact: boolean, onNavigate?: () => void) => (
    <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Primary navigation">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="nav-section-label">{group.label}</p>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onNavigate}
                    title={compact ? item.label : undefined}
                    className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className={compact ? 'sr-only' : 'truncate'}>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const renderSidebarTop = (compact: boolean) => (
    <div className="px-3 pt-4">
      <div className={`flex items-center gap-2 ${compact ? 'justify-center' : 'px-1'}`}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-white/[0.04]">
          <span className="font-brand text-sm font-bold text-foreground">Φ</span>
        </div>
        {!compact && (
          <span className="font-brand text-sm font-semibold text-foreground">ExpenseHub</span>
        )}
      </div>

      <div className={`mt-4 flex items-center gap-2 ${compact ? 'flex-col' : ''}`}>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          aria-label="Add expense"
          title={compact ? 'Add expense' : undefined}
          className={`btn-primary ${compact ? 'h-9 w-9 p-0' : 'flex-1 px-3 py-2'}`}
        >
          <Plus className="h-4 w-4" />
          {!compact && <span>Add Expense</span>}
        </button>
        <button
          type="button"
          onClick={() => navigate('/transactions')}
          aria-label="Search transactions"
          title="Search transactions"
          className="btn-secondary h-9 w-9 p-0"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderSidebarFooter = (compact: boolean) => (
    <div className="mt-auto border-t border-border p-3">
      <div className={`flex items-center gap-2 ${compact ? 'flex-col' : ''}`}>
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-xs font-medium text-foreground"
          aria-hidden="true"
        >
          {initials}
        </div>
        {!compact && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          className="btn-ghost h-8 w-8 p-0"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex ${
          collapsed ? 'w-[76px]' : 'w-64'
        }`}
      >
        {renderSidebarTop(collapsed)}
        {renderNav(collapsed)}
        {renderSidebarFooter(collapsed)}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-card">
            <div className="flex items-center justify-end px-3 pt-3">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="btn-ghost h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {renderSidebarTop(false)}
            {renderNav(false, () => setMobileOpen(false))}
            {renderSidebarFooter(false)}
          </aside>
        </div>
      )}

      {/* Content column */}
      <div
        className={`flex min-h-screen flex-col transition-[padding] duration-200 ${
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-64'
        }`}
      >
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur md:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="btn-ghost h-8 w-8 p-0 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-pressed={collapsed}
            className="btn-ghost hidden h-8 w-8 p-0 lg:inline-flex"
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <span className="mx-1 hidden h-5 w-px bg-border lg:block" aria-hidden="true" />
          <div className="flex min-w-0 items-center gap-2">
            <ActiveIcon
              className="hidden h-4 w-4 text-muted-foreground sm:block"
              aria-hidden="true"
            />
            <span className="truncate text-sm font-medium text-foreground">
              {activeItem?.label ?? 'Overview'}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <CurrencySelector />
            <button
              type="button"
              onClick={() => navigate('/alerts')}
              aria-label="Alerts"
              className="btn-ghost h-8 w-8 p-0"
            >
              <Bell className="h-4 w-4" />
            </button>
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((value) => !value)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                aria-label="Account menu"
                className="flex items-center gap-1.5 rounded-lg p-1 pr-2 transition-colors duration-150 hover:bg-white/[0.04]"
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.08] text-xs font-medium text-foreground"
                  aria-hidden="true"
                >
                  {initials}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
                >
                  <div className="border-b border-border px-3 py-2.5">
                    <p className="truncate text-sm font-medium text-foreground">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    {USER_MENU_LINKS.map((link) => {
                      const Icon = link.icon;
                      return (
                        <button
                          key={link.path}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setUserMenuOpen(false);
                            navigate(link.path);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground transition-colors duration-150 hover:bg-white/[0.04] hover:text-foreground"
                        >
                          <Icon className="h-4 w-4" />
                          {link.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-border py-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger transition-colors duration-150 hover:bg-white/[0.04]"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 md:px-6 md:py-6">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>

      <AddExpenseDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
};

export default AppShell;

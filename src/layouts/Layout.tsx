import React from 'react';
import AppShell from '../components/ui/AppShell';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return <AppShell>{children}</AppShell>;
};

export default Layout;

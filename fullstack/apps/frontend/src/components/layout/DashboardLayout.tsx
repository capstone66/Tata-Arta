import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import type { Role } from '../../types';

interface DashboardLayoutProps {
  role: Role;
  userFullName: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role, userFullName }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} userFullName={userFullName} />
      
      <div className="ml-[var(--spacing-sidebar)] flex-1 flex flex-col min-h-screen">
        <TopNavbar title="Dashboard" subtitle="Selamat pagi 👋" />
        
        <main className="p-6 md:p-7 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

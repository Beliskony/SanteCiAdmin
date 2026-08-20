// src/components/layout/DashboardLayout.tsx
import { Outlet } from 'react-router-dom';
import { Sidebar } from './SideBar';
import { Header } from './Header';

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-bg">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
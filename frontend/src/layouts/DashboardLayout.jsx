import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-900">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        desktopCollapsed={desktopCollapsed}
      />
      <div className={`min-w-0 transition-[padding] duration-300 ease-in-out ${desktopCollapsed ? '' : 'lg:pl-66'}`}>
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          onDesktopToggle={() => setDesktopCollapsed((v) => !v)}
          desktopCollapsed={desktopCollapsed}
        />
        <main className="px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

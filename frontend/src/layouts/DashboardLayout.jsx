import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen scroll-smooth bg-zinc-100 text-zinc-900">
      <Sidebar />
      <div className="min-w-0 bg-gradient-to-b from-white/70 to-zinc-100/95 lg:pl-[264px]">
        <Navbar />
        <main className="px-4 pb-8 pt-2 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

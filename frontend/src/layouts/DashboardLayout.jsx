import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Sidebar />
      <div className="min-w-0 lg:pl-66">
        <Navbar />
        <main className="px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

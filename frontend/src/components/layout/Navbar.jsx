import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const titleMap = {
  '/dashboard': 'Dashboard',
  '/documents': 'Documents',
  '/documents/upload': 'Upload Document',
  '/categories': 'Categories',
  '/barangays': 'Barangays',
  '/users': 'Users',
  '/activity-logs': 'Activity Logs',
};

const descriptionMap = {
  '/dashboard': 'Monitor archive growth, upload activity, and operational movement in one view.',
  '/documents': 'Browse, filter, and manage archived municipal records.',
  '/documents/upload': 'Create a new archive record and attach the official file.',
  '/categories': 'Maintain the document taxonomy used across the archive.',
  '/barangays': 'Manage barangay access scope and classification references.',
  '/users': 'Control users, permissions, and account assignments.',
  '/activity-logs': 'Review the audit trail for uploads, edits, downloads, and logins.',
};

export default function Navbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const userScope = user?.barangay?.name ? `${user.role} | ${user.barangay.name}` : user?.role;

  return (
    <header className="flex flex-col gap-4 px-4 pt-6 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
      <div>
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-400">MPDO Archiving System</p>
        <h1 className="text-[clamp(1.85rem,3vw,2.65rem)] font-semibold leading-none tracking-[-0.04em] text-zinc-900">
          {titleMap[pathname] ?? 'Workspace'}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-500 sm:text-[15px]">
          {descriptionMap[pathname] ?? 'Manage records, users, and archive operations.'}
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white/90 px-3 py-3 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
        <div className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700 text-sm font-bold text-white">
          {user?.name?.slice(0, 1)?.toUpperCase() ?? 'U'}
        </div>
        <div>
          <strong className="block text-sm font-semibold text-zinc-900">{user?.name ?? 'Archive User'}</strong>
          <p className="text-sm text-zinc-500">{userScope ?? 'Authenticated session'}</p>
        </div>
      </div>
    </header>
  );
}

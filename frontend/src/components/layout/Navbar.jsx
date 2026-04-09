import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const titleMap = {
  '/dashboard': 'Dashboard',
  '/documents': 'Documents',
  '/documents/upload': 'Upload Document',
  '/profile': 'My Profile',
  '/settings': 'Settings',
  '/categories': 'Categories',
  '/barangays': 'Barangays',
  '/users': 'Users',
  '/activity-logs': 'Activity Logs',
};

const descriptionMap = {
  '/dashboard': 'Monitor archive growth, upload activity, and operational movement in one view.',
  '/documents': 'Browse, filter, and manage archived municipal records.',
  '/documents/upload': 'Create a new archive record and attach the official file.',
  '/profile': 'Update your personal details and password.',
  '/settings': 'Configure core options used in validation and access control.',
  '/categories': 'Maintain the document taxonomy used across the archive.',
  '/barangays': 'Manage barangay access scope and classification references.',
  '/users': 'Control users, permissions, and account assignments.',
  '/activity-logs': 'Review the audit trail for uploads, edits, downloads, and logins.',
};

export default function Navbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const userScope = user?.barangay?.name
    ? `${user.role} · ${user.barangay.name}`
    : user?.role;

  return (
    <header className="border-b border-zinc-200 bg-white px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-blue-500" />
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-500">
              MPDO Archiving System
            </p>
          </div>
          <h1 className="mt-1 text-[clamp(1.5rem,3vw,2rem)] font-bold leading-tight tracking-[-0.03em] text-zinc-900">
            {titleMap[pathname] ?? 'Workspace'}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500">
            {descriptionMap[pathname] ?? 'Manage records, users, and archive operations.'}
          </p>
        </div>

        {userScope ? (
          <div className="mt-3 flex-shrink-0 sm:mt-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {userScope}
            </span>
          </div>
        ) : null}
      </div>
    </header>
  );
}

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

const roleColorMap = {
  admin: 'bg-violet-500/10 text-violet-600 border-violet-200/70',
  staff: 'bg-blue-500/10 text-blue-600 border-blue-200/70',
  barangay: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/70',
};

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const scopeLabel = user?.barangay?.name
    ? user.barangay.name
    : 'Municipal Access';
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : null;
  const roleBadgeColor = roleColorMap[user?.role] ?? 'bg-zinc-100 text-zinc-600 border-zinc-200';

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/90 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex items-start gap-3 sm:items-center">

        {/* Hamburger — mobile & tablet only */}
        <button
          type="button"
          onClick={onMenuClick}
          className="mt-1 grid size-9 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-900 lg:hidden"
          aria-label="Open navigation"
        >
          <HamburgerIcon />
        </button>

        {/* Page title + description */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-blue-500" />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-500/80">
              MPDO Archiving System
            </p>
          </div>
          <h1 className="mt-0.5 text-[clamp(1.25rem,3vw,1.85rem)] font-bold leading-tight tracking-[-0.035em] text-zinc-900">
            {titleMap[pathname] ?? 'Workspace'}
          </h1>
          <p className="mt-0.5 max-w-2xl text-sm leading-relaxed text-zinc-400">
            {descriptionMap[pathname] ?? 'Manage records, users, and archive operations.'}
          </p>
        </div>

        {/* Role + scope badges */}
        {roleLabel ? (
          <div className="mt-1 flex shrink-0 flex-col items-end gap-1.5 sm:mt-0 sm:flex-row sm:items-center">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${roleBadgeColor}`}>
              {roleLabel}
            </span>
            <span className="hidden items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[11px] font-medium text-zinc-500 sm:inline-flex">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {scopeLabel}
            </span>
          </div>
        ) : null}
      </div>
    </header>
  );
}

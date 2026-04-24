import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navigation = [
  {
    section: 'Workspace',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['admin', 'staff', 'barangay'] },
      { to: '/documents', label: 'Documents', icon: 'documents', roles: ['admin', 'staff', 'barangay'] },
      { to: '/profile', label: 'My Profile', icon: 'profile', roles: ['admin', 'staff', 'barangay'] },
    ],
  },
  {
    section: 'Administration',
    items: [
      { to: '/settings', label: 'Settings', icon: 'settings', roles: ['admin'] },
      { to: '/categories', label: 'Categories', icon: 'categories', roles: ['admin'] },
      { to: '/barangays', label: 'Barangays', icon: 'barangays', roles: ['admin'] },
      { to: '/users', label: 'Users', icon: 'users', roles: ['admin'] },
      { to: '/activity-logs', label: 'Activity Logs', icon: 'activity', roles: ['admin'] },
    ],
  },
];

function SidebarIcon({ name, className = 'size-[18px]' }) {
  const paths = {
    dashboard: 'M3 11.5 12 4l9 7.5v7a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z M9 20v-6h6v6',
    documents: 'M7 3.75h7.5L19.25 8.5v11A1.75 1.75 0 0 1 17.5 21h-10A1.75 1.75 0 0 1 5.75 19.5v-14A1.75 1.75 0 0 1 7.5 3.75z M14 3.75V8.5h4.75 M8.75 12h7.5 M8.75 15.5h7.5',
    categories: 'M5 6.5h14 M5 12h14 M5 17.5h14',
    barangays: 'M4.75 18.25h14.5 M7.5 18.25V8.75l4.5-3 4.5 3v9.5 M10 18.25v-4.5h4v4.5',
    users: 'M12 12a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5z M5.5 19.5a6.5 6.5 0 0 1 13 0',
    activity: 'M5 12h3l2-5 4 10 2-5h3',
    profile: 'M12 12a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5z M4.75 19.5a7.25 7.25 0 0 1 14.5 0',
    settings: 'M12 15.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5z M19.5 12a7.5 7.5 0 0 0-.1-1.2l2-1.55-2-3.46-2.35.95a7.7 7.7 0 0 0-2.05-1.2L14.6 3h-4l-.4 2.54a7.7 7.7 0 0 0-2.05 1.2l-2.35-.95-2 3.46 2 1.55A7.5 7.5 0 0 0 4.5 12c0 .41.03.81.1 1.2l-2 1.55 2 3.46 2.35-.95c.62.5 1.31.9 2.05 1.2L10.4 21h4l.4-2.54c.74-.3 1.43-.7 2.05-1.2l2.35.95 2-3.46-2-1.55c.07-.39.1-.79.1-1.2z',
    logout: 'M14 7.75 18.25 12 14 16.25 M18 12H9.75 M10.5 4.75h-3A1.75 1.75 0 0 0 5.75 6.5v11A1.75 1.75 0 0 0 7.5 19.25h3',
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

export default function Sidebar({ open = false, onClose }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  // Auto-close drawer when navigating on mobile/tablet
  useEffect(() => {
    onClose?.();
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const visibleSections = navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(user?.role)),
    }))
    .filter((group) => group.items.length > 0);

  const userScope = user?.barangay?.name ? user.barangay.name : 'Municipal Access';
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'User';
  const userInitial = user?.name?.slice(0, 1)?.toUpperCase() ?? 'U';

  return (
    <>
      {/* Backdrop — mobile/tablet only */}
      <div
        className={[
          'fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <aside
        className={[
          // Base — mobile/tablet: fixed overlay drawer
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 transition-transform duration-300 ease-in-out',
          // Desktop: always visible, narrower, lower z
          'lg:z-30 lg:w-66 lg:translate-x-0',
          // Slide state for mobile/tablet
          open ? 'translate-x-0 shadow-2xl shadow-slate-900/60' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">

          {/* Brand + mobile close button */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-3.5 py-3">
            <div className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-[13px] font-bold tracking-wide text-white shadow-lg shadow-blue-900/40">
              <span>MP</span>
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-slate-950 bg-emerald-500" />
            </div>
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-[13px] font-bold tracking-tight text-white">MPDO Archiving</strong>
              <span className="block truncate text-[11px] text-slate-500">Document Management</span>
            </div>
            {/* Close button — mobile/tablet only */}
            <button
              type="button"
              onClick={onClose}
              className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 lg:hidden"
              aria-label="Close sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          {visibleSections.map((group) => (
            <div key={group.section} className="grid gap-1">
              <div className="flex items-center gap-2 px-2 pb-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                  {group.section}
                </span>
                <span className="h-px flex-1 bg-slate-800" />
              </div>
              <nav className="grid gap-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                        isActive
                          ? 'bg-blue-600/15 text-blue-400'
                          : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200',
                      ].join(' ')
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-blue-500" />
                        )}
                        <span className={[
                          'grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-150',
                          isActive
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'text-slate-500 group-hover:bg-slate-700/60 group-hover:text-slate-300',
                        ].join(' ')}>
                          <SidebarIcon name={item.icon} />
                        </span>
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* User footer */}
        <div className="space-y-2 border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-900/60 px-3 py-2.5">
            {user?.profile_photo_url ? (
              <img
                src={user.profile_photo_url}
                alt="Profile"
                className="size-8 shrink-0 rounded-full border border-slate-700/60 object-cover"
              />
            ) : (
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-[12px] font-bold text-white shadow-md shadow-blue-900/30">
                {userInitial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-[13px] font-semibold leading-tight text-slate-100">
                {user?.name ?? 'Archive User'}
              </strong>
              <p className="truncate text-[11px] text-slate-500">
                {roleLabel} &middot; {userScope}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-xl border border-slate-800 px-3 py-2.5 text-[13px] font-medium text-slate-400 transition-all duration-150 hover:border-red-900/50 hover:bg-red-950/40 hover:text-red-400"
            onClick={logout}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-500">
              <SidebarIcon name="logout" />
            </span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

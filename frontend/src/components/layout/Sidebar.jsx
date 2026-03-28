import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navigation = [
  {
    section: 'Workspace',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['admin', 'staff', 'barangay'] },
      { to: '/documents', label: 'Documents', icon: 'documents', roles: ['admin', 'staff', 'barangay'] },
      { to: '/documents/upload', label: 'Upload Document', icon: 'upload', roles: ['admin', 'staff'] },
    ],
  },
  {
    section: 'Administration',
    items: [
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
    upload: 'M12 16.25V7.75 M8.5 11.25 12 7.75l3.5 3.5 M5.75 18.25h12.5',
    categories: 'M5 6.5h14 M5 12h14 M5 17.5h14',
    barangays: 'M4.75 18.25h14.5 M7.5 18.25V8.75l4.5-3 4.5 3v9.5 M10 18.25v-4.5h4v4.5',
    users: 'M12 12a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5z M5.5 19.5a6.5 6.5 0 0 1 13 0',
    activity: 'M5 12h3l2-5 4 10 2-5h3',
    logout: 'M14 7.75 18.25 12 14 16.25 M18 12H9.75 M10.5 4.75h-3A1.75 1.75 0 0 0 5.75 6.5v11A1.75 1.75 0 0 0 7.5 19.25h3',
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const visibleSections = navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(user?.role)),
    }))
    .filter((group) => group.items.length > 0);
  const userScope = user?.barangay?.name ? user.barangay.name : 'Municipal access';

  return (
    <aside className="flex min-h-auto flex-col border-b border-zinc-200 bg-zinc-50/90 p-4 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:h-screen lg:w-[264px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center gap-3 rounded-[1.35rem] border border-zinc-200 bg-white/90 p-2 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-700 text-sm font-bold tracking-[0.2em] text-white">
            MP
          </div>
          <div>
            <strong className="block text-sm font-semibold text-zinc-900">MPDO Archiving</strong>
            <p className="text-xs text-zinc-500">Tailwind dashboard shell</p>
          </div>
        </div>

        {visibleSections.map((group) => (
          <div key={group.section} className="grid gap-2">
            <p className="px-3 text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-400">{group.section}</p>
            <nav className="grid gap-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition',
                      isActive
                        ? 'border-zinc-200 bg-white text-zinc-900 shadow-[0_12px_28px_rgba(15,23,42,0.08)]'
                        : 'border-transparent text-zinc-600 hover:border-zinc-200 hover:bg-white/80 hover:text-zinc-900',
                    ].join(' ')
                  }
                >
                  <SidebarIcon name={item.icon} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 border-t border-zinc-200 px-1 pt-4">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-zinc-200 to-zinc-50 text-sm font-bold text-zinc-900">
            {user?.name?.slice(0, 1)?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <strong className="block text-sm font-semibold text-zinc-900">{user?.name ?? 'Archive User'}</strong>
            <p className="text-xs text-zinc-500">{userScope}</p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex w-full items-center justify-start gap-3 rounded-full border border-zinc-900/10 bg-gradient-to-r from-zinc-900 to-zinc-800 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5"
          onClick={logout}
        >
          <SidebarIcon name="logout" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

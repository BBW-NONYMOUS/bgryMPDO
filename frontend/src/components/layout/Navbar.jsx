import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const titleMap = {
  '/dashboard': 'Admin Dashboard',
  '/documents': 'Documents',
  '/documents/upload': 'Upload Document',
  '/profile': 'My Profile',
  '/settings': 'Settings',
  '/categories': 'Categories',
  '/barangays': 'Barangays',
  '/users': 'Users',
  '/activity-logs': 'Activity Logs',
  '/archive-status': 'Archive Status',
  '/reports': 'Reports',
};

const descriptionMap = {
  '/dashboard': "Welcome back! Here's what's happening in the system today.",
  '/documents': 'Browse, filter, and manage archived municipal records.',
  '/documents/upload': 'Create a new archive record and attach the official file.',
  '/profile': 'Update your personal details and password.',
  '/settings': 'Configure core options used in validation and access control.',
  '/categories': 'Maintain the document taxonomy used across the archive.',
  '/barangays': 'Manage barangay access scope and classification references.',
  '/users': 'Control users, permissions, and account assignments.',
  '/activity-logs': 'Review the audit trail for uploads, edits, downloads, and logins.',
  '/archive-status': 'View and update the archive status of individual documents.',
  '/reports': 'Export document, activity log, and summary reports in CSV or Excel format.',
};

const roleTitleMap = {
  admin: 'System Administrator',
  staff: 'MPDO Staff',
  barangay: 'Barangay Official',
};

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
    </svg>
  );
}

export default function Navbar({ onMenuClick, onDesktopToggle, desktopCollapsed }) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (!notifOpen) return;
    function handleOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [notifOpen]);

  const userInitial = user?.name?.slice(0, 1)?.toUpperCase() ?? 'U';
  const roleTitle = roleTitleMap[user?.role] ?? 'User';

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">

        {/* Desktop sidebar collapse toggle */}
        <button
          type="button"
          onClick={onDesktopToggle}
          className="hidden size-9 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-900 lg:grid"
          aria-label={desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <HamburgerIcon />
        </button>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="grid size-9 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-900 lg:hidden"
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
          <h1 className="mt-0.5 text-[clamp(1rem,2.5vw,1.5rem)] font-bold leading-tight tracking-[-0.035em] text-zinc-900">
            {titleMap[pathname] ?? 'Workspace'}
          </h1>
          <p className="mt-0.5 hidden max-w-xl truncate text-sm leading-relaxed text-zinc-400 sm:block">
            {descriptionMap[pathname] ?? 'Manage records, users, and archive operations.'}
          </p>
        </div>

        {/* Right: notification + profile */}
        <div className="flex shrink-0 items-center gap-2">

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              className="relative grid size-9 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-900"
              aria-label="Notifications"
            >
              <BellIcon />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500 ring-1 ring-white" aria-hidden="true" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/10">
                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
                  <p className="text-xs font-bold text-zinc-900">Notifications</p>
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">New</span>
                </div>
                <div className="px-4 py-8 text-center">
                  <div className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-zinc-100 text-zinc-400">
                    <BellIcon />
                  </div>
                  <p className="text-sm font-medium text-zinc-600">No new notifications</p>
                  <p className="mt-1 text-xs text-zinc-400">You're all caught up.</p>
                </div>
              </div>
            )}
          </div>

          {/* Profile chip */}
          <div className="flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm">
            {user?.profile_photo_url ? (
              <img
                src={user.profile_photo_url}
                alt="Profile"
                className="size-8 shrink-0 rounded-full object-cover ring-1 ring-zinc-200"
              />
            ) : (
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-bold text-white shadow-sm shadow-blue-700/30">
                {userInitial}
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-xs font-bold leading-tight text-zinc-900">{user?.name ?? 'User'}</p>
              <p className="text-[10px] leading-tight text-zinc-400">{roleTitle}</p>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}

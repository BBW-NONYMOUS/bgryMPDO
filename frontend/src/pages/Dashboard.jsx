import { useEffect, useState } from 'react';
import { getDashboard } from '../api/dashboardApi';
import { downloadDashboardSummaryReport } from '../api/reportApi';
import StatusPill from '../components/common/StatusPill';
import LoadingState from '../components/common/LoadingState';
import DataTable from '../components/tables/DataTable';
import { ghostButtonClassName } from '../styles/uiClasses';
import { formatDateTime } from '../utils/apiData';

const dayFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

function startOfDay(date) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return null;
  value.setHours(0, 0, 0, 0);
  return value;
}

function buildTimeline(recentDocuments, recentActivity) {
  const today = startOfDay(new Date());
  const timeline = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return { key: date.toISOString().slice(0, 10), label: dayFormatter.format(date), uploads: 0, activity: 0 };
  });

  const bucketMap = Object.fromEntries(timeline.map((bucket) => [bucket.key, bucket]));

  recentDocuments.forEach((item) => {
    const value = item.uploaded_at ?? item.created_at;
    if (!value) return;
    const day = startOfDay(value);
    if (!day) return;
    const key = day.toISOString().slice(0, 10);
    if (bucketMap[key]) bucketMap[key].uploads += 1;
  });

  recentActivity.forEach((item) => {
    if (!item.created_at) return;
    const day = startOfDay(item.created_at);
    if (!day) return;
    const key = day.toISOString().slice(0, 10);
    if (bucketMap[key]) bucketMap[key].activity += 1;
  });

  return timeline;
}

function buildPoints(series, key, width, height, padding) {
  const values = series.map((item) => item[key]);
  const maxValue = Math.max(...values, 1);
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;
  return series.map((item, index) => ({
    x: padding + (plotWidth / Math.max(series.length - 1, 1)) * index,
    y: padding + plotHeight - (item[key] / maxValue) * plotHeight,
  }));
}

function buildLinePath(points) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function buildAreaPath(points, height, padding) {
  if (!points.length) return '';
  return `${buildLinePath(points)} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
}

function ActivityChart({ series }) {
  const width = 760;
  const height = 260;
  const padding = 28;
  const uploadsPoints = buildPoints(series, 'uploads', width, height, padding);
  const activityPoints = buildPoints(series, 'activity', width, height, padding);

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-5 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-700">
            <span className="size-2.5 rounded-full bg-blue-600" />
            Uploads
          </span>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            Activity
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="block h-auto w-full"
        role="img"
        aria-label="Archive activity chart for the last seven days"
      >
        <defs>
          <linearGradient id="uploads-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="activity-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3].map((line) => {
          const y = padding + ((height - padding * 2) / 3) * line;
          return <line key={line} x1={padding} y1={y} x2={width - padding} y2={y} className="stroke-zinc-100" />;
        })}

        <path d={buildAreaPath(activityPoints, height, padding)} fill="url(#activity-fill)" />
        <path d={buildAreaPath(uploadsPoints, height, padding)} fill="url(#uploads-fill)" />
        <path d={buildLinePath(activityPoints)} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        <path d={buildLinePath(uploadsPoints)} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />

        {uploadsPoints.map((point, index) => (
          <g key={series[index].key}>
            <circle cx={point.x} cy={point.y} r="4" fill="#2563eb" />
            <circle cx={activityPoints[index].x} cy={activityPoints[index].y} r="4" fill="#10b981" />
            <text x={point.x} y={height - 8} textAnchor="middle" fill="#a1a1aa" fontSize="11" fontWeight="500">
              {series[index].label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function formatActionLabel(action) {
  return String(action ?? 'System event')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

// Colorful metric card with icon
function MetricCard({ label, value, badge, hint, icon, accent = 'blue' }) {
  const config = {
    blue: {
      wrap: 'border-blue-100 bg-blue-50',
      icon: 'bg-blue-100 text-blue-600',
      badge: 'bg-blue-600 text-white shadow-[0_3px_10px_rgba(37,99,235,0.30)]',
    },
    violet: {
      wrap: 'border-violet-100 bg-violet-50',
      icon: 'bg-violet-100 text-violet-600',
      badge: 'bg-violet-600 text-white shadow-[0_3px_10px_rgba(124,58,237,0.30)]',
    },
    emerald: {
      wrap: 'border-emerald-100 bg-emerald-50',
      icon: 'bg-emerald-100 text-emerald-600',
      badge: 'bg-emerald-600 text-white shadow-[0_3px_10px_rgba(5,150,105,0.30)]',
    },
    amber: {
      wrap: 'border-amber-100 bg-amber-50',
      icon: 'bg-amber-100 text-amber-600',
      badge: 'bg-amber-500 text-white shadow-[0_3px_10px_rgba(245,158,11,0.30)]',
    },
  };
  const c = config[accent] ?? config.blue;

  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${c.wrap}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`grid size-10 place-items-center rounded-xl ${c.icon}`}>
          {icon}
        </div>
        {badge ? (
          <span className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-[11px] font-semibold ${c.badge}`}>
            {badge}
          </span>
        ) : null}
      </div>
      <strong className="mt-4 block text-[2.2rem] font-bold leading-none tracking-[-0.04em] text-zinc-900">
        {value ?? '--'}
      </strong>
      <p className="mt-2 text-sm font-semibold text-zinc-700">{label}</p>
      {hint ? <p className="mt-0.5 text-xs text-zinc-500">{hint}</p> : null}
    </article>
  );
}

function SummaryCard({ label, value, hint, accent = 'blue' }) {
  const config = {
    blue: 'border-blue-100 bg-blue-50 text-blue-900',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-900',
  };
  return (
    <div className={`rounded-xl border p-4 ${config[accent] ?? config.blue}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-60">{label}</p>
      <div className="mt-2 text-3xl font-bold tracking-[-0.04em]">{value ?? '--'}</div>
      <p className="mt-1.5 text-sm opacity-60 leading-5">{hint}</p>
    </div>
  );
}

function SnapshotItem({ label, value, meta }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <div className="mt-0.5 size-1.5 flex-shrink-0 rounded-full bg-blue-500 ring-4 ring-blue-100" />
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400">{label}</p>
        <p className="mt-1 truncate text-sm font-semibold text-zinc-900">{value}</p>
        <p className="mt-0.5 text-xs text-zinc-500">{meta}</p>
      </div>
    </div>
  );
}

// SVG icons for metric cards
function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <path d="M7 3.75h7.5L19.25 8.5v11A1.75 1.75 0 0 1 17.5 21h-10A1.75 1.75 0 0 1 5.75 19.5v-14A1.75 1.75 0 0 1 7.5 3.75z" />
      <path d="M14 3.75V8.5h4.75M8.75 12h7.5M8.75 15.5h7.5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <path d="M12 12a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5z" />
      <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <path d="M5 6.5h14M5 12h14M5 17.5h14" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <path d="M4.75 18.25h14.5M7.5 18.25V8.75l4.5-3 4.5 3v9.5M10 18.25v-4.5h4v4.5" />
    </svg>
  );
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await getDashboard();
        setDashboard(response);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <LoadingState
        title="Loading dashboard"
        description="Preparing archive metrics and recent activity."
      />
    );
  }

  const recentDocuments = dashboard?.recent_documents ?? [];
  const recentActivity = dashboard?.recent_activity ?? [];
  const activitySeries = buildTimeline(recentDocuments, recentActivity);
  const uploadsThisWeek = activitySeries.reduce((total, item) => total + item.uploads, 0);
  const actionsThisWeek = activitySeries.reduce((total, item) => total + item.activity, 0);
  const latestDocument = recentDocuments[0];
  const latestEvent = recentActivity[0];

  return (
    <div className="space-y-6">

      {/* Hero banner */}
      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-linear-to-br from-blue-600 to-blue-800 p-6 text-white shadow-[0_8px_30px_rgba(37,99,235,0.25)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-blue-200">
              Administrative Overview
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] sm:text-[2rem]">
              Archive Management Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
              Monitor document flow, system activity, and operational coverage from one executive workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 xl:min-w-[400px] xl:justify-end">
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">Latest Upload</p>
              <p className="mt-1 max-w-[160px] truncate text-sm font-semibold">
                {latestDocument?.title ?? 'No uploads yet'}
              </p>
              <p className="mt-0.5 text-xs text-blue-200">
                {latestDocument ? formatDateTime(latestDocument.uploaded_at ?? latestDocument.created_at) : '--'}
              </p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">Weekly Pace</p>
              <p className="mt-1 text-sm font-bold">
                {uploadsThisWeek} uploads
              </p>
              <p className="mt-0.5 text-xs text-blue-200">{actionsThisWeek} events · Last 7 days</p>
            </div>

            <button
              type="button"
              className="self-end rounded-xl border border-white/25 bg-white/15 px-4 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
              onClick={downloadDashboardSummaryReport}
            >
              Export Summary
            </button>
          </div>
        </div>
      </section>

      {/* Metric cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Documents"
          value={dashboard?.counts?.documents}
          badge={`${uploadsThisWeek} this week`}
          hint="Archived files in the system."
          icon={<DocIcon />}
          accent="blue"
        />
        <MetricCard
          label="Total Users"
          value={dashboard?.counts?.users}
          badge="Admin scope"
          hint="Accounts with system access."
          icon={<UsersIcon />}
          accent="violet"
        />
        <MetricCard
          label="Total Categories"
          value={dashboard?.counts?.categories}
          badge={`${recentDocuments.length} recent`}
          hint="Document classification groups."
          icon={<TagIcon />}
          accent="emerald"
        />
        <MetricCard
          label="Total Barangays"
          value={dashboard?.counts?.barangays}
          badge={`${actionsThisWeek} events`}
          hint="Linked local units for tagging."
          icon={<MapIcon />}
          accent="amber"
        />
      </section>

      {/* Chart + Snapshot */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]">
        <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-500">Archive Pulse</p>
              <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-zinc-900">Weekly activity overview</h2>
              <p className="mt-1 max-w-md text-sm text-zinc-500">
                Uploads and audit events over the last 7 days.
              </p>
            </div>
            <span className="inline-flex items-center self-start rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              Last 7 days
            </span>
          </div>

          <ActivityChart series={activitySeries} />

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SummaryCard
              label="Uploads this week"
              value={uploadsThisWeek}
              hint="New documents added during the weekly period."
              accent="blue"
            />
            <SummaryCard
              label="Activity events"
              value={actionsThisWeek}
              hint="Audit entries generated by user actions."
              accent="emerald"
            />
          </div>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-500">Executive Snapshot</p>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-zinc-900">Operational highlights</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Key archive signals for this administrator account.
            </p>
          </div>
          <div className="mt-4 grid gap-2.5">
            <SnapshotItem
              label="Recent uploads"
              value={String(recentDocuments.length)}
              meta="Items in the latest uploads feed."
            />
            <SnapshotItem
              label="Activity feed"
              value={String(recentActivity.length)}
              meta="Recent audit entries available for review."
            />
            <SnapshotItem
              label="Latest document"
              value={latestDocument?.title ?? 'No document uploaded yet'}
              meta={latestDocument ? formatDateTime(latestDocument.uploaded_at ?? latestDocument.created_at) : '--'}
            />
            <SnapshotItem
              label="Latest activity"
              value={latestEvent ? formatActionLabel(latestEvent.action) : 'No activity logged yet'}
              meta={latestEvent ? formatDateTime(latestEvent.created_at) : '--'}
            />
            <SnapshotItem
              label="Visible categories"
              value={String(dashboard?.counts?.categories ?? '--')}
              meta="Classification groups for this account."
            />
            <SnapshotItem
              label="Barangay coverage"
              value={String(dashboard?.counts?.barangays ?? '--')}
              meta="Linked local units used for tagging."
            />
          </div>
        </article>
      </section>

      {/* Tables */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-500">Recent Uploads</p>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-zinc-900">Latest documents</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Newest uploaded files and their current visibility context.
            </p>
          </div>
          <DataTable
            columns={[
              {
                key: 'title',
                label: 'Title',
                render: (row) => (
                  <div className="max-w-xs">
                    <p className="truncate text-sm font-semibold text-zinc-900">{row.title}</p>
                  </div>
                ),
              },
              {
                key: 'category',
                label: 'Category',
                render: (row) => <span className="text-sm text-zinc-600">{row.category?.name ?? '--'}</span>,
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusPill value={row.status} />,
              },
              {
                key: 'uploaded_at',
                label: 'Uploaded',
                render: (row) => (
                  <span className="whitespace-nowrap text-sm text-zinc-500">
                    {formatDateTime(row.uploaded_at ?? row.created_at)}
                  </span>
                ),
              },
            ]}
            rows={recentDocuments}
            emptyTitle="No uploads yet"
            emptyDescription="Recent documents will appear here after the first upload."
          />
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-500">Audit Trail</p>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-zinc-900">Recent activity</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Recent system actions, user events, and document changes.
            </p>
          </div>
          <DataTable
            columns={[
              {
                key: 'action',
                label: 'Action',
                render: (row) => (
                  <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {formatActionLabel(row.action)}
                  </span>
                ),
              },
              {
                key: 'user',
                label: 'User',
                render: (row) => (
                  <span className="text-sm font-semibold text-zinc-900">{row.user?.name ?? 'System'}</span>
                ),
              },
              {
                key: 'document',
                label: 'Document',
                render: (row) => (
                  <div className="max-w-[200px]">
                    <p className="truncate text-sm text-zinc-600">{row.document?.title ?? '--'}</p>
                  </div>
                ),
              },
              {
                key: 'created_at',
                label: 'When',
                render: (row) => (
                  <span className="whitespace-nowrap text-sm text-zinc-500">
                    {formatDateTime(row.created_at)}
                  </span>
                ),
              },
            ]}
            rows={recentActivity}
            emptyTitle="No activity yet"
            emptyDescription="Login, upload, update, and download events will appear here."
          />
        </article>
      </section>
    </div>
  );
}

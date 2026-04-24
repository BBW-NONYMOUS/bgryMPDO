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

// ─── Charts ────────────────────────────────────────────────────────────────

function ActivityChart({ series }) {
  const width = 760;
  const height = 220;
  const padding = 28;
  const uploadsPoints = buildPoints(series, 'uploads', width, height, padding);
  const activityPoints = buildPoints(series, 'activity', width, height, padding);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50/50">
      <div className="flex flex-wrap items-center gap-5 border-b border-zinc-100 px-5 py-3">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-700">
          <span className="size-2.5 rounded-full bg-blue-500" />
          Uploads
        </span>
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500">
          <span className="size-2.5 rounded-full bg-emerald-500" />
          Activity events
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="block h-auto w-full"
        role="img"
        aria-label="Archive activity chart for the last seven days"
      >
        <defs>
          <linearGradient id="uploads-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="activity-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((line) => {
          const y = padding + ((height - padding * 2) / 3) * line;
          return <line key={line} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f1f5f9" strokeWidth="1" />;
        })}
        <path d={buildAreaPath(activityPoints, height, padding)} fill="url(#activity-fill)" />
        <path d={buildAreaPath(uploadsPoints, height, padding)} fill="url(#uploads-fill)" />
        <path d={buildLinePath(activityPoints)} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={buildLinePath(uploadsPoints)} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {uploadsPoints.map((point, index) => (
          <g key={series[index].key}>
            <circle cx={point.x} cy={point.y} r="5" fill="#fff" stroke="#3b82f6" strokeWidth="2" />
            <circle cx={activityPoints[index].x} cy={activityPoints[index].y} r="5" fill="#fff" stroke="#10b981" strokeWidth="2" />
            <text x={point.x} y={height - 7} textAnchor="middle" fill="#94a3b8" fontSize="10.5" fontWeight="500">
              {series[index].label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

const STATUS_COLORS = {
  active: '#22c55e',
  draft: '#f59e0b',
  archived: '#94a3b8',
};
const STATUS_LABELS = { active: 'Active', draft: 'Draft', archived: 'Archived' };

function DonutChart({ statusCounts }) {
  const entries = Object.entries(statusCounts ?? {}).map(([status, count]) => ({
    status,
    count: Number(count),
    color: STATUS_COLORS[status] ?? '#cbd5e1',
    label: STATUS_LABELS[status] ?? status,
  }));
  const total = entries.reduce((s, e) => s + e.count, 0);

  const cx = 72, cy = 72, r = 54, strokeW = 18;
  const circumference = 2 * Math.PI * r;
  let cumulativePct = 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 144 144" className="w-36 shrink-0" aria-label="Document status distribution">
          {total === 0 ? (
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeW} />
          ) : (
            entries.map((entry) => {
              const pct = entry.count / total;
              const dashArray = pct * circumference;
              const dashOffset = circumference * (0.25 - cumulativePct);
              cumulativePct += pct;
              return (
                <circle
                  key={entry.status}
                  cx={cx} cy={cy} r={r}
                  fill="none"
                  stroke={entry.color}
                  strokeWidth={strokeW}
                  strokeDasharray={`${dashArray} ${circumference - dashArray}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="butt"
                />
              );
            })
          )}
          <text x={cx} y={cy - 6} textAnchor="middle" fill="#0f172a" fontSize="22" fontWeight="700">{total}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="500">docs</text>
        </svg>
      </div>
      <div className="grid gap-1.5">
        {entries.length === 0 ? (
          <p className="text-center text-xs text-zinc-400">No data</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.status} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: entry.color }} />
                <span className="text-xs text-zinc-600">{entry.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-800">{entry.count}</span>
                <span className="text-[10px] text-zinc-400">
                  {total > 0 ? `${Math.round((entry.count / total) * 100)}%` : '0%'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CategoryBarChart({ topCategories }) {
  const data = topCategories ?? [];
  const max = Math.max(...data.map((d) => d.count), 1);

  const ACCENT = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  if (data.length === 0) {
    return <p className="py-4 text-center text-xs text-zinc-400">No category data yet</p>;
  }

  return (
    <div className="grid gap-2.5">
      {data.map((item, i) => {
        const pct = (item.count / max) * 100;
        const color = ACCENT[i % ACCENT.length];
        return (
          <div key={item.name} className="grid gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-xs font-medium text-zinc-600" title={item.name}>{item.name}</span>
              <span className="shrink-0 text-xs font-bold tabular-nums text-zinc-800">{item.count}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Support components ─────────────────────────────────────────────────────

function formatActionLabel(action) {
  return String(action ?? 'System event')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function MetricCard({ label, value, badge, hint, icon, accent = 'blue' }) {
  const config = {
    blue: { wrap: 'border-blue-100 bg-blue-50', icon: 'bg-blue-100 text-blue-600', badge: 'bg-blue-600 text-white shadow-[0_3px_10px_rgba(37,99,235,0.30)]' },
    violet: { wrap: 'border-violet-100 bg-violet-50', icon: 'bg-violet-100 text-violet-600', badge: 'bg-violet-600 text-white shadow-[0_3px_10px_rgba(124,58,237,0.30)]' },
    emerald: { wrap: 'border-emerald-100 bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', badge: 'bg-emerald-600 text-white shadow-[0_3px_10px_rgba(5,150,105,0.30)]' },
    amber: { wrap: 'border-amber-100 bg-amber-50', icon: 'bg-amber-100 text-amber-600', badge: 'bg-amber-500 text-white shadow-[0_3px_10px_rgba(245,158,11,0.30)]' },
  };
  const c = config[accent] ?? config.blue;
  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${c.wrap}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`grid size-10 place-items-center rounded-xl ${c.icon}`}>{icon}</div>
        {badge ? (
          <span className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-[11px] font-semibold ${c.badge}`}>{badge}</span>
        ) : null}
      </div>
      <strong className="mt-4 block text-[2.2rem] font-bold leading-none tracking-[-0.04em] text-zinc-900">{value ?? '--'}</strong>
      <p className="mt-2 text-sm font-semibold text-zinc-700">{label}</p>
      {hint ? <p className="mt-0.5 text-xs text-zinc-500">{hint}</p> : null}
    </article>
  );
}

function SnapshotItem({ label, value, meta }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <div className="mt-0.5 size-1.5 shrink-0 rounded-full bg-blue-500 ring-4 ring-blue-100" />
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400">{label}</p>
        <p className="mt-1 truncate text-sm font-semibold text-zinc-900">{value}</p>
        <p className="mt-0.5 text-xs text-zinc-500">{meta}</p>
      </div>
    </div>
  );
}

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

// ─── Page ───────────────────────────────────────────────────────────────────

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
    return <LoadingState title="Loading dashboard" description="Preparing archive metrics and recent activity." />;
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
      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-[0_8px_30px_rgba(37,99,235,0.25)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-blue-200">Administrative Overview</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] sm:text-[2rem]">Archive Management Dashboard</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
              Monitor document flow, system activity, and operational coverage from one executive workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 xl:min-w-100 xl:justify-end">
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">Latest Upload</p>
              <p className="mt-1 max-w-40 truncate text-sm font-semibold">
                {latestDocument?.title ?? 'No uploads yet'}
              </p>
              <p className="mt-0.5 text-xs text-blue-200">
                {latestDocument ? formatDateTime(latestDocument.uploaded_at ?? latestDocument.created_at) : '--'}
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">Weekly Pace</p>
              <p className="mt-1 text-sm font-bold">{uploadsThisWeek} uploads</p>
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
        <MetricCard label="Total Documents" value={dashboard?.counts?.documents} badge={`${uploadsThisWeek} this week`} hint="Archived files in the system." icon={<DocIcon />} accent="blue" />
        <MetricCard label="Total Users" value={dashboard?.counts?.users} badge="Admin scope" hint="Accounts with system access." icon={<UsersIcon />} accent="violet" />
        <MetricCard label="Total Categories" value={dashboard?.counts?.categories} badge={`${recentDocuments.length} recent`} hint="Document classification groups." icon={<TagIcon />} accent="emerald" />
        <MetricCard label="Total Barangays" value={dashboard?.counts?.barangays} badge={`${actionsThisWeek} events`} hint="Linked local units for tagging." icon={<MapIcon />} accent="amber" />
      </section>

      {/* ── Archive Pulse ── */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.75fr)]">
        <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {/* Section header */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-500">Archive Pulse</p>
              <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-zinc-900">Weekly activity overview</h2>
              <p className="mt-0.5 max-w-md text-sm text-zinc-400">Uploads and audit events plotted over the last 7 days.</p>
            </div>
            <span className="inline-flex items-center self-start rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              Last 7 days
            </span>
          </div>

          {/* Line chart */}
          <ActivityChart series={activitySeries} />

          {/* Below chart: stat pills */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-400">Uploads this week</p>
              <p className="mt-1.5 text-3xl font-bold tracking-[-0.04em] text-blue-900">{uploadsThisWeek}</p>
              <p className="mt-1 text-xs text-blue-400/80">New documents added this week.</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">Activity events</p>
              <p className="mt-1.5 text-3xl font-bold tracking-[-0.04em] text-emerald-900">{actionsThisWeek}</p>
              <p className="mt-1 text-xs text-emerald-500/70">Audit entries this week.</p>
            </div>
          </div>

          {/* Below stat pills: donut + bar chart side-by-side */}
          <div className="mt-5 grid grid-cols-1 gap-5 border-t border-zinc-100 pt-5 sm:grid-cols-2">
            {/* Status donut */}
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">By Status</p>
              <DonutChart statusCounts={dashboard?.status_counts ?? {}} />
            </div>

            {/* Category bar chart */}
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Top Categories</p>
              <CategoryBarChart topCategories={dashboard?.top_categories ?? []} />
            </div>
          </div>
        </article>

        {/* Executive Snapshot */}
        <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-500">Executive Snapshot</p>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-zinc-900">Operational highlights</h2>
            <p className="mt-0.5 text-sm text-zinc-400">Key archive signals for this account.</p>
          </div>
          <div className="mt-4 grid gap-2.5">
            <SnapshotItem label="Recent uploads" value={String(recentDocuments.length)} meta="Items in the latest uploads feed." />
            <SnapshotItem label="Activity feed" value={String(recentActivity.length)} meta="Recent audit entries available for review." />
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
            <SnapshotItem label="Visible categories" value={String(dashboard?.counts?.categories ?? '--')} meta="Classification groups for this account." />
            <SnapshotItem label="Barangay coverage" value={String(dashboard?.counts?.barangays ?? '--')} meta="Linked local units used for tagging." />
          </div>
        </article>
      </section>

      {/* Tables */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-500">Recent Uploads</p>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-zinc-900">Latest documents</h2>
            <p className="mt-0.5 text-sm text-zinc-400">Newest uploaded files and their current visibility context.</p>
          </div>
          <DataTable
            columns={[
              { key: 'title', label: 'Title', render: (row) => (
                <div className="max-w-xs"><p className="truncate text-sm font-semibold text-zinc-900">{row.title}</p></div>
              )},
              { key: 'category', label: 'Category', render: (row) => <span className="text-sm text-zinc-600">{row.category?.name ?? '--'}</span> },
              { key: 'status', label: 'Status', render: (row) => <StatusPill value={row.status} /> },
              { key: 'uploaded_at', label: 'Uploaded', render: (row) => (
                <span className="whitespace-nowrap text-sm text-zinc-500">{formatDateTime(row.uploaded_at ?? row.created_at)}</span>
              )},
            ]}
            rows={recentDocuments}
            emptyTitle="No uploads yet"
            emptyDescription="Recent documents will appear here after the first upload."
          />
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-500">Audit Trail</p>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-zinc-900">Recent activity</h2>
            <p className="mt-0.5 text-sm text-zinc-400">Recent system actions, user events, and document changes.</p>
          </div>
          <DataTable
            columns={[
              { key: 'action', label: 'Action', render: (row) => (
                <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {formatActionLabel(row.action)}
                </span>
              )},
              { key: 'user', label: 'User', render: (row) => (
                <span className="text-sm font-semibold text-zinc-900">{row.user?.name ?? 'System'}</span>
              )},
              { key: 'document', label: 'Document', render: (row) => (
                <div className="max-w-50"><p className="truncate text-sm text-zinc-600">{row.document?.title ?? '--'}</p></div>
              )},
              { key: 'created_at', label: 'When', render: (row) => (
                <span className="whitespace-nowrap text-sm text-zinc-500">{formatDateTime(row.created_at)}</span>
              )},
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

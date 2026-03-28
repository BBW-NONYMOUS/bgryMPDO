import { useEffect, useState } from 'react';
import { getDashboard } from '../api/dashboardApi';
import StatCard from '../components/common/StatCard';
import StatusPill from '../components/common/StatusPill';
import LoadingState from '../components/common/LoadingState';
import DataTable from '../components/tables/DataTable';
import { formatDateTime } from '../utils/apiData';

const dayFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const panelClassName = 'rounded-[1.75rem] border border-zinc-200 bg-white/95 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]';
const eyebrowClassName = 'mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-400';

function startOfDay(date) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return null;
  }

  value.setHours(0, 0, 0, 0);
  return value;
}

function buildTimeline(recentDocuments, recentActivity) {
  const today = startOfDay(new Date());
  const timeline = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    return {
      key: date.toISOString().slice(0, 10),
      label: dayFormatter.format(date),
      uploads: 0,
      activity: 0,
    };
  });

  const bucketMap = Object.fromEntries(timeline.map((bucket) => [bucket.key, bucket]));

  recentDocuments.forEach((item) => {
    const value = item.uploaded_at ?? item.created_at;

    if (!value) {
      return;
    }

    const day = startOfDay(value);

    if (!day) {
      return;
    }

    const key = day.toISOString().slice(0, 10);

    if (bucketMap[key]) {
      bucketMap[key].uploads += 1;
    }
  });

  recentActivity.forEach((item) => {
    if (!item.created_at) {
      return;
    }

    const day = startOfDay(item.created_at);

    if (!day) {
      return;
    }

    const key = day.toISOString().slice(0, 10);

    if (bucketMap[key]) {
      bucketMap[key].activity += 1;
    }
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
  if (!points.length) {
    return '';
  }

  return `${buildLinePath(points)} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
}

function ActivityChart({ series }) {
  const width = 760;
  const height = 280;
  const padding = 28;
  const uploadsPoints = buildPoints(series, 'uploads', width, height, padding);
  const activityPoints = buildPoints(series, 'activity', width, height, padding);

  return (
    <div className="mt-4 rounded-[1.5rem] border border-zinc-200 bg-gradient-to-b from-zinc-50/95 to-zinc-100/70">
      <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full" role="img" aria-label="Archive activity chart for the last seven days">
        <defs>
          <linearGradient id="uploads-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111827" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#111827" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="activity-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b7280" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6b7280" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3].map((line) => {
          const y = padding + ((height - padding * 2) / 3) * line;

          return <line key={line} x1={padding} y1={y} x2={width - padding} y2={y} className="stroke-zinc-200" />;
        })}

        <path d={buildAreaPath(activityPoints, height, padding)} fill="url(#activity-fill)" />
        <path d={buildAreaPath(uploadsPoints, height, padding)} fill="url(#uploads-fill)" />
        <path d={buildLinePath(activityPoints)} className="fill-none stroke-zinc-500 [stroke-width:2.5]" />
        <path d={buildLinePath(uploadsPoints)} className="fill-none stroke-zinc-900 [stroke-width:2.5]" />

        {uploadsPoints.map((point, index) => (
          <g key={series[index].key}>
            <circle cx={point.x} cy={point.y} r="4" className="fill-zinc-900" />
            <circle cx={activityPoints[index].x} cy={activityPoints[index].y} r="4" className="fill-zinc-500" />
            <text x={point.x} y={height - 8} textAnchor="middle" className="fill-zinc-400 text-[11px] font-semibold">
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
    <div className="space-y-5">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Documents"
          value={dashboard?.counts?.documents}
          badge={`${uploadsThisWeek} this week`}
          hint="Archived files currently visible to this account."
        />
        <StatCard
          label="Total Users"
          value={dashboard?.counts?.users}
          badge={dashboard?.counts?.users ? 'Admin scope' : 'Restricted'}
          hint="Only populated for administrators."
        />
        <StatCard
          label="Total Categories"
          value={dashboard?.counts?.categories}
          badge={`${recentDocuments.length} recent`}
          hint="Document classification groups."
        />
        <StatCard
          label="Total Barangays"
          value={dashboard?.counts?.barangays}
          badge={`${actionsThisWeek} events`}
          hint="Barangay directory used for tagging and access."
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
        <article className={panelClassName}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className={eyebrowClassName}>Archive Pulse</p>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-900">Weekly activity overview</h2>
              <p className="mt-2 text-sm text-zinc-500">Recent uploads and audit events over the last seven days.</p>
            </div>

            <div className="inline-flex flex-wrap gap-2">
              <span className="inline-flex min-h-8 items-center rounded-full border border-zinc-900 bg-zinc-900 px-3 text-xs font-semibold text-white">
                Last 7 days
              </span>
              <span className="inline-flex min-h-8 items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-500">
                Uploads
              </span>
              <span className="inline-flex min-h-8 items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-500">
                Activity
              </span>
            </div>
          </div>

          <ActivityChart series={activitySeries} />

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4">
              <span className="mt-1 size-3 rounded-full bg-zinc-900" />
              <div>
                <strong className="block text-sm font-semibold text-zinc-900">{uploadsThisWeek}</strong>
                <p className="mt-1 text-sm text-zinc-500">Uploads in the current weekly window</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4">
              <span className="mt-1 size-3 rounded-full bg-zinc-500" />
              <div>
                <strong className="block text-sm font-semibold text-zinc-900">{actionsThisWeek}</strong>
                <p className="mt-1 text-sm text-zinc-500">Logged activity events in the same period</p>
              </div>
            </div>
          </div>
        </article>

        <article className={panelClassName}>
          <div>
            <p className={eyebrowClassName}>Highlights</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-900">Operational snapshot</h2>
            <p className="mt-2 text-sm text-zinc-500">The most recent archive signals visible from this account.</p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-2">
            <div className="flex flex-col gap-1 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">Recent uploads</span>
              <strong className="text-3xl font-semibold leading-none tracking-[-0.04em] text-zinc-900">{recentDocuments.length}</strong>
              <p className="text-sm text-zinc-500">Items currently shown in the latest upload feed.</p>
            </div>

            <div className="flex flex-col gap-1 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">Activity feed</span>
              <strong className="text-3xl font-semibold leading-none tracking-[-0.04em] text-zinc-900">{recentActivity.length}</strong>
              <p className="text-sm text-zinc-500">Audit events visible in the recent activity panel.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/80 p-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">Latest document</p>
                <strong className="mt-1 block text-sm font-semibold text-zinc-900">{latestDocument?.title ?? 'No document uploaded yet'}</strong>
              </div>
              <span className="text-xs text-zinc-500">{latestDocument ? formatDateTime(latestDocument.uploaded_at ?? latestDocument.created_at) : '--'}</span>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/80 p-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">Latest activity</p>
                <strong className="mt-1 block text-sm font-semibold text-zinc-900">{latestEvent ? formatActionLabel(latestEvent.action) : 'No activity logged yet'}</strong>
              </div>
              <span className="text-xs text-zinc-500">{latestEvent ? formatDateTime(latestEvent.created_at) : '--'}</span>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/80 p-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">Visible categories</p>
                <strong className="mt-1 block text-sm font-semibold text-zinc-900">{dashboard?.counts?.categories ?? '--'}</strong>
              </div>
              <span className="text-xs text-zinc-500">Classification groups</span>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/80 p-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">Barangay coverage</p>
                <strong className="mt-1 block text-sm font-semibold text-zinc-900">{dashboard?.counts?.barangays ?? '--'}</strong>
              </div>
              <span className="text-xs text-zinc-500">Linked local units</span>
            </div>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <article className={panelClassName}>
          <div className="mb-5">
            <p className={eyebrowClassName}>Recent Uploads</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-900">Latest documents</h2>
          </div>

          <DataTable
            columns={[
              { key: 'title', label: 'Title' },
              { key: 'category', label: 'Category', render: (row) => row.category?.name ?? '--' },
              { key: 'barangay', label: 'Barangay', render: (row) => row.barangay?.name ?? 'All' },
              { key: 'status', label: 'Status', render: (row) => <StatusPill value={row.status} /> },
              { key: 'uploaded_at', label: 'Uploaded', render: (row) => formatDateTime(row.uploaded_at ?? row.created_at) },
            ]}
            rows={recentDocuments}
            emptyTitle="No uploads yet"
            emptyDescription="Recent documents will appear here after the first upload."
          />
        </article>

        <article className={panelClassName}>
          <div className="mb-5">
            <p className={eyebrowClassName}>Audit Trail</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-900">Recent activity</h2>
          </div>

          <DataTable
            columns={[
              { key: 'action', label: 'Action' },
              { key: 'user', label: 'User', render: (row) => row.user?.name ?? 'System' },
              { key: 'document', label: 'Document', render: (row) => row.document?.title ?? '--' },
              { key: 'created_at', label: 'When', render: (row) => formatDateTime(row.created_at) },
            ]}
            rows={recentActivity}
            emptyTitle="No activity yet"
            emptyDescription="Login, upload, update, delete, and download events will appear here."
          />
        </article>
      </section>
    </div>
  );
}

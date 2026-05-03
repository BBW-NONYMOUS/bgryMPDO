import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../api/dashboardApi';
import LoadingState from '../components/common/LoadingState';
import { useAuth } from '../hooks/useAuth';
import { ghostButtonClassName } from '../styles/uiClasses';
import { formatDateTime } from '../utils/apiData';

const numberFormatter = new Intl.NumberFormat('en-US');
const byteFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

const categoryColors = ['#2f6fed', '#47bf7f', '#f6b21a', '#8f5de8', '#6f67a6', '#a8b0bd'];

function formatNumber(value) {
  if (value === null || value === undefined) return '--';
  return numberFormatter.format(Number(value) || 0);
}

function formatBytes(value) {
  const bytes = Number(value) || 0;
  if (bytes >= 1024 * 1024 * 1024) return `${byteFormatter.format(bytes / 1024 / 1024 / 1024)} GB`;
  if (bytes >= 1024 * 1024) return `${byteFormatter.format(bytes / 1024 / 1024)} MB`;
  if (bytes >= 1024) return `${byteFormatter.format(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function titleCase(value) {
  return String(value ?? '')
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function iconPath(name) {
  const paths = {
    document: 'M7 3.75h7.5L19.25 8.5v11A1.75 1.75 0 0 1 17.5 21h-10A1.75 1.75 0 0 1 5.75 19.5v-14A1.75 1.75 0 0 1 7.5 3.75z M14 3.75V8.5h4.75 M9 12h6 M9 15.5h6',
    folder: 'M3.75 7.5A2.25 2.25 0 0 1 6 5.25h3.8c.6 0 1.17.24 1.59.66l.7.68c.42.42.99.66 1.58.66H18A2.25 2.25 0 0 1 20.25 9.5v7.25A2.25 2.25 0 0 1 18 19H6a2.25 2.25 0 0 1-2.25-2.25V7.5z',
    building: 'M4.75 19.25h14.5 M7.5 19.25V8.75l4.5-3 4.5 3v10.5 M9.75 11h.01 M12 11h.01 M14.25 11h.01 M9.75 14h.01 M12 14h.01 M14.25 14h.01',
    users: 'M8.75 11.25a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3.75 19a5 5 0 0 1 10 0 M16.25 10.75a2.5 2.5 0 1 0 0-5 M14.75 14.25A4.25 4.25 0 0 1 20.25 18.5',
    activity: 'M4 13h3.25l2-6 4 10 2.25-5H20',
    upload: 'M12 16V5 M7.75 9.25 12 5l4.25 4.25 M5 18.75h14',
    edit: 'm5 16.75-.75 3 3-.75 9.75-9.75a2.12 2.12 0 0 0-3-3L5 16.75z',
    download: 'M12 4.75v10 M7.75 10.5 12 14.75l4.25-4.25 M5 19.25h14',
    user: 'M12 12a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5z M5 19.25a7 7 0 0 1 14 0',
  };
  return paths[name] ?? paths.document;
}

function Icon({ name, className = 'size-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={iconPath(name)} />
    </svg>
  );
}

function StatCard({ label, value, helper, icon, accent, delta }) {
  const deltaValue = Number(delta ?? 0);
  const isUp = deltaValue >= 0;

  return (
    <article className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
      <div className="flex items-start gap-4">
        <div className={`grid size-12 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${accent} text-white shadow-sm`}>
          <Icon name={icon} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          <strong className="mt-1 block text-2xl font-bold leading-none text-slate-950">{value}</strong>
          <p className="mt-2 text-xs text-slate-500">{helper}</p>
        </div>
      </div>
      <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className={isUp ? 'font-bold text-emerald-600' : 'font-bold text-red-600'}>
          {isUp ? 'Up' : 'Down'} {Math.abs(deltaValue)}%
        </span>
        <span> from last month</span>
      </div>
    </article>
  );
}

function LineChart({ data }) {
  const width = 760;
  const height = 240;
  const paddingX = 42;
  const paddingY = 30;
  const max = Math.max(...data.map((item) => item.count), 1);
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;
  const points = data.map((item, index) => ({
    ...item,
    x: paddingX + (plotWidth / Math.max(data.length - 1, 1)) * index,
    y: paddingY + plotHeight - (item.count / max) * plotHeight,
  }));
  const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const area = points.length
    ? `${line} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Documents overview chart">
      <defs>
        <linearGradient id="document-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2f6fed" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#2f6fed" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((lineIndex) => {
        const y = paddingY + (plotHeight / 3) * lineIndex;
        return <line key={lineIndex} x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="#e8edf5" strokeDasharray="4 4" />;
      })}
      <path d={area} fill="url(#document-area)" />
      <path d={line} fill="none" stroke="#2f6fed" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point) => (
        <g key={point.key}>
          <circle cx={point.x} cy={point.y} r="5" fill="#2f6fed" stroke="#fff" strokeWidth="2" />
          <text x={point.x} y={point.y - 14} textAnchor="middle" fill="#0f1d3a" fontSize="11" fontWeight="700">{formatNumber(point.count)}</text>
          <text x={point.x} y={height - 8} textAnchor="middle" fill="#667085" fontSize="11">{point.label}</text>
        </g>
      ))}
    </svg>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((sum, item) => sum + Number(item.count || 0), 0);
  const cx = 74;
  const cy = 74;
  const radius = 54;
  const stroke = 24;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="grid gap-5 md:grid-cols-[180px_1fr] md:items-center">
      <div className="relative mx-auto size-40">
        <svg viewBox="0 0 148 148" className="size-40 -rotate-90" aria-label="Documents by category">
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#edf1f7" strokeWidth={stroke} />
          {data.map((item, index) => {
            const segment = total > 0 ? (Number(item.count) / total) * circumference : 0;
            const dashOffset = -offset;
            offset += segment;
            return (
              <circle
                key={item.name}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={categoryColors[index % categoryColors.length]}
                strokeWidth={stroke}
                strokeDasharray={`${segment} ${circumference - segment}`}
                strokeDashoffset={dashOffset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <strong className="block text-2xl font-bold text-slate-950">{formatNumber(total)}</strong>
            <span className="text-xs text-slate-500">Total</span>
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        {data.length === 0 ? (
          <p className="text-sm text-slate-500">No category data yet.</p>
        ) : data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-slate-700">
              <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: categoryColors[index % categoryColors.length] }} />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="shrink-0 font-semibold text-slate-700">{item.percentage ?? 0}% ({formatNumber(item.count)})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StorageWidget({ storage }) {
  const used = Number(storage?.used_percentage ?? 0);
  const safeUsed = Math.min(100, Math.max(0, used));
  const capacity = Number(storage?.capacity_bytes ?? 0);
  const usedBytes = Number(storage?.used_bytes ?? 0);
  const available = Math.max(0, capacity - usedBytes);

  return (
    <article className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
      <h2 className="text-base font-bold text-slate-950">System Storage</h2>
      <div className="mt-4 grid place-items-center">
        <div className="relative size-32">
          <svg viewBox="0 0 120 120" className="size-32 -rotate-90">
            <circle cx="60" cy="60" r="46" fill="none" stroke="#edf1f7" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke="#2f6fed"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(safeUsed / 100) * 289} ${289 - (safeUsed / 100) * 289}`}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <strong className="block text-2xl font-bold text-slate-950">{Math.round(safeUsed)}%</strong>
              <span className="text-xs text-slate-500">Used</span>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-sm font-bold text-slate-950">
        {formatBytes(usedBytes)} / {formatBytes(capacity)} Used
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${safeUsed}%` }} />
      </div>
      <div className="mt-4 grid gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <span className="flex items-center gap-2 text-slate-600"><span className="size-2.5 rounded-full bg-blue-600" />Used Space</span>
          <strong className="text-slate-900">{formatBytes(usedBytes)}</strong>
        </div>
        <div className="flex justify-between gap-3">
          <span className="flex items-center gap-2 text-slate-600"><span className="size-2.5 rounded-full bg-slate-400" />Available Space</span>
          <strong className="text-slate-900">{formatBytes(available)}</strong>
        </div>
      </div>
    </article>
  );
}

function FileBadge({ type }) {
  const label = String(type ?? '').includes('pdf')
    ? 'PDF'
    : String(type ?? '').includes('word')
      ? 'DOC'
      : String(type ?? '').includes('sheet')
        ? 'XLS'
        : 'FILE';
  const color = label === 'PDF' ? 'bg-red-50 text-red-600' : label === 'DOC' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600';

  return <span className={`inline-grid size-8 place-items-center rounded-lg text-[10px] font-bold ${color}`}>{label}</span>;
}

function ActivityIcon({ action }) {
  const key = String(action ?? '');
  const name = key.includes('download') ? 'download' : key.includes('update') ? 'edit' : key.includes('user') ? 'user' : 'upload';
  const color = key.includes('download')
    ? 'bg-violet-100 text-violet-600'
    : key.includes('update')
      ? 'bg-blue-100 text-blue-600'
      : key.includes('user')
        ? 'bg-amber-100 text-amber-600'
        : 'bg-emerald-100 text-emerald-600';

  return <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${color}`}><Icon name={name} className="size-4" /></span>;
}

function PanelHeader({ title, actionTo }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-bold text-slate-950">{title}</h2>
      {actionTo ? <Link to={actionTo} className={`${ghostButtonClassName} min-h-8 rounded-lg px-3 py-1 text-xs`}>View All</Link> : null}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setDashboard(await getDashboard());
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const roleRows = useMemo(() => {
    const roles = dashboard?.user_role_counts ?? {};
    return [
      ['Administrator', roles.admin ?? 0, 'bg-blue-50 text-blue-700'],
      ['MPDO Staff', roles.staff ?? 0, 'bg-emerald-50 text-emerald-700'],
      ['Barangay Official', roles.barangay ?? 0, 'bg-violet-50 text-violet-700'],
    ];
  }, [dashboard]);

  if (loading) {
    return <LoadingState title="Loading dashboard" description="Preparing archive metrics and recent activity." />;
  }

  const recentDocuments = dashboard?.recent_documents ?? [];
  const recentActivity = dashboard?.recent_activity ?? [];
  const monthlyDocuments = dashboard?.monthly_documents ?? [];
  const categoryDistribution = dashboard?.category_distribution ?? [];

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total Documents" value={formatNumber(dashboard?.counts?.documents)} helper="All archived documents" icon="document" accent="from-blue-500 to-blue-700" delta={dashboard?.deltas?.documents} />
        <StatCard label="Total Categories" value={formatNumber(dashboard?.counts?.categories)} helper="Document categories" icon="folder" accent="from-emerald-500 to-emerald-700" delta={0} />
        <StatCard label="Total Barangays" value={formatNumber(dashboard?.counts?.barangays)} helper="Registered barangays" icon="building" accent="from-amber-400 to-orange-500" delta={0} />
        <StatCard label="Total Users" value={formatNumber(dashboard?.counts?.users)} helper="System users" icon="users" accent="from-violet-500 to-purple-700" delta={0} />
        <StatCard label="Total Activity Logs" value={formatNumber(dashboard?.counts?.activity_logs)} helper="System activities" icon="activity" accent="from-cyan-500 to-teal-600" delta={dashboard?.deltas?.activity_logs} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.35fr_1fr_290px]">
        <article className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 md:col-span-2 xl:col-span-1">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-950">Documents Overview</h2>
            <span className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">Last 6 Months</span>
          </div>
          <LineChart data={monthlyDocuments} />
        </article>

        <article className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
          <h2 className="mb-4 text-base font-bold text-slate-950">Documents by Category</h2>
          <DonutChart data={categoryDistribution} />
        </article>

        <StorageWidget storage={dashboard?.storage} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 lg:col-span-2 xl:col-span-1">
          <PanelHeader title="Recent Documents" actionTo="/documents" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-[11px] font-bold uppercase text-slate-500">
                <tr className="border-b border-slate-100">
                  <th className="py-3">Document Title</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Uploaded By</th>
                  <th className="py-3">Date Uploaded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentDocuments.length === 0 ? (
                  <tr><td className="py-6 text-center text-slate-500" colSpan="4">No documents yet.</td></tr>
                ) : recentDocuments.map((document) => (
                  <tr key={document.id}>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <FileBadge type={document.file_type} />
                        <span className="font-semibold text-slate-900">{document.title}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">{document.category?.name ?? '--'}</td>
                    <td className="py-3 text-slate-600">{document.uploader?.name ?? 'System'}</td>
                    <td className="py-3 text-slate-600">{formatDateTime(document.uploaded_at ?? document.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
          <PanelHeader title="Recent Activity Logs" actionTo={user?.role === 'admin' ? '/activity-logs' : null} />
          <div className="grid gap-3">
            {recentActivity.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">No activity logged yet.</p>
            ) : recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <ActivityIcon action={item.action} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{item.description ?? titleCase(item.action)}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{item.document?.title ?? item.user?.name ?? titleCase(item.module)}</p>
                </div>
                <span className="shrink-0 text-right text-xs text-slate-500">{formatDateTime(item.created_at)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
          <PanelHeader title="User Accounts Overview" actionTo={user?.role === 'admin' ? '/users' : null} />
          <div className="grid divide-y divide-slate-100">
            {roleRows.map(([label, count, color]) => (
              <div key={label} className="flex items-center justify-between gap-3 py-4">
                <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${color}`}>{label}</span>
                <strong className="text-slate-950">{formatNumber(count)}</strong>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <span className="font-bold text-slate-950">Total Users</span>
            <strong className="text-slate-950">{formatNumber(dashboard?.counts?.users)}</strong>
          </div>
           </article>
      </section>
    </div>
  );
}

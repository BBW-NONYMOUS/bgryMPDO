import { useEffect, useState } from 'react';
import { getActivityLogs } from '../api/activityLogApi';
import { downloadActivityLogsReport } from '../api/reportApi';
import SearchFilterBar from '../components/common/SearchFilterBar';
import DataTable from '../components/tables/DataTable';
import {
  ghostButtonClassName,
  pageStackClassName,
  pageTitleClassName,
  panelClassName,
  panelHeaderClassName,
  sectionEyebrowClassName,
} from '../styles/uiClasses';
import { extractCollection, formatDateTime } from '../utils/apiData';

const defaultFilters = {
  action: '',
  date_from: '',
  date_to: '',
};

function ActionBadge({ action }) {
  const value = action || 'unknown';

  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
      {value}
    </span>
  );
}

function InfoText({ children, muted = false }) {
  return <span className={muted ? 'text-sm text-zinc-500' : 'text-sm text-zinc-700'}>{children}</span>;
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    loadLogs(filters);
  }, []);

  async function loadLogs(params = {}) {
    const response = await getActivityLogs(params);
    setLogs(extractCollection(response));
  }

  return (
    <div className={pageStackClassName}>
      <article className={`${panelClassName} space-y-6`}>
        <div className={panelHeaderClassName}>
          <div>
            <p className={sectionEyebrowClassName}>Audit and Monitoring</p>
            <h2 className={pageTitleClassName}>Activity Logs</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Review system events, user actions, and document-related activity across the platform.
            </p>
          </div>
        </div>

        <SearchFilterBar
          fields={[
            { name: 'action', label: 'Action', placeholder: 'document.created' },
            { name: 'date_from', label: 'Date From', type: 'date' },
            { name: 'date_to', label: 'Date To', type: 'date' },
          ]}
          values={filters}
          onChange={(field, value) => setFilters((current) => ({ ...current, [field]: value }))}
          onSubmit={(event) => {
            event.preventDefault();
            loadLogs(filters);
          }}
          onReset={() => {
            setFilters(defaultFilters);
            loadLogs(defaultFilters);
          }}
          actions={(
            <button type="button" className={ghostButtonClassName} onClick={() => downloadActivityLogsReport(filters)}>
              Export Report
            </button>
          )}
        />

        <DataTable
          columns={[
            {
              key: 'action',
              label: 'Action',
              render: (row) => <ActionBadge action={row.action} />,
            },
            {
              key: 'description',
              label: 'Description',
              render: (row) => (
                <div className="max-w-xl">
                  <p className="text-sm leading-6 text-zinc-700">{row.description || 'No description available'}</p>
                </div>
              ),
            },
            {
              key: 'user',
              label: 'User',
              render: (row) => (
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-zinc-900">{row.user?.name ?? 'System'}</p>
                  <p className="text-xs text-zinc-500">{row.user?.email ?? 'Automated event'}</p>
                </div>
              ),
            },
            {
              key: 'document',
              label: 'Document',
              render: (row) =>
                row.document?.title ? (
                  <div className="max-w-xs">
                    <p className="truncate text-sm font-medium text-zinc-800">{row.document.title}</p>
                  </div>
                ) : (
                  <InfoText muted>--</InfoText>
                ),
            },
            {
              key: 'ip_address',
              label: 'IP Address',
              render: (row) =>
                row.ip_address ? (
                  <code className="rounded-lg bg-zinc-100 px-2 py-1 text-xs text-zinc-700">{row.ip_address}</code>
                ) : (
                  <InfoText muted>--</InfoText>
                ),
            },
            {
              key: 'created_at',
              label: 'Date & Time',
              render: (row) => <div className="whitespace-nowrap text-sm text-zinc-700">{formatDateTime(row.created_at)}</div>,
            },
          ]}
          rows={logs}
          emptyTitle="No activity logs found"
          emptyDescription="Audit records will appear here once users begin interacting with the platform."
        />
      </article>
    </div>
  );
}

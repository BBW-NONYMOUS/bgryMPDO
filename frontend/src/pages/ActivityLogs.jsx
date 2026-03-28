import { useEffect, useState } from 'react';
import { getActivityLogs } from '../api/activityLogApi';
import SearchFilterBar from '../components/common/SearchFilterBar';
import DataTable from '../components/tables/DataTable';
import { extractCollection, formatDateTime } from '../utils/apiData';

const defaultFilters = {
  action: '',
  date_from: '',
  date_to: '',
};

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
    <div className="page-stack">
      <article className="panel">
        <div className="panel__header">
          <div>
            <p className="section-label">Audit and Monitoring</p>
            <h2>Activity logs</h2>
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
        />

        <DataTable
          columns={[
            { key: 'action', label: 'Action' },
            { key: 'description', label: 'Description', render: (row) => row.description || '--' },
            { key: 'user', label: 'User', render: (row) => row.user?.name ?? 'System' },
            { key: 'document', label: 'Document', render: (row) => row.document?.title ?? '--' },
            { key: 'ip_address', label: 'IP Address', render: (row) => row.ip_address || '--' },
            { key: 'created_at', label: 'Date', render: (row) => formatDateTime(row.created_at) },
          ]}
          rows={logs}
          emptyTitle="No activity logs found"
          emptyDescription="System audit records will appear after users start interacting with the platform."
        />
      </article>
    </div>
  );
}

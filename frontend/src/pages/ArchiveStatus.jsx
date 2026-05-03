import { useCallback, useEffect, useState } from 'react';
import { getDocuments, updateDocumentStatus } from '../api/documentApi';
import { getSettings } from '../api/settingsApi';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import StatusPill from '../components/common/StatusPill';
import { useAuth } from '../hooks/useAuth';
import {
  inputClassName,
  pageStackClassName,
  panelClassName,
  panelHeaderBetweenClassName,
  pageTitleClassName,
  sectionEyebrowClassName,
  selectClassName,
} from '../styles/uiClasses';
import { extractCollection, formatDate } from '../utils/apiData';

function titleCase(value) {
  return String(value ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

const STATUS_COLORS = {
  draft: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  active: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  archived: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' },
};

function getStatusColor(status) {
  return STATUS_COLORS[String(status).toLowerCase()] ?? {
    bg: 'bg-zinc-50', border: 'border-zinc-200', text: 'text-zinc-600', dot: 'bg-zinc-400',
  };
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5a2.25 2.25 0 0 1 2.25-2.25h4.09a2.25 2.25 0 0 1 1.59.66l1.32 1.33c.42.42.99.66 1.59.66H18A2.25 2.25 0 0 1 20.25 10v6.75A2.25 2.25 0 0 1 18 19H6a2.25 2.25 0 0 1-2.25-2.25V7.5Z" />
    </svg>
  );
}

export default function ArchiveStatus() {
  const { user } = useAuth();
  const canEdit = ['admin', 'staff'].includes(user?.role);

  const [statusOptions, setStatusOptions] = useState(['draft', 'active', 'archived']);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    getSettings().then((res) => {
      const statuses = res.settings?.document_statuses ?? ['draft', 'active', 'archived'];
      setStatusOptions(statuses);
    });
  }, []);

  // Load per-status counts once statusOptions are known
  useEffect(() => {
    async function loadCounts() {
      const [totalRes, ...statusRes] = await Promise.all([
        getDocuments({ per_page: 1 }),
        ...statusOptions.map((s) => getDocuments({ status: s, per_page: 1 })),
      ]);
      setTotalCount(totalRes.meta?.total ?? totalRes.total ?? 0);
      const counts = {};
      statusOptions.forEach((s, i) => {
        counts[s] = statusRes[i].meta?.total ?? statusRes[i].total ?? 0;
      });
      setStatusCounts(counts);
    }
    loadCounts();
  }, [statusOptions]);

  const loadDocuments = useCallback(async (tab, searchValue) => {
    setLoading(true);
    try {
      const params = { per_page: 100 };
      if (tab !== 'all') params.status = tab;
      if (searchValue) params.search = searchValue;
      const res = await getDocuments(params);
      setDocuments(extractCollection(res));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments(activeTab, search);
  }, [loadDocuments, activeTab]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadDocuments(activeTab, search);
  }

  async function handleStatusChange(docId, newStatus) {
    setUpdating(docId);
    try {
      await updateDocumentStatus(docId, newStatus);
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, status: newStatus } : d)),
      );
      // Refresh counts
      const [totalRes, ...statusRes] = await Promise.all([
        getDocuments({ per_page: 1 }),
        ...statusOptions.map((s) => getDocuments({ status: s, per_page: 1 })),
      ]);
      setTotalCount(totalRes.meta?.total ?? totalRes.total ?? 0);
      const counts = {};
      statusOptions.forEach((s, i) => {
        counts[s] = statusRes[i].meta?.total ?? statusRes[i].total ?? 0;
      });
      setStatusCounts(counts);
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className={pageStackClassName}>
      {/* ── Summary stat cards ─────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Total */}
        <article className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm shadow-zinc-900/5">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Total</p>
          <strong className="mt-1 block text-3xl font-bold text-zinc-900">{totalCount}</strong>
          <p className="mt-1 text-xs text-zinc-400">All documents</p>
        </article>

        {statusOptions.map((status) => {
          const c = getStatusColor(status);
          return (
            <article
              key={status}
              className={`rounded-2xl border ${c.border} ${c.bg} p-5 shadow-sm`}
            >
              <p className={`text-xs font-semibold uppercase tracking-widest ${c.text}`}>
                {titleCase(status)}
              </p>
              <strong className={`mt-1 block text-3xl font-bold ${c.text}`}>
                {statusCounts[status] ?? '--'}
              </strong>
              <p className={`mt-1 text-xs ${c.text} opacity-70`}>documents</p>
            </article>
          );
        })}
      </section>

      {/* ── Main panel ─────────────────────────────────────────── */}
      <article className={panelClassName}>
        <div className={panelHeaderBetweenClassName}>
          <div>
            <p className={sectionEyebrowClassName}>Archive Management</p>
            <h2 className={pageTitleClassName}>Archive Status</h2>
          </div>
        </div>

        {/* Tab bar + search */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {['all', ...statusOptions].map((tab) => {
              const isActive = activeTab === tab;
              const c = tab === 'all' ? null : getStatusColor(tab);
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={[
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
                    isActive
                      ? tab === 'all'
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : `${c.border} ${c.bg} ${c.text} shadow-sm`
                      : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-700',
                  ].join(' ')}
                >
                  {tab !== 'all' && (
                    <span className={`size-1.5 rounded-full ${isActive ? (c?.dot ?? 'bg-zinc-400') : 'bg-zinc-300'}`} />
                  )}
                  {tab === 'all' ? 'All' : titleCase(tab)}
                  {tab !== 'all' && (
                    <span className="ml-0.5 opacity-70">
                      ({statusCounts[tab] ?? 0})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <input
              className={`${inputClassName} h-9 w-56 text-xs`}
              placeholder="Search title, number, keyword…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-600 shadow-sm hover:bg-zinc-50"
            >
              Search
            </button>
          </form>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingState title="Loading documents" description="Fetching archive records…" />
        ) : documents.length === 0 ? (
          <EmptyState
            icon={<FolderIcon />}
            title="No documents found"
            description="No documents match the selected status or search criteria."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50/60 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Doc Number</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Barangay</th>
                  <th className="px-4 py-3">Doc Date</th>
                  <th className="px-4 py-3">Current Status</th>
                  {canEdit && <th className="px-4 py-3">Change Status</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className={`transition-colors ${updating === doc.id ? 'bg-blue-50/40' : 'hover:bg-zinc-50/60'}`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-semibold text-zinc-900">{doc.title}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{doc.document_number ?? '--'}</td>
                    <td className="px-4 py-3 text-zinc-600">{doc.category?.name ?? '--'}</td>
                    <td className="px-4 py-3 text-zinc-600">{doc.barangay?.name ?? 'All'}</td>
                    <td className="px-4 py-3 text-zinc-600">{formatDate(doc.document_date)}</td>
                    <td className="px-4 py-3">
                      <StatusPill value={doc.status} />
                    </td>
                    {canEdit && (
                      <td className="px-4 py-3">
                        <select
                          className={`${selectClassName} h-9 w-36 text-xs`}
                          value={doc.status ?? ''}
                          disabled={updating === doc.id}
                          onChange={(e) => handleStatusChange(doc.id, e.target.value)}
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>{titleCase(s)}</option>
                          ))}
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-3 text-xs text-zinc-400">
          Showing {documents.length} document{documents.length === 1 ? '' : 's'}.
          {activeTab !== 'all' && ` Filtered by status: ${titleCase(activeTab)}.`}
        </p>
      </article>
    </div>
  );
}

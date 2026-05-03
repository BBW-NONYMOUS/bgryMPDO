import { useEffect, useState } from 'react';
import { getDocuments } from '../api/documentApi';
import { getBarangays, getCategories } from '../api/lookupApi';
import {
  downloadActivityLogsReport,
  downloadDashboardSummaryReport,
  downloadDocumentsReport,
} from '../api/reportApi';
import { getSettings } from '../api/settingsApi';
import Spinner from '../components/common/Spinner';
import { useAuth } from '../hooks/useAuth';
import {
  fieldLabelClassName,
  ghostButtonClassName,
  inputClassName,
  pageStackClassName,
  panelClassName,
  pageTitleClassName,
  primaryButtonClassName,
  sectionEyebrowClassName,
  selectClassName,
} from '../styles/uiClasses';
import { extractCollection, formatDate } from '../utils/apiData';
import { documentTypesFromSettings } from '../utils/documentTypes';

function titleCase(value) {
  return String(value ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function SectionIcon({ children, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };
  return (
    <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl border ${colors[color]}`}>
      {children}
    </span>
  );
}

function FilterGrid({ children }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

function FilterField({ label, children }) {
  return (
    <label className="grid gap-1.5">
      <span className={fieldLabelClassName}>{label}</span>
      {children}
    </label>
  );
}

export default function Reports() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [categories, setCategories] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [statusOptions, setStatusOptions] = useState(['draft', 'active', 'archived']);
  const [documentTypeOptions, setDocumentTypeOptions] = useState([]);

  const [docFilters, setDocFilters] = useState({
    search: '', category_id: '', barangay_id: '',
    status: '', file_type: '', date_from: '', date_to: '',
  });

  const [actFilters, setActFilters] = useState({
    date_from: '', date_to: '', action: '',
  });

  const [exporting, setExporting] = useState('');

  useEffect(() => {
    async function bootstrap() {
      const [catRes, brgyRes, settingsRes] = await Promise.all([
        getCategories({ per_page: 100 }),
        getBarangays({ per_page: 100 }),
        getSettings(),
      ]);
      setCategories(extractCollection(catRes));
      setBarangays(extractCollection(brgyRes));
      setStatusOptions(settingsRes.settings?.document_statuses ?? ['draft', 'active', 'archived']);
      setDocumentTypeOptions(documentTypesFromSettings(settingsRes.settings));
    }
    bootstrap();
  }, []);

  function setDocFilter(field, value) {
    setDocFilters((prev) => ({ ...prev, [field]: value }));
  }

  function setActFilter(field, value) {
    setActFilters((prev) => ({ ...prev, [field]: value }));
  }

  async function runExport(key, fn) {
    setExporting(key);
    try {
      await fn();
    } finally {
      setExporting('');
    }
  }

  function printDocumentsReport() {
    // Collect current filter label for header
    const categoryLabel = categories.find((c) => String(c.id) === String(docFilters.category_id))?.name ?? 'All Categories';
    const barangayLabel = barangays.find((b) => String(b.id) === String(docFilters.barangay_id))?.name ?? 'All Barangays';
    const statusLabel = docFilters.status ? titleCase(docFilters.status) : 'All Statuses';
    const dateRange = docFilters.date_from || docFilters.date_to
      ? `${docFilters.date_from || '—'} to ${docFilters.date_to || '—'}`
      : 'All Dates';

    const popup = window.open('', '_blank', 'width=1120,height=780');
    if (!popup) return;

    popup.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Documents Report</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 32px; color: #18181b; font-family: Arial, sans-serif; font-size: 13px; }
            h1 { margin: 0 0 4px; font-size: 22px; }
            .meta { margin: 0 0 6px; color: #71717a; font-size: 12px; }
            .filters { margin: 0 0 20px; color: #71717a; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { border: 1px solid #d4d4d8; padding: 7px 8px; text-align: left; vertical-align: top; }
            th { background: #f4f4f5; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
            @media print { body { margin: 14mm; } }
          </style>
        </head>
        <body>
          <h1>MPDO — Documents Report</h1>
          <p class="meta">Generated: ${escapeHtml(new Date().toLocaleString())}</p>
          <p class="filters">
            Category: ${escapeHtml(categoryLabel)} &nbsp;|&nbsp;
            Barangay: ${escapeHtml(barangayLabel)} &nbsp;|&nbsp;
            Status: ${escapeHtml(statusLabel)} &nbsp;|&nbsp;
            Date: ${escapeHtml(dateRange)}
            ${docFilters.search ? ` &nbsp;|&nbsp; Search: "${escapeHtml(docFilters.search)}"` : ''}
          </p>
          <p style="font-size:11px;color:#71717a;margin-bottom:16px">
            Note: This print preview shows the currently loaded result set. For a complete export use CSV or Excel.
          </p>
          <table>
            <thead>
              <tr>
                <th>#</th><th>Title</th><th>Doc Number</th><th>Category</th>
                <th>Barangay</th><th>Doc Date</th><th>Status</th><th>Access Level</th>
              </tr>
            </thead>
            <tbody id="rows"><tr><td colspan="8" style="text-align:center">Loading…</td></tr></tbody>
          </table>
          <script>window.setTimeout(function(){ window.print(); }, 600);<\/script>
        </body>
      </html>
    `);
    popup.document.close();

    // Fetch and fill rows after popup is open
    const params = {};
    Object.entries(docFilters).forEach(([k, v]) => { if (v) params[k] = v; });
    params.per_page = 500;
    getDocuments(params).then((res) => {
      const docs = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      const rows = docs.map((d, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${escapeHtml(d.title)}</td>
          <td>${escapeHtml(d.document_number ?? '--')}</td>
          <td>${escapeHtml(d.category?.name ?? '--')}</td>
          <td>${escapeHtml(d.barangay?.name ?? 'All')}</td>
          <td>${escapeHtml(formatDate(d.document_date))}</td>
          <td>${escapeHtml(titleCase(d.status))}</td>
          <td>${escapeHtml(titleCase(d.access_level ?? '--'))}</td>
        </tr>
      `).join('');
      try {
        popup.document.getElementById('rows').innerHTML = rows || '<tr><td colspan="8">No documents found.</td></tr>';
      } catch {
        // popup may have closed
      }
    });
  }

  const ACTION_OPTIONS = [
    'document.uploaded', 'document.updated', 'document.deleted',
    'document.downloaded', 'document.previewed',
    'user.login', 'user.logout', 'user.created', 'user.updated',
  ];

  return (
    <div className={pageStackClassName}>

      {/* ── Documents Report ───────────────────────────────────── */}
      <article className={`${panelClassName} space-y-5`}>
        <div className="flex items-start gap-4">
          <SectionIcon color="blue">
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
              <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
            </svg>
          </SectionIcon>
          <div>
            <p className={sectionEyebrowClassName}>Export</p>
            <h2 className={pageTitleClassName}>Documents Report</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Filter and export the document archive to CSV, Excel, or print.
            </p>
          </div>
        </div>

        <FilterGrid>
          <FilterField label="Search">
            <input
              className={inputClassName}
              placeholder="Title, number, or keyword"
              value={docFilters.search}
              onChange={(e) => setDocFilter('search', e.target.value)}
            />
          </FilterField>

          <FilterField label="Category">
            <select className={selectClassName} value={docFilters.category_id} onChange={(e) => setDocFilter('category_id', e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FilterField>

          <FilterField label="Barangay">
            <select className={selectClassName} value={docFilters.barangay_id} onChange={(e) => setDocFilter('barangay_id', e.target.value)}>
              <option value="">All Barangays</option>
              {barangays.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </FilterField>

          <FilterField label="Status">
            <select className={selectClassName} value={docFilters.status} onChange={(e) => setDocFilter('status', e.target.value)}>
              <option value="">All Statuses</option>
              {statusOptions.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
            </select>
          </FilterField>

          <FilterField label="File Type">
            <select className={selectClassName} value={docFilters.file_type} onChange={(e) => setDocFilter('file_type', e.target.value)}>
              <option value="">All Types</option>
              {documentTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FilterField>

          <FilterField label="Date From">
            <input type="date" className={inputClassName} value={docFilters.date_from} onChange={(e) => setDocFilter('date_from', e.target.value)} />
          </FilterField>

          <FilterField label="Date To">
            <input type="date" className={inputClassName} value={docFilters.date_to} onChange={(e) => setDocFilter('date_to', e.target.value)} />
          </FilterField>
        </FilterGrid>

        <div className="flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-4">
          <button
            type="button"
            className={primaryButtonClassName}
            disabled={exporting === 'doc-xls'}
            onClick={() => runExport('doc-xls', () => downloadDocumentsReport(docFilters, 'xls'))}
          >
            {exporting === 'doc-xls' ? <><Spinner className="size-3.5" label="Exporting" /> Exporting…</> : (
              <>
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v4.59L7.3 9.44a.75.75 0 0 0-1.1 1.02l3.25 3.5a.75.75 0 0 0 1.1 0l3.25-3.5a.75.75 0 1 0-1.1-1.02l-1.95 2.1V6.75Z" clipRule="evenodd" />
                </svg>
                Export Excel (.xls)
              </>
            )}
          </button>

          <button
            type="button"
            className={ghostButtonClassName}
            disabled={exporting === 'doc-csv'}
            onClick={() => runExport('doc-csv', () => downloadDocumentsReport(docFilters, 'csv'))}
          >
            {exporting === 'doc-csv' ? <><Spinner className="size-3.5" label="Exporting" /> Exporting…</> : 'Export CSV'}
          </button>

          <button
            type="button"
            className={ghostButtonClassName}
            onClick={printDocumentsReport}
          >
            Print / PDF Preview
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
            onClick={() => setDocFilters({ search: '', category_id: '', barangay_id: '', status: '', file_type: '', date_from: '', date_to: '' })}
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="size-3.5">
              <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.78-4.22a.75.75 0 0 1-1.06 1.06L8 10.06l-1.72 1.72a.75.75 0 0 1-1.06-1.06L6.94 9 5.22 7.28a.75.75 0 0 1 1.06-1.06L8 7.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L9.06 9l1.72 1.72Z" clipRule="evenodd" />
            </svg>
            Clear filters
          </button>
        </div>
      </article>

      {/* ── Activity Logs Report (admin only) ─────────────────── */}
      {isAdmin && (
        <article className={`${panelClassName} space-y-5`}>
          <div className="flex items-start gap-4">
            <SectionIcon color="violet">
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
                <path fillRule="evenodd" d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.333 3 4.374v10.25c0 1.042.806 1.926 1.93 2.064 1.662.204 3.354.312 5.07.312 1.716 0 3.408-.108 5.07-.312C16.194 16.55 17 15.667 17 14.626V4.374c0-1.041-.806-1.924-1.93-2.063A48.467 48.467 0 0 0 10 2Zm0 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-2.5 3.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5h-1.5Z" clipRule="evenodd" />
              </svg>
            </SectionIcon>
            <div>
              <p className={sectionEyebrowClassName}>Export</p>
              <h2 className={pageTitleClassName}>Activity Logs Report</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Export the system audit trail filtered by date or action type.
              </p>
            </div>
          </div>

          <FilterGrid>
            <FilterField label="Action Type">
              <select className={selectClassName} value={actFilters.action} onChange={(e) => setActFilter('action', e.target.value)}>
                <option value="">All Actions</option>
                {ACTION_OPTIONS.map((a) => (
                  <option key={a} value={a}>{titleCase(a)}</option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Date From">
              <input type="date" className={inputClassName} value={actFilters.date_from} onChange={(e) => setActFilter('date_from', e.target.value)} />
            </FilterField>

            <FilterField label="Date To">
              <input type="date" className={inputClassName} value={actFilters.date_to} onChange={(e) => setActFilter('date_to', e.target.value)} />
            </FilterField>
          </FilterGrid>

          <div className="flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-4">
            <button
              type="button"
              className={primaryButtonClassName}
              disabled={exporting === 'act-csv'}
              onClick={() => runExport('act-csv', () => downloadActivityLogsReport(actFilters))}
            >
              {exporting === 'act-csv' ? <><Spinner className="size-3.5" label="Exporting" /> Exporting…</> : (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v4.59L7.3 9.44a.75.75 0 0 0-1.1 1.02l3.25 3.5a.75.75 0 0 0 1.1 0l3.25-3.5a.75.75 0 1 0-1.1-1.02l-1.95 2.1V6.75Z" clipRule="evenodd" />
                  </svg>
                  Export Activity Logs (CSV)
                </>
              )}
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
              onClick={() => setActFilters({ date_from: '', date_to: '', action: '' })}
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="size-3.5">
                <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.78-4.22a.75.75 0 0 1-1.06 1.06L8 10.06l-1.72 1.72a.75.75 0 0 1-1.06-1.06L6.94 9 5.22 7.28a.75.75 0 0 1 1.06-1.06L8 7.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L9.06 9l1.72 1.72Z" clipRule="evenodd" />
              </svg>
              Clear filters
            </button>
          </div>
        </article>
      )}

      {/* ── Dashboard Summary Report ───────────────────────────── */}
      <article className={`${panelClassName} space-y-5`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <SectionIcon color="emerald">
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
                <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
              </svg>
            </SectionIcon>
            <div>
              <p className={sectionEyebrowClassName}>Export</p>
              <h2 className={pageTitleClassName}>Dashboard Summary Report</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Download a snapshot of system stats, recent documents, and latest activity.
              </p>
            </div>
          </div>

          <button
            type="button"
            className={primaryButtonClassName}
            disabled={exporting === 'summary'}
            onClick={() => runExport('summary', downloadDashboardSummaryReport)}
          >
            {exporting === 'summary' ? <><Spinner className="size-3.5" label="Exporting" /> Exporting…</> : (
              <>
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v4.59L7.3 9.44a.75.75 0 0 0-1.1 1.02l3.25 3.5a.75.75 0 0 0 1.1 0l3.25-3.5a.75.75 0 1 0-1.1-1.02l-1.95 2.1V6.75Z" clipRule="evenodd" />
                </svg>
                Export Summary (CSV)
              </>
            )}
          </button>
        </div>

        <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 text-sm text-zinc-500">
          <p className="font-semibold text-zinc-700">Includes:</p>
          <ul className="mt-2 grid gap-1 pl-4 list-disc marker:text-zinc-400">
            <li>Total visible documents, categories, barangays, and users</li>
            <li>5 most recently uploaded documents</li>
            <li>5 most recent activity log entries</li>
          </ul>
        </div>
      </article>
    </div>
  );
}

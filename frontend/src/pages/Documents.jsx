import { useEffect, useState } from 'react';
import {
  createDocument,
  deleteDocument,
  downloadDocument,
  getDocuments,
  previewDocument,
  printDocument,
  updateDocument,
} from '../api/documentApi';
import { downloadDocumentsReport } from '../api/reportApi';
import { getBarangays, getCategories } from '../api/lookupApi';
import { getSettings } from '../api/settingsApi';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import SearchFilterBar from '../components/common/SearchFilterBar';
import StatusPill from '../components/common/StatusPill';
import DocumentForm from '../components/forms/DocumentForm';
import DataTable from '../components/tables/DataTable';
import { useAuth } from '../hooks/useAuth';
import {
  alertErrorClassName,
  dangerButtonClassName,
  ghostButtonClassName,
  pageStackClassName,
  pageTitleClassName,
  panelClassName,
  panelHeaderBetweenClassName,
  primaryButtonClassName,
  sectionEyebrowClassName,
  smallButtonClassName,
  tableActionsClassName,
} from '../styles/uiClasses';
import {
  buildDocumentFormData,
  extractCollection,
  formatDate,
  formatDateTime,
} from '../utils/apiData';
import {
  DEFAULT_DOCUMENT_UPLOAD_LIMIT_BYTES,
  documentFileHelpText,
  documentFileTooLargeMessage,
  getDocumentUploadLimitBytes,
} from '../utils/uploadLimits';
import { documentTypesFromSettings, labelDocumentType } from '../utils/documentTypes';

const defaultFilters = {
  search: '',
  category_id: '',
  barangay_id: '',
  status: '',
  file_type: '',
  date_from: '',
  date_to: '',
};

const blankDocument = {
  title: '',
  document_number: '',
  document_date: '',
  description: '',
  keywords: '',
  remarks: '',
  category_id: '',
  barangay_id: '',
  access_level: 'staff',
  status: 'draft',
};

function mapDocumentToForm(document) {
  return {
    title: document.title ?? '',
    document_number: document.document_number ?? '',
    document_date: document.document_date ?? '',
    description: document.description ?? '',
    keywords: document.keywords ?? '',
    remarks: document.remarks ?? '',
    category_id: document.category?.id ? String(document.category.id) : '',
    barangay_id: document.barangay?.id ? String(document.barangay.id) : '',
    access_level: document.access_level ?? 'staff',
    status: document.status ?? 'draft',
  };
}

function FolderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-7 w-7"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 7.5a2.25 2.25 0 0 1 2.25-2.25h4.09a2.25 2.25 0 0 1 1.59.66l1.32 1.33c.42.42.99.66 1.59.66H18A2.25 2.25 0 0 1 20.25 10v6.75A2.25 2.25 0 0 1 18 19H6a2.25 2.25 0 0 1-2.25-2.25V7.5Z"
      />
    </svg>
  );
}

function titleCase(value) {
  return String(value ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function labelFileType(value) {
  return labelDocumentType(value);
}

function highlightText(value, search) {
  const text = String(value ?? '');
  const needle = String(search ?? '').trim();

  if (!needle) {
    return text || '--';
  }

  const index = text.toLowerCase().indexOf(needle.toLowerCase());
  if (index === -1) {
    return text || '--';
  }

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-amber-100 px-0.5 text-amber-900">{text.slice(index, index + needle.length)}</mark>
      {text.slice(index + needle.length)}
    </>
  );
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [statusOptions, setStatusOptions] = useState(['draft', 'active', 'archived']);
  const [accessLevelOptions, setAccessLevelOptions] = useState(['admin', 'staff', 'barangay']);
  const [documentTypeOptions, setDocumentTypeOptions] = useState([]);
  const [maxUploadBytes, setMaxUploadBytes] = useState(DEFAULT_DOCUMENT_UPLOAD_LIMIT_BYTES);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formValues, setFormValues] = useState(blankDocument);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [exporting, setExporting] = useState('');

  const [uploading, setUploading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadValues, setUploadValues] = useState(blankDocument);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');

  const canEdit = ['admin', 'staff'].includes(user?.role);

  useEffect(() => {
    async function loadLookups() {
      const [categoryResponse, barangayResponse, settingsResponse] = await Promise.all([
        getCategories({ per_page: 100 }),
        getBarangays({ per_page: 100 }),
        getSettings(),
      ]);

      setCategories(extractCollection(categoryResponse));
      setBarangays(extractCollection(barangayResponse));
      setStatusOptions(settingsResponse.settings?.document_statuses ?? ['draft', 'active', 'archived']);
      setAccessLevelOptions(settingsResponse.settings?.document_access_levels ?? ['admin', 'staff', 'barangay']);
      setDocumentTypeOptions(documentTypesFromSettings(settingsResponse.settings));
      setMaxUploadBytes(getDocumentUploadLimitBytes(settingsResponse));
    }

    loadLookups();
  }, []);

  useEffect(() => {
    loadDocuments(filters);
  }, []);

  async function loadDocuments(activeFilters) {
    setLoading(true);

    try {
      const response = await getDocuments(activeFilters);
      setDocuments(extractCollection(response));
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function applyCategoryPreview(categoryId) {
    const nextFilters = { ...filters, category_id: String(categoryId) };
    setFilters(nextFilters);
    loadDocuments(nextFilters);
  }

  function openEdit(document) {
    setEditing(document);
    setFormValues(mapDocumentToForm(document));
    setSelectedFile(null);
    setMessage('');
  }

  function closeEdit() {
    setEditing(null);
    setFormValues(blankDocument);
    setSelectedFile(null);
    setMessage('');
  }

  function handleFileChange(nextFile) {
    if (!nextFile) {
      setSelectedFile(null);
      return;
    }

    if (nextFile.size > maxUploadBytes) {
      setSelectedFile(null);
      setMessage(documentFileTooLargeMessage(maxUploadBytes));
      return;
    }

    setMessage('');
    setSelectedFile(nextFile);
  }

  async function handleEditSubmit(event) {
    event.preventDefault();

    if (!editing) {
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      await updateDocument(editing.id, buildDocumentFormData(formValues, selectedFile));
      closeEdit();
      await loadDocuments(filters);
    } catch (error) {
      const validationErrors = error.response?.data?.errors;
      const firstValidationMessage = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;

      setMessage(
        firstValidationMessage ??
          error.response?.data?.message ??
          'Unable to update the document.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this document record?')) return;

    try {
      await deleteDocument(id);
      await loadDocuments(filters);
    } catch (error) {
      window.alert(error.response?.data?.message ?? 'Failed to delete document.');
    }
  }

  function openUpload() {
    setUploadValues(blankDocument);
    setUploadFile(null);
    setUploadMessage('');
    setUploadOpen(true);
  }

  function closeUpload() {
    setUploadOpen(false);
    setUploadValues(blankDocument);
    setUploadFile(null);
    setUploadMessage('');
  }

  function handleUploadFileChange(nextFile) {
    if (!nextFile) {
      setUploadFile(null);
      return;
    }
    if (nextFile.size > maxUploadBytes) {
      setUploadFile(null);
      setUploadMessage(documentFileTooLargeMessage(maxUploadBytes));
      return;
    }
    setUploadMessage('');
    setUploadFile(nextFile);
  }

  async function handleUploadSubmit(event) {
    event.preventDefault();
    setUploading(true);
    setUploadMessage('');

    try {
      await createDocument(buildDocumentFormData(uploadValues, uploadFile));
      closeUpload();
      await loadDocuments(filters);
    } catch (error) {
      const validationErrors = error.response?.data?.errors;
      const firstValidationMessage = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;

      setUploadMessage(
        firstValidationMessage ??
          error.response?.data?.message ??
          'Unable to save document. Review the form and backend setup.',
      );
    } finally {
      setUploading(false);
    }
  }

  function handleResetFilters() {
    setFilters(defaultFilters);
    loadDocuments(defaultFilters);
  }

  function printDocumentsReport() {
    // Do NOT use "noopener" — modern browsers return null for the reference when it is set,
    // making popup.document.write() impossible.
    const popup = window.open('', '_blank', 'width=1120,height=780');

    if (!popup) {
      window.alert('Popup was blocked. Please allow popups for this site and try again.');
      return;
    }

    const rows = documents.map((document) => `
      <tr>
        <td>${escapeHtml(document.title)}</td>
        <td>${escapeHtml(document.document_number ?? '--')}</td>
        <td>${escapeHtml(document.category?.name ?? '--')}</td>
        <td>${escapeHtml(document.barangay?.name ?? 'All')}</td>
        <td>${escapeHtml(formatDate(document.document_date))}</td>
        <td>${escapeHtml(titleCase(document.status))}</td>
        <td>${escapeHtml(labelFileType(document.file_type))}</td>
      </tr>
    `).join('');

    popup.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Documents Report</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 32px; color: #18181b; font-family: Arial, sans-serif; }
            h1 { margin: 0 0 6px; font-size: 24px; }
            p { margin: 0 0 20px; color: #71717a; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #d4d4d8; padding: 8px; text-align: left; vertical-align: top; }
            th { background: #f4f4f5; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
            @media print { body { margin: 18mm; } }
          </style>
        </head>
        <body>
          <h1>MPDO Documents Report</h1>
          <p>${documents.length} document(s), generated ${escapeHtml(new Date().toLocaleString())}</p>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Number</th>
                <th>Category</th>
                <th>Barangay</th>
                <th>Date</th>
                <th>Status</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="7">No documents found.</td></tr>'}</tbody>
          </table>
          <script>window.setTimeout(function(){ window.print(); }, 300);<\/script>
        </body>
      </html>
    `);
    popup.document.close();
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');
  const groupedDocuments = documents.reduce((groups, document) => {
    const key = document.category?.name ?? 'Uncategorized';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(document);
    return groups;
  }, {});
  const groupEntries = Object.entries(groupedDocuments);
  const categoryPreviews = categories.map((category) => {
    const count = documents.filter((document) => document.category?.id === category.id).length;
    const latest = documents.find((document) => document.category?.id === category.id);

    return { category, count, latest };
  });
  const activeCategory = categories.find((category) => String(category.id) === String(filters.category_id));
  const documentColumns = [
    { key: 'title', label: 'Title', render: (row) => highlightText(row.title, filters.search) },
    {
      key: 'document_date',
      label: 'Document Date',
      render: (row) => formatDate(row.document_date),
    },
    {
      key: 'keywords',
      label: 'Keywords',
      render: (row) => highlightText(row.keywords || '--', filters.search),
    },
    {
      key: 'file_type',
      label: 'Type',
      render: (row) => labelFileType(row.file_type),
    },
    {
      key: 'barangay',
      label: 'Barangay',
      render: (row) => row.barangay?.name ?? 'All',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusPill value={row.status} />,
    },
    {
      key: 'uploaded_at',
      label: 'Uploaded',
      render: (row) => formatDateTime(row.uploaded_at ?? row.created_at),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className={tableActionsClassName}>
          <button
            type="button"
            className={`${ghostButtonClassName} ${smallButtonClassName}`}
            onClick={() => previewDocument(row.id)}
          >
            Open
          </button>
          <button
            type="button"
            className={`${ghostButtonClassName} ${smallButtonClassName}`}
            onClick={() => printDocument(row.id)}
          >
            Print
          </button>
          <button
            type="button"
            className={`${ghostButtonClassName} ${smallButtonClassName}`}
            onClick={() =>
              downloadDocument(row.id, row.file_name ?? `${row.title}.pdf`)
            }
          >
            Download
          </button>

          {canEdit ? (
            <button
              type="button"
              className={`${ghostButtonClassName} ${smallButtonClassName}`}
              onClick={() => openEdit(row)}
            >
              Edit
            </button>
          ) : null}

          {canEdit ? (
            <button
              type="button"
              className={`${dangerButtonClassName} ${smallButtonClassName}`}
              onClick={() => handleDelete(row.id)}
            >
              Delete
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className={pageStackClassName}>
      <article className={panelClassName}>
        <div className={panelHeaderBetweenClassName}>
          <div>
            <p className={sectionEyebrowClassName}>Records Center</p>
            <h2 className={pageTitleClassName}>Document library</h2>
          </div>

          {canEdit ? (
            <button type="button" className={primaryButtonClassName} onClick={openUpload}>
              Upload New Document
            </button>
          ) : null}
        </div>

        <SearchFilterBar
          fields={[
            {
              name: 'search',
              label: 'Search',
              placeholder: 'Title, number, or keyword',
            },
            {
              name: 'category_id',
              label: 'Category',
              type: 'select',
              options: categories.map((item) => ({
                value: item.id,
                label: item.name,
              })),
            },
            {
              name: 'barangay_id',
              label: 'Barangay',
              type: 'select',
              options: barangays.map((item) => ({
                value: item.id,
                label: item.name,
              })),
            },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: statusOptions.map((status) => ({
                value: status,
                label: titleCase(status),
              })),
            },
            {
              name: 'file_type',
              label: 'Document Type',
              type: 'select',
              options: documentTypeOptions,
            },
            { name: 'date_from', label: 'Date From', type: 'date' },
            { name: 'date_to', label: 'Date To', type: 'date' },
          ]}
          values={filters}
          onChange={handleFilterChange}
          onSubmit={(event) => {
            event.preventDefault();
            loadDocuments(filters);
          }}
          onReset={handleResetFilters}
          actions={
            <>
              <button
                type="button"
                className={ghostButtonClassName}
                disabled={exporting === 'xls'}
                onClick={async () => {
                  setExporting('xls');
                  try {
                    await downloadDocumentsReport(filters, 'xls');
                  } catch {
                    window.alert('Failed to export Excel. Please try again.');
                  } finally {
                    setExporting('');
                  }
                }}
              >
                {exporting === 'xls' ? (
                  <><Spinner className="size-3.5" label="Exporting" /> Exporting…</>
                ) : 'Export Excel'}
              </button>
              <button
                type="button"
                className={ghostButtonClassName}
                disabled={exporting === 'print'}
                onClick={() => {
                  setExporting('print');
                  try {
                    printDocumentsReport();
                  } finally {
                    setExporting('');
                  }
                }}
              >
                Export PDF / Print
              </button>
            </>
          }
        />

        <section className="mb-6 grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={sectionEyebrowClassName}>Category Preview</p>
              <h3 className="text-base font-bold text-zinc-900">
                {activeCategory ? activeCategory.name : 'All document categories'}
              </h3>
            </div>
            <span className="text-xs font-semibold text-zinc-500">
              {documents.length} result{documents.length === 1 ? '' : 's'} loaded
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {categoryPreviews.slice(0, 8).map(({ category, count, latest }) => (
              <button
                key={category.id}
                type="button"
                className={`rounded-xl border p-3 text-left transition ${
                  String(filters.category_id) === String(category.id)
                    ? 'border-blue-300 bg-blue-50 shadow-sm'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
                onClick={() => applyCategoryPreview(category.id)}
              >
                <span className="block truncate text-sm font-bold text-zinc-900">{category.name}</span>
                <span className="mt-1 block text-xs text-zinc-500">
                  {count} visible result{count === 1 ? '' : 's'}
                </span>
                <span className="mt-2 block truncate text-xs text-zinc-400">
                  Latest: {latest?.title ?? 'No matching document'}
                </span>
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <LoadingState
            title="Loading documents"
            description="Fetching archive records and applying your filters."
          />
        ) : documents.length === 0 ? (
          <EmptyState
            icon={<FolderIcon />}
            title={hasActiveFilters ? 'No documents match your filters' : 'No documents found'}
            description={
              hasActiveFilters
                ? 'Try adjusting your search or reset the current filters to see more records.'
                : 'There are no document records yet. Start by uploading your first document to build the library.'
            }
            primaryAction={
              canEdit ? (
                <button type="button" className={primaryButtonClassName} onClick={openUpload}>
                  Upload Document
                </button>
              ) : null
            }
            secondaryAction={
              hasActiveFilters ? (
                <button
                  type="button"
                  className={ghostButtonClassName}
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </button>
              ) : null
            }
          />
        ) : (
          <div className="grid gap-5">
            {groupEntries.map(([categoryName, rows], index) => (
              <section key={categoryName} className="grid gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                      Group {index + 1}
                    </p>
                    <h3 className="text-lg font-bold text-zinc-900">{categoryName}</h3>
                  </div>
                  <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-600">
                    {rows.length} document{rows.length === 1 ? '' : 's'}
                  </span>
                </div>
                <DataTable columns={documentColumns} rows={rows} />
              </section>
            ))}
          </div>
        )}
      </article>

      <Modal title="Upload Document" open={uploadOpen} onClose={closeUpload}>
        {uploadMessage ? <div className={`${alertErrorClassName} mb-4`}>{uploadMessage}</div> : null}

        <DocumentForm
          values={uploadValues}
          categories={categories}
          barangays={barangays}
          statusOptions={statusOptions}
          accessLevelOptions={accessLevelOptions}
          onChange={(field, value) =>
            setUploadValues((current) => ({ ...current, [field]: value }))
          }
          onFileChange={handleUploadFileChange}
          onSubmit={handleUploadSubmit}
          submitting={uploading}
          submitLabel="Upload Document"
          fileHelpText={documentFileHelpText(maxUploadBytes)}
        />
      </Modal>

      <Modal title="Edit Document" open={Boolean(editing)} onClose={closeEdit}>
        {message ? <div className={`${alertErrorClassName} mb-4`}>{message}</div> : null}

        <DocumentForm
          values={formValues}
          categories={categories}
          barangays={barangays}
          statusOptions={statusOptions}
          accessLevelOptions={accessLevelOptions}
          onChange={(field, value) =>
            setFormValues((current) => ({ ...current, [field]: value }))
          }
          onFileChange={handleFileChange}
          onSubmit={handleEditSubmit}
          submitting={submitting}
          submitLabel="Save Changes"
          fileHelpText={documentFileHelpText(
            maxUploadBytes,
            'Leave the file empty to keep the current attachment. Maximum replacement file size is',
          )}
        />
      </Modal>

    </div>
  );
}

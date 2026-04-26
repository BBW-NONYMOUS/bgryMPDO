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

const defaultFilters = {
  search: '',
  category_id: '',
  barangay_id: '',
  status: '',
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

export default function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [statusOptions, setStatusOptions] = useState(['draft', 'active', 'archived']);
  const [accessLevelOptions, setAccessLevelOptions] = useState(['admin', 'staff', 'barangay']);
  const [maxUploadBytes, setMaxUploadBytes] = useState(DEFAULT_DOCUMENT_UPLOAD_LIMIT_BYTES);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formValues, setFormValues] = useState(blankDocument);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

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
    if (!window.confirm('Delete this document record?')) {
      return;
    }

    await deleteDocument(id);
    await loadDocuments(filters);
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

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

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
                label: status.replace(/[_-]+/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase()),
              })),
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
            <button
              type="button"
              className={ghostButtonClassName}
              onClick={() => downloadDocumentsReport(filters)}
            >
              Export Report
            </button>
          }
        />

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
          <DataTable
            columns={[
              { key: 'title', label: 'Title' },
              {
                key: 'document_date',
                label: 'Document Date',
                render: (row) => formatDate(row.document_date),
              },
              {
                key: 'keywords',
                label: 'Keywords',
                render: (row) => row.keywords || '--',
              },
              {
                key: 'category',
                label: 'Category',
                render: (row) => row.category?.name ?? '--',
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
            ]}
            rows={documents}
          />
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

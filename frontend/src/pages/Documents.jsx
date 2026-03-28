import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteDocument, downloadDocument, getDocuments } from '../api/documentApi';
import { getBarangays, getCategories } from '../api/lookupApi';
import LoadingState from '../components/common/LoadingState';
import SearchFilterBar from '../components/common/SearchFilterBar';
import StatusPill from '../components/common/StatusPill';
import DataTable from '../components/tables/DataTable';
import { useAuth } from '../hooks/useAuth';
import { extractCollection, formatDateTime } from '../utils/apiData';

const defaultFilters = {
  search: '',
  category_id: '',
  barangay_id: '',
  status: '',
  date_from: '',
  date_to: '',
};

export default function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLookups() {
      const [categoryResponse, barangayResponse] = await Promise.all([
        getCategories({ per_page: 100 }),
        getBarangays({ per_page: 100 }),
      ]);

      setCategories(extractCollection(categoryResponse));
      setBarangays(extractCollection(barangayResponse));
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

  async function handleDelete(id) {
    if (!window.confirm('Delete this document record?')) {
      return;
    }

    await deleteDocument(id);
    await loadDocuments(filters);
  }

  const canEdit = ['admin', 'staff'].includes(user?.role);

  return (
    <div className="page-stack">
      <article className="panel">
        <div className="panel__header panel__header--space-between">
          <div>
            <p className="section-label">Records Center</p>
            <h2>Document library</h2>
          </div>
          {canEdit ? (
            <Link to="/documents/upload" className="button button--primary">
              Upload New Document
            </Link>
          ) : null}
        </div>

        <SearchFilterBar
          fields={[
            { name: 'search', label: 'Search', placeholder: 'Title, number, or keyword' },
            {
              name: 'category_id',
              label: 'Category',
              type: 'select',
              options: categories.map((item) => ({ value: item.id, label: item.name })),
            },
            {
              name: 'barangay_id',
              label: 'Barangay',
              type: 'select',
              options: barangays.map((item) => ({ value: item.id, label: item.name })),
            },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'draft', label: 'Draft' },
                { value: 'active', label: 'Active' },
                { value: 'archived', label: 'Archived' },
              ],
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
          onReset={() => {
            setFilters(defaultFilters);
            loadDocuments(defaultFilters);
          }}
        />

        {loading ? (
          <LoadingState title="Loading documents" description="Fetching archive records and applying your filters." />
        ) : (
          <DataTable
            columns={[
              { key: 'title', label: 'Title' },
              { key: 'keywords', label: 'Keywords', render: (row) => row.keywords || '--' },
              { key: 'category', label: 'Category', render: (row) => row.category?.name ?? '--' },
              { key: 'barangay', label: 'Barangay', render: (row) => row.barangay?.name ?? 'All' },
              { key: 'status', label: 'Status', render: (row) => <StatusPill value={row.status} /> },
              { key: 'uploaded_at', label: 'Uploaded', render: (row) => formatDateTime(row.uploaded_at ?? row.created_at) },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <div className="table-actions">
                    <a
                      className="button button--ghost button--sm"
                      href="#download"
                      onClick={(event) => {
                        event.preventDefault();
                        downloadDocument(row.id, row.file_name ?? `${row.title}.pdf`);
                      }}
                    >
                      Download
                    </a>
                    {canEdit ? (
                      <button type="button" className="button button--danger button--sm" onClick={() => handleDelete(row.id)}>
                        Delete
                      </button>
                    ) : null}
                  </div>
                ),
              },
            ]}
            rows={documents}
            emptyTitle="No documents found"
            emptyDescription="Try a broader search or upload the first document record."
          />
        )}
      </article>
    </div>
  );
}

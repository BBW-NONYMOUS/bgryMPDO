import { useEffect, useState } from 'react';
import Modal from '../components/common/Modal';
import SearchFilterBar from '../components/common/SearchFilterBar';
import DataTable from '../components/tables/DataTable';
import { createCategory, deleteCategory, getCategories, updateCategory } from '../api/lookupApi';
import { extractCollection } from '../utils/apiData';

const blankCategory = {
  name: '',
  description: '',
  is_active: true,
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: '' });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankCategory);

  useEffect(() => {
    loadCategories(filters);
  }, []);

  async function loadCategories(params = {}) {
    const response = await getCategories(params);
    setCategories(extractCollection(response));
  }

  function openCreate() {
    setEditing(null);
    setForm(blankCategory);
    setOpen(true);
  }

  function openEdit(category) {
    setEditing(category);
    setForm({
      name: category.name ?? '',
      description: category.description ?? '',
      is_active: Boolean(category.is_active),
    });
    setOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (editing) {
      await updateCategory(editing.id, form);
    } else {
      await createCategory(form);
    }

    setOpen(false);
    await loadCategories(filters);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this category?')) {
      return;
    }

    await deleteCategory(id);
    await loadCategories(filters);
  }

  return (
    <div className="page-stack">
      <article className="panel">
        <div className="panel__header panel__header--space-between">
          <div>
            <p className="section-label">Catalog Setup</p>
            <h2>Document categories</h2>
          </div>
          <button type="button" className="button button--primary" onClick={openCreate}>
            Add Category
          </button>
        </div>

        <SearchFilterBar
          fields={[{ name: 'search', label: 'Search', placeholder: 'Category name' }]}
          values={filters}
          onChange={(field, value) => setFilters((current) => ({ ...current, [field]: value }))}
          onSubmit={(event) => {
            event.preventDefault();
            loadCategories(filters);
          }}
          onReset={() => {
            const nextFilters = { search: '' };
            setFilters(nextFilters);
            loadCategories(nextFilters);
          }}
        />

        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'description', label: 'Description', render: (row) => row.description || '--' },
            { key: 'documents_count', label: 'Documents' },
            { key: 'is_active', label: 'Status', render: (row) => (row.is_active ? 'Active' : 'Inactive') },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="table-actions">
                  <button type="button" className="button button--ghost button--sm" onClick={() => openEdit(row)}>
                    Edit
                  </button>
                  <button type="button" className="button button--danger button--sm" onClick={() => handleDelete(row.id)}>
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
          rows={categories}
          emptyTitle="No categories found"
          emptyDescription="Create categories such as Development Plans, Reports, and Permits."
        />
      </article>

      <Modal title={editing ? 'Edit Category' : 'Add Category'} open={open} onClose={() => setOpen(false)}>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field field--full">
            <span>Category Name</span>
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
          </label>
          <label className="field field--full">
            <span>Description</span>
            <textarea
              rows="4"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>Status</span>
            <select value={String(form.is_active)} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.value === 'true' }))}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <div className="field field--full form-actions">
            <button type="submit" className="button button--primary">
              Save Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

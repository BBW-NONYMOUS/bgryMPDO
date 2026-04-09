import { useEffect, useState } from 'react';
import Modal from '../components/common/Modal';
import SearchFilterBar from '../components/common/SearchFilterBar';
import DataTable from '../components/tables/DataTable';
import { createCategory, deleteCategory, getCategories, updateCategory } from '../api/lookupApi';
import {
  dangerButtonClassName,
  fieldClassName,
  fieldFullClassName,
  fieldLabelClassName,
  formActionsClassName,
  formGridClassName,
  ghostButtonClassName,
  inputClassName,
  pageStackClassName,
  pageTitleClassName,
  panelClassName,
  panelHeaderBetweenClassName,
  primaryButtonClassName,
  sectionEyebrowClassName,
  selectClassName,
  smallButtonClassName,
  tableActionsClassName,
  textareaClassName,
} from '../styles/uiClasses';
import { extractCollection } from '../utils/apiData';

const blankCategory = {
  name: '',
  description: '',
  is_active: true,
};

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        active
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
          : 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: '' });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankCategory);
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);

    try {
      if (editing) {
        await updateCategory(editing.id, form);
      } else {
        await createCategory(form);
      }

      setOpen(false);
      await loadCategories(filters);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this category?')) {
      return;
    }

    await deleteCategory(id);
    await loadCategories(filters);
  }

  return (
    <div className={pageStackClassName}>
      <article className={`${panelClassName} space-y-6`}>
        <div className={panelHeaderBetweenClassName}>
          <div>
            <p className={sectionEyebrowClassName}>Catalog Setup</p>
            <h2 className={pageTitleClassName}>Document Categories</h2>
            <p className="mt-1 text-sm text-slate-500">
              Organize documents into clear groups for easier filtering and management.
            </p>
          </div>

          <button
            type="button"
            className={primaryButtonClassName}
            onClick={openCreate}
          >
            Add Category
          </button>
        </div>

        <SearchFilterBar
          fields={[{ name: 'search', label: 'Search', placeholder: 'Search category name' }]}
          values={filters}
          onChange={(field, value) =>
            setFilters((current) => ({ ...current, [field]: value }))
          }
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
            {
              key: 'name',
              label: 'Name',
              render: (row) => (
                <div>
                  <p className="font-medium text-slate-900">{row.name}</p>
                </div>
              ),
            },
            {
              key: 'description',
              label: 'Description',
              render: (row) => (
                <span className="text-sm text-slate-600">
                  {row.description || 'No description provided'}
                </span>
              ),
            },
            {
              key: 'documents_count',
              label: 'Documents',
              render: (row) => (
                <span className="font-medium text-slate-700">
                  {row.documents_count ?? 0}
                </span>
              ),
            },
            {
              key: 'is_active',
              label: 'Status',
              render: (row) => <StatusBadge active={row.is_active} />,
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className={tableActionsClassName}>
                  <button
                    type="button"
                    className={`${ghostButtonClassName} ${smallButtonClassName}`}
                    onClick={() => openEdit(row)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`${dangerButtonClassName} ${smallButtonClassName}`}
                    onClick={() => handleDelete(row.id)}
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
          rows={categories}
          emptyTitle="No categories found"
          emptyDescription="Create categories like Development Plans, Reports, and Permits to organize your documents."
        />
      </article>

      <Modal
        title={editing ? 'Edit Category' : 'Add Category'}
        open={open}
        onClose={() => setOpen(false)}
      >
        <form className={`space-y-6 ${formGridClassName}`} onSubmit={handleSubmit}>
          <div className={`${fieldFullClassName} col-span-full`}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Category Details
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Provide the basic information used to classify documents.
            </p>
          </div>

          <label className={`${fieldClassName} ${fieldFullClassName}`}>
            <span className={fieldLabelClassName}>Category Name</span>
            <input
              className={inputClassName}
              value={form.name}
              placeholder="Enter category name"
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
          </label>

          <label className={`${fieldClassName} ${fieldFullClassName}`}>
            <span className={fieldLabelClassName}>Description</span>
            <textarea
              className={textareaClassName}
              rows="4"
              placeholder="Write a short description for this category"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </label>

          <label className={fieldClassName}>
            <span className={fieldLabelClassName}>Status</span>
            <select
              className={selectClassName}
              value={String(form.is_active)}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  is_active: event.target.value === 'true',
                }))
              }
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>

          <div className={`${formActionsClassName} col-span-full border-t border-slate-200 pt-4`}>
            <button type="submit" className={primaryButtonClassName} disabled={submitting}>
              {submitting ? 'Saving...' : editing ? 'Update Category' : 'Save Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
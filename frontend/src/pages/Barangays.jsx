import { useEffect, useState } from 'react';
import Modal from '../components/common/Modal';
import SearchFilterBar from '../components/common/SearchFilterBar';
import DataTable from '../components/tables/DataTable';
import { createBarangay, deleteBarangay, getBarangays, updateBarangay } from '../api/lookupApi';
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

const blankBarangay = {
  name: '',
  description: '',
  is_active: true,
};

export default function Barangays() {
  const [barangays, setBarangays] = useState([]);
  const [filters, setFilters] = useState({ search: '' });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankBarangay);

  useEffect(() => {
    loadBarangays(filters);
  }, []);

  async function loadBarangays(params = {}) {
    const response = await getBarangays(params);
    setBarangays(extractCollection(response));
  }

  function openCreate() {
    setEditing(null);
    setForm(blankBarangay);
    setOpen(true);
  }

  function openEdit(barangay) {
    setEditing(barangay);
    setForm({
      name: barangay.name ?? '',
      description: barangay.description ?? '',
      is_active: Boolean(barangay.is_active),
    });
    setOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (editing) {
      await updateBarangay(editing.id, form);
    } else {
      await createBarangay(form);
    }

    setOpen(false);
    await loadBarangays(filters);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this barangay?')) {
      return;
    }

    await deleteBarangay(id);
    await loadBarangays(filters);
  }

  return (
    <div className={pageStackClassName}>
      <article className={panelClassName}>
        <div className={panelHeaderBetweenClassName}>
          <div>
            <p className={sectionEyebrowClassName}>Coverage Setup</p>
            <h2 className={pageTitleClassName}>Barangay directory</h2>
          </div>
          <button type="button" className={primaryButtonClassName} onClick={openCreate}>
            Add Barangay
          </button>
        </div>

        <SearchFilterBar
          fields={[{ name: 'search', label: 'Search', placeholder: 'Barangay name' }]}
          values={filters}
          onChange={(field, value) => setFilters((current) => ({ ...current, [field]: value }))}
          onSubmit={(event) => {
            event.preventDefault();
            loadBarangays(filters);
          }}
          onReset={() => {
            const nextFilters = { search: '' };
            setFilters(nextFilters);
            loadBarangays(nextFilters);
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
                <div className={tableActionsClassName}>
                  <button type="button" className={`${ghostButtonClassName} ${smallButtonClassName}`} onClick={() => openEdit(row)}>
                    Edit
                  </button>
                  <button type="button" className={`${dangerButtonClassName} ${smallButtonClassName}`} onClick={() => handleDelete(row.id)}>
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
          rows={barangays}
          emptyTitle="No barangays found"
          emptyDescription="Maintain the municipal barangay list used for tagging documents and assigning officials."
        />
      </article>

      <Modal title={editing ? 'Edit Barangay' : 'Add Barangay'} open={open} onClose={() => setOpen(false)}>
        <form className={formGridClassName} onSubmit={handleSubmit}>
          <label className={`${fieldClassName} ${fieldFullClassName}`}>
            <span className={fieldLabelClassName}>Barangay Name</span>
            <input className={inputClassName} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
          </label>
          <label className={`${fieldClassName} ${fieldFullClassName}`}>
            <span className={fieldLabelClassName}>Description</span>
            <textarea
              className={textareaClassName}
              rows="4"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>
          <label className={fieldClassName}>
            <span className={fieldLabelClassName}>Status</span>
            <select className={selectClassName} value={String(form.is_active)} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.value === 'true' }))}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <div className={formActionsClassName}>
            <button type="submit" className={primaryButtonClassName}>
              Save Barangay
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

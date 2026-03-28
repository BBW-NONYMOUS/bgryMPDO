import { useEffect, useState } from 'react';
import Modal from '../components/common/Modal';
import SearchFilterBar from '../components/common/SearchFilterBar';
import UserForm from '../components/forms/UserForm';
import DataTable from '../components/tables/DataTable';
import { getBarangays } from '../api/lookupApi';
import { createUser, deleteUser, getUsers, updateUser } from '../api/userApi';
import { extractCollection } from '../utils/apiData';

const blankUser = {
  name: '',
  email: '',
  password: '',
  role: 'staff',
  barangay_id: '',
  is_active: true,
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [filters, setFilters] = useState({ search: '' });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankUser);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      const [userResponse, barangayResponse] = await Promise.all([
        getUsers(filters),
        getBarangays({ per_page: 100 }),
      ]);

      setUsers(extractCollection(userResponse));
      setBarangays(extractCollection(barangayResponse));
    }

    bootstrap();
  }, []);

  async function loadUsers(params = {}) {
    const response = await getUsers(params);
    setUsers(extractCollection(response));
  }

  function openCreate() {
    setEditing(null);
    setForm(blankUser);
    setOpen(true);
  }

  function openEdit(user) {
    setEditing(user);
    setForm({
      name: user.name ?? '',
      email: user.email ?? '',
      password: '',
      role: user.role ?? 'staff',
      barangay_id: user.barangay?.id ?? '',
      is_active: Boolean(user.is_active),
    });
    setOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (editing) {
        await updateUser(editing.id, form);
      } else {
        await createUser(form);
      }

      setOpen(false);
      await loadUsers(filters);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this user account?')) {
      return;
    }

    await deleteUser(id);
    await loadUsers(filters);
  }

  return (
    <div className="page-stack">
      <article className="panel">
        <div className="panel__header panel__header--space-between">
          <div>
            <p className="section-label">Administration</p>
            <h2>User accounts</h2>
          </div>
          <button type="button" className="button button--primary" onClick={openCreate}>
            Add User
          </button>
        </div>

        <SearchFilterBar
          fields={[{ name: 'search', label: 'Search', placeholder: 'Name or email' }]}
          values={filters}
          onChange={(field, value) => setFilters((current) => ({ ...current, [field]: value }))}
          onSubmit={(event) => {
            event.preventDefault();
            loadUsers(filters);
          }}
          onReset={() => {
            const nextFilters = { search: '' };
            setFilters(nextFilters);
            loadUsers(nextFilters);
          }}
        />

        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role' },
            { key: 'barangay', label: 'Barangay', render: (row) => row.barangay?.name ?? '--' },
            { key: 'is_active', label: 'Status', render: (row) => (row.is_active ? 'Active' : 'Inactive') },
            { key: 'documents_count', label: 'Uploads' },
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
          rows={users}
          emptyTitle="No users found"
          emptyDescription="Create administrator, staff, and barangay official accounts here."
        />
      </article>

      <Modal title={editing ? 'Edit User' : 'Add User'} open={open} onClose={() => setOpen(false)}>
        <UserForm
          values={form}
          barangays={barangays}
          isEdit={Boolean(editing)}
          submitting={submitting}
          onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}

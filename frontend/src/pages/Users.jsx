import { useEffect, useState } from 'react';
import Modal from '../components/common/Modal';
import SearchFilterBar from '../components/common/SearchFilterBar';
import UserForm from '../components/forms/UserForm';
import DataTable from '../components/tables/DataTable';
import { getBarangays } from '../api/lookupApi';
import {
  approveUser,
  createUser,
  getUsers,
  rejectUser,
  suspendUser,
  unsuspendUser,
  updateUser,
} from '../api/userApi';
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
import { extractCollection } from '../utils/apiData';

const blankUser = {
  name: '',
  email: '',
  password: '',
  role: 'staff',
  barangay_id: '',
  is_active: true,
  account_status: 'pending',
  account_status_remark: '',
};

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        active
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
          : 'bg-zinc-100 text-zinc-600 ring-zinc-200'
      }`}
    >
      {active ? 'Active' : 'Suspended'}
    </span>
  );
}

function RoleBadge({ role }) {
  const styles = {
    admin: 'bg-violet-50 text-violet-700 ring-violet-200',
    staff: 'bg-blue-50 text-blue-700 ring-blue-200',
    barangay: 'bg-amber-50 text-amber-700 ring-amber-200',
  };

  const labels = {
    admin: 'Admin',
    staff: 'MPDO Staff',
    barangay: 'Barangay Official',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        styles[role] ?? 'bg-zinc-100 text-zinc-700 ring-zinc-200'
      }`}
    >
      {labels[role] ?? role}
    </span>
  );
}

function AccountStatusBadge({ status }) {
  const styles = {
    approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    rejected: 'bg-red-50 text-red-700 ring-red-200',
  };

  const labels = {
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        styles[status] ?? 'bg-zinc-100 text-zinc-700 ring-zinc-200'
      }`}
    >
      {labels[status] ?? status ?? 'Unknown'}
    </span>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [filters, setFilters] = useState({ search: '', account_status: '', is_active: '' });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankUser);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

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
    setFormError('');
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
      account_status: user.account_status ?? 'pending',
      account_status_remark: user.account_status_remark ?? '',
    });
    setFormError('');
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      if (editing) {
        await updateUser(editing.id, form);
      } else {
        await createUser(form);
      }

      closeModal();
      await loadUsers(filters);
    } catch (error) {
      const validationErrors = error.response?.data?.errors;
      const first = validationErrors ? Object.values(validationErrors).flat()[0] : null;
      setFormError(first ?? error.response?.data?.message ?? 'Failed to save user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSuspend(user) {
    if (!window.confirm(`Suspend ${user.name}'s account? They will be signed out and blocked from using the system.`)) return;

    try {
      await suspendUser(user.id);
      await loadUsers(filters);
    } catch (error) {
      window.alert(error.response?.data?.message ?? 'Failed to suspend user.');
    }
  }

  async function handleUnsuspend(user) {
    if (!window.confirm(`Reactivate ${user.name}'s account? Their existing data will remain available.`)) return;

    try {
      await unsuspendUser(user.id);
      await loadUsers(filters);
    } catch (error) {
      window.alert(error.response?.data?.message ?? 'Failed to reactivate user.');
    }
  }

  async function handleApprove(user) {
    const remark = window.prompt('Approval remark (optional):') ?? '';
    try {
      await approveUser(user.id, remark.trim() || undefined);
      await loadUsers(filters);
    } catch (error) {
      window.alert(error.response?.data?.message ?? 'Failed to approve user.');
    }
  }

  async function handleReject(user) {
    const remark = window.prompt('Rejection remark (optional):') ?? '';
    try {
      await rejectUser(user.id, remark.trim() || undefined);
      await loadUsers(filters);
    } catch (error) {
      window.alert(error.response?.data?.message ?? 'Failed to reject user.');
    }
  }

  return (
    <div className={pageStackClassName}>
      <article className={`${panelClassName} space-y-6`}>
        <div className={panelHeaderBetweenClassName}>
          <div>
            <p className={sectionEyebrowClassName}>Administration</p>
            <h2 className={pageTitleClassName}>User Accounts</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Manage administrator, staff, and barangay official access in one place.
            </p>
          </div>

          <button
            type="button"
            className={primaryButtonClassName}
            onClick={openCreate}
          >
            Add User
          </button>
        </div>

        <SearchFilterBar
          fields={[
            { name: 'search', label: 'Search', placeholder: 'Search by name or email' },
            { name: 'account_status', label: 'Account Status', placeholder: 'approved, pending, rejected' },
            { name: 'is_active', label: 'Access', placeholder: 'true or false' },
          ]}
          values={filters}
          onChange={(field, value) =>
            setFilters((current) => ({ ...current, [field]: value }))
          }
          onSubmit={(event) => {
            event.preventDefault();
            loadUsers(filters);
          }}
          onReset={() => {
            const nextFilters = { search: '', account_status: '', is_active: '' };
            setFilters(nextFilters);
            loadUsers(nextFilters);
          }}
        />

        <DataTable
          columns={[
            {
              key: 'name',
              label: 'User',
              render: (row) => (
                <div className="space-y-0.5">
                  <p className="font-medium text-zinc-900">{row.name}</p>
                  <p className="text-sm text-zinc-500">{row.email}</p>
                </div>
              ),
            },
            {
              key: 'role',
              label: 'Role',
              render: (row) => <RoleBadge role={row.role} />,
            },
            {
              key: 'barangay',
              label: 'Barangay',
              render: (row) => (
                <span className="text-sm text-zinc-600">
                  {row.barangay?.name ?? 'Not assigned'}
                </span>
              ),
            },
            {
              key: 'is_active',
              label: 'Status',
              render: (row) => <StatusBadge active={row.is_active} />,
            },
            {
              key: 'account_status',
              label: 'Approval',
              render: (row) => <AccountStatusBadge status={row.account_status} />,
            },
            {
              key: 'documents_count',
              label: 'Uploads',
              render: (row) => (
                <span className="font-medium text-zinc-700">
                  {row.documents_count ?? 0}
                </span>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className={tableActionsClassName}>
                  {row.account_status === 'pending' ? (
                    <>
                      <button
                        type="button"
                        className={`${primaryButtonClassName} ${smallButtonClassName}`}
                        onClick={() => handleApprove(row)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className={`${dangerButtonClassName} ${smallButtonClassName}`}
                        onClick={() => handleReject(row)}
                      >
                        Reject
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    className={`${ghostButtonClassName} ${smallButtonClassName}`}
                    onClick={() => openEdit(row)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`${
                      row.is_active ? dangerButtonClassName : primaryButtonClassName
                    } ${smallButtonClassName}`}
                    onClick={() => (row.is_active ? handleSuspend(row) : handleUnsuspend(row))}
                  >
                    {row.is_active ? 'Suspend' : 'Unsuspend'}
                  </button>
                </div>
              ),
            },
          ]}
          rows={users}
          emptyTitle="No users found"
          emptyDescription="Create administrator, staff, and barangay official accounts to manage access."
        />
      </article>

      <Modal
        title={editing ? 'Edit User' : 'Add User'}
        open={open}
        onClose={closeModal}
      >
        {formError && <div className={`${alertErrorClassName} mb-4`}>{formError}</div>}
        <UserForm
          values={form}
          barangays={barangays}
          isEdit={Boolean(editing)}
          submitting={submitting}
          onChange={(field, value) =>
            setForm((current) => ({ ...current, [field]: value }))
          }
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}

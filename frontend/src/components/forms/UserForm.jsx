import Spinner from '../common/Spinner';
import {
  fieldClassName,
  fieldLabelClassName,
  formActionsClassName,
  formGridClassName,
  inputClassName,
  primaryButtonClassName,
  selectClassName,
} from '../../styles/uiClasses';

export default function UserForm({
  values,
  barangays,
  onChange,
  onSubmit,
  submitting,
  isEdit = false,
}) {
  return (
    <form className={`space-y-8 ${formGridClassName}`} onSubmit={onSubmit}>
      {/* HEADER */}
      <div className="col-span-full border-b border-slate-200 pb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? 'Edit User' : 'Create User'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage user account details and access permissions.
        </p>
      </div>

      {/* BASIC INFO */}
      <div className="col-span-full">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Basic Information
        </h3>
      </div>

      <label className={fieldClassName}>
        <span className={fieldLabelClassName}>Full Name</span>
        <input
          className={inputClassName}
          value={values.name}
          onChange={(event) => onChange('name', event.target.value)}
          placeholder="Enter full name"
          required
        />
      </label>

      <label className={fieldClassName}>
        <span className={fieldLabelClassName}>Email Address</span>
        <input
          className={inputClassName}
          type="email"
          value={values.email}
          onChange={(event) => onChange('email', event.target.value)}
          placeholder="user@email.com"
          required
        />
      </label>

      {/* ACCESS CONTROL */}
      <div className="col-span-full mt-2">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Access & Role
        </h3>
      </div>

      <label className={fieldClassName}>
        <span className={fieldLabelClassName}>Role</span>
        <select
          className={selectClassName}
          value={values.role}
          onChange={(event) => onChange('role', event.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="staff">MPDO Staff</option>
          <option value="barangay">Barangay Official</option>
        </select>
      </label>

      <label className={fieldClassName}>
        <span className={fieldLabelClassName}>Barangay</span>
        <select
          className={selectClassName}
          value={values.barangay_id}
          onChange={(event) => onChange('barangay_id', event.target.value)}
        >
          <option value="">Not assigned</option>
          {barangays.map((barangay) => (
            <option key={barangay.id} value={barangay.id}>
              {barangay.name}
            </option>
          ))}
        </select>
      </label>

      {/* SECURITY */}
      <div className="col-span-full mt-2">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Security
        </h3>
      </div>

      <label className={fieldClassName}>
        <span className={fieldLabelClassName}>
          Password {isEdit && <span className="text-slate-400">(leave blank to keep current)</span>}
        </span>
        <input
          className={inputClassName}
          type="password"
          value={values.password}
          onChange={(event) => onChange('password', event.target.value)}
          placeholder={isEdit ? '••••••••' : 'Enter password'}
        />
      </label>

      <label className={fieldClassName}>
        <span className={fieldLabelClassName}>Account Status</span>
        <select
          className={selectClassName}
          value={String(values.is_active)}
          onChange={(event) => onChange('is_active', event.target.value === 'true')}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </label>

      <label className={fieldClassName}>
        <span className={fieldLabelClassName}>Approval Status</span>
        <select
          className={selectClassName}
          value={values.account_status ?? 'pending'}
          onChange={(event) => onChange('account_status', event.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </label>

      <label className={`${fieldClassName} md:col-span-2`}>
        <span className={fieldLabelClassName}>Approval Remark</span>
        <input
          className={inputClassName}
          value={values.account_status_remark ?? ''}
          onChange={(event) => onChange('account_status_remark', event.target.value)}
          placeholder="Optional notes for approval or rejection"
        />
      </label>

      {/* ACTIONS */}
      <div className={`${formActionsClassName} col-span-full border-t border-slate-200 pt-4`}>
        <button
          type="submit"
          className={primaryButtonClassName}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Spinner className="size-4" label="Saving user" />
              Saving...
            </>
          ) : isEdit ? (
            'Update User'
          ) : (
            'Create User'
          )}
        </button>
      </div>
    </form>
  );
}

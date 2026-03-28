import Spinner from '../common/Spinner';

export default function UserForm({ values, barangays, onChange, onSubmit, submitting, isEdit = false }) {
  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <label className="field">
        <span>Full Name</span>
        <input value={values.name} onChange={(event) => onChange('name', event.target.value)} required />
      </label>

      <label className="field">
        <span>Email Address</span>
        <input type="email" value={values.email} onChange={(event) => onChange('email', event.target.value)} required />
      </label>

      <label className="field">
        <span>Role</span>
        <select value={values.role} onChange={(event) => onChange('role', event.target.value)}>
          <option value="admin">Admin</option>
          <option value="staff">MPDO Staff</option>
          <option value="barangay">Barangay Official</option>
        </select>
      </label>

      <label className="field">
        <span>Barangay</span>
        <select value={values.barangay_id} onChange={(event) => onChange('barangay_id', event.target.value)}>
          <option value="">Not assigned</option>
          {barangays.map((barangay) => (
            <option key={barangay.id} value={barangay.id}>
              {barangay.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Password {isEdit ? '(leave blank to keep current)' : ''}</span>
        <input type="password" value={values.password} onChange={(event) => onChange('password', event.target.value)} />
      </label>

      <label className="field">
        <span>Account Status</span>
        <select value={String(values.is_active)} onChange={(event) => onChange('is_active', event.target.value === 'true')}>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </label>

      <div className="field field--full form-actions">
        <button type="submit" className="button button--primary" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner className="size-4" label="Saving user" />
              Saving...
            </>
          ) : (
            'Save User'
          )}
        </button>
      </div>
    </form>
  );
}

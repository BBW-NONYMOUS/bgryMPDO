import Spinner from '../common/Spinner';

export default function DocumentForm({
  values,
  categories,
  barangays,
  onChange,
  onFileChange,
  onSubmit,
  submitting,
  canManageAccess = true,
}) {
  return (
    <form className="panel form-grid" onSubmit={onSubmit}>
      <label className="field field--full">
        <span>Document Title</span>
        <input value={values.title} onChange={(event) => onChange('title', event.target.value)} required />
      </label>

      <label className="field">
        <span>Document Number</span>
        <input value={values.document_number} onChange={(event) => onChange('document_number', event.target.value)} />
      </label>

      <label className="field">
        <span>Status</span>
        <select value={values.status} onChange={(event) => onChange('status', event.target.value)}>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </label>

      <label className="field">
        <span>Category</span>
        <select value={values.category_id} onChange={(event) => onChange('category_id', event.target.value)}>
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Barangay</span>
        <select value={values.barangay_id} onChange={(event) => onChange('barangay_id', event.target.value)}>
          <option value="">General / All barangays</option>
          {barangays.map((barangay) => (
            <option key={barangay.id} value={barangay.id}>
              {barangay.name}
            </option>
          ))}
        </select>
      </label>

      {canManageAccess && (
        <label className="field">
          <span>Access Level</span>
          <select value={values.access_level} onChange={(event) => onChange('access_level', event.target.value)}>
            <option value="admin">Admin only</option>
            <option value="staff">Admin and staff</option>
            <option value="barangay">Visible to barangay officials</option>
          </select>
        </label>
      )}

      <label className="field field--full">
        <span>Keywords</span>
        <input
          value={values.keywords}
          placeholder="Example: zoning, annual plan, permit"
          onChange={(event) => onChange('keywords', event.target.value)}
        />
      </label>

      <label className="field field--full">
        <span>Description</span>
        <textarea rows="4" value={values.description} onChange={(event) => onChange('description', event.target.value)} />
      </label>

      <label className="field field--full upload-field">
        <span>Upload File</span>
        <input type="file" onChange={(event) => onFileChange(event.target.files?.[0] ?? null)} />
        <small>Current server upload limit is 5 MB. Recommended PDF, image, or office document formats.</small>
      </label>

      <div className="field field--full form-actions">
        <button type="submit" className="button button--primary" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner className="size-4" label="Saving document" />
              Saving...
            </>
          ) : (
            'Save Document'
          )}
        </button>
      </div>
    </form>
  );
}

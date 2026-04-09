import Spinner from '../common/Spinner';

function titleCase(value) {
  return String(value ?? '')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function labelForAccessLevel(value) {
  const labels = {
    admin: 'Admin only',
    staff: 'Admin and staff',
    barangay: 'Visible to barangay officials',
  };

  return labels[value] ?? titleCase(value);
}

export default function DocumentForm({
  values,
  categories,
  barangays,
  onChange,
  onFileChange,
  onSubmit,
  submitting,
  canManageAccess = true,
  statusOptions = ['draft', 'active', 'archived'],
  accessLevelOptions = ['admin', 'staff', 'barangay'],
  submitLabel = 'Save Document',
  fileHelpText = 'Maximum file size is 5 MB. Supported formats: PDF, DOCX, XLSX, PPT, JPG, and PNG.',
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-semibold text-slate-900">Document Details</h2>
        <p className="mt-1 text-sm text-slate-500">
          Fill in the required information to create or update a document.
        </p>
      </div>

      <div className="space-y-8 px-6 py-6">
        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Basic Information
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Main details used to identify and organize this document.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Document Title
              </span>
              <input
                value={values.title}
                onChange={(event) => onChange('title', event.target.value)}
                placeholder="Enter document title"
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Document Number
              </span>
              <input
                value={values.document_number}
                onChange={(event) => onChange('document_number', event.target.value)}
                placeholder="e.g. DOC-2026-001"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
              <select
                value={values.status}
                onChange={(event) => onChange('status', event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {titleCase(status)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Document Date
              </span>
              <input
                type="date"
                value={values.document_date ?? ''}
                onChange={(event) => onChange('document_date', event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">Category</span>
              <select
                value={values.category_id}
                onChange={(event) => onChange('category_id', event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">Barangay</span>
              <select
                value={values.barangay_id}
                onChange={(event) => onChange('barangay_id', event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">General / All barangays</option>
                {barangays.map((barangay) => (
                  <option key={barangay.id} value={barangay.id}>
                    {barangay.name}
                  </option>
                ))}
              </select>
            </label>

            {canManageAccess && (
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Access Level
                </span>
                <select
                  value={values.access_level}
                  onChange={(event) => onChange('access_level', event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  {accessLevelOptions.map((level) => (
                    <option key={level} value={level}>
                      {labelForAccessLevel(level)}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Additional Information
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Add supporting details to make the document easier to understand and search.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">Keywords</span>
              <input
                value={values.keywords}
                placeholder="e.g. zoning, annual plan, permit"
                onChange={(event) => onChange('keywords', event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              <span className="mt-2 block text-xs text-slate-500">
                Use comma-separated keywords to improve searchability.
              </span>
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
              <textarea
                rows="5"
                value={values.description}
                onChange={(event) => onChange('description', event.target.value)}
                placeholder="Write a short summary or important notes about this document"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">Remarks</span>
              <textarea
                rows="4"
                value={values.remarks ?? ''}
                onChange={(event) => onChange('remarks', event.target.value)}
                placeholder="Optional internal remarks or handling notes"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Attachment
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Upload the document file to attach it to this record.
            </p>
          </div>

          <label className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 transition hover:border-blue-400 hover:bg-blue-50/30">
            <span className="mb-2 block text-sm font-medium text-slate-700">Upload File</span>
            <input
              type="file"
              accept=".pdf,.docx,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
              onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
            />
            <span className="mt-3 block text-xs leading-5 text-slate-500">
              {fileHelpText}
            </span>
          </label>
        </section>
      </div>

      <div className="flex items-center justify-end border-t border-slate-200 px-6 py-4">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-w-[170px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Spinner className="size-4" label="Saving document" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}

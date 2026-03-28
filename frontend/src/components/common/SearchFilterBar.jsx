export default function SearchFilterBar({ fields, values, onChange, onSubmit, onReset, actions }) {
  return (
    <form className="filter-bar" onSubmit={onSubmit}>
      <div className="filter-bar__fields">
        {fields.map((field) => {
          if (field.type === 'select') {
            return (
              <label key={field.name} className="field">
                <span>{field.label}</span>
                <select value={values[field.name] ?? ''} onChange={(event) => onChange(field.name, event.target.value)}>
                  <option value="">{field.placeholder ?? `All ${field.label}`}</option>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            );
          }

          return (
            <label key={field.name} className="field">
              <span>{field.label}</span>
              <input
                type={field.type ?? 'text'}
                value={values[field.name] ?? ''}
                placeholder={field.placeholder}
                onChange={(event) => onChange(field.name, event.target.value)}
              />
            </label>
          );
        })}
      </div>

      <div className="filter-bar__actions">
        {actions}
        <button type="submit" className="button button--primary">
          Apply
        </button>
        <button type="button" className="button button--ghost" onClick={onReset}>
          Reset
        </button>
      </div>
    </form>
  );
}

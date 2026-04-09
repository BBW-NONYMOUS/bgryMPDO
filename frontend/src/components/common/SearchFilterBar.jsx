import {
  fieldClassName,
  fieldLabelClassName,
  filterActionsClassName,
  filterBarClassName,
  filterGridClassName,
  ghostButtonClassName,
  inputClassName,
  primaryButtonClassName,
  selectClassName,
} from '../../styles/uiClasses';

export default function SearchFilterBar({ fields, values, onChange, onSubmit, onReset, actions }) {
  return (
    <form className={filterBarClassName} onSubmit={onSubmit}>
      <div className={filterGridClassName}>
        {fields.map((field) => {
          if (field.type === 'select') {
            return (
              <label key={field.name} className={fieldClassName}>
                <span className={fieldLabelClassName}>{field.label}</span>
                <select className={selectClassName} value={values[field.name] ?? ''} onChange={(event) => onChange(field.name, event.target.value)}>
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
            <label key={field.name} className={fieldClassName}>
              <span className={fieldLabelClassName}>{field.label}</span>
              <input
                className={inputClassName}
                type={field.type ?? 'text'}
                value={values[field.name] ?? ''}
                placeholder={field.placeholder}
                onChange={(event) => onChange(field.name, event.target.value)}
              />
            </label>
          );
        })}
      </div>

      <div className={filterActionsClassName}>
        {actions}
        <button type="submit" className={primaryButtonClassName}>
          Apply
        </button>
        <button type="button" className={ghostButtonClassName} onClick={onReset}>
          Reset
        </button>
      </div>
    </form>
  );
}

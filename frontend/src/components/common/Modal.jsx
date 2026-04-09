import { ghostButtonClassName, modalBackdropClassName, modalBodyClassName, modalCardClassName, modalHeaderClassName } from '../../styles/uiClasses';

export default function Modal({ title, open, onClose, children }) {
  if (!open) {
    return null;
  }

  return (
    <div className={modalBackdropClassName} role="presentation" onClick={onClose}>
      <div
        className={modalCardClassName}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={modalHeaderClassName}>
          <div className="flex items-center gap-3">
            <span className="size-1.5 rounded-full bg-blue-500" />
            <h3 className="text-base font-bold tracking-[-0.02em] text-zinc-900">{title}</h3>
          </div>
          <button type="button" className={`${ghostButtonClassName} min-h-9 px-4 py-2 text-xs`} onClick={onClose}>
            Close
          </button>
        </div>
        <div className={modalBodyClassName}>{children}</div>
      </div>
    </div>
  );
}

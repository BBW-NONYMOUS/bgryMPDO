import { ghostButtonClassName, modalBackdropClassName, modalBodyClassName, modalCardClassName, modalHeaderClassName } from '../../styles/uiClasses';

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

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
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
                <path d="M7 3.75h7.5L19.25 8.5v11A1.75 1.75 0 0 1 17.5 21h-10A1.75 1.75 0 0 1 5.75 19.5v-14A1.75 1.75 0 0 1 7.5 3.75z M14 3.75V8.5h4.75 M8.75 12h7.5 M8.75 15.5h7.5" />
              </svg>
            </span>
            <h3 className="text-[15px] font-bold tracking-[-0.02em] text-zinc-900">{title}</h3>
          </div>
          <button
            type="button"
            className={`${ghostButtonClassName} min-h-8 gap-1.5 px-3 py-1.5 text-xs`}
            onClick={onClose}
            aria-label="Close modal"
          >
            <CloseIcon />
            Close
          </button>
        </div>
        <div className={modalBodyClassName}>{children}</div>
      </div>
    </div>
  );
}

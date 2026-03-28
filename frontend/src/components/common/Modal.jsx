export default function Modal({ title, open, onClose, children }) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <div>
            <h3>{title}</h3>
          </div>
          <button type="button" className="button button--ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

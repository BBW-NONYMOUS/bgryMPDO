export default function Spinner({ className = 'size-4', label = 'Loading' }) {
  return (
    <svg
      className={`animate-spin text-current ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      role="img"
    >
      <title>{label}</title>
      <circle cx="12" cy="12" r="9" className="stroke-current/20" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" className="stroke-current" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

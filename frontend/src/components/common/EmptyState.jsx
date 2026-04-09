export default function EmptyState({
  title,
  description,
  icon,
  action,
  primaryAction,
  secondaryAction,
}) {
  const hasActions = action || primaryAction || secondaryAction;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 px-6 py-14 text-center">
      {icon && (
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-500">
          {icon}
        </div>
      )}

      <h3 className="text-base font-semibold text-zinc-900">{title}</h3>

      {description && (
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-zinc-500">
          {description}
        </p>
      )}

      {hasActions && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {primaryAction}
          {secondaryAction}
          {action}
        </div>
      )}
    </div>
  );
}

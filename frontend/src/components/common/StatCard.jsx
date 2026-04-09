export default function StatCard({ label, value, hint, badge }) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-zinc-500">{label}</span>
        {badge ? (
          <span className="inline-flex min-h-7 items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 text-[11px] font-semibold text-blue-700">
            {badge}
          </span>
        ) : null}
      </div>
      <strong className="mt-4 block text-[clamp(1.85rem,4vw,2.55rem)] font-bold leading-none tracking-[-0.04em] text-zinc-900">
        {value ?? '--'}
      </strong>
      <p className="mt-3 text-sm text-zinc-500">{hint}</p>
    </article>
  );
}

export default function StatCard({ label, value, hint, badge }) {
  return (
    <article className="rounded-[1.75rem] border border-zinc-200 bg-white/95 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-zinc-500">{label}</span>
        {badge ? (
          <span className="inline-flex min-h-8 items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 text-[11px] font-semibold text-zinc-900">
            {badge}
          </span>
        ) : null}
      </div>
      <strong className="mt-4 block text-[clamp(1.85rem,4vw,2.55rem)] font-semibold leading-none tracking-[-0.04em] text-zinc-900">
        {value ?? '--'}
      </strong>
      <p className="mt-4 text-sm text-zinc-500">{hint}</p>
    </article>
  );
}

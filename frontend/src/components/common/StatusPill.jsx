export default function StatusPill({ value }) {
  const tone = String(value ?? '').toLowerCase();
  const toneClassName = {
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    archived: 'bg-orange-50 text-orange-700 border border-orange-200',
    inactive: 'bg-zinc-100 text-zinc-600 border border-zinc-200',
    draft: 'bg-blue-50 text-blue-700 border border-blue-200',
  }[tone] ?? 'bg-zinc-100 text-zinc-700 border border-zinc-200';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${toneClassName}`}>
      {value ?? 'N/A'}
    </span>
  );
}

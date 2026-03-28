export default function StatusPill({ value }) {
  const tone = String(value ?? '').toLowerCase();
  const toneClassName = {
    active: 'bg-zinc-900/8 text-zinc-950',
    archived: 'bg-red-500/10 text-red-700',
    inactive: 'bg-red-500/10 text-red-700',
    draft: 'bg-zinc-200 text-zinc-700',
  }[tone] ?? 'bg-zinc-100 text-zinc-800';

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${toneClassName}`}>
      {value ?? 'N/A'}
    </span>
  );
}

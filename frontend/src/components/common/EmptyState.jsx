export default function EmptyState({ title, description }) {
  return (
    <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white/70 px-6 py-10 text-center">
      <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
      <p className="max-w-xl text-sm text-zinc-500">{description}</p>
    </div>
  );
}

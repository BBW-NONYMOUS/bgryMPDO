import Spinner from './Spinner';

export default function LoadingState({ title = 'Loading', description = 'Please wait while we prepare the page.' }) {
  return (
    <div className="relative overflow-hidden grid place-items-center rounded-2xl border border-zinc-200 bg-linear-to-br from-white via-zinc-50 to-zinc-100 px-6 py-16 text-center shadow-sm">
      {/* Subtle background blobs */}
      <div className="pointer-events-none absolute -top-10 -left-10 size-40 rounded-full bg-zinc-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 size-40 rounded-full bg-zinc-300/30 blur-3xl" />

      <div className="relative flex flex-col items-center gap-5">
        {/* Spinner ring with glow */}
        <div className="relative grid size-16 place-items-center">
          <div className="absolute inset-0 rounded-full bg-zinc-900/10 blur-md" />
          <div className="relative grid size-16 place-items-center rounded-full bg-zinc-900 shadow-lg shadow-zinc-900/20 text-white">
            <Spinner className="size-7" label={title} />
          </div>
        </div>

        {/* Animated dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 rounded-full bg-zinc-400 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-semibold tracking-tight text-zinc-900">{title}</h3>
          <p className="max-w-xs text-sm text-zinc-500 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

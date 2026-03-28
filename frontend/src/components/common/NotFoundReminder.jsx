import { Link } from 'react-router-dom';

export default function NotFoundReminder({
  title = '404 Page Not Found',
  description = 'The page you are looking for may have been moved, removed, or never existed.',
}) {
  return (
    <section className="mx-auto grid w-full max-w-2xl gap-5 rounded-[2rem] border border-zinc-200 bg-white/95 p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-zinc-900 text-white">
        <span className="text-lg font-semibold">404</span>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-400">Reminder</p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-zinc-900">{title}</h1>
        <p className="text-sm leading-6 text-zinc-500">{description}</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/dashboard"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5"
        >
          Back to Dashboard
        </Link>
        <Link
          to="/documents"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
        >
          Open Documents
        </Link>
      </div>
    </section>
  );
}

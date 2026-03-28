import Spinner from './Spinner';

export default function LoadingState({ title = 'Loading', description = 'Please wait while we prepare the page.' }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-zinc-300 bg-white/70 px-6 py-10 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="grid size-12 place-items-center rounded-full bg-zinc-900 text-white">
          <Spinner className="size-5" label={title} />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
          <p className="max-w-xl text-sm text-zinc-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

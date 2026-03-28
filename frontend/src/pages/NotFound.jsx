import NotFoundReminder from '../components/common/NotFoundReminder';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 px-4 py-8">
      <NotFoundReminder />
    </div>
  );
}

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';
import loginBackground from '../assets/image/bgV1.png';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: 'admin@mpdo.local',
    password: 'password123',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(form);
      navigate(location.state?.from?.pathname ?? '/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? 'Unable to sign in. Check your credentials and backend API.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-100 px-4 py-8">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
        style={{ backgroundImage: `url(${loginBackground})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-white/60" aria-hidden="true" />

      <section className="relative z-10 w-full max-w-sm rounded-[2rem] border border-zinc-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8">
        <form className="mx-auto flex w-full flex-col items-center gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="grid size-20 place-items-center rounded-full border border-zinc-200 bg-gradient-to-b from-white to-zinc-100 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
              <svg viewBox="0 0 64 64" className="size-12" aria-hidden="true">
                <circle cx="32" cy="18" r="10" fill="#f2c9a5" />
                <path d="M22 18c0-6 4.6-11 10-11s10 5 10 11c-1.7-3.2-5-5.2-10-5.2S23.7 14.8 22 18Z" fill="#334155" />
                <path d="M18 49c1.5-10.2 8.1-16 14-16s12.5 5.8 14 16Z" fill="#1f2937" />
                <path d="M31.5 34h1l6.2 8.3-6.7 7.6-6.5-7.6Z" fill="#60a5fa" />
                <path d="M26.5 33.6h11L32 40.3Z" fill="#0f172a" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-400">Secure Access</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-zinc-900">Member Login</h2>
            </div>
          </div>

          <div className="grid w-full gap-3">
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-zinc-500">Email</span>
              <input
                className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                required
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-zinc-500">Password</span>
              <input
                className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                required
              />
            </label>
          </div>

          {error ? (
            <div className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-red-500 to-red-600 px-4 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(220,38,38,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner className="size-4" label="Signing in" />
                Signing in...
              </>
            ) : (
              'Login'
            )}
          </button>

          <p className="text-center text-[11px] text-zinc-400">Need help with your account?</p>
        </form>
      </section>
    </div>
  );
}

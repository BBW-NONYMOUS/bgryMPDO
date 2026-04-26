import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';
import loginBackground from '../assets/image/bgV1.png';
import Logo from '../assets/image/Logo.png';

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
      setError(
        requestError.response?.data?.message ??
          'Unable to sign in. Check your credentials and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 px-4 py-8">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${loginBackground})` }}
        aria-hidden="true"
      />

      {/* Blue radial glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 opacity-10 blur-[120px]"
        aria-hidden="true"
      />

      <section className="relative z-10 w-full max-w-sm">
        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">

          {/* Card header accent */}
          <div className="border-b border-white/10 bg-linear-to-r from-blue-600/30 to-blue-800/20 px-8 py-6 text-center">
            {/* MPDO Icon */}
            <div className="mx-auto mb-4 grid size-15 place-items-center rounded-3xl bg-linear-to-br from-blue-500 to-blue-700 shadow-[0_8px_24px_rgba(37,99,235,0.50)]">
                <img src={Logo} alt="MPDO Icon" className="h-15 w-15 rounded-3xl" />
            </div>  
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-300">
              MPDO Archiving System
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-white">
              Sign In to Your Account
            </h2>
            <p className="mt-1 text-xs text-blue-200/70">
              Municipal Planning &amp; Development Office
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4 px-8 py-6" onSubmit={handleSubmit}>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/60">Email Address</span>
              <input
                className="h-11 w-full rounded-xl border border-white/10 bg-white/8 px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20"
                type="email"
                placeholder="admin@mpdo.local"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/60">Password</span>
              <input
                className="h-11 w-full rounded-xl border border-white/10 bg-white/8 px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                required
              />
            </label>

            {error ? (
              <div className="rounded-xl border border-red-400/30 bg-red-500/15 px-3 py-2.5 text-center text-xs font-medium text-red-300">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              className="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 text-sm font-bold text-white shadow-[0_6px_20px_rgba(37,99,235,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(37,99,235,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner className="size-4" label="Signing in" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <p className="text-center text-[11px] text-white/30">
              Need help? Contact your system administrator.
            </p>
          </form>
        </div>

        <p className="mt-4 text-center text-[11px] text-white/20">
          &copy; {new Date().getFullYear()} Municipal Planning &amp; Development Office
        </p>
      </section>
    </div>
  );
}

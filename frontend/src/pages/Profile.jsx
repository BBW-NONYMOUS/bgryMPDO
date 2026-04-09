import { useMemo, useState } from 'react';
import { updatePassword, updateProfile, uploadProfilePhoto } from '../api/authApi';
import Spinner from '../components/common/Spinner';
import { useAuth } from '../hooks/useAuth';
import {
  fieldClassName,
  fieldFullClassName,
  fieldLabelClassName,
  formActionsClassName,
  formGridClassName,
  ghostButtonClassName,
  inputClassName,
  pageStackClassName,
  pageTitleClassName,
  panelClassName,
  panelHeaderBetweenClassName,
  primaryButtonClassName,
  sectionEyebrowClassName,
} from '../styles/uiClasses';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [profileForm, setProfileForm] = useState(() => ({
    name: user?.name ?? '',
    email: user?.email ?? '',
    address: user?.address ?? '',
    contact_number: user?.contact_number ?? '',
  }));

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const initials = useMemo(() => {
    const name = user?.name ?? '';
    return name.trim().slice(0, 1).toUpperCase() || 'U';
  }, [user?.name]);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setSavingProfile(true);

    try {
      const response = await updateProfile(profileForm);
      setUser(response.user);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setSavingPassword(true);

    try {
      await updatePassword(passwordForm);
      setPasswordForm({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
    } finally {
      setSavingPassword(false);
    }
  }

  async function handlePhotoSelected(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const response = await uploadProfilePhoto(file);
      setUser(response.user);
    } finally {
      setUploadingPhoto(false);
      event.target.value = '';
    }
  }

  return (
    <div className={pageStackClassName}>
      <article className={`${panelClassName} space-y-8`}>
        <div className={panelHeaderBetweenClassName}>
          <div>
            <p className={sectionEyebrowClassName}>Account</p>
            <h2 className={pageTitleClassName}>My Profile</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Update your personal details, password, and profile picture.
            </p>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-zinc-900">Profile Photo</h3>
            <p className="mt-1 text-sm text-zinc-500">Used across navigation and audit logs.</p>

            <div className="mt-5 flex items-center gap-4">
              {user?.profile_photo_url ? (
                <img
                  src={user.profile_photo_url}
                  alt="Profile"
                  className="size-14 rounded-full border border-zinc-200 object-cover"
                />
              ) : (
                <div className="grid size-14 place-items-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                  {initials}
                </div>
              )}

              <div className="grid gap-2">
                <label className={ghostButtonClassName}>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={handlePhotoSelected}
                    disabled={uploadingPhoto}
                  />
                  {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                </label>
                <p className="text-xs text-zinc-500">JPG or PNG, up to 2MB.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-2">
            <form className={`space-y-6 ${formGridClassName}`} onSubmit={handleProfileSubmit}>
              <div className={`${fieldFullClassName} col-span-full`}>
                <h3 className="text-sm font-semibold text-zinc-900">Personal Details</h3>
                <p className="mt-1 text-sm text-zinc-500">Keep your contact information up to date.</p>
              </div>

              <label className={`${fieldClassName} ${fieldFullClassName}`}>
                <span className={fieldLabelClassName}>Full Name</span>
                <input
                  className={inputClassName}
                  value={profileForm.name}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, name: event.target.value }))
                  }
                  required
                />
              </label>

              <label className={`${fieldClassName} ${fieldFullClassName}`}>
                <span className={fieldLabelClassName}>Email</span>
                <input
                  className={inputClassName}
                  type="email"
                  value={profileForm.email}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                />
              </label>

              <label className={`${fieldClassName} ${fieldFullClassName}`}>
                <span className={fieldLabelClassName}>Address</span>
                <input
                  className={inputClassName}
                  value={profileForm.address}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, address: event.target.value }))
                  }
                  placeholder="Optional"
                />
              </label>

              <label className={`${fieldClassName} ${fieldFullClassName}`}>
                <span className={fieldLabelClassName}>Contact Number</span>
                <input
                  className={inputClassName}
                  value={profileForm.contact_number}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, contact_number: event.target.value }))
                  }
                  placeholder="Optional"
                />
              </label>

              <div className={`${formActionsClassName} col-span-full border-t border-zinc-200 pt-4`}>
                <button type="submit" className={primaryButtonClassName} disabled={savingProfile}>
                  {savingProfile ? (
                    <>
                      <Spinner className="size-4" label="Saving profile" />
                      Saving...
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <form className={`space-y-6 ${formGridClassName}`} onSubmit={handlePasswordSubmit}>
            <div className={`${fieldFullClassName} col-span-full`}>
              <h3 className="text-sm font-semibold text-zinc-900">Change Password</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Use a strong password and keep it private.
              </p>
            </div>

            <label className={`${fieldClassName} ${fieldFullClassName}`}>
              <span className={fieldLabelClassName}>Current Password</span>
              <input
                className={inputClassName}
                type="password"
                value={passwordForm.current_password}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, current_password: event.target.value }))
                }
                required
              />
            </label>

            <label className={`${fieldClassName} ${fieldFullClassName}`}>
              <span className={fieldLabelClassName}>New Password</span>
              <input
                className={inputClassName}
                type="password"
                value={passwordForm.password}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, password: event.target.value }))
                }
                required
              />
            </label>

            <label className={`${fieldClassName} ${fieldFullClassName}`}>
              <span className={fieldLabelClassName}>Confirm New Password</span>
              <input
                className={inputClassName}
                type="password"
                value={passwordForm.password_confirmation}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    password_confirmation: event.target.value,
                  }))
                }
                required
              />
            </label>

            <div className={`${formActionsClassName} col-span-full border-t border-zinc-200 pt-4`}>
              <button type="submit" className={primaryButtonClassName} disabled={savingPassword}>
                {savingPassword ? (
                  <>
                    <Spinner className="size-4" label="Saving password" />
                    Saving...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </section>
      </article>
    </div>
  );
}

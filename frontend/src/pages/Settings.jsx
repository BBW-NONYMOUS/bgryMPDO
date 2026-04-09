import { useEffect, useMemo, useState } from 'react';
import { getSettings, updateSetting } from '../api/settingsApi';
import Spinner from '../components/common/Spinner';
import {
  dangerButtonClassName,
  fieldClassName,
  fieldLabelClassName,
  formActionsClassName,
  inputClassName,
  pageStackClassName,
  pageTitleClassName,
  panelClassName,
  panelHeaderBetweenClassName,
  primaryButtonClassName,
  sectionEyebrowClassName,
  smallButtonClassName,
} from '../styles/uiClasses';

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
      {label}
      <button
        type="button"
        className={`${dangerButtonClassName} ${smallButtonClassName} !px-2 !py-1`}
        onClick={onRemove}
      >
        Remove
      </button>
    </span>
  );
}

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    document_statuses: [],
    document_access_levels: [],
  });

  const [newStatus, setNewStatus] = useState('');
  const [newAccessLevel, setNewAccessLevel] = useState('');

  useEffect(() => {
    async function bootstrap() {
      setLoading(true);
      try {
        const response = await getSettings();
        setSettings({
          document_statuses: response.settings?.document_statuses ?? [],
          document_access_levels: response.settings?.document_access_levels ?? [],
        });
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  const canSave = useMemo(() => (
    settings.document_statuses.length > 0 && settings.document_access_levels.length > 0
  ), [settings]);

  async function handleSave() {
    setSaving(true);
    try {
      await Promise.all([
        updateSetting('document_statuses', settings.document_statuses),
        updateSetting('document_access_levels', settings.document_access_levels),
      ]);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={pageStackClassName}>
        <div className={`${panelClassName} flex items-center gap-2`}>
          <Spinner className="size-4" label="Loading settings" />
          <span className="text-sm text-zinc-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={pageStackClassName}>
      <article className={`${panelClassName} space-y-6`}>
        <div className={panelHeaderBetweenClassName}>
          <div>
            <p className={sectionEyebrowClassName}>Administration</p>
            <h2 className={pageTitleClassName}>System Settings</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Configure allowed document statuses and access levels without changing code.
            </p>
          </div>

          <button
            type="button"
            className={primaryButtonClassName}
            disabled={!canSave || saving}
            onClick={handleSave}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-zinc-900">Document Status Options</h3>
            <p className="mt-1 text-sm text-zinc-500">Used for tagging archive records.</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {settings.document_statuses.map((status) => (
                <Chip
                  key={status}
                  label={status}
                  onRemove={() =>
                    setSettings((current) => ({
                      ...current,
                      document_statuses: current.document_statuses.filter((item) => item !== status),
                    }))
                  }
                />
              ))}
            </div>

            <div className="mt-5 flex items-end gap-2">
              <label className={`${fieldClassName} flex-1`}>
                <span className={fieldLabelClassName}>Add Status</span>
                <input
                  className={inputClassName}
                  value={newStatus}
                  onChange={(event) => setNewStatus(event.target.value)}
                  placeholder="e.g., archived"
                />
              </label>
              <button
                type="button"
                className={primaryButtonClassName}
                onClick={() => {
                  const value = newStatus.trim();
                  if (!value) return;
                  setSettings((current) => ({
                    ...current,
                    document_statuses: Array.from(new Set([...current.document_statuses, value])),
                  }));
                  setNewStatus('');
                }}
              >
                Add
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-zinc-900">Access Level Options</h3>
            <p className="mt-1 text-sm text-zinc-500">Controls document visibility in search and download.</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {settings.document_access_levels.map((level) => (
                <Chip
                  key={level}
                  label={level}
                  onRemove={() =>
                    setSettings((current) => ({
                      ...current,
                      document_access_levels: current.document_access_levels.filter((item) => item !== level),
                    }))
                  }
                />
              ))}
            </div>

            <div className="mt-5 flex items-end gap-2">
              <label className={`${fieldClassName} flex-1`}>
                <span className={fieldLabelClassName}>Add Access Level</span>
                <input
                  className={inputClassName}
                  value={newAccessLevel}
                  onChange={(event) => setNewAccessLevel(event.target.value)}
                  placeholder="e.g., staff"
                />
              </label>
              <button
                type="button"
                className={primaryButtonClassName}
                onClick={() => {
                  const value = newAccessLevel.trim();
                  if (!value) return;
                  setSettings((current) => ({
                    ...current,
                    document_access_levels: Array.from(new Set([...current.document_access_levels, value])),
                  }));
                  setNewAccessLevel('');
                }}
              >
                Add
              </button>
            </div>
          </div>
        </section>

        <div className={`${formActionsClassName} border-t border-zinc-200 pt-4`}>
          <p className="text-sm text-zinc-500">
            Tip: Keep these lists aligned with existing documents to avoid validation errors during edits.
          </p>
        </div>
      </article>
    </div>
  );
}


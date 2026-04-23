import { useEffect, useMemo, useRef, useState } from 'react';
import { backupData, resetData, restoreData, seedTestData } from '../api/dataManagementApi';
import { getSettings, updateSetting } from '../api/settingsApi';
import Spinner from '../components/common/Spinner';
import {
  alertErrorClassName,
  dangerButtonClassName,
  fieldLabelClassName,
  inputClassName,
  pageStackClassName,
  pageTitleClassName,
  panelClassName,
  panelHeaderBetweenClassName,
  primaryButtonClassName,
  sectionEyebrowClassName,
} from '../styles/uiClasses';

function StatusChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
      {label}
      <button
        type="button"
        aria-label={`Remove ${label}`}
        className="flex size-4 items-center justify-center rounded-full text-blue-400 transition hover:bg-blue-200 hover:text-blue-700"
        onClick={onRemove}
      >
        ×
      </button>
    </span>
  );
}

function AccessChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
      {label}
      <button
        type="button"
        aria-label={`Remove ${label}`}
        className="flex size-4 items-center justify-center rounded-full text-violet-400 transition hover:bg-violet-200 hover:text-violet-700"
        onClick={onRemove}
      >
        ×
      </button>
    </span>
  );
}

function SectionIcon({ children, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    sky: 'bg-sky-50 text-sky-600 border-sky-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };
  return (
    <span className={`inline-flex size-10 items-center justify-center rounded-xl border ${colors[color]} shrink-0`}>
      {children}
    </span>
  );
}

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    document_statuses: [],
    document_access_levels: [],
  });

  const [newStatus, setNewStatus] = useState('');
  const [newAccessLevel, setNewAccessLevel] = useState('');

  const [dataStatus, setDataStatus] = useState({ type: '', message: '' });
  const [dataWorking, setDataWorking] = useState(false);
  const [activeAction, setActiveAction] = useState('');
  const restoreInputRef = useRef(null);

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

  const canSave = useMemo(
    () => settings.document_statuses.length > 0 && settings.document_access_levels.length > 0,
    [settings],
  );

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await Promise.all([
        updateSetting('document_statuses', settings.document_statuses),
        updateSetting('document_access_levels', settings.document_access_levels),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleDataAction(label, fn) {
    setDataStatus({ type: '', message: '' });
    setDataWorking(true);
    setActiveAction(label);
    try {
      const result = await fn();
      setDataStatus({ type: 'success', message: result?.message ?? `${label} completed.` });
    } catch (error) {
      setDataStatus({
        type: 'error',
        message: error.response?.data?.message ?? `${label} failed. Check server logs.`,
      });
    } finally {
      setDataWorking(false);
      setActiveAction('');
    }
  }

  async function handleRestore(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleDataAction('Restore', () => restoreData(file));
    restoreInputRef.current.value = '';
  }

  if (loading) {
    return (
      <div className={pageStackClassName}>
        <div className={`${panelClassName} flex items-center gap-3`}>
          <Spinner className="size-4 text-blue-500" label="Loading settings" />
          <span className="text-sm text-zinc-500">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={pageStackClassName}>

      {/* ── System Settings ─────────────────────────────────────── */}
      <article className={`${panelClassName} space-y-6`}>
        <div className={panelHeaderBetweenClassName}>
          <div className="flex items-start gap-4">
            <SectionIcon color="blue">
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
                <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
              </svg>
            </SectionIcon>
            <div>
              <p className={sectionEyebrowClassName}>Administration</p>
              <h2 className={pageTitleClassName}>System Settings</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Configure allowed document statuses and access levels without changing code.
              </p>
            </div>
          </div>

          <button
            type="button"
            className={primaryButtonClassName}
            disabled={!canSave || saving}
            onClick={handleSave}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-3.5" label="Saving" /> Saving...
              </span>
            ) : saved ? (
              <span className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-4"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>
                Saved
              </span>
            ) : 'Save Settings'}
          </button>
        </div>

        <section className="grid gap-5 lg:grid-cols-2">
          {/* Document Status */}
          <div className="rounded-2xl border border-zinc-100 bg-gradient-to-br from-blue-50/60 to-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <SectionIcon color="blue">
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                  <path fillRule="evenodd" d="M5.5 3A2.5 2.5 0 0 0 3 5.5v2.879a2.5 2.5 0 0 0 .732 1.767l6.5 6.5a2.5 2.5 0 0 0 3.536 0l2.878-2.878a2.5 2.5 0 0 0 0-3.536l-6.5-6.5A2.5 2.5 0 0 0 8.38 3H5.5ZM6 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                </svg>
              </SectionIcon>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Document Status Options</h3>
                <p className="text-xs text-zinc-500">Used for tagging archive records.</p>
              </div>
            </div>

            <div className="mt-4 min-h-10 flex flex-wrap gap-2">
              {settings.document_statuses.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">No statuses yet — add one below.</p>
              ) : settings.document_statuses.map((status) => (
                <StatusChip
                  key={status}
                  label={status}
                  onRemove={() =>
                    setSettings((c) => ({
                      ...c,
                      document_statuses: c.document_statuses.filter((i) => i !== status),
                    }))
                  }
                />
              ))}
            </div>

            <div className="mt-5 flex items-end gap-2">
              <label className="grid gap-1.5 flex-1">
                <span className={fieldLabelClassName}>Add Status</span>
                <input
                  className={inputClassName}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    const v = newStatus.trim();
                    if (!v) return;
                    setSettings((c) => ({ ...c, document_statuses: Array.from(new Set([...c.document_statuses, v])) }));
                    setNewStatus('');
                  }}
                  placeholder="e.g., archived"
                />
              </label>
              <button
                type="button"
                className={primaryButtonClassName}
                onClick={() => {
                  const v = newStatus.trim();
                  if (!v) return;
                  setSettings((c) => ({ ...c, document_statuses: Array.from(new Set([...c.document_statuses, v])) }));
                  setNewStatus('');
                }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Access Level */}
          <div className="rounded-2xl border border-zinc-100 bg-gradient-to-br from-violet-50/60 to-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <SectionIcon color="violet">
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                </svg>
              </SectionIcon>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Access Level Options</h3>
                <p className="text-xs text-zinc-500">Controls document visibility in search and download.</p>
              </div>
            </div>

            <div className="mt-4 min-h-10 flex flex-wrap gap-2">
              {settings.document_access_levels.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">No access levels yet — add one below.</p>
              ) : settings.document_access_levels.map((level) => (
                <AccessChip
                  key={level}
                  label={level}
                  onRemove={() =>
                    setSettings((c) => ({
                      ...c,
                      document_access_levels: c.document_access_levels.filter((i) => i !== level),
                    }))
                  }
                />
              ))}
            </div>

            <div className="mt-5 flex items-end gap-2">
              <label className="grid gap-1.5 flex-1">
                <span className={fieldLabelClassName}>Add Access Level</span>
                <input
                  className={inputClassName}
                  value={newAccessLevel}
                  onChange={(e) => setNewAccessLevel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    const v = newAccessLevel.trim();
                    if (!v) return;
                    setSettings((c) => ({ ...c, document_access_levels: Array.from(new Set([...c.document_access_levels, v])) }));
                    setNewAccessLevel('');
                  }}
                  placeholder="e.g., staff"
                />
              </label>
              <button
                type="button"
                className={primaryButtonClassName}
                onClick={() => {
                  const v = newAccessLevel.trim();
                  if (!v) return;
                  setSettings((c) => ({ ...c, document_access_levels: Array.from(new Set([...c.document_access_levels, v])) }));
                  setNewAccessLevel('');
                }}
              >
                Add
              </button>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-2 border-t border-zinc-100 pt-4 text-sm text-zinc-400">
          <svg viewBox="0 0 16 16" fill="currentColor" className="size-4 shrink-0 text-blue-400">
            <path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-9 .5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm3.5.5a.75.75 0 0 0 .75-.75V5a.75.75 0 0 0-1.5 0v3.25c0 .414.336.75.75.75Z" clipRule="evenodd" />
          </svg>
          Keep these lists aligned with existing documents to avoid validation errors during edits.
        </div>
      </article>

      {/* ── Data Management ──────────────────────────────────────── */}
      <article className={`${panelClassName} space-y-6`}>
        <div className="flex items-start gap-4">
          <SectionIcon color="emerald">
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
              <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3Z" />
              <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7Z" />
              <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3Z" />
            </svg>
          </SectionIcon>
          <div>
            <p className={sectionEyebrowClassName}>Administration</p>
            <h2 className={pageTitleClassName}>Data Management</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Seed test records, back up or restore the database, or reset to a clean state.
            </p>
          </div>
        </div>

        {dataStatus.message ? (
          <div
            className={
              dataStatus.type === 'error'
                ? alertErrorClassName
                : 'flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'
            }
          >
            {dataStatus.type !== 'error' && (
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4 shrink-0">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
              </svg>
            )}
            {dataStatus.message}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Test Data */}
          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-gradient-to-br from-emerald-50/50 to-white p-5 shadow-sm">
            <SectionIcon color="emerald">
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
              </svg>
            </SectionIcon>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Test Data</h3>
              <p className="mt-1 text-xs text-zinc-500 leading-relaxed">Seed sample documents and demo users for testing.</p>
            </div>
            <button
              type="button"
              className="mt-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dataWorking}
              onClick={() => handleDataAction('Seed test data', seedTestData)}
            >
              {activeAction === 'Seed test data' ? (
                <><Spinner className="size-3" label="Seeding" /> Seeding...</>
              ) : 'Seed Test Data'}
            </button>
          </div>

          {/* Back Up */}
          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-gradient-to-br from-sky-50/50 to-white p-5 shadow-sm">
            <SectionIcon color="sky">
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
              </svg>
            </SectionIcon>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Back Up Data</h3>
              <p className="mt-1 text-xs text-zinc-500 leading-relaxed">Download a full MySQL database backup as a .sql file.</p>
            </div>
            <button
              type="button"
              className="mt-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dataWorking}
              onClick={() => handleDataAction('Backup', backupData)}
            >
              {activeAction === 'Backup' ? (
                <><Spinner className="size-3" label="Backing up" /> Backing up...</>
              ) : (
                <>
                  <svg viewBox="0 0 16 16" fill="currentColor" className="size-3.5">
                    <path d="M8.75 2.75a.75.75 0 0 0-1.5 0v5.69L5.03 6.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.75 8.44V2.75Z" />
                    <path d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5Z" />
                  </svg>
                  Download Backup
                </>
              )}
            </button>
          </div>

          {/* Restore */}
          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-gradient-to-br from-amber-50/50 to-white p-5 shadow-sm">
            <SectionIcon color="amber">
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path fillRule="evenodd" d="M10 2a.75.75 0 0 1 .75.75v1.258a32.987 32.987 0 0 1 3.204.502.75.75 0 0 1-.413 1.443 31.46 31.46 0 0 0-1.055-.218l1.837 7.967a.75.75 0 0 1-.037.36 2 2 0 0 1-.863.85c-.608.306-1.405.49-2.423.49s-1.815-.184-2.423-.49a2 2 0 0 1-.863-.85.75.75 0 0 1-.037-.36l1.836-7.967a30.977 30.977 0 0 0-1.055.218.75.75 0 0 1-.413-1.443 32.99 32.99 0 0 1 3.204-.502V2.75A.75.75 0 0 1 10 2Z" clipRule="evenodd" />
                <path d="M3.102 8.21a.75.75 0 1 0-1.494.14l.77 8.209A1.75 1.75 0 0 0 4.13 18h11.738a1.75 1.75 0 0 0 1.753-1.44l.77-8.209a.75.75 0 0 0-1.494-.14l-.77 8.208a.25.25 0 0 1-.25.206H4.13a.25.25 0 0 1-.25-.206l-.777-8.209Z" />
              </svg>
            </SectionIcon>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Restore Data</h3>
              <p className="mt-1 text-xs text-zinc-500 leading-relaxed">Upload a .sql backup file to restore the database.</p>
            </div>
            <label className="mt-auto inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-60">
              {activeAction === 'Restore' ? (
                <><Spinner className="size-3" label="Restoring" /> Restoring...</>
              ) : (
                <>
                  <svg viewBox="0 0 16 16" fill="currentColor" className="size-3.5">
                    <path d="M8.75 13.25a.75.75 0 0 1-1.5 0V7.56L5.03 9.78a.75.75 0 0 1-1.06-1.06l3.5-3.5a.75.75 0 0 1 1.06 0l3.5 3.5a.75.75 0 1 1-1.06 1.06L8.75 7.56v5.69Z" />
                    <path d="M3.5 3.75a.75.75 0 0 0-1.5 0v.5A2.75 2.75 0 0 0 4.75 7h6.5A2.75 2.75 0 0 0 14 4.25v-.5a.75.75 0 0 0-1.5 0v.5c0 .69-.56 1.25-1.25 1.25h-6.5C4.06 5.5 3.5 4.94 3.5 4.25v-.5Z" />
                  </svg>
                  Choose .sql File
                </>
              )}
              <input
                ref={restoreInputRef}
                type="file"
                accept=".sql,.txt"
                className="sr-only"
                disabled={dataWorking}
                onChange={handleRestore}
              />
            </label>
          </div>

          {/* Reset */}
          <div className="flex flex-col gap-4 rounded-2xl border border-red-100 bg-gradient-to-br from-red-50/60 to-white p-5 shadow-sm">
            <SectionIcon color="red">
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
              </svg>
            </SectionIcon>
            <div>
              <h3 className="text-sm font-semibold text-red-800">Reset Data</h3>
              <p className="mt-1 text-xs text-red-500 leading-relaxed">
                Wipe all documents, activity logs, and non-admin users. Admin accounts and settings are preserved.
              </p>
            </div>
            <button
              type="button"
              className={`${dangerButtonClassName} mt-auto min-h-10 px-4 py-2 text-xs`}
              disabled={dataWorking}
              onClick={() => {
                if (!window.confirm('This will permanently delete all documents, activity logs, and non-admin users. Continue?')) return;
                handleDataAction('Reset', resetData);
              }}
            >
              {activeAction === 'Reset' ? (
                <><Spinner className="size-3" label="Resetting" /> Resetting...</>
              ) : 'Reset Data'}
            </button>
          </div>

        </div>
      </article>
    </div>
  );
}

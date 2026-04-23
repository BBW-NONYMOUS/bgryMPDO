import api from './axios';
import { downloadBlobFromEndpoint } from './fileTransfer';

export async function seedTestData() {
  const response = await api.post('/data-management/seed');
  return response.data;
}

export async function backupData() {
  return downloadBlobFromEndpoint(
    '/data-management/backup',
    `mpdo-backup-${new Date().toISOString().slice(0, 10)}.sql`,
  );
}

export async function restoreData(file) {
  const formData = new FormData();
  formData.append('backup', file);
  const response = await api.post('/data-management/restore', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function resetData() {
  const response = await api.post('/data-management/reset');
  return response.data;
}

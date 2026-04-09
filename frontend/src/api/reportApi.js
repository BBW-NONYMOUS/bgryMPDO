import { downloadBlobFromEndpoint } from './fileTransfer';

export function downloadDashboardSummaryReport() {
  return downloadBlobFromEndpoint('/reports/dashboard-summary', 'dashboard-summary-report.csv');
}

export function downloadDocumentsReport(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      query.set(key, value);
    }
  });

  const endpoint = query.toString() ? `/reports/documents?${query.toString()}` : '/reports/documents';
  return downloadBlobFromEndpoint(endpoint, 'documents-report.csv');
}

export function downloadActivityLogsReport(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      query.set(key, value);
    }
  });

  const endpoint = query.toString() ? `/reports/activity-logs?${query.toString()}` : '/reports/activity-logs';
  return downloadBlobFromEndpoint(endpoint, 'activity-logs-report.csv');
}

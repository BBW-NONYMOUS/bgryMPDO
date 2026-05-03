import { downloadBlobFromEndpoint } from './fileTransfer';

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      query.set(key, value);
    }
  });

  return query;
}

export function downloadDashboardSummaryReport() {
  return downloadBlobFromEndpoint('/reports/dashboard-summary', 'dashboard-summary-report.csv');
}

export function downloadDocumentsReport(params = {}, format = 'csv') {
  const query = buildQuery(params);
  query.set('format', format);

  const endpoint = query.toString() ? `/reports/documents?${query.toString()}` : '/reports/documents';
  const extension = format === 'xls' ? 'xls' : 'csv';
  return downloadBlobFromEndpoint(endpoint, `documents-report.${extension}`);
}

export function downloadActivityLogsReport(params = {}) {
  const query = buildQuery(params);

  const endpoint = query.toString() ? `/reports/activity-logs?${query.toString()}` : '/reports/activity-logs';
  return downloadBlobFromEndpoint(endpoint, 'activity-logs-report.csv');
}

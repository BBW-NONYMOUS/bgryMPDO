import api from './axios';

function createObjectUrl(response) {
  const contentType = response.headers?.['content-type'];
  const blob = response.data instanceof Blob ? response.data : new Blob([response.data], contentType ? { type: contentType } : undefined);
  return window.URL.createObjectURL(blob);
}

export async function printBlobFromEndpoint(endpoint) {
  const response = await api.get(endpoint, { responseType: 'blob' });
  const url = createObjectUrl(response);
  const popup = window.open(url, '_blank', 'noopener');

  if (popup) {
    popup.onload = () => {
      try { popup.print(); } catch (_) {}
    };
    // fallback: blob URLs sometimes fire load before onload is attached
    window.setTimeout(() => {
      try { popup.print(); } catch (_) {}
      window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    }, 1200);
  } else {
    window.URL.revokeObjectURL(url);
  }
}

export async function downloadBlobFromEndpoint(endpoint, fallbackName) {
  const response = await api.get(endpoint, {
    responseType: 'blob',
  });

  const url = createObjectUrl(response);
  const link = window.document.createElement('a');
  link.href = url;
  link.setAttribute('download', fallbackName);
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function openBlobFromEndpoint(endpoint) {
  const response = await api.get(endpoint, {
    responseType: 'blob',
  });

  const url = createObjectUrl(response);
  const popup = window.open(url, '_blank', 'noopener,noreferrer');

  if (!popup) {
    const link = window.document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    window.document.body.appendChild(link);
    link.click();
    link.remove();
  }

  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 60000);
}

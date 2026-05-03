import api from './axios';

function createObjectUrl(response) {
  const contentType = response.headers?.['content-type'];
  const blob = response.data instanceof Blob ? response.data : new Blob([response.data], contentType ? { type: contentType } : undefined);
  return window.URL.createObjectURL(blob);
}

export async function printBlobFromEndpoint(endpoint) {
  // Open popup synchronously (before any await) so the browser treats it
  // as a direct user-gesture response and does not block it.
  // Note: do NOT include "noopener" — it causes window.open to return null
  // in modern browsers, losing the reference we need to write into the popup.
  const popup = window.open('', '_blank', 'width=960,height=720');

  if (!popup) {
    // Popup was blocked — download instead so the user can print natively.
    const response = await api.get(endpoint, { responseType: 'blob' });
    const url = createObjectUrl(response);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = 'document';
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 10_000);
    return;
  }

  popup.document.write(
    '<!DOCTYPE html><html><head><title>Print</title>' +
    '<style>*{margin:0;padding:0;box-sizing:border-box}' +
    'body{display:flex;flex-direction:column;align-items:center;justify-content:center;' +
    'height:100vh;background:#f8fafc;font-family:system-ui,sans-serif;gap:12px;color:#64748b}' +
    '.sp{width:32px;height:32px;border:3px solid #e2e8f0;border-top-color:#3b82f6;' +
    'border-radius:50%;animation:s .7s linear infinite}' +
    '@keyframes s{to{transform:rotate(360deg)}}</style></head>' +
    '<body><div class="sp"></div><p>Preparing document…</p></body></html>',
  );
  popup.document.close();

  try {
    const response = await api.get(endpoint, { responseType: 'blob' });
    const url = createObjectUrl(response);

    // Navigate the popup directly to the blob URL so the browser's native
    // PDF viewer handles rendering. This avoids the "plugin not supported"
    // error that <embed>/<object> triggers in Brave and some Chromium builds.
    popup.location.href = url;

    // The popup navigates to the blob URL. blob: URLs are same-origin with the
    // page that created them, so popup.print() is a valid same-origin call —
    // unless Brave's PDF viewer extension replaces the document (making it
    // cross-origin). We try popup.print() first; on SecurityError we fall
    // back to showing an alert that prompts the user to use Ctrl+P.
    const printAttempt = window.setTimeout(() => {
      try {
        popup.focus();
        popup.print();
      } catch (_) {
        // PDF viewer made the popup cross-origin (common in Brave).
        // The document is already visible — user can press Ctrl+P.
      }
    }, 1800);

    window.setTimeout(() => {
      window.clearTimeout(printAttempt);
      window.URL.revokeObjectURL(url);
    }, 120_000);
  } catch (error) {
    popup.close();
    throw error;
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
  // Delay revoke so the browser has time to start the download.
  window.setTimeout(() => window.URL.revokeObjectURL(url), 10_000);
}

export async function openBlobFromEndpoint(endpoint) {
  // Open a blank popup synchronously (before any await) so the browser
  // treats it as a direct user-gesture response and does not block it.
  // Do NOT use "noopener" — it causes modern browsers to return null,
  // losing the reference we need to navigate the popup after the fetch.
  const popup = window.open('', '_blank');

  try {
    const response = await api.get(endpoint, { responseType: 'blob' });
    const url = createObjectUrl(response);

    if (popup && !popup.closed) {
      popup.location.href = url;
    } else {
      // Fallback if the popup was blocked or closed.
      const link = window.document.createElement('a');
      link.href = url;
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      link.remove();
    }

    window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    if (popup && !popup.closed) popup.close();
    throw error;
  }
}

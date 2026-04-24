import api from './axios';

function createObjectUrl(response) {
  const contentType = response.headers?.['content-type'];
  const blob = response.data instanceof Blob ? response.data : new Blob([response.data], contentType ? { type: contentType } : undefined);
  return window.URL.createObjectURL(blob);
}

export async function printBlobFromEndpoint(endpoint) {
  // Must open the popup synchronously (before any await) so the browser
  // treats it as a direct user-gesture response and doesn't block it.
  const popup = window.open('', '_blank', 'noopener,width=960,height=720');

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

  // Write a loading screen while the blob is fetched.
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
    const contentType = response.headers?.['content-type'] ?? 'application/octet-stream';
    const url = createObjectUrl(response);

    // Strategy: write an HTML page directly into the popup that embeds the
    // file and calls window.print() from *within the popup's own script*.
    // This is far more reliable than calling popup.print() from the parent
    // after a location.replace(), which becomes cross-origin after navigation
    // and is silently ignored by some browsers.
    popup.document.open();
    popup.document.write(
      '<!DOCTYPE html><html><head><title>Print</title>' +
      '<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden;background:#fff}' +
      'embed,iframe{display:block;width:100%;height:100%;border:none}' +
      '@media print{html,body{height:auto}embed,iframe{height:100vh}}</style></head>' +
      '<body>' +
      '<embed src="' + url + '" type="' + contentType + '" width="100%" height="100%" />' +
      '<script>' +
      // Retry loop: attempt window.print() every 700 ms up to 10 times.
      // The PDF renderer needs a moment to fully initialise before print()
      // reliably opens the dialog.
      '(function(){' +
      'var n=0;' +
      'var t=setInterval(function(){' +
      'n++;' +
      'try{window.focus();window.print();clearInterval(t);}catch(e){}' +
      'if(n>=10)clearInterval(t);' +
      '},700);' +
      '})();' +
      '<\/script>' +
      '</body></html>',
    );
    popup.document.close();

    window.setTimeout(() => window.URL.revokeObjectURL(url), 120_000);
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

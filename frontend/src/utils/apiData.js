export function extractCollection(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

export function formatDateTime(value) {
  if (!value) {
    return '--';
  }

  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function buildDocumentFormData(values, file) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  if (file) {
    formData.append('file', file);
  }

  return formData;
}

import api from './axios';

export async function getDocuments(params = {}) {
  const response = await api.get('/documents', { params });
  return response.data;
}

export async function getDocument(id) {
  const response = await api.get(`/documents/${id}`);
  return response.data;
}

export async function createDocument(payload) {
  const response = await api.post('/documents', payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function updateDocument(id, payload) {
  const response = await api.post(`/documents/${id}?_method=PUT`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export function getDocumentDownloadUrl(id) {
  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';
  return `${baseUrl}/documents/${id}/download`;
}

export async function downloadDocument(id, fallbackName = 'document') {
  const response = await api.get(`/documents/${id}/download`, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = window.document.createElement('a');
  link.href = url;
  link.setAttribute('download', fallbackName);
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function deleteDocument(id) {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
}

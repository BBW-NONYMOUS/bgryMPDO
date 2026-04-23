import api from './axios';
import { downloadBlobFromEndpoint, openBlobFromEndpoint, printBlobFromEndpoint } from './fileTransfer';

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
  return downloadBlobFromEndpoint(`/documents/${id}/download`, fallbackName);
}

export async function previewDocument(id) {
  return openBlobFromEndpoint(`/documents/${id}/preview`);
}

export async function printDocument(id) {
  return printBlobFromEndpoint(`/documents/${id}/preview`);
}

export async function deleteDocument(id) {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
}

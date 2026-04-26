export const DEFAULT_DOCUMENT_UPLOAD_LIMIT_BYTES = 60 * 1024 * 1024;

export function getDocumentUploadLimitBytes(settingsResponse) {
  return (
    settingsResponse?.upload_limits?.documents?.max_bytes ??
    DEFAULT_DOCUMENT_UPLOAD_LIMIT_BYTES
  );
}

export function formatMegabytes(bytes) {
  return Math.max(1, Math.floor(bytes / 1024 / 1024));
}

export function documentFileHelpText(maxBytes, prefix = 'Maximum file size is') {
  return `${prefix} ${formatMegabytes(maxBytes)} MB. Supported formats: PDF, DOCX, XLSX, PPT, JPG, and PNG.`;
}

export function documentFileTooLargeMessage(maxBytes) {
  return `The selected file is too large. The current server upload limit is ${formatMegabytes(maxBytes)} MB.`;
}

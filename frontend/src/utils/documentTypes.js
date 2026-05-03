export const CANONICAL_DOCUMENT_TYPES = [
  { value: 'application/pdf', label: 'PDF' },
  {
    value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    label: 'Word (.docx)',
  },
  {
    value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    label: 'Excel (.xlsx)',
  },
  {
    value: 'application/vnd.ms-powerpoint',
    label: 'PowerPoint (.ppt)',
  },
  {
    value: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    label: 'PowerPoint (.pptx)',
  },
  { value: 'image/jpeg', label: 'Image (JPG/JPEG)' },
  { value: 'image/png', label: 'Image (PNG)' },
];

const DOCUMENT_TYPE_ALIASES = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  word: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  powerpoint: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  image: 'image/jpeg',
  png: 'image/png',
};

export function normalizeDocumentTypeValue(value) {
  const normalized = String(value ?? '').split(';')[0].trim().toLowerCase();
  return DOCUMENT_TYPE_ALIASES[normalized] ?? normalized;
}

export function labelDocumentType(value) {
  const normalized = normalizeDocumentTypeValue(value);
  const known = CANONICAL_DOCUMENT_TYPES.find((type) => type.value === normalized);
  return known?.label ?? (normalized ? normalized.split('/').pop().toUpperCase() : '--');
}

export function documentTypesFromSettings(settings) {
  const configured = Array.isArray(settings?.document_types) ? settings.document_types : [];
  const values = configured
    .map(normalizeDocumentTypeValue)
    .filter(Boolean);

  const uniqueValues = Array.from(new Set(values));
  const sourceValues = uniqueValues.length > 0
    ? uniqueValues
    : CANONICAL_DOCUMENT_TYPES.map((type) => type.value);

  return sourceValues.map((value) => ({
    value,
    label: labelDocumentType(value),
  }));
}

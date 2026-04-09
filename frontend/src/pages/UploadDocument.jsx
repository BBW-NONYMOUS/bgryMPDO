import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDocument } from '../api/documentApi';
import { getBarangays, getCategories } from '../api/lookupApi';
import { getSettings } from '../api/settingsApi';
import DocumentForm from '../components/forms/DocumentForm';
import { alertErrorClassName, pageStackClassName, pageTitleClassName, panelHeaderClassName, sectionEyebrowClassName } from '../styles/uiClasses';
import { extractCollection, buildDocumentFormData } from '../utils/apiData';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const initialValues = {
  title: '',
  document_number: '',
  document_date: '',
  description: '',
  keywords: '',
  remarks: '',
  category_id: '',
  barangay_id: '',
  access_level: 'staff',
  status: 'draft',
};

export default function UploadDocument() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [statusOptions, setStatusOptions] = useState(['draft', 'active', 'archived']);
  const [accessLevelOptions, setAccessLevelOptions] = useState(['admin', 'staff', 'barangay']);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadLookups() {
      const [categoryResponse, barangayResponse, settingsResponse] = await Promise.all([
        getCategories({ per_page: 100 }),
        getBarangays({ per_page: 100 }),
        getSettings(),
      ]);

      setCategories(extractCollection(categoryResponse));
      setBarangays(extractCollection(barangayResponse));
      setStatusOptions(settingsResponse.settings?.document_statuses ?? ['draft', 'active', 'archived']);
      setAccessLevelOptions(settingsResponse.settings?.document_access_levels ?? ['admin', 'staff', 'barangay']);
    }

    loadLookups();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      await createDocument(buildDocumentFormData(values, file));
      navigate('/documents');
    } catch (error) {
      const validationErrors = error.response?.data?.errors;
      const firstValidationMessage = validationErrors ? Object.values(validationErrors).flat()[0] : null;

      setMessage(firstValidationMessage ?? error.response?.data?.message ?? 'Unable to save document. Review the form and backend setup.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleFileChange(nextFile) {
    if (!nextFile) {
      setFile(null);
      return;
    }

    if (nextFile.size > MAX_UPLOAD_BYTES) {
      setFile(null);
      setMessage('The selected file is too large. The current server upload limit is 5 MB.');
      return;
    }

    setMessage('');
    setFile(nextFile);
  }

  return (
    <div className={pageStackClassName}>
      <div className={panelHeaderClassName}>
        <div>
          <p className={sectionEyebrowClassName}>Document Intake</p>
          <h2 className={pageTitleClassName}>Upload and classify document</h2>
        </div>
      </div>

      {message ? <div className={alertErrorClassName}>{message}</div> : null}

      <DocumentForm
        values={values}
        categories={categories}
        barangays={barangays}
        statusOptions={statusOptions}
        accessLevelOptions={accessLevelOptions}
        onChange={(field, value) => setValues((current) => ({ ...current, [field]: value }))}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        submitting={submitting}
        fileHelpText="Maximum file size is 5 MB. Supported formats: PDF, DOCX, XLSX, PPT, JPG, and PNG."
      />
    </div>
  );
}

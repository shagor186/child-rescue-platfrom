const API_BASE_URL = 'http://localhost:5000/api';

/* ================= CREATE REPORT ================= */
export const createReport = async (formData: FormData) => {
  const response = await fetch(`${API_BASE_URL}/reports`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to create report');
  }

  return response.json();
};

/* ================= GET ALL REPORTS ================= */
export const getReports = async () => {
  const response = await fetch(`${API_BASE_URL}/reports`);

  if (!response.ok) {
    throw new Error('Failed to fetch reports');
  }

  return response.json();
};

/* ================= DELETE REPORT ================= */
export const deleteReport = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete report');
  }

  return response.json();
};

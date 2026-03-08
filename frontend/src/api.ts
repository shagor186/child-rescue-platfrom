import type { MissingPerson, Detection, DashboardStats } from './types';


export const API_BASE_URL = 'http://127.0.0.1:5000/api';


export const fetchDashboardStats = async (
  setDashboardStats: (stats: DashboardStats) => void,
  showMessage: (type: 'success' | 'error', text: string) => void,
  setLoading?: (loading: boolean) => void
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    setDashboardStats(data);
    if (setLoading) setLoading(false);
  } catch (error: unknown) {
    console.error('Error fetching dashboard stats:', error);
    
    let errorMessage = 'Failed to load dashboard statistics';
    if (error instanceof Error) {
      errorMessage = `Dashboard stats fetch failed: ${error.message}`;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    showMessage('error', errorMessage);
    if (setLoading) setLoading(false);
  }
};

export const fetchReports = async (
  setReports: (reports: MissingPerson[]) => void,
  showMessage: (type: 'success' | 'error', text: string) => void
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reports`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    setReports(data);
  } catch (error: unknown) {
    console.error('Error fetching reports:', error);
    
    let errorMessage = 'Failed to load reports';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    showMessage('error', errorMessage);
  }
};

export const fetchNotifications = async (
  setNotifications: (notifications: Detection[]) => void
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data: Detection[] = await response.json();
    setNotifications(data);
  } catch (error: unknown) {
    console.error('Error fetching notifications:', error);
    
    if (error instanceof Error) {
      console.log(`Notification fetch error: ${error.message}`);
    }
  }
};

export const createReport = async (
  formData: FormData,
  showMessage: (type: 'success' | 'error', text: string) => void
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (response.ok) {
      showMessage('success', data.message || 'Report created successfully');
      return { success: true, data };
    } else {
      showMessage('error', data.error || 'Failed to create report');
      return { success: false, error: data.error };
    }
  } catch (error: unknown) {
  console.error('Error creating report:', error);
  
  let errorMessage = 'Failed to create report';
  let errorDetails = '';
  
  if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
    errorDetails = error;
  }
  
  showMessage('error', errorMessage);
  return { success: false, error: errorDetails };
}
};

export const deleteReport = async (
  id: string,
  showMessage: (type: 'success' | 'error', text: string) => void
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
      method: 'DELETE',
    });

    const data = await response.json();
    
    if (response.ok) {
      showMessage('success', 'Report deleted successfully');
      return { success: true };
    } else {
      showMessage('error', data.error || 'Failed to delete report');
      return { success: false, error: data.error };
    }
  } catch (error: unknown) {
  console.error('Error deleting report:', error);
  
  let errorMessage = 'Failed to delete report';
  let errorDetails = '';
  
  if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
    errorDetails = error;
  }
  
  showMessage('error', errorMessage);
  return { success: false, error: errorDetails };
}
};
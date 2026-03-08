// API layer only talks with backend

const API_BASE_URL = 'http://localhost:5000/api'; 

export const fetchNotifications = async () => {
  const res = await fetch(`${API_BASE_URL}/notifications`);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
};

export const deleteNotification = async (id: number) => {
  const res = await fetch(`${API_BASE_URL}/notifications/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete notification');
  return res.json();
};

export const clearNotifications = async () => {
  const res = await fetch(`${API_BASE_URL}/notifications/clear`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear notifications');
  return res.json();
};

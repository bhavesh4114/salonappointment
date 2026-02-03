const getAuthToken = () => localStorage.getItem('token');

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return url.replace(/\/$/, '');
};

/**
 * GET /api/barber/earnings
 * Barber identified by JWT only (do NOT send barberId).
 */
export async function fetchBarberEarnings(tokenFromContext = null) {
  const token = tokenFromContext ?? getAuthToken();
  if (!token) {
    const err = new Error('Not authenticated');
    err.code = 'NO_TOKEN';
    throw err;
  }

  const url = `${getBaseUrl()}/api/barber/earnings`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(json.message || 'Failed to fetch earnings');
    err.status = response.status;
    throw err;
  }
  return json;
}

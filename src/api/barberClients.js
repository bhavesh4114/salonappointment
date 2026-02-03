const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthToken = () => localStorage.getItem('token');

/**
 * GET /api/barber/clients
 * Barber is identified by JWT only (do NOT send barberId in query or body).
 * Query: page, limit, search (name or phone).
 * Returns: { success, data: { clients, totalClients, page, limit } }
 */
export async function fetchBarberClients({ page = 1, limit = 10, search = '' } = {}, tokenFromContext = null) {
  const token = tokenFromContext ?? getAuthToken();
  if (!token) {
    const err = new Error('Not authenticated');
    err.code = 'NO_TOKEN';
    throw err;
  }

  const params = new URLSearchParams();
  if (page != null) params.set('page', String(page));
  if (limit != null) params.set('limit', String(limit));
  if (search != null && String(search).trim()) params.set('search', String(search).trim());

  const url = `${API_BASE_URL}/api/barber/clients?${params.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(json.message || 'Failed to fetch clients');
    err.status = response.status;
    throw err;
  }
  return json;
}

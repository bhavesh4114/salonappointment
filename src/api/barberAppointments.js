const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/** Barber JWT from localStorage; only the logged-in barber's appointments are returned by the API. */
const getAuthToken = () => localStorage.getItem('token');

/**
 * GET /api/barber/appointments
 * Uses barber JWT (from token param or localStorage). Backend returns only this barber's appointments.
 * Pass token from AuthContext when barber is logged in so the same session is used.
 * Optional query: dateFilter = 'All' | 'Today' | 'Tomorrow' | 'This Week' (default 'All').
 * Returns: { success, data: { pendingAppointments, upcomingAppointments, summary: { totalAppointments, estimatedRevenue } } }
 */
export async function fetchBarberAppointments(dateFilter = 'All', tokenFromContext = null) {
  const token = tokenFromContext ?? getAuthToken();
  if (!token) {
    const err = new Error('Not authenticated');
    err.code = 'NO_TOKEN';
    throw err;
  }

  const params = new URLSearchParams();
  if (dateFilter) params.set('dateFilter', dateFilter);
  const url = `${API_BASE_URL}/api/barber/appointments?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(json.message || 'Failed to fetch appointments');
    err.status = response.status;
    throw err;
  }

  return json;
}

/**
 * PATCH /api/barber/appointments/:id/accept
 */
export async function acceptAppointment(id) {
  const token = getAuthToken();
  if (!token) {
    const err = new Error('Not authenticated');
    err.code = 'NO_TOKEN';
    throw err;
  }

  const response = await fetch(`${API_BASE_URL}/api/barber/appointments/${id}/accept`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.message || 'Failed to accept appointment');
    err.status = response.status;
    throw err;
  }
  return data;
}

/**
 * PATCH /api/barber/appointments/:id/decline
 */
export async function declineAppointment(id) {
  const token = getAuthToken();
  if (!token) {
    const err = new Error('Not authenticated');
    err.code = 'NO_TOKEN';
    throw err;
  }

  const response = await fetch(`${API_BASE_URL}/api/barber/appointments/${id}/decline`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.message || 'Failed to decline appointment');
    err.status = response.status;
    throw err;
  }
  return data;
}

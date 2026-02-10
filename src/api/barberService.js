const API_BASE_URL = 'http://localhost:5000';

// Helper to get token from localStorage (consistent with AuthContext)
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  console.log('[barberService] Token from storage:', token ? 'present' : 'null');
  return token;
};

// Add a new service for the authenticated barber
// serviceData can include primitive fields and an optional imageFile (File object)
// tokenOverride: pass token so it's guaranteed to be sent (FormData + fetch can drop plain headers in some cases)
export async function addNewService(serviceData, tokenOverride) {
  const token = (tokenOverride ?? getAuthToken())?.trim?.() ?? getAuthToken();

  if (!token) {
    const error = new Error('You are not logged in as a barber. Please login again.');
    error.code = 'NO_TOKEN';
    throw error;
  }

  try {
    const formData = new FormData();

    // Append all fields to FormData
    Object.entries(serviceData).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      // Image file is sent under the key "image"
      if (key === 'imageFile' && value instanceof File) {
        formData.append('image', value);
      } else {
         formData.append(key, String(value));
      }
    });

    // Use Headers so Authorization is always sent (do NOT set Content-Type; browser sets multipart boundary)
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${token}`);

    const response = await fetch(`${API_BASE_URL}/api/barber/services`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const err = new Error(
        data.message ||
          (response.status === 401
            ? 'Session expired. Please login again.'
            : 'Failed to add service')
      );
      err.status = response.status;
      throw err;
    }

    return data; // { success, message, data: service }
  } catch (error) {
    throw error;
  }
}

// Fetch all services for the authenticated barber
export async function fetchMyServices() {
  const token = getAuthToken();

  if (!token) {
    const error = new Error('You are not logged in as a barber.');
    error.code = 'NO_TOKEN';
    throw error;
  }

  const response = await fetch(
    `${API_BASE_URL}/api/barber/services`, // ✅ ONLY THIS
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    const err = new Error(
      data.message ||
        (response.status === 401
          ? 'Session expired or not authenticated. Please login as barber again.'
          : 'Failed to fetch services')
    );
    err.status = response.status;
    throw err;
  }

  return data; // { success: true, data: services }
}

/**
 * Update service enabled/disabled (isActive) for the authenticated barber.
 * PATCH /api/barber/services/:id
 * Body: { isActive: boolean }
 */
export async function updateServiceIsActive(serviceId, isActive, tokenOverride) {
  const token = (tokenOverride ?? getAuthToken())?.trim?.() ?? getAuthToken();

  if (!token) {
    const error = new Error('You are not logged in as a barber. Please login again.');
    error.code = 'NO_TOKEN';
    throw error;
  }

  const response = await fetch(
    `${API_BASE_URL}/api/barber/services/${encodeURIComponent(serviceId)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive }),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    const err = new Error(
      data.message ||
        (response.status === 401
          ? 'Session expired or not authenticated. Please login as barber again.'
          : 'Failed to update service')
    );
    err.status = response.status;
    throw err;
  }

  return data; // { success: true, message, data: service }
}

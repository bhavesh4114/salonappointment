const API_BASE_URL = 'http://localhost:5000';

// Add a new service for the authenticated barber
// serviceData can include primitive fields and an optional imageFile (File object)
export async function addNewService(serviceData) {
  const token = localStorage.getItem('barberToken');

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
        formData.append(key, value);
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/barber/services`, {
      method: 'POST',
      headers: {
        // DO NOT set Content-Type manually; browser will set multipart boundary
        Authorization: `Bearer ${token}`,
      },
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
  const token = localStorage.getItem('barberToken');

  if (!token) {
    const error = new Error('You are not logged in as a barber. Please login again.');
    error.code = 'NO_TOKEN';
    throw error;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/barber/services`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const err = new Error(
        data.message ||
          (response.status === 401
            ? 'Session expired. Please login again.'
            : 'Failed to fetch services')
      );
      err.status = response.status;
      throw err;
    }

    return data; // { success, data: services }
  } catch (error) {
    throw error;
  }
}


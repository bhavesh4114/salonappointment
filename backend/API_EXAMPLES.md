# API Usage Examples for Frontend (Vite/React)

This document provides example fetch calls for integrating the backend API with your Vite + React frontend.

## Base URL
```
http://localhost:5000
```

## Authentication

### Register User
```javascript
const register = async (userData) => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'John Doe',
      mobileNumber: '+1234567890',
      email: 'john@example.com',
      password: 'password123',
      role: 'user' // or 'barber'
    })
  });
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
};
```

### Login
```javascript
const login = async (credentials) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mobileNumber: '+1234567890', // or email: 'john@example.com'
      password: 'password123'
    })
  });
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
};
```

### Get Current User
```javascript
const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }
  
  const response = await fetch('http://localhost:5000/api/auth/me', {
    headers: { 
      'Authorization': `Bearer ${token}` 
    }
  });
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    throw new Error('Unauthorized');
  }
  
  return await response.json();
};
```

## Appointments

### Create Appointment
```javascript
const createAppointment = async (appointmentData) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      barberId: 1, // Integer ID
      services: [
        { service: 1, quantity: 1 }, // service is the service ID (integer)
        { service: 2, quantity: 2 }
      ],
      appointmentDate: '2024-12-15T10:30:00Z', // ISO date string
      appointmentTime: '10:30 AM',
      notes: 'Please be gentle'
    })
  });
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    throw new Error('Unauthorized');
  }
  
  return await response.json();
};
```

### Get All Appointments
```javascript
const getAppointments = async (filters = {}) => {
  const token = localStorage.getItem('token');
  const queryParams = new URLSearchParams(filters);
  
  const response = await fetch(
    `http://localhost:5000/api/appointments?${queryParams}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    throw new Error('Unauthorized');
  }
  
  return await response.json();
};

// Usage examples:
// getAppointments({ status: 'pending' })
// getAppointments({ upcoming: 'true' })
// getAppointments({ past: 'true' })
```

### Get Single Appointment
```javascript
const getAppointment = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5000/api/appointments/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    throw new Error('Unauthorized');
  }
  
  return await response.json();
};
```

### Update Appointment Status
```javascript
const updateAppointmentStatus = async (id, status, cancellationReason = '') => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      status, // 'pending', 'confirmed', 'completed', 'cancelled', 'no-show'
      cancellationReason
    })
  });
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    throw new Error('Unauthorized');
  }
  
  return await response.json();
};
```

## React Hook Example

```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser()
        .then(data => {
          setUser(data.user);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return { user, loading, login, logout };
};
```

## Error Handling

```javascript
const handleApiCall = async (apiCall) => {
  try {
    const data = await apiCall();
    return { success: true, data };
  } catch (error) {
    if (error.message === 'Unauthorized') {
      // Redirect to login
      window.location.href = '/login';
    }
    return { success: false, error: error.message };
  }
};
```

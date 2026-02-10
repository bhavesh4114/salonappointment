import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000';

const UserProfileEdit = () => {
  const { token, user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    avatar: '',
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(`${API_BASE}/api/users/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (res.status === 401) {
            logout();
            navigate('/login', { replace: true });
            return;
          }
          throw new Error(data.message || 'Failed to load profile');
        }

        const u = data.user || {};
        setForm({
          fullName: u.fullName || '',
          mobileNumber: u.mobileNumber || '',
          email: u.email || '',
          avatar: u.avatar || '',
        });
        setAvatarPreview(u.avatar || '');
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Failed to fetch profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }

    return () => controller.abort();
  }, [token, logout, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be 2MB or less.');
      return;
    }

    setError('');
    setAvatarFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result?.toString() || '');
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (!form.fullName.trim()) {
      setError('Full Name is required.');
      return false;
    }

    if (!form.mobileNumber.trim()) {
      setError('Mobile Number is required.');
      return false;
    }

    if (form.email && form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        setError('Please enter a valid email address.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError('');
    setSuccess('');

    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload = {
        fullName: form.fullName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        email: form.email ? form.email.trim() : '',
        avatar: avatarPreview || form.avatar || '',
      };

      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }
        throw new Error(data.message || 'Failed to update profile');
      }

      if (data.user) {
        updateUser(data.user);
      }

      setSuccess('Profile updated successfully.');
      setTimeout(() => {
        navigate('/user/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6"
        >
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={form.fullName || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-gray-500">
                  {user?.fullName
                    ? user.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'U'}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={submitting}
                className="block w-full text-sm text-gray-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-gray-200 file:text-sm file:font-semibold file:bg-white file:text-gray-700 hover:file:bg-gray-50"
              />
              <p className="mt-1 text-xs text-gray-500">
                JPG, PNG up to 2MB.
              </p>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              disabled={submitting}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-mint focus:ring-teal-mint"
              placeholder="Enter your full name"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              name="mobileNumber"
              value={form.mobileNumber}
              onChange={handleChange}
              disabled={submitting}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-mint focus:ring-teal-mint"
              placeholder="Enter your mobile number"
            />
            <p className="mt-1 text-xs text-gray-500">
              This is used for booking confirmations and notifications.
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (optional)
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={submitting}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-mint focus:ring-teal-mint"
              placeholder="Enter your email"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/user/dashboard')}
              disabled={submitting}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-teal-mint hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileEdit;


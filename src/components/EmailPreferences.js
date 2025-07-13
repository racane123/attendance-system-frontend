import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { emailAPI } from '../services/api';

const EmailPreferences = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    daily_summary: false,
    weekly_summary: false,
    attendance_reports: false,
    notifications: true,
    email_frequency: 'immediate'
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await emailAPI.getPreferences();
      if (response.data.data) {
        setPreferences(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load email preferences');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await emailAPI.updatePreferences(preferences);
      toast.success('Email preferences updated successfully!');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error(error.message || 'Failed to update email preferences');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setPreferences({
      daily_summary: false,
      weekly_summary: false,
      attendance_reports: false,
      notifications: true,
      email_frequency: 'immediate'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Preferences</h2>
        <p className="text-gray-600">
          Manage your email notification settings and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Notification Types */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Types</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Daily Summary</h4>
                <p className="text-sm text-gray-500">
                  Receive daily attendance summaries
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.daily_summary}
                  onChange={(e) => handlePreferenceChange('daily_summary', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Weekly Summary</h4>
                <p className="text-sm text-gray-500">
                  Receive weekly attendance summaries
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.weekly_summary}
                  onChange={(e) => handlePreferenceChange('weekly_summary', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Attendance Reports</h4>
                <p className="text-sm text-gray-500">
                  Receive detailed attendance reports
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.attendance_reports}
                  onChange={(e) => handlePreferenceChange('attendance_reports', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">General Notifications</h4>
                <p className="text-sm text-gray-500">
                  Receive important system notifications
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notifications}
                  onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Email Frequency */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Frequency</h3>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="email_frequency"
                value="immediate"
                checked={preferences.email_frequency === 'immediate'}
                onChange={(e) => handlePreferenceChange('email_frequency', e.target.value)}
                className="mr-3"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Immediate</span>
                <p className="text-sm text-gray-500">Receive emails as soon as they are generated</p>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="email_frequency"
                value="daily"
                checked={preferences.email_frequency === 'daily'}
                onChange={(e) => handlePreferenceChange('email_frequency', e.target.value)}
                className="mr-3"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Daily Digest</span>
                <p className="text-sm text-gray-500">Receive all emails once per day</p>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="email_frequency"
                value="weekly"
                checked={preferences.email_frequency === 'weekly'}
                onChange={(e) => handlePreferenceChange('email_frequency', e.target.value)}
                className="mr-3"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Weekly Digest</span>
                <p className="text-sm text-gray-500">Receive all emails once per week</p>
              </div>
            </label>
          </div>
        </div>

        {/* Current Email */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Current Email Address</h3>
          <p className="text-sm text-gray-600">{user?.email || 'No email address found'}</p>
          <p className="text-xs text-gray-500 mt-1">
            Contact an administrator to change your email address
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={resetToDefaults}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset to Defaults
          </button>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={fetchPreferences}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Refresh
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">ℹ️ About Email Preferences:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Daily Summary:</strong> Receive attendance summaries every day at 6:00 PM</li>
          <li>• <strong>Weekly Summary:</strong> Receive attendance summaries every Sunday at 6:00 PM</li>
          <li>• <strong>Attendance Reports:</strong> Receive detailed reports when requested by teachers</li>
          <li>• <strong>General Notifications:</strong> Receive important system updates and announcements</li>
          <li>• <strong>Email Frequency:</strong> Controls how often you receive batched emails</li>
        </ul>
      </div>
    </div>
  );
};

export default EmailPreferences; 
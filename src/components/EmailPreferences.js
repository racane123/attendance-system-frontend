import React, { useState, useEffect } from 'react';
import { emailAPI } from '../services/api';

const EmailPreferences = () => {
  const [preferences, setPreferences] = useState({
    dailySummary: false,
    weeklySummary: false,
    attendanceReports: false,
    notifications: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const data = await emailAPI.getPreferences();
      setPreferences(data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      await emailAPI.updatePreferences(preferences);
      setResult({ success: true, message: 'Preferences saved successfully!' });
    } catch (error) {
      setResult({ 
        success: false, 
        message: `Failed to save preferences: ${error.message}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Email Preferences</h2>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Daily Summary</h3>
              <p className="text-sm text-gray-600">Receive daily attendance summaries</p>
            </div>
            <button
              onClick={() => handleToggle('dailySummary')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.dailySummary ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.dailySummary ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Weekly Summary</h3>
              <p className="text-sm text-gray-600">Receive weekly attendance reports</p>
            </div>
            <button
              onClick={() => handleToggle('weeklySummary')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.weeklySummary ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.weeklySummary ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Attendance Reports</h3>
              <p className="text-sm text-gray-600">Receive detailed attendance reports</p>
            </div>
            <button
              onClick={() => handleToggle('attendanceReports')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.attendanceReports ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.attendanceReports ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Notifications</h3>
              <p className="text-sm text-gray-600">Receive real-time notifications</p>
            </div>
            <button
              onClick={() => handleToggle('notifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.notifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.notifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </button>

        {result && (
          <div className={`p-3 rounded-md ${
            result.success 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {result.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailPreferences; 
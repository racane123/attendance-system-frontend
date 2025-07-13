import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import EmailHistory from '../components/EmailHistory';
import EmailStats from '../components/EmailStats';
import SendEmailForm from '../components/SendEmailForm';
import EmailPreferences from '../components/EmailPreferences';
import EmailDebug from '../components/EmailDebug';

const EmailManagement = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('history');
  const [loading, setLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const tabs = [
    { id: 'history', name: 'Email History', icon: '📧' },
    { id: 'stats', name: 'Statistics', icon: '📊' },
    { id: 'send', name: 'Send Email', icon: '✉️' },
    { id: 'preferences', name: 'Preferences', icon: '⚙️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'history':
        return <EmailHistory />;
      case 'stats':
        return <EmailStats />;
      case 'send':
        return <SendEmailForm />;
      case 'preferences':
        return <EmailPreferences />;
      default:
        return <EmailHistory />;
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">
            You don't have permission to access email management. Only administrators and teachers can manage email settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Management</h1>
            <p className="text-gray-600">
              Manage email notifications, view history, and configure preferences
            </p>
          </div>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </button>
        </div>
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <div className="mb-6">
          <EmailDebug />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default EmailManagement; 
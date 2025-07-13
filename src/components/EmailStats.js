import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { emailAPI } from '../services/api';

const EmailStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchEmailStats = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching email stats...');
      
      const params = { days };
      console.log('📡 API params:', params);

      const response = await emailAPI.getStats(params);
      console.log('📊 Stats data received:', response.data);
      setStats(response.data.data);
    } catch (error) {
      console.error('❌ Error fetching email stats:', error);
      toast.error(`Failed to load email statistics: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailStats();
  }, [days, fetchEmailStats]);

  const getTotalEmails = () => {
    if (!stats?.totalByType) return 0;
    return stats.totalByType.reduce((sum, type) => sum + parseInt(type.total), 0);
  };

  const getSuccessRate = () => {
    if (!stats?.totalByType) return 0;
    const total = getTotalEmails();
    const sent = stats.totalByType.reduce((sum, type) => sum + parseInt(type.sent), 0);
    return total > 0 ? Math.round((sent / total) * 100) : 0;
  };

  const getEmailTypeStats = (type) => {
    if (!stats?.totalByType) return { total: 0, sent: 0, failed: 0 };
    const typeStats = stats.totalByType.find(t => t.email_type === type);
    return typeStats ? {
      total: parseInt(typeStats.total),
      sent: parseInt(typeStats.sent),
      failed: parseInt(typeStats.failed)
    } : { total: 0, sent: 0, failed: 0 };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Email Statistics</h2>
        <select
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Emails</p>
              <p className="text-2xl font-semibold text-gray-900">{getTotalEmails()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{getSuccessRate()}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Daily Summary</p>
              <p className="text-2xl font-semibold text-gray-900">{getEmailTypeStats('daily_summary').total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reports</p>
              <p className="text-2xl font-semibold text-gray-900">{getEmailTypeStats('attendance_report').total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Type Breakdown */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Email Type Breakdown</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {stats?.totalByType?.map((type) => {
              const successRate = type.total > 0 ? Math.round((type.sent / type.total) * 100) : 0;
              return (
                <div key={type.email_type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {type.email_type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {type.sent} sent, {type.failed} failed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{type.total}</p>
                    <p className="text-sm text-gray-500">{successRate}% success</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Stats Chart */}
      {stats?.dailyStats && stats.dailyStats.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Daily Email Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {stats.dailyStats.slice(0, 10).map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{day.date}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {day.email_type}: {day.count}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      day.status === 'sent' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {day.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!stats && (
        <div className="text-center py-8">
          <p className="text-gray-500">No email statistics available for the selected period.</p>
        </div>
      )}
    </div>
  );
};

export default EmailStats; 
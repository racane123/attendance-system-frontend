import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { emailAPI } from '../services/api';

const EmailStats = () => {
  const [stats, setStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    successRate: 0,
    averageResponseTime: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchEmailStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await emailAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch email stats:', error);
      toast.error(`Failed to load email statistics: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmailStats();
  }, [fetchEmailStats]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Email Statistics</h2>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600">Total Sent</h3>
            <p className="text-2xl font-bold text-blue-900">{stats.totalSent}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600">Total Received</h3>
            <p className="text-2xl font-bold text-green-900">{stats.totalReceived}</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-600">Success Rate</h3>
            <p className="text-2xl font-bold text-yellow-900">{stats.successRate}%</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-600">Avg Response Time</h3>
            <p className="text-2xl font-bold text-purple-900">{stats.averageResponseTime}ms</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailStats; 
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Send, X } from 'lucide-react';
import { emailAPI } from '../services/api';

const EmailNotification = ({ 
  type = 'notification', 
  recipientEmail, 
  subject, 
  message, 
  onSuccess, 
  onCancel,
  showForm = false 
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientEmail: recipientEmail || '',
    subject: subject || '',
    message: message || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await emailAPI.sendNotification(formData);
      toast.success('Email sent successfully!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const sendQuickEmail = async (emailType, data) => {
    setLoading(true);

    try {
      let apiCall;

      switch (emailType) {
        case 'attendance_report':
          apiCall = () => emailAPI.sendAttendanceReport(data);
          break;
        case 'daily_summary':
          apiCall = () => emailAPI.sendDailySummary({ date: new Date().toISOString().split('T')[0] });
          break;
        case 'weekly_summary':
          apiCall = () => emailAPI.sendWeeklySummary({ endDate: new Date().toISOString().split('T')[0] });
          break;
        default:
          throw new Error('Invalid email type');
      }

      const response = await apiCall();
      toast.success(response.data.message || 'Email sent successfully!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  if (showForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Send Email</h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Email *
              </label>
              <input
                type="email"
                name="recipientEmail"
                value={formData.recipientEmail}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter recipient email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your message"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Mail className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-sm font-medium text-gray-900">Quick Email Actions</h3>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => sendQuickEmail('daily_summary')}
          disabled={loading}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 disabled:opacity-50"
        >
          <span>Send Daily Summary</span>
          <Send className="h-4 w-4" />
        </button>

        <button
          onClick={() => sendQuickEmail('weekly_summary')}
          disabled={loading}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 disabled:opacity-50"
        >
          <span>Send Weekly Summary</span>
          <Send className="h-4 w-4" />
        </button>

        {type === 'attendance_report' && (
          <button
            onClick={() => sendQuickEmail('attendance_report', { 
              subjectId: formData.subjectId, 
              date: formData.date,
              recipientEmail: formData.recipientEmail 
            })}
            disabled={loading}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            <span>Send Attendance Report</span>
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Emails will be sent to users based on their preferences
        </p>
      </div>
    </div>
  );
};

export default EmailNotification; 
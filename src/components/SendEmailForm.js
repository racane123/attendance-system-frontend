import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { emailAPI, subjectsAPI } from '../services/api';

const SendEmailForm = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    emailType: 'notification',
    recipientEmail: '',
    subject: '',
    message: '',
    subjectId: '',
    date: new Date().toISOString().split('T')[0]
  });

  const emailTypes = [
    { value: 'notification', label: 'Custom Notification', description: 'Send a custom message to any email address' },
    { value: 'attendance_report', label: 'Attendance Report', description: 'Send attendance report for a specific subject and date' },
    { value: 'daily_summary', label: 'Daily Summary', description: 'Send daily attendance summary to all users' },
    { value: 'weekly_summary', label: 'Weekly Summary', description: 'Send weekly attendance summary to all users' }
  ];

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

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
      let apiCall;

      switch (formData.emailType) {
        case 'notification':
          apiCall = () => emailAPI.sendNotification({
            recipientEmail: formData.recipientEmail,
            subject: formData.subject,
            message: formData.message
          });
          break;

        case 'attendance_report':
          apiCall = () => emailAPI.sendAttendanceReport({
            subjectId: formData.subjectId,
            date: formData.date,
            recipientEmail: formData.recipientEmail
          });
          break;

        case 'daily_summary':
          apiCall = () => emailAPI.sendDailySummary({ date: formData.date });
          break;

        case 'weekly_summary':
          apiCall = () => emailAPI.sendWeeklySummary({ endDate: formData.date });
          break;

        default:
          throw new Error('Invalid email type');
      }

      console.log('📡 Sending email...');
      const response = await apiCall();
      console.log('📧 Email response:', response.data);

      toast.success(response.data.message || 'Email sent successfully!');
      setFormData({
        emailType: 'notification',
        recipientEmail: '',
        subject: '',
        message: '',
        subjectId: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = () => {
    switch (formData.emailType) {
      case 'notification':
        return (
          <>
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
                placeholder="Enter recipient email address"
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
          </>
        );

      case 'attendance_report':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
                placeholder="Enter recipient email address"
              />
            </div>
          </>
        );

      case 'daily_summary':
      case 'weekly_summary':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.emailType === 'daily_summary' ? 'Date' : 'End Date'} *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-2 text-sm text-gray-500">
              {formData.emailType === 'daily_summary' 
                ? 'Daily summary will be sent to all users with daily preferences enabled.'
                : 'Weekly summary will be sent to all users with weekly preferences enabled.'
              }
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Send Email</h2>
        <p className="text-gray-600">
          Send different types of emails to users and recipients
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Email Type *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emailTypes.map((type) => (
              <div
                key={type.value}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.emailType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, emailType: type.value }))}
              >
                <div className="flex items-start">
                  <input
                    type="radio"
                    name="emailType"
                    value={type.value}
                    checked={formData.emailType === type.value}
                    onChange={handleInputChange}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{type.label}</h3>
                    <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Form Fields */}
        <div className="space-y-4">
          {renderFormFields()}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Tips:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Custom Notifications:</strong> Send personalized messages to any email address</li>
          <li>• <strong>Attendance Reports:</strong> Generate detailed reports for specific subjects and dates</li>
          <li>• <strong>Daily/Weekly Summaries:</strong> Automatically sent to users based on their preferences</li>
          <li>• All emails are tracked in the email history for monitoring and audit purposes</li>
        </ul>
      </div>
    </div>
  );
};

export default SendEmailForm; 
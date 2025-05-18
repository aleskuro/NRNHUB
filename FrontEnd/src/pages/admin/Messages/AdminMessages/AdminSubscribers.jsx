import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Copy } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const fetchSubscribers = async () => {
    try {
      console.log('Fetching subscribers from:', `${API_URL}/api/subscribers`);
      const response = await axios.get(`${API_URL}/api/subscribers`, {
        timeout: 5000, // 5s timeout
      });
      console.log('Subscribers response:', response.data);
      setSubscribers(response.data);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      const errorMessage =
        err.code === 'ERR_NETWORK'
          ? 'Cannot connect to backend. Please ensure the server is running.'
          : err.response?.data?.message || 'Failed to load subscribers.';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);

      if (retryCount < maxRetries && err.code === 'ERR_NETWORK') {
        setTimeout(() => {
          setRetryCount(retryCount + 1);
          console.log(`Retrying fetch subscribers (attempt ${retryCount + 2})...`);
          fetchSubscribers();
        }, 2000 * (retryCount + 1));
      }
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const copyAllEmails = () => {
    if (subscribers.length === 0) {
      toast.warn('No subscribers to copy.');
      return;
    }
    const emails = subscribers.map((sub) => sub.email).join(', ');
    navigator.clipboard
      .writeText(emails)
      .then(() => {
        toast.success('All emails copied to clipboard!');
      })
      .catch((err) => {
        console.error('Error copying emails:', err);
        toast.error('Failed to copy emails.');
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#E6F0FA] to-[#F3E8FF] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#883FFF] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading subscribers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#E6F0FA] to-[#F3E8FF] flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-lg">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-[#883FFF] text-white rounded-lg hover:bg-[#7623EA] transition-colors"
            onClick={() => {
              setLoading(true);
              setError(null);
              setRetryCount(0);
              fetchSubscribers();
            }}
            aria-label="Retry fetching subscribers"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E6F0FA] to-[#F3E8FF] py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Newsletter Subscribers</h2>
            {subscribers.length > 0 && (
              <button
                onClick={copyAllEmails}
                className="flex items-center px-4 py-2 bg-[#883FFF] text-white rounded-lg hover:bg-[#7623EA] transition-colors"
                aria-label="Copy all subscriber emails"
              >
                <Copy size={18} className="mr-2" aria-hidden="true" />
                Copy All Emails
              </button>
            )}
          </div>
          {subscribers.length === 0 ? (
            <div className="text-center text-gray-600 py-8">
              <p>No subscribers yet. Encourage users to join your newsletter!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="p-4 font-semibold">Email</th>
                    <th className="p-4 font-semibold">Subscribed At</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr
                      key={subscriber._id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">{subscriber.email}</td>
                      <td className="p-4">
                        {new Date(subscriber.subscribedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSubscribers;
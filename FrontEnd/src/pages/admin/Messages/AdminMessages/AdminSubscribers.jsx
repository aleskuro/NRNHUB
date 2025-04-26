import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Copy } from 'lucide-react';

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/subscribers');
        setSubscribers(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching subscribers:', err);
        setError(err.response?.data?.message || 'Failed to load subscribers. Please try again.');
        setLoading(false);
      }
    };

    fetchSubscribers();
  }, []);

  const copyAllEmails = () => {
    const emails = subscribers.map((sub) => sub.email).join(', ');
    navigator.clipboard.writeText(emails)
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
          <p>{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-[#883FFF] text-white rounded-lg hover:bg-[#7623EA]"
            onClick={() => window.location.reload()}
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
              >
                <Copy size={18} className="mr-2" />
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
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="p-4 font-semibold">Email</th>
                    <th className="p-4 font-semibold">Subscribed At</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber._id} className="border-b hover:bg-gray-50">
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
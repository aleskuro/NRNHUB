import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Event ID:', id); // Log ID for debugging
    const fetchDetails = async () => {
      try {
        // Validate ID length and type
        if (!id || typeof id !== 'string' || id.length !== 24) {
          throw new Error('Invalid event ID format');
        }
        const response = await axios.get(`http://localhost:5000/api/events/${id}/details`);
        console.log('API Response:', response.data); // Log response
        setDetails(response.data.registrationDetails);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event details:', error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to load event details. Please try again.';
        setError(errorMessage);
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const copyEmailsToClipboard = () => {
    if (!details || details.registeredUsers.length === 0) {
      toast.info('No registered users to copy');
      return;
    }
    const emails = details.registeredUsers.map((reg) => reg.email).join(', ');
    navigator.clipboard.writeText(emails).then(
      () => toast.success('Emails copied to clipboard!'),
      () => toast.error('Failed to copy emails')
    );
  };

  if (loading) return <div className="text-center py-8 font-Nunito">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-600 font-Nunito">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8 font-Montserrat">
      <h2 className="text-2xl font-bold mb-6 font-PlayfairDisplay text-indigo-800">
        Registration Details for {details.title}
      </h2>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600 mb-4 font-Nunito">
          <strong>Total Registered:</strong> {details.registeredUsers.length}{' '}
          {details.registeredUsers.length === 1 ? 'person' : 'people'}
        </p>
        <button
          onClick={copyEmailsToClipboard}
          className="mb-6 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500 font-Rubik"
        >
          Copy All Emails
        </button>
        {details.registeredUsers.length === 0 ? (
          <p className="text-gray-600 font-Nunito">No users registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="border px-4 py-2 text-left font-Nunito">Name</th>
                  <th className="border px-4 py-2 text-left font-Nunito">Email</th>
                  <th className="border px-4 py-2 text-left font-Nunito">Gender</th>
                  <th className="border px-4 py-2 text-left font-Nunito">Age</th>
                  <th className="border px-4 py-2 text-left font-Nunito">Registered At</th>
                  <th className="border px-4 py-2 text-left font-Nunito">Reference ID</th>
                </tr>
              </thead>
              <tbody>
                {details.registeredUsers.map((reg, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2 font-OpenSans">{reg.name || 'N/A'}</td>
                    <td className="border px-4 py-2 font-OpenSans">{reg.email}</td>
                    <td className="border px-4 py-2 font-OpenSans">{reg.gender || 'N/A'}</td>
                    <td className="border px-4 py-2 font-OpenSans">{reg.age || 'N/A'}</td>
                    <td className="border px-4 py-2 font-OpenSans">
                      {new Date(reg.registeredAt).toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 font-OpenSans">{reg.referenceId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button
          onClick={() => navigate('/dashboard/Form-data')}
          className="mt-6 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-400 font-Rubik"
        >
          Back to Events
        </button>
      </div>
    </div>
  );
};

export default EventDetails;
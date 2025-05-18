import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// Backend base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

const AdminAdvertisers = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const apiUrl = `${API_URL}/api/ads/inquiries`;
        console.log(`Fetching inquiries from: ${apiUrl}`);

        // Assuming JWT token is stored in localStorage or another mechanism
        const token = localStorage.getItem('token'); // Adjust based on your auth setup

        const res = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Include JWT token
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Server responded with ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log('Fetched inquiries:', data);
        setInquiries(data);
      } catch (err) {
        console.error('Error fetching inquiries:', err);
        setError(err.message);
        toast.error(`Failed to load inquiries: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  return (
    <section className="container mx-auto py-10 px-4 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-6">
          Ad Inquiry Messages
        </h1>
        <p className="text-sm md:text-base text-gray-600 text-center mb-8">
          View the latest advertising inquiries submitted to{' '}
          <span className="text-[#883FFF]" style={{ fontFamily: '"Luxurious Roman", serif' }}>
            NRN
          </span>
          <span className="text-[#883FFF]" style={{ fontFamily: '"Luxurious Roman", serif' }}>
            HUB
          </span>.
        </p>

        {loading && (
          <div className="text-center text-gray-600">Loading inquiries...</div>
        )}

        {error && (
          <div className="text-center text-[#883FFF]">
            Error: {error}
          </div>
        )}

        {!loading && !error && inquiries.length === 0 && (
          <div className="text-center text-gray-600">
            No inquiries found.
          </div>
        )}

        {!loading && !error && inquiries.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-800">
                <thead className="text-xs uppercase bg-gray-100">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Ad Type</th>
                    <th className="px-4 py-3">Message</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inquiry) => (
                    <tr
                      key={inquiry._id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{inquiry.name}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${inquiry.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {inquiry.email}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        {inquiry.company || 'N/A'}
                      </td>
                      <td className="px-4 py-3">{inquiry.adType}</td>
                      <td className="px-4 py-3">
                        {inquiry.message || 'No message'}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminAdvertisers;
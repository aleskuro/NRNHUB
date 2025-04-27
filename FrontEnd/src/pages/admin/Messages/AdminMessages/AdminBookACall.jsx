import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AdminBookACall = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const apiUrl = `${window.location.origin}/api/calls/bookings`;
        console.log(`Fetching bookings from: ${apiUrl}`);

        const res = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Server responded with ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log('Fetched bookings:', data);
        setBookings(data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err.message);
        toast.error(`Failed to load bookings: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <section className="container mx-auto py-10 px-4 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-6">
          Booked Calls
        </h1>
        <p className="text-sm md:text-base text-gray-600 text-center mb-8">
          View the latest call bookings submitted to{' '}
          <span className="text-[#883FFF]" style={{ fontFamily: '"Luxurious Roman", serif' }}>
            NRNHUB
          </span>.
        </p>

        {loading && (
          <div className="text-center text-gray-600">Loading bookings...</div>
        )}

        {error && (
          <div className="text-center text-red-500">
            Error: {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="text-center text-gray-600">
            No bookings found.
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-800">
                <thead className="text-xs uppercase bg-gray-100">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Date & Time</th>
                    <th className="px-4 py-3">Message</th>
                    <th className="px-4 py-3">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{booking.name}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${booking.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {booking.email}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        {booking.phone || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(booking.dateTime).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {booking.message || 'No message'}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(booking.createdAt).toLocaleDateString()}
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

export default AdminBookACall;
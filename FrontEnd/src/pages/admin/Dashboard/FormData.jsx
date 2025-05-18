import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import noImage from '../../../assets/images.png';

// Backend base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

const FormData = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/events`);
        setEvents(response.data.events);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events. Please try again later.');
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const formatDateInNepalTime = (date, timeZone = 'Asia/Kathmandu') => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone,
    };
    return new Date(date).toLocaleString('en-US', options);
  };

  const toggleDropdown = (eventId) => {
    setOpenDropdown(openDropdown === eventId ? null : eventId);
  };

  const copyEmailsToClipboard = (registeredUsers) => {
    if (registeredUsers.length === 0) {
      toast.info('No registered users to copy');
      return;
    }
    const emails = registeredUsers.map((user) => user.email).join(', ');
    navigator.clipboard.writeText(emails).then(
      () => toast.success('Emails copied to clipboard!'),
      () => toast.error('Failed to copy emails')
    );
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8 font-Montserrat">
      <h2 className="text-2xl font-bold mb-6 font-PlayfairDisplay text-indigo-800">Upcoming Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <p className="text-gray-600 font-Nunito">No events available.</p>
        ) : (
          events.map((event) => (
            <div key={event._id} className="border rounded-lg shadow p-4 bg-white">
              <img
                src={event.image || noImage}
                alt={event.title}
                onError={(e) => (e.target.src = noImage)}
                className="w-full h-48 object-cover rounded mb-4"
              />
              <h3 className="text-xl font-semibold font-Merriweather text-indigo-800">{event.title}</h3>
              <p className="text-gray-600 font-Nunito">
                <strong>Date:</strong> {formatDateInNepalTime(event.date, event.timeZone)}
              </p>
              <p className="text-gray-600 font-Nunito">
                <strong>Location:</strong> {event.location}
              </p>
              <p
                className="text-gray-700 mt-2 font-Nunito"
                dangerouslySetInnerHTML={{
                  __html: event.description.slice(0, 100) + '...',
                }}
              />
              <p className="text-gray-600 font-Nunito mt-2">
                <strong>Registered:</strong> {event.registeredUsers.length}{' '}
                {event.registeredUsers.length === 1 ? 'person' : 'people'}
              </p>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => toggleDropdown(event._id)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500 font-Rubik"
                >
                  {openDropdown === event._id ? 'Hide Registrations' : 'Show Registrations'}
                </button>
                <button
                  onClick={() => copyEmailsToClipboard(event.registeredUsers)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 font-Rubik"
                >
                  Copy All Emails
                </button>
              </div>
              <Link
                to={`/dashboard/events/${event._id}/details`}
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 font-Rubik"
              >
                View Registration Details
              </Link>
              {openDropdown === event._id && (
                <div className="mt-4">
                  {event.registeredUsers.length === 0 ? (
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
                          {event.registeredUsers.map((user, index) => (
                            <tr key={index}>
                              <td className="border px-4 py-2 font-OpenSans">{user.name || 'N/A'}</td>
                              <td className="border px-4 py-2 font-OpenSans">{user.email}</td>
                              <td className="border px-4 py-2 font-OpenSans">{user.gender || 'N/A'}</td>
                              <td className="border px-4 py-2 font-OpenSans">{user.age || 'N/A'}</td>
                              <td className="border px-4 py-2 font-OpenSans">
                                {new Date(user.registeredAt).toLocaleString()}
                              </td>
                              <td className="border px-4 py-2 font-OpenSans">{user.referenceId}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FormData;
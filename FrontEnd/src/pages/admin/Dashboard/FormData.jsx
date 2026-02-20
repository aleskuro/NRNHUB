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
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

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
      () => toast.success('📧 Emails copied to clipboard!'),
      () => toast.error('Failed to copy emails')
    );
  };

  const handleDeleteEvent = async (eventId) => {
    if (deleteConfirm !== eventId) {
      setDeleteConfirm(eventId);
      return;
    }

    setIsDeleting(true);
    try {
      console.log('Sending DELETE request for event:', eventId);
      await axios.delete(`${API_URL}/api/events/${eventId}`);
      setEvents(events.filter((event) => event._id !== eventId));
      setDeleteConfirm(null);
      toast.success('🗑️ Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      const message =
        error.response?.status === 404
          ? 'Event not found'
          : error.response?.data?.message || 'Failed to delete event';
      toast.error(message);
      setDeleteConfirm(null); // Reset confirmation on error
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-4 text-lg font-Nunito text-gray-600">Loading events...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-Nunito mb-4">{error}</div>
        <button
          onClick={fetchEvents}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 font-Montserrat">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold font-PlayfairDisplay text-indigo-800">Manage Events</h2>
        <Link
          to="/dashboard/events/create"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 font-Rubik"
        >
          + Create New Event
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <p className="text-xl text-gray-600 font-Nunito mb-4">No events created yet</p>
            <Link
              to="/dashboard/events/create"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-Rubik"
            >
              Create Your First Event
            </Link>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative">
                <img
                  src={event.image || noImage}
                  alt={event.title}
                  onError={(e) => (e.target.src = noImage)}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    disabled={isDeleting && deleteConfirm === event._id}
                    className={`p-2 rounded-full transition-all shadow-lg ${
                      deleteConfirm === event._id
                        ? 'bg-red-700 text-white scale-110'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                    title={deleteConfirm === event._id ? 'Click again to confirm' : 'Delete Event'}
                  >
                    {isDeleting && deleteConfirm === event._id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {deleteConfirm === event._id && (
                  <div className="absolute inset-0 bg-red-600 bg-opacity-90 flex items-center justify-center">
                    <div className="text-white text-center p-4">
                      <p className="font-bold mb-2">Delete this event?</p>
                      <p className="text-sm mb-4">This action cannot be undone</p>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          disabled={isDeleting}
                          className="bg-red-700 text-white px-3 py-1 rounded hover:bg-red-800 text-sm"
                        >
                          {isDeleting ? 'Deleting...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold font-Merriweather text-indigo-800 mb-3">{event.title}</h3>
                <div className="space-y-2 mb-4">
                  <p className="text-gray-600 font-Nunito flex items-center">
                    <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <strong>Date:</strong> {formatDateInNepalTime(event.date, event.timeZone)}
                  </p>
                  <p className="text-gray-600 font-Nunito flex items-center">
                    <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <strong>Location:</strong> {event.location}
                  </p>
                  <p className="text-gray-600 font-Nunito flex items-center">
                    <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <strong>Registered:</strong> {event.registeredUsers.length}{' '}
                    {event.registeredUsers.length === 1 ? 'person' : 'people'}
                  </p>
                </div>

                <p
                  className="text-gray-700 mb-4 font-Nunito text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: event.description.slice(0, 100) + (event.description.length > 100 ? '...' : ''),
                  }}
                />

                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => toggleDropdown(event._id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-Rubik text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    {openDropdown === event._id ? 'Hide' : 'Show'} Registrations
                  </button>

                  <button
                    onClick={() => copyEmailsToClipboard(event.registeredUsers)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-Rubik text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy Emails
                  </button>
                </div>

                <Link
                  to={`/dashboard/events/${event._id}/details`}
                  className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-Rubik text-sm"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  View Details
                </Link>

                {openDropdown === event._id && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4 animate-slide-down">
                    {event.registeredUsers.length === 0 ? (
                      <p className="text-gray-600 font-Nunito text-center py-4">No users registered yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left font-Nunito text-sm font-medium text-gray-700">Name</th>
                              <th className="px-4 py-2 text-left font-Nunito text-sm font-medium text-gray-700">Email</th>
                              <th className="px-4 py-2 text-left font-Nunito text-sm font-medium text-gray-700">Gender</th>
                              <th className="px-4 py-2 text-left font-Nunito text-sm font-medium text-gray-700">Age</th>
                              <th className="px-4 py-2 text-left font-Nunito text-sm font-medium text-gray-700">Registered</th>
                              <th className="px-4 py-2 text-left font-Nunito text-sm font-medium text-gray-700">Ref ID</th>
                            </tr>
                          </thead>
                          <tbody>
                            {event.registeredUsers.map((user, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="px-4 py-2 font-OpenSans text-sm">{user.name || 'N/A'}</td>
                                <td className="px-4 py-2 font-OpenSans text-sm">{user.email}</td>
                                <td className="px-4 py-2 font-OpenSans text-sm">{user.gender || 'N/A'}</td>
                                <td className="px-4 py-2 font-OpenSans text-sm">{user.age || 'N/A'}</td>
                                <td className="px-4 py-2 font-OpenSans text-sm">
                                  {new Date(user.registeredAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 font-OpenSans text-sm font-mono">{user.referenceId}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FormData;
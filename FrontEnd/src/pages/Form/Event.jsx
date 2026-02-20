import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, ArrowRight, X, User, Mail, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

const Event = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailView, setDetailView] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    age: '',
  });
  const [activeTab, setActiveTab] = useState('upcoming');
  const [submitting, setSubmitting] = useState(false);

  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/events`);
        setEvents(response.data.events || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch events', {
          position: 'top-right',
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open detail view
  const openDetailView = (event) => {
    setDetailView(event);
  };

  // Close detail view
  const closeDetailView = () => {
    setDetailView(null);
  };

  // Open modal
  const openModal = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
    setFormData({
      name: '',
      email: '',
      gender: '',
      age: '',
    });
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
    setSubmitting(false);
  };

  // Check if user is already registered for a specific event
  const isUserRegistered = (event, email) => {
    if (!email) return false;
    return event.registeredUsers.some(
      (reg) => reg.email.toLowerCase() === email.toLowerCase()
    );
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const { name, email, gender, age } = formData;

    // Client-side validation
    if (!name || !email || !gender || !age) {
      toast.error('Please fill all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      toast.error('Age must be between 1 and 120');
      return;
    }

    // Check if already registered
    if (isUserRegistered(selectedEvent, email)) {
      toast.error('You are already registered for this event');
      return;
    }

    try {
      setSubmitting(true);

      const payload = { name, email: email.toLowerCase(), gender, age: ageNum };

      const response = await axios.post(
        `${API_URL}/api/events/${selectedEvent._id}/register`,
        payload
      );

      if (selectedEvent.isInHouse) {
        toast.success(response.data.message || 'Successfully registered!', {
          position: 'top-right',
          autoClose: 3000,
        });

        // Update local state with the new registration
        const newReg = {
          name,
          email: email.toLowerCase(),
          gender,
          age: ageNum,
          registeredAt: new Date(),
          referenceId: response.data.registration?.referenceId || `REF-${Date.now()}`,
        };

        setEvents((prev) =>
          prev.map((ev) =>
            ev._id === selectedEvent._id
              ? { ...ev, registeredUsers: [...ev.registeredUsers, newReg] }
              : ev
          )
        );

        closeModal();
      } else {
        // For external events, redirect to organizer link
        window.location.href = response.data.organizerLink;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Format date in Nepal time
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

  // Check if event is past
  const isPastEvent = (eventDate) => new Date(eventDate) < new Date();

  // Filter events
  const filteredEvents = events.filter((event) =>
    activeTab === 'upcoming' ? !isPastEvent(event.date) : isPastEvent(event.date)
  );

  // Time status badge
  const getTimeStatus = (eventDate) => {
    const now = new Date();
    const eventTime = new Date(eventDate);
    const diffInDays = Math.floor((eventTime - now) / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) return { text: 'Past Event', color: 'bg-gray-500' };
    if (diffInDays === 0) return { text: 'Today!', color: 'bg-green-500' };
    if (diffInDays <= 3) return { text: 'Coming Soon!', color: 'bg-yellow-500' };
    return { text: 'Upcoming', color: 'bg-blue-500' };
  };

  // Skeleton
  const EventSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/6 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
      </div>
    </div>
  );

  // Detail View Component
  if (detailView) {
    const timeStatus = getTimeStatus(detailView.date);
    
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen py-12 px-4 font-sans">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={closeDetailView}
            className="mb-6 flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Events
          </button>

          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="relative">
              <div
                className={`absolute top-6 right-6 ${timeStatus.color} text-white text-sm font-medium py-2 px-4 rounded-full z-10`}
              >
                {timeStatus.text}
              </div>
              <img
                src={detailView.image || '/api/placeholder/800/600'}
                alt={detailView.title}
                className="w-full h-96 object-cover"
              />
            </div>

            <div className="p-8">
              <h1 className="text-4xl font-bold mb-6 text-gray-800">{detailView.title}</h1>

              <div className="grid md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-start">
                  <Calendar size={24} className="mr-3 text-indigo-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                    <p className="text-gray-800 font-medium">
                      {formatDateInNepalTime(detailView.date, detailView.timeZone)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin size={24} className="mr-3 text-indigo-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="text-gray-800 font-medium">{detailView.location}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users size={24} className="mr-3 text-indigo-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Attendees</p>
                    <p className="text-gray-800 font-medium">
                      {detailView.registeredUsers.length}{' '}
                      {detailView.registeredUsers.length === 1 ? 'person' : 'people'} registered
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">About This Event</h2>
                <div
                  className="text-gray-600 leading-relaxed prose prose-indigo max-w-none"
                  dangerouslySetInnerHTML={{ __html: detailView.description }}
                />
              </div>

              {!isPastEvent(detailView.date) && (
                <button
                  onClick={() => {
                    closeDetailView();
                    openModal(detailView);
                  }}
                  className="w-full py-4 px-6 font-medium text-lg rounded-lg flex items-center justify-center transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90"
                >
                  Register for This Event <ArrowRight size={20} className="ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen py-12 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Join us for exciting opportunities to learn, connect, and grow with our community.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-1 shadow-md inline-flex">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === 'upcoming'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming Events
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === 'past'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Past Events
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <EventSkeleton key={i} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No {activeTab} events found
            </h3>
            <p className="text-gray-500">
              {activeTab === 'upcoming'
                ? 'Stay tuned! New events will be added soon.'
                : 'Check back later for our event history.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => {
              const timeStatus = getTimeStatus(event.date);
              const registered = isUserRegistered(event, formData.email);

              return (
                <div
                  key={event._id}
                  onClick={() => openDetailView(event)}
                  className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                >
                  <div className="relative">
                    <div
                      className={`absolute top-4 right-4 ${timeStatus.color} text-white text-sm font-medium py-1 px-3 rounded-full`}
                    >
                      {timeStatus.text}
                    </div>
                    <img
                      src={event.image || '/api/placeholder/800/600'}
                      alt={event.title}
                      className="w-full h-56 object-cover"
                    />
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">{event.title}</h3>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={18} className="mr-2 text-indigo-500" />
                        <span className="text-sm">{formatDateInNepalTime(event.date, event.timeZone)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin size={18} className="mr-2 text-indigo-500" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users size={18} className="mr-2 text-indigo-500" />
                        <span className="text-sm">
                          {event.registeredUsers.length}{' '}
                          {event.registeredUsers.length === 1 ? 'person' : 'people'} registered
                        </span>
                      </div>
                    </div>

                    <div
                      className="text-gray-600 text-sm mb-6 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: event.description }}
                    />

                    {!isPastEvent(event.date) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(event);
                        }}
                        className="w-full py-3 px-4 font-medium rounded-lg flex items-center justify-center transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90"
                      >
                        Register Now <ArrowRight size={18} className="ml-2" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {modalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white hover:text-gray-200"
              >
                <X size={20} />
              </button>
              <h3 className="text-2xl font-bold">Register for Event</h3>
              <p className="text-purple-100 mt-1">{selectedEvent.title}</p>
            </div>

            <form onSubmit={handleRegister} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 w-full rounded-lg border border-gray-300 bg-gray-50 py-3 px-4 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 w-full rounded-lg border border-gray-300 bg-gray-50 py-3 px-4 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 px-4 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 px-4 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="25"
                    min="1"
                    max="120"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 px-4 font-medium rounded-lg flex items-center justify-center transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  submitting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90'
                }`}
              >
                {submitting ? 'Registering...' : 'Complete Registration'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Event;
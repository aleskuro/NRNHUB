import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Mail, Users, ArrowRight, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Event = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    age: '',
  });
  const [activeTab, setActiveTab] = useState('upcoming');

  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/events');
        setEvents(response.data.events);
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open registration modal
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
  };

  // Handle registration submission
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { name, email, gender, age } = formData;
      if (!name || !email || !gender || !age) {
        toast.error('Please fill all fields', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error('Please enter a valid email', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }
      
      if (isNaN(age) || age < 1 || age > 120) {
        toast.error('Please enter a valid age', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/events/${selectedEvent._id}/register`,
        { name, email, gender, age }
      );

      if (selectedEvent.isInHouse) {
        toast.success(response.data.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        
        // Update event to reflect new registration
        setEvents((prev) =>
          prev.map((ev) =>
            ev._id === selectedEvent._id
              ? {
                  ...ev,
                  registeredUsers: [
                    ...ev.registeredUsers,
                    { name, email, gender, age, registeredAt: new Date() },
                  ],
                }
              : ev
          )
        );
        closeModal();
      } else {
        window.location.href = response.data.organizerLink;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register for event', {
        position: 'top-right',
        autoClose: 3000,
      });
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

  // Calculate if event is past
  const isPastEvent = (eventDate) => {
    return new Date(eventDate) < new Date();
  };

  // Filter events based on active tab
  const filteredEvents = events.filter(event => 
    activeTab === 'upcoming' ? !isPastEvent(event.date) : isPastEvent(event.date)
  );

  // Check if user is already registered
  const isUserRegistered = (event) => {
    return event.registeredUsers.some((reg) => reg.email === formData.email);
  };

  // Loading skeleton
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

  const getTimeStatus = (eventDate) => {
    const now = new Date();
    const eventTime = new Date(eventDate);
    const diffInDays = Math.floor((eventTime - now) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) {
      return { text: 'Past Event', color: 'bg-gray-500' };
    } else if (diffInDays === 0) {
      return { text: 'Today!', color: 'bg-green-500' };
    } else if (diffInDays <= 3) {
      return { text: 'Coming Soon!', color: 'bg-yellow-500' };
    } else {
      return { text: 'Upcoming', color: 'bg-blue-500' };
    }
  };

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
            {[1, 2, 3].map((item) => (
              <EventSkeleton key={item} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No {activeTab} events found</h3>
            <p className="text-gray-500">
              {activeTab === 'upcoming'
                ? "Stay tuned! New events will be added soon."
                : "Check back later for our event history."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => {
              const timeStatus = getTimeStatus(event.date);
              
              return (
                <div 
                  key={event._id} 
                  className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="relative">
                    <div className={`absolute top-4 right-4 ${timeStatus.color} text-white text-sm font-medium py-1 px-3 rounded-full`}>
                      {timeStatus.text}
                    </div>
                    <img
                      src={event.image || "/api/placeholder/800/600"}
                      alt={event.title}
                      className="w-full h-56 object-cover"
                    />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={18} className="mr-2 text-indigo-500" />
                        <span>{formatDateInNepalTime(event.date, event.timeZone)}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <MapPin size={18} className="mr-2 text-indigo-500" />
                        <span>{event.location}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Users size={18} className="mr-2 text-indigo-500" />
                        <span>
                          {event.registeredUsers.length}{' '}
                          {event.registeredUsers.length === 1 ? 'person' : 'people'} registered
                        </span>
                      </div>
                    </div>
                    
                    <div
                      className="text-gray-600 text-sm mb-6 line-clamp-3"
                      dangerouslySetInnerHTML={{
                        __html: event.description
                      }}
                    />
                    
                    {!isPastEvent(event.date) && (
                      <button
                        onClick={() => openModal(event)}
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg flex items-center justify-center transition-all duration-300 hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={isUserRegistered(event)}
                      >
                        {isUserRegistered(event) ? (
                          'Already Registered'
                        ) : (
                          <>
                            Register Now <ArrowRight size={18} className="ml-2" />
                          </>
                        )}
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
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-0 w-full max-w-md overflow-hidden animate-fadeIn shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 relative">
              <button 
                onClick={closeModal} 
                className="absolute top-4 right-4 text-white hover:text-gray-200 focus:outline-none"
              >
                <X size={20} />
              </button>
              <h3 className="text-2xl font-bold">
                Register for Event
              </h3>
              <p className="text-purple-100 mt-1">
                {selectedEvent?.title}
              </p>
            </div>
            
            <form onSubmit={handleRegister} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-gray-400" />
                    </div>
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
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={16} className="text-gray-400" />
                    </div>
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
                
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg flex items-center justify-center transition-all duration-300 hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Complete Registration
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Event;
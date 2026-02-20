import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

// Backend base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

const EditEventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    timeZone: 'Asia/Kathmandu',
    location: '',
    description: '',
    isInHouse: true,
    organizerLink: '',
    image: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Common time zones for dropdown
  const timeZones = [
    'Asia/Kathmandu',
    'UTC',
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (!id || typeof id !== 'string' || id.length !== 24) {
          throw new Error('Invalid event ID format');
        }
        const response = await axios.get(`${API_URL}/api/events/${id}`);
        console.log('Fetched event:', response.data);
        const event = response.data.event;
        setFormData({
          title: event.title || '',
          date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
          timeZone: event.timeZone || 'Asia/Kathmandu',
          location: event.location || '',
          description: event.description || '',
          isInHouse: event.isInHouse,
          organizerLink: event.organizerLink || '',
          image: event.image || '',
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event:', error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to load event details. Please try again.';
        setError(errorMessage);
        setLoading(false);
        toast.error(errorMessage);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Client-side validation
      if (!formData.title || !formData.date || !formData.location || !formData.description) {
        toast.error('All required fields must be provided');
        return;
      }
      if (!formData.isInHouse && !formData.organizerLink) {
        toast.error('Organizer link is required for outhouse events');
        return;
      }
      const eventDate = new Date(formData.date);
      if (isNaN(eventDate.getTime())) {
        toast.error('Invalid date format');
        return;
      }

      const response = await axios.put(`${API_URL}/api/events/${id}`, formData);
      console.log('Event updated:', response.data);
      toast.success('Event updated successfully');
      navigate('/dashboard/Form-data');
    } catch (error) {
      console.error('Error updating event:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to update event';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const response = await axios.delete(`${API_URL}/api/events/${id}`);
      console.log('Event deleted:', response.data);
      toast.success('Event deleted successfully');
      navigate('/dashboard/Form-data');
    } catch (error) {
      console.error('Error deleting event:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to delete event';
      toast.error(errorMessage);
    }
  };

  if (loading) return <div className="text-center py-8 font-Nunito">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-600 font-Nunito">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8 font-Montserrat">
      <h2 className="text-2xl font-bold mb-6 font-PlayfairDisplay text-indigo-800">
        Edit Event: {formData.title}
      </h2>
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 font-Nunito">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 font-OpenSans"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-Nunito">Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 font-OpenSans"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-Nunito">Time Zone</label>
            <select
              name="timeZone"
              value={formData.timeZone}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 font-OpenSans"
            >
              {timeZones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-Nunito">Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 font-OpenSans"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-Nunito">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 font-OpenSans"
              rows="4"
              required
            />
          </div>
          <div>
            <label className="flex items-center space-x-2 font-Nunito">
              <input
                type="checkbox"
                name="isInHouse"
                checked={formData.isInHouse}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">In-House Event</span>
            </label>
          </div>
          {!formData.isInHouse && (
            <div>
              <label className="block text-sm font-medium text-gray-700 font-Nunito">
                Organizer Link *
              </label>
              <input
                type="url"
                name="organizerLink"
                value={formData.organizerLink}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 font-OpenSans"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-Nunito">Image URL (Optional)</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 font-OpenSans"
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500 font-Rubik"
            >
              Update Event
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 font-Rubik"
            >
              Delete Event
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/Form-data')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-400 font-Rubik"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventForm;
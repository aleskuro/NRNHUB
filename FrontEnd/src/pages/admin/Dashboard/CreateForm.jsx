import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Backend base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

const CreateForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    date: '',
    timeZone: '',
    location: '',
    description: '',
    isInHouse: true,
    organizerLink: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleQuillChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.image && !formData.image.match(/\.(jpeg|jpg|png|gif)$/i)) {
      toast.error('Image URL must be a valid image (jpeg, jpg, png, gif)');
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/events/create`, formData);
      toast.success('Event created successfully');
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 font-Montserrat">
      <h2 className="text-2xl font-bold mb-6 font-PlayfairDisplay text-indigo-800">Create New Event</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 font-Nunito">Event Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm font-OpenSans"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 font-Nunito">Image URL</label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm font-OpenSans"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 font-Nunito">Date and Time</label>
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm font-OpenSans"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 font-Nunito">Time Zone</label>
          <input
            type="text"
            name="timeZone"
            value={formData.timeZone}
            onChange={handleChange}
            placeholder="e.g., Asia/Kathmandu"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm font-OpenSans"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 font-Nunito">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm font-OpenSans"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 font-Nunito">Description</label>
          <ReactQuill
            value={formData.description}
            onChange={handleQuillChange}
            className="mt-1 bg-white font-OpenSans"
            modules={{ toolbar: [['bold', 'italic'], ['link'], [{ list: 'ordered' }, { list: 'bullet' }]] }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 font-Nunito">In-House Event</label>
          <input
            type="checkbox"
            name="isInHouse"
            checked={formData.isInHouse}
            onChange={handleChange}
            className="mt-1 font-OpenSans"
          />
        </div>
        {!formData.isInHouse && (
          <div>
            <label className="block text-sm font-medium text-gray-700 font-Nunito">Organizer Link</label>
            <input
              type="text"
              name="organizerLink"
              value={formData.organizerLink}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm font-OpenSans"
              required={!formData.isInHouse}
            />
          </div>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500 font-Rubik disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default CreateForm;
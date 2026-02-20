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
  const [showSuccess, setShowSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [focusedField, setFocusedField] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'image') {
      setImagePreview(value);
      if (fieldErrors.image) {
        setFieldErrors((prev) => ({ ...prev, image: '' }));
      }
    } else if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleQuillChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value }));
    if (fieldErrors.description) {
      setFieldErrors((prev) => ({ ...prev, description: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Event title is required';
    }

    if (!formData.date) {
      errors.date = 'Event date is required';
    }

    if (!formData.location.trim()) {
      errors.location = 'Event location is required';
    }

    if (!formData.description.trim() || formData.description === '<p><br></p>') {
      errors.description = 'Event description is required';
    }

    if (!formData.isInHouse && !formData.organizerLink.trim()) {
      errors.organizerLink = 'Organizer link is required for external events';
    }

    // Basic URL format check for image (optional field)
    if (formData.image && !formData.image.match(/^https?:\/\/.+/i)) {
      errors.image = 'Image URL must be a valid URL starting with http:// or https://';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Object.keys(fieldErrors).forEach((field) => {
        const element = document.querySelector(`[name="${field}"]`) || document.querySelector(`#${field}`);
        if (element) {
          element.classList.add('animate-shake');
          setTimeout(() => element.classList.remove('animate-shake'), 500);
        }
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate image URL by checking content-type
      if (formData.image) {
        try {
          const response = await fetch(formData.image, { method: 'HEAD' });
          const contentType = response.headers.get('content-type');
          const urlParams = new URLSearchParams(formData.image.split('?')[1] || '');
          const format = urlParams.get('fm')?.toLowerCase();
          const validFormats = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg'];

          if (
            !contentType?.startsWith('image/') &&
            !(format && validFormats.includes(format))
          ) {
            setFieldErrors((prev) => ({ ...prev, image: 'URL does not point to a valid image' }));
            setIsSubmitting(false);
            return;
          }
        } catch (fetchError) {
          // Fallback to query parameter check if fetch fails (e.g., CORS)
          const urlParams = new URLSearchParams(formData.image.split('?')[1] || '');
          const format = urlParams.get('fm')?.toLowerCase();
          if (!format || !['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg'].includes(format)) {
            setFieldErrors((prev) => ({ ...prev, image: 'Unable to verify image URL' }));
            setIsSubmitting(false);
            return;
          }
        }
      }

      await axios.post(`${API_URL}/api/events/create`, formData);

      setShowSuccess(true);
      toast.success('🎉 Event created successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setTimeout(() => {
        navigate('/events');
      }, 2000);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error.response?.data?.message || 'Failed to create event', {
        position: 'top-right',
        autoClose: 5000,
      });

      document.querySelector('form').classList.add('animate-shake');
      setTimeout(() => document.querySelector('form').classList.remove('animate-shake'), 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const SuccessOverlay = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all duration-500 ${showSuccess ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white rounded-2xl p-8 text-center transform transition-all duration-500 ${showSuccess ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
        <div className="w-20 h-20 mx-auto mb-4 relative">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-10 h-10 text-green-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="absolute -top-2 -right-2">
            <div className="w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="w-6 h-6 bg-yellow-400 rounded-full absolute top-0"></div>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-green-600 mb-2 font-PlayfairDisplay">Success!</h3>
        <p className="text-gray-600 font-Nunito">Your event has been created successfully</p>
        <div className="mt-4">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium">
            <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Redirecting...
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="container mx-auto px-4 py-8 font-Montserrat">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 font-PlayfairDisplay text-indigo-800 text-center animate-fade-in">
            Create New Event
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-slide-up"
          >
            <div className="transform transition-all duration-300 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 font-Nunito mb-2">
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onFocus={() => setFocusedField('title')}
                onBlur={() => setFocusedField('')}
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 font-OpenSans ${
                  fieldErrors.title
                    ? 'border-red-300 bg-red-50'
                    : focusedField === 'title'
                    ? 'border-indigo-400 bg-indigo-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Enter an amazing event title..."
                required
              />
              {fieldErrors.title && (
                <p className="mt-2 text-sm text-red-600 animate-slide-down flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {fieldErrors.title}
                </p>
              )}
            </div>

            <div className="transform transition-all duration-300 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 font-Nunito mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                onFocus={() => setFocusedField('image')}
                onBlur={() => setFocusedField('')}
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 font-OpenSans ${
                  fieldErrors.image
                    ? 'border-red-300 bg-red-50'
                    : focusedField === 'image'
                    ? 'border-indigo-400 bg-indigo-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="https://example.com/image.jpg"
              />
              {fieldErrors.image && (
                <p className="mt-2 text-sm text-red-600 animate-slide-down flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {fieldErrors.image}
                </p>
              )}
              {imagePreview && !fieldErrors.image && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 font-Nunito mb-2">Image Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="max-w-full h-auto rounded-xl border-2 border-gray-200"
                    onError={() => {
                      setFieldErrors((prev) => ({ ...prev, image: 'Unable to load image from URL' }));
                      setImagePreview(null);
                    }}
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}
            </div>

            <div className="transform transition-all duration-300 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 font-Nunito mb-2">
                Date and Time *
              </label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                onFocus={() => setFocusedField('date')}
                onBlur={() => setFocusedField('')}
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 font-OpenSans ${
                  fieldErrors.date
                    ? 'border-red-300 bg-red-50'
                    : focusedField === 'date'
                    ? 'border-indigo-400 bg-indigo-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                required
              />
              {fieldErrors.date && (
                <p className="mt-2 text-sm text-red-600 animate-slide-down flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {fieldErrors.date}
                </p>
              )}
            </div>

            <div className="transform transition-all duration-300 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 font-Nunito mb-2">
                Time Zone
              </label>
              <select
                name="timeZone"
                value={formData.timeZone}
                onChange={handleChange}
                onFocus={() => setFocusedField('timeZone')}
                onBlur={() => setFocusedField('')}
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 font-OpenSans ${
                  focusedField === 'timeZone'
                    ? 'border-indigo-400 bg-indigo-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <option value="">Select timezone...</option>
                <option value="Asia/Kathmandu">Asia/Kathmandu</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
              </select>
            </div>

            <div className="transform transition-all duration-300 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 font-Nunito mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                onFocus={() => setFocusedField('location')}
                onBlur={() => setFocusedField('')}
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 font-OpenSans ${
                  fieldErrors.location
                    ? 'border-red-300 bg-red-50'
                    : focusedField === 'location'
                    ? 'border-indigo-400 bg-indigo-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Where will this amazing event take place?"
                required
              />
              {fieldErrors.location && (
                <p className="mt-2 text-sm text-red-600 animate-slide-down flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {fieldErrors.location}
                </p>
              )}
            </div>

            <div className="transform transition-all duration-300 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 font-Nunito mb-2">
                Description *
              </label>
              <div
                className={`rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                  fieldErrors.description
                    ? 'border-red-300'
                    : focusedField === 'description'
                    ? 'border-indigo-400 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ReactQuill
                  value={formData.description}
                  onChange={handleQuillChange}
                  onFocus={() => setFocusedField('description')}
                  onBlur={() => setFocusedField('')}
                  className="bg-white font-OpenSans"
                  modules={{
                    toolbar: [['bold', 'italic'], ['link'], [{ list: 'ordered' }, { list: 'bullet' }], ['clean']],
                  }}
                  placeholder="Tell us about this exciting event..."
                />
              </div>
              {fieldErrors.description && (
                <p className="mt-2 text-sm text-red-600 animate-slide-down flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {fieldErrors.description}
                </p>
              )}
            </div>

            <div className="transform transition-all duration-300 hover:scale-105">
              <div className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300">
                <input
                  type="checkbox"
                  name="isInHouse"
                  checked={formData.isInHouse}
                  onChange={handleChange}
                  className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2 transition-all duration-300"
                />
                <label className="ml-3 text-sm font-medium text-gray-700 font-Nunito">
                  This is an in-house event
                </label>
              </div>
            </div>

            {!formData.isInHouse && (
              <div className="transform transition-all duration-300 hover:scale-105 animate-slide-down">
                <label className="block text-sm font-medium text-gray-700 font-Nunito mb-2">
                  Organizer Link *
                </label>
                <input
                  type="url"
                  name="organizerLink"
                  value={formData.organizerLink}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('organizerLink')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 font-OpenSans ${
                    fieldErrors.organizerLink
                      ? 'border-red-300 bg-red-50'
                      : focusedField === 'organizerLink'
                      ? 'border-indigo-400 bg-indigo-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="https://organizer-website.com/register"
                  required
                />
                {fieldErrors.organizerLink && (
                  <p className="mt-2 text-sm text-red-600 animate-slide-down flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {fieldErrors.organizerLink}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 max-w-xs mx-auto px-8 py-4 rounded-xl font-semibold font-Rubik text-white transition-all duration-300 transform ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed scale-95'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl active:scale-95'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Event...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Event
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <SuccessOverlay />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

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

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default CreateForm;
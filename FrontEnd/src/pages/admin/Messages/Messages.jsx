import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaEnvelope, FaTag, FaComment, FaPaperPlane } from 'react-icons/fa';

const Messages = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors in the form', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      toast.success('Message sent successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(`Failed to send message: ${err.message}`, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-8 transform transition-all duration-500 hover:shadow-3xl">
        <h1 className="text-4xl font-bold text-[#883FFF] mb-6 text-center animate-fade-in-up">
          Contact Us
        </h1>
        <p className="text-gray-600 text-center mb-8 animate-fade-in-up animation-delay-200">
          We'd love to hear from you! Fill out the form below to get in touch.
        </p>
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Name */}
          <div className="relative animate-fade-in-up animation-delay-300">
            <label
              htmlFor="name"
              className="  text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
            >
              <FaUser className="text-[#883FFF]" /> Name (Optional)
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#883FFF] focus:border-transparent transition-all duration-300"
              placeholder="Your name"
              aria-label="Name"
            />
          </div>

          {/* Email */}
          <div className="relative animate-fade-in-up animation-delay-400">
            <label
              htmlFor="email"
              className="  text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
            >
              <FaEnvelope className="text-[#883FFF]" /> Email{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-[#883FFF] focus:border-transparent transition-all duration-300 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="your.email@example.com"
              required
              aria-label="Email"
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p
                id="email-error"
                className="text-red-500 text-sm mt-2 flex items-center gap-1 animate-fade-in"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          {/* Subject */}
          <div className="relative animate-fade-in-up animation-delay-500">
            <label
              htmlFor="subject"
              className="  text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
            >
              <FaTag className="text-[#883FFF]" /> Subject (Optional)
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#883FFF] focus:border-transparent transition-all duration-300"
              placeholder="Message subject"
              aria-label="Subject"
            />
          </div>

          {/* Message */}
          <div className="relative animate-fade-in-up animation-delay-600">
            <label
              htmlFor="message"
              className="  text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
            >
              <FaComment className="text-[#883FFF]" /> Message{' '}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-[#883FFF] focus:border-transparent transition-all duration-300 resize-y min-h-[120px] ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }`}
              rows="5"
              placeholder="Your message here..."
              required
              aria-label="Message"
              aria-describedby={errors.message ? 'message-error' : undefined}
            ></textarea>
            {errors.message && (
              <p
                id="message-error"
                className="text-red-500 text-sm mt-2 flex items-center gap-1 animate-fade-in"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                {errors.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 bg-gradient-to-r from-[#883FFF] to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-[#883FFF] transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            } animate-fade-in-up animation-delay-700`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <FaPaperPlane />
                Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Messages;
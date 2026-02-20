import React, { useState } from 'react';
import { CheckCircle, Send, User, Mail, Phone, MessageSquare, Loader2 } from 'lucide-react';

// Use environment variable
const API_BASE = import.meta.env.VITE_API_URL; // https://nrnhub.com.np

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Removed TypeScript annotation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    const { name, email, phone } = formData;

    if (!name.trim()) {
      setError('Please enter your name.');
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (phone.trim() && !/^[\d\+\-\(\)\s]+$/.test(phone)) {
      setError('Please enter a valid phone number.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      const apiUrl = `${API_BASE}/api/contacts`;
      console.log(`Submitting contact to: ${apiUrl}`, formData);

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseText = await res.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', responseText);
        throw new Error(`Server error: ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(data.message || `Server responded with ${res.status}`);
      }

      console.log('Submission response:', data);

      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit contact form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container mx-auto py-10 px-4 bg-white min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">
          Contact <span className="text-[#883FFF]">Us</span>
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-3 text-center">
          Get in touch with us! Fill out the form below, and we'll respond as soon as possible.
        </p>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-sm text-gray-800">Message Sent! We'll get back to you soon!</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 bg-white rounded-xl shadow-lg p-6 sm:p-8 flex flex-col gap-6"
        >
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-[#C4A1FF] focus:ring-2 focus:outline-none text-sm text-gray-800 pl-10"
                required
                disabled={submitting}
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#883FFF]" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-[#C4A1FF] focus:ring-2 focus:outline-none text-sm text-gray-800 pl-10"
                required
                disabled={submitting}
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#883FFF]" />
            </div>
          </div>

          {/* Phone (Optional) */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-800 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number (optional)"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-[#C4A1FF] focus:ring-2 focus:outline-none text-sm text-gray-800 pl-10"
                disabled={submitting}
              />
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#883FFF]" />
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-800 mb-1">
              Message (Optional)
            </label>
            <div className="relative">
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Any additional details or questions?"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-[#C4A1FF] focus:ring-2 focus:outline-none text-sm text-gray-800 resize-y pl-10"
                rows={4}
                disabled={submitting}
              />
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-[#883FFF]" />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center">
            <button
              type="submit"
              className={`bg-[#883FFF] hover:bg-[#b88aff] transition px-6 py-3 rounded-xl text-white text-sm font-medium shadow-md flex items-center gap-2 ${
                submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
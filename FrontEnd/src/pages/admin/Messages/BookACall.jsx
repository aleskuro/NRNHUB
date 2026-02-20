// src/components/BookACall.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const BookACall = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateTime: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, dateTime } = formData;

    if (!name.trim()) return toast.error('Please enter your name.');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return toast.error('Please enter a valid email.');
    if (!dateTime) return toast.error('Please select a date and time.');

    setSubmitting(true);

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/calls/bookings`;
      console.log('Submitting to:', apiUrl);

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`${res.status}: ${err}`);
      }

      const data = await res.json();
      console.log('Success:', data);

      toast.success('Call booked! We’ll contact you soon.');
      setFormData({ name: '', email: '', phone: '', dateTime: '', message: '' });
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(`Failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container mx-auto py-10 px-4 bg-gradient-to-b from-[#E6F0FA] to-white min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-[#883FFF] to-purple-600 bg-clip-text text-transparent">
          Book a Call with Us
        </h1>
        <p className="text-gray-600 mt-3 text-center">
          Schedule a call to discuss your needs. We’ll get back to you soon!
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#883FFF] focus:outline-none"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#883FFF] focus:outline-none"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Phone (Optional)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+977 98XXXXXXXX"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#883FFF] focus:outline-none"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Preferred Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="dateTime"
              value={formData.dateTime}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#883FFF] focus:outline-none"
              min={new Date().toISOString().slice(0, 16)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Message (Optional)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us more about your needs..."
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#883FFF] focus:outline-none resize-y"
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 rounded-xl font-medium text-white transition ${
              submitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#883FFF] hover:bg-[#7623EA] shadow-lg'
            }`}
          >
            {submitting ? 'Submitting...' : 'Schedule Call'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default BookACall;
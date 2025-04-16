import React, { useState } from 'react';

const BookACall = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateTime: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, dateTime } = formData;

    // Basic validation
    if (!name.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!dateTime) {
      alert('Please select a preferred date and time.');
      return;
    }

    // Placeholder submit action
    alert(
      `Call booked for ${name} on ${new Date(dateTime).toLocaleString()}.\nEmail: ${email}${
        formData.phone ? `\nPhone: ${phone}` : ''
      }${formData.message ? `\nMessage: ${message}` : ''}`
    );

    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      dateTime: '',
      message: '',
    });
  };

  return (
    <section className="container mx-auto py-10 px-4 bg-white min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">
          Book a Call with{' '}
          <span className="text-[#2260bf]" style={{ fontFamily: '"Luxurious Roman", serif' }}>
            NRN
          </span>
          <span className="text-red-500" style={{ fontFamily: '"Luxurious Roman", serif' }}>
            HUB
          </span>
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-3 text-center">
          Schedule a call to discuss your needs. Fill out the form below, and we’ll get back to you soon!
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 bg-white rounded-xl shadow-lg p-6 sm:p-8 flex flex-col gap-6"
        >
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-[#68bef8] focus:ring-2 focus:outline-none text-sm text-gray-800"
              required
              aria-required="true"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-[#68bef8] focus:ring-2 focus:outline-none text-sm text-gray-800"
              required
              aria-required="true"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-800 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number (optional)"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-[#68bef8] focus:ring-2 focus:outline-none text-sm text-gray-800"
              pattern="[0-9+()-]*"
            />
          </div>

          {/* Preferred Date/Time */}
          <div>
            <label htmlFor="dateTime" className="block text-sm font-medium text-gray-800 mb-1">
              Preferred Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="dateTime"
              name="dateTime"
              value={formData.dateTime}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-[#68bef8] focus:ring-2 focus:outline-none text-sm text-gray-800"
              required
              aria-required="true"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-800 mb-1">
              Message (Optional)
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Any additional details or questions?"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-[#68bef8] focus:ring-2 focus:outline-none text-sm text-gray-800 resize-y"
              rows="4"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-500 transition px-6 py-3 rounded-xl text-white text-sm font-medium shadow-md flex items-center gap-2"
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
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Schedule Call
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default BookACall;
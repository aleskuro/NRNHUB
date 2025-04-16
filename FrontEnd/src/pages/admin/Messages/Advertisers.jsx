import React, { useState } from 'react';

const Advertisers = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    adType: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, adType } = formData;

    // Basic validation
    if (!name.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!adType) {
      alert('Please select an advertisement type.');
      return;
    }

    // Placeholder submit action
    alert(
      `Advertising inquiry from ${name}.\nEmail: ${email}\nAd Type: ${adType}${
        formData.company ? `\nCompany: ${formData.company}` : ''
      }${formData.message ? `\nMessage: ${formData.message}` : ''}`
    );

    // Reset form
    setFormData({
      name: '',
      email: '',
      company: '',
      adType: '',
      message: '',
    });
  };

  return (
    <section className="container mx-auto py-10 px-4 bg-white min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">
          Advertise with{' '}
          <span className="text-[#2260bf]" style={{ fontFamily: '"Luxurious Roman", serif' }}>
            NRN
          </span>
          <span className="text-red-500" style={{ fontFamily: '"Luxurious Roman", serif' }}>
            HUB
          </span>
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-3 text-center">
          Reach a global audience of Non-Resident Nepalis through our platform. Fill out the form below to explore advertising opportunities!
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

          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-800 mb-1">
              Company Name
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Enter your company name (optional)"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-[#68bef8] focus:ring-2 focus:outline-none text-sm text-gray-800"
            />
          </div>

          {/* Ad Type */}
          <div>
            <label htmlFor="adType" className="block text-sm font-medium text-gray-800 mb-1">
              Advertisement Type <span className="text-red-500">*</span>
            </label>
            <select
              id="adType"
              name="adType"
              value={formData.adType}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-[#68bef8] focus:ring-2 focus:outline-none text-sm text-gray-800"
              required
              aria-required="true"
            >
              <option value="" disabled>
                Select an ad type
              </option>
              <option value="Banner">Banner Ad</option>
              <option value="Sponsored Post">Sponsored Post</option>
              <option value="Newsletter">Newsletter Feature</option>
              <option value="Other">Other</option>
            </select>
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
              placeholder="Tell us about your advertising needs or budget"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0l-4.243-4.243a2 2 0 010-2.828 2 2 0 012.828 0l2.829 2.829a2 2 0 002.828 0l4.243-4.243z"
                />
              </svg>
              Submit Inquiry
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Advertisers;
import React, { useState } from 'react';
import { Mail, Check, AlertCircle, Bell } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

const Subscribers = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      toast.error('Name must be at least 2 characters long');
      return;
    }

    setLoading(true);

    try {
      // Send only email to match backend
      const response = await fetch(`${API_URL}/api/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Remove credentials if not needed
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Server responded with ${response.status}`);
      }

      console.log('Subscription response:', data);
      setSubmitted(true);
      toast.success(data.message || 'Successfully subscribed to the newsletter!');
    } catch (err) {
      console.error('Subscription error:', err.message);
      setError(err.message || 'Failed to subscribe. Please try again.');
      toast.error(err.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setEmail('');
    setName('');
    setFrequency('weekly');
    setError('');
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg border border-purple-100">
      <div className="flex justify-center mb-6">
        <div className="bg-purple-100 p-3 rounded-full">
          <Bell className="h-8 w-8 text-purple-600" aria-hidden="true" />
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Stay Updated</h2>
        <div className="h-1 w-16 bg-purple-600 mx-auto my-4 rounded-full"></div>
        <p className="text-gray-600">Get exclusive content and updates delivered to your inbox.</p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error && (
            <div
              className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 animate-pulse"
              role="alert"
            >
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200"
              placeholder="John Doe"
              required
              aria-describedby={error && name.trim().length < 2 ? 'name-error' : undefined}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200"
                placeholder="your@email.com"
                required
                aria-describedby={error && !validateEmail(email) ? 'email-error' : undefined}
              />
            </div>
          </div>

          <div className="space-y-2">
            <legend className="block text-sm font-medium text-gray-700">Email Frequency</legend>
            <div className="grid grid-cols-3 gap-3">
              {['weekly', 'biweekly', 'monthly'].map((freq) => (
                <div key={freq}>
                  <input
                    type="radio"
                    id={freq}
                    name="frequency"
                    value={freq}
                    checked={frequency === freq}
                    onChange={() => setFrequency(freq)}
                    className="hidden peer"
                    required
                  />
                  <label
                    htmlFor={freq}
                    className="block text-center p-2 border border-gray-200 rounded-lg cursor-pointer peer-checked:border-purple-500 peer-checked:bg-purple-50 peer-checked:text-purple-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Subscribing...' : 'Subscribe Now'}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            By subscribing, you agree to our{' '}
            <a href="/privacy-policy" className="text-purple-600 hover:underline">
              Privacy Policy
            </a>{' '}
            and consent to receive updates.
          </p>
        </form>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-4">
            <Check className="h-8 w-8 text-purple-600" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-medium text-gray-900">Subscription Successful!</h3>
          <p className="text-gray-600 mt-2">Thank you for subscribing to our newsletter.</p>
          <button
            onClick={resetForm}
            className="mt-6 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline"
          >
            Subscribe another email
          </button>
        </div>
      )}
    </div>
  );
};

export default Subscribers;
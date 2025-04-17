import React, { useState } from 'react';
import { Mail, Check, AlertCircle, Bell } from 'lucide-react';

const Subscribers = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [frequency, setFrequency] = useState('weekly');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (name.trim().length < 2) {
      setError('Please enter your name');
      return;
    }
    
    // Clear error and show success state
    setError('');
    setSubmitted(true);
    
    // Here you would typically send data to your backend
    console.log('Subscription data:', { name, email, frequency });
  };

  const resetForm = () => {
    setSubmitted(false);
    setEmail('');
    setName('');
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg border border-purple-100">
      <div className="flex justify-center mb-6">
        <div className="bg-purple-100 p-3 rounded-full">
          <Bell className="h-8 w-8 text-purple-600" />
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Stay Updated</h2>
        <div className="h-1 w-16 bg-purple-600 mx-auto my-4 rounded-full"></div>
        <p className="text-gray-600">Get exclusive content and updates delivered to your inbox.</p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 animate-pulse">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
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
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200"
                placeholder="your@email.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email Frequency
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <input 
                  type="radio" 
                  id="weekly" 
                  name="frequency" 
                  value="weekly"
                  checked={frequency === 'weekly'} 
                  onChange={() => setFrequency('weekly')}
                  className="hidden peer" 
                />
                <label 
                  htmlFor="weekly"
                  className="block text-center p-2 border border-gray-200 rounded-lg cursor-pointer peer-checked:border-purple-500 peer-checked:bg-purple-50 peer-checked:text-purple-700 hover:bg-gray-50 transition-all duration-200"
                >
                  Weekly
                </label>
              </div>
              <div>
                <input 
                  type="radio" 
                  id="biweekly" 
                  name="frequency" 
                  value="biweekly"
                  checked={frequency === 'biweekly'} 
                  onChange={() => setFrequency('biweekly')}
                  className="hidden peer" 
                />
                <label 
                  htmlFor="biweekly"
                  className="block text-center p-2 border border-gray-200 rounded-lg cursor-pointer peer-checked:border-purple-500 peer-checked:bg-purple-50 peer-checked:text-purple-700 hover:bg-gray-50 transition-all duration-200"
                >
                  Bi-weekly
                </label>
              </div>
              <div>
                <input 
                  type="radio" 
                  id="monthly" 
                  name="frequency" 
                  value="monthly"
                  checked={frequency === 'monthly'} 
                  onChange={() => setFrequency('monthly')}
                  className="hidden peer" 
                />
                <label 
                  htmlFor="monthly"
                  className="block text-center p-2 border border-gray-200 rounded-lg cursor-pointer peer-checked:border-purple-500 peer-checked:bg-purple-50 peer-checked:text-purple-700 hover:bg-gray-50 transition-all duration-200"
                >
                  Monthly
                </label>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              style={{ backgroundColor: '#883FFF' }}
              className="w-full text-white font-medium py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Subscribe Now
            </button>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
          </p>
        </form>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-4">
            <Check className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-medium text-gray-900">Subscription Successful!</h3>
          <p className="text-gray-600 mt-2">Thank you for subscribing to our newsletter.</p>
          <button
            onClick={resetForm}
            style={{ color: '#883FFF' }}
            className="mt-6 px-4 py-2 text-sm font-medium hover:text-purple-800 hover:underline"
          >
            Subscribe another email
          </button>
        </div>
      )}
    </div>
  );
};

export default Subscribers;
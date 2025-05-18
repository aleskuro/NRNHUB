import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginUserMutation } from '../../Redux/features/auth/authAPI';
import { useDispatch } from 'react-redux';
import { setUser } from '../../Redux/features/auth/authSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginUser, { isLoading, error }] = useLoginUserMutation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    // Client-side validation
    if (!email || !password) {
      setMessage('Please enter both email and password.');
      return;
    }
    if (password.length < 8) {
      setMessage('Password must be at least 8 characters long.');
      return;
    }

    try {
      const response = await loginUser({ email, password }).unwrap();
      const { token, user } = response;

      // Store user and token in Redux and localStorage
      dispatch(setUser({ user, token }));
      localStorage.setItem('user', JSON.stringify({ user, token }));

      setMessage('Login successful!');
      setTimeout(() => navigate('/'), 1000); // Reduced delay for better UX
    } catch (err) {
      console.error('Login error:', err); // Log for debugging
      // Handle specific error cases
      if (err.status === 401) {
        setMessage('Invalid email or password.');
      } else if (err.status === 'FETCH_ERROR') {
        setMessage('Unable to connect to the server. Please check your network.');
      } else {
        setMessage(err.data?.message || 'An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="max-w-md bg-white p-8 rounded-xl shadow-lg w-full">
        <h2 className="text-3xl font-semibold text-center text-indigo-700 mb-8">Welcome Back!</h2>
        {message && (
          <p
            className={`text-center mb-4 ${
              message.includes('successful') ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {message}
          </p>
        )}
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-100 px-5 py-3 rounded-md border border-gray-300 focus:outline-none"
              placeholder="Your Email"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-100 px-5 py-3 rounded-md border border-gray-300 focus:outline-none"
              placeholder="Your Password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 rounded-md mt-4 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-600 hover:to-indigo-600'
            }`}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
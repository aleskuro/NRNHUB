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
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser({ email, password }).unwrap();
      const { token, user } = response;

      dispatch(setUser({ user, token }));
      localStorage.setItem('user', JSON.stringify({ user, token }));

      alert('Login successful');
      navigate('/'); // ✅ Make sure this route exists
    } catch (err) {
      setMessage('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="max-w-md bg-white p-8 rounded-xl shadow-lg w-full">
        <h2 className="text-3xl font-semibold text-center text-indigo-700 mb-8">
          Welcome Back!
        </h2>
        {message && <p className="text-red-500 text-center">{message}</p>}
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-100 px-5 py-3 rounded-md border border-gray-300"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-100 px-5 py-3 rounded-md border border-gray-300"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 rounded-md mt-4"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{' '}
          <Link to="/registor" className="text-indigo-600 underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useRegisterUserMutation } from '../../Redux/features/auth/authAPI';
import { useDispatch } from 'react-redux';
import { setUser } from '../../Redux/features/auth/authSlice';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    birthdate: '',
    gender: '',
  });
  const [message, setMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [registerUser, { isLoading, error }] = useRegisterUserMutation();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleResize = () => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Prevent spaces in username
    if (name === 'username') {
      setFormData({ ...formData, [name]: value.replace(/\s/g, '') });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    // Client-side validation
    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword || !formData.birthdate || !formData.gender) {
      setMessage('Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage('Please enter a valid email address.');
      return;
    }
    if (formData.username.length < 3) {
      setMessage('Username must be at least 3 characters long.');
      return;
    }
    if (formData.password.length < 8) {
      setMessage('Password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    // Optional: Validate birthdate (e.g., user must be at least 13 years old)
    const birthYear = new Date(formData.birthdate).getFullYear();
    if (new Date().getFullYear() - birthYear < 13) {
      setMessage('You must be at least 13 years old to register.');
      return;
    }

    try {
      const { confirmPassword, ...payload } = formData; // Exclude confirmPassword from API payload
      const response = await registerUser(payload).unwrap();
      const { token, user } = response;

      // Store user and token in Redux and localStorage
      dispatch(setUser({ user, token }));
      localStorage.setItem('user', JSON.stringify({ user, token }));

      setMessage('Registration successful!');
      setIsRegistered(true);
      setTimeout(() => navigate('/login'), 1000); // Reduced delay for better UX
    } catch (err) {
      console.error('Registration error:', err);
      if (err.status === 400) {
        setMessage(err.data?.message || 'Invalid input data.');
      } else if (err.status === 409) {
        setMessage('Email or username already exists.');
      } else if (err.status === 'FETCH_ERROR') {
        setMessage('Unable to connect to the server. Please check your network.');
      } else {
        setMessage(err.data?.message || 'An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative overflow-hidden">
      {isRegistered && <Confetti width={windowSize.width} height={windowSize.height} />}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#c3dafe"
          fillOpacity="0.6"
          d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L0,320Z"
        ></path>
      </svg>
      <div className="max-w-md bg-white p-8 rounded-xl shadow-lg w-full relative z-10 animate__animated animate__fadeIn">
        <h2 className="text-3xl font-semibold text-center text-indigo-700 mb-8">Register</h2>
        {message && (
          <p
            className={`text-center mb-4 ${
              message.includes('successful') ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {message}
          </p>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-gray-100 focus:outline-none px-5 py-3 rounded-md border border-gray-300"
              placeholder="Your Username"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-100 focus:outline-none px-5 py-3 rounded-md border border-gray-300"
              placeholder="Your Email"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-gray-100 focus:outline-none px-5 py-3 rounded-md border border-gray-300"
              placeholder="Your Password"
              required
            />
          </div>
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-gray-100 focus:outline-none px-5 py-3 rounded-md border border-gray-300"
              placeholder="Confirm Password"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="birthdate">
              Birthdate
            </label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              className="w-full bg-gray-100 focus:outline-none px-5 py-3 rounded-md border border-gray-300"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-gray-100 focus:outline-none px-5 py-3 rounded-md border border-gray-300"
              required
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full mt-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold py-3 rounded-md ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-600 hover:to-indigo-600'
            }`}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-8 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Login here
          </Link>
          <br />
          By registering, you agree to our{' '}
          <Link to="/terms-and-conditions" className="text-indigo-600 hover:underline">
            Terms and Conditions
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
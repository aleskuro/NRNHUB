import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';


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
    // Password validation
    if (formData.password.length < 8) {
      setMessage('Password must be at least 8 characters long');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }); 
      const data = await response.json();
      if (response.ok) {
        setMessage('Registration successful!');
        setIsRegistered(true);
        // Simulate default user settings
        localStorage.setItem(
          'user',
          JSON.stringify({
            username: formData.username,
            settings: { theme: 'light', notifications: true },
          })
        );
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Unable to connect to the server. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative overflow -hidden">
      {isRegistered && <Confetti width={windowSize.width} height={windowSize.height} />}
      {/* Wavy Background */}
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
              message.includes('successful')
                ? 'text-green-500 animate__animated animate__shakeX'
                : 'text-red-500 animate__animated animate__shakeX'
            }`}
          >
            {message}
          </p>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              className="w-full bg-gray-100 focus:outline-none px-5 py-3 rounded-md border border-gray-300"
              onChange={handleChange}
              placeholder="Your Username"
              required
            />
          </div>
          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              className="w-full bg-gray-100 focus:outline-none px-5 py-3 rounded-md border border-gray-300"
              onChange={handleChange}
              placeholder="Your Email"
              required
            />
          </div>
          {/* Password */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              className="w-full bg-gray-100 focus:outline-none px-5 py-3 rounded-md border border-gray-300"
              onChange={handleChange}
              placeholder="Your Password"
              required
            />
          </div>
          {/* Confirm Password */}
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              className="w-full bg-gray-100 focus:outline-none px-5 py-3 rounded-md border border-gray-300"
              onChange={handleChange}
              placeholder="Confirm Password"
              required
            />
          </div>
          {/* Birthdate */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="birthdate">
              Birthdate
            </label>
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              className="w-full bg-gray-100 focus:outline-none px-5 py-3 rounded-md border border-gray-300"
              onChange={handleChange}
              required
            />
          </div>
          {/* Gender */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              className="w-full bg-gray-100 focus:outline-none px-5 py-3 rounded-md border border-gray-300"
              onChange={handleChange}
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
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-md shadow-md transition duration-300"
          >
            Register
          </button>
        </form>
        <p className="mt-8 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Login here
          </Link>
          <br />
          By registering, you agree to our{' '}
          <Link to="/terms-and-condition" className="text-indigo-600 hover:underline">
            Terms and Conditions
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
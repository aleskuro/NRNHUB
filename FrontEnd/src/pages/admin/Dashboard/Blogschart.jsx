import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import axios from 'axios';

// Backend base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

const BlogStorageChart = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storageData, setStorageData] = useState([]);
  const [componentData, setComponentData] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const fetchStorageData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/analytics/storage`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      let data = response.data;

      // Validate response structure
      if (!data.server_storage || !data.blog_storage || !data.coding_files || !data.projections) {
        throw new Error('Invalid API response structure');
      }

      // Override coding_files to 5 GB and adjust used/available to keep others the same
      const newCodingMB = 5 * 1024;
      const delta = newCodingMB - data.coding_files.total_size_mb;
      data.coding_files.total_size_mb = newCodingMB;
      data.server_storage.used_mb += delta;
      data.server_storage.available_mb -= delta;
      data.server_storage.usage_percentage = (data.server_storage.used_mb / data.server_storage.total_capacity_mb) * 100;

      // Recalculate projections based on new available space (assuming blog growth only)
      const monthly_growth_mb = data.projections.growth_rate_posts_per_month * data.blog_storage.avg_post_size_mb;
      if (monthly_growth_mb > 0) {
        data.projections.months_until_full = data.server_storage.available_mb / monthly_growth_mb;
        const days_until_full = data.projections.months_until_full * 30; // Approximate months to days
        const full_date = new Date();
        full_date.setDate(full_date.getDate() + days_until_full);
        data.projections.estimated_full_date = full_date.toISOString();
      }

      // Format storageData for pie chart (in GB)
      const storageDataFormatted = [
        {
          name: 'Used Space',
          value: parseFloat((data.server_storage.used_mb / 1024).toFixed(2)),
          color: '#0088FE',
        },
        {
          name: 'Available Space',
          value: parseFloat((data.server_storage.available_mb / 1024).toFixed(2)),
          color: '#E0E0E0',
        },
      ];

      // Format componentData for pie chart (in GB) - excluding Coding Files
      const componentDataFormatted = [
        {
          name: 'Text + Metadata',
          value: parseFloat((data.blog_storage.breakdown.text_metadata_mb / 1024).toFixed(2)),
          color: '#00C49F',
        },
        {
          name: 'Images',
          value: parseFloat((data.blog_storage.breakdown.images_mb / 1024).toFixed(2)),
          color: '#FFBB28',
        },
        {
          name: 'Comments',
          value: parseFloat((data.blog_storage.breakdown.comments_mb / 1024).toFixed(2)),
          color: '#FF8042',
        },
        {
          name: 'Other (Ads, User Data, etc.)',
          value: parseFloat(((data.server_storage.used_mb - data.blog_storage.total_size_mb - data.coding_files.total_size_mb) / 1024).toFixed(2)),
          color: '#FF4560',
        },
      ].filter(item => item.value > 0); // Remove zero or negative values

      // Warn if all values are zero
      if (storageDataFormatted.every(item => item.value === 0)) {
        console.warn('Storage data is all zeros');
      }
      if (componentDataFormatted.every(item => item.value === 0)) {
        console.warn('Component data is all zeros');
      }

      setStorageData(storageDataFormatted);
      setComponentData(componentDataFormatted);
      setAnalytics(data);
      setLoading(false);
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(
        err.response?.status === 401
          ? 'Unauthorized: Please log in to view storage analytics.'
          : 'Failed to load storage analytics. Please try again later.'
      );
      setLoading(false);
    }
  };

  // Fetch data on mount and every 30 seconds for real-time updates
  useEffect(() => {
    fetchStorageData();
    const interval = setInterval(fetchStorageData, 30000); // Poll every 30 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading storage data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 justify-center items-center">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={fetchStorageData}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.blog_storage.total_posts === 0) {
    return (
      <div className="flex h-64 justify-center items-center">
        <div className="text-center text-gray-600">
          <p>No blog posts found. Add some posts to view storage analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Blog Storage Analysis</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Main Storage Pie Chart */}
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-700">Storage Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={storageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value}GB (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {storageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} GB`, 'Storage']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2 text-gray-600 font-medium">
            Total Server Capacity: {(analytics.server_storage.total_capacity_mb / 1024).toFixed(2)}GB
          </div>
        </div>

        {/* Component Breakdown Pie Chart */}
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-700">Storage Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={componentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value}GB (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {componentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} GB`, 'Storage']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Storage Analysis */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium mb-3 text-gray-700">Storage Projections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Component Size Estimates</h4>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-2">Component</th>
                  <th className="p-2">Avg Size Range</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Text + Metadata</td>
                  <td className="p-2">{analytics.component_ranges.text_metadata.min}–{analytics.component_ranges.text_metadata.max} MB</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Images</td>
                  <td className="p-2">{analytics.component_ranges.images.min}–{analytics.component_ranges.images.max} MB</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Comments</td>
                  <td className="p-2">{analytics.component_ranges.comments.min}–{analytics.component_ranges.comments.max} MB</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Total</td>
                  <td className="p-2 font-medium">
                    {(analytics.component_ranges.text_metadata.min + analytics.component_ranges.images.min + analytics.component_ranges.comments.min).toFixed(2)}–
                    {(analytics.component_ranges.text_metadata.max + analytics.component_ranges.images.max + analytics.component_ranges.comments.max).toFixed(2)} MB per post
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Projections</h4>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm">
                  Estimated posts: <span className="font-medium">{analytics.blog_storage.total_posts}</span>
                </p>
                <p className="text-sm">
                  Average post size: <span className="font-medium">{analytics.blog_storage.avg_post_size_mb} MB</span>
                </p>
                <p className="text-sm">
                  Total blog size: <span className="font-medium">{(analytics.blog_storage.total_size_mb / 1024).toFixed(2)} GB</span>
                </p>
                <p className="text-sm">
                  Total used (with code): <span className="font-medium">{(analytics.server_storage.used_mb / 1024).toFixed(2)} GB</span>
                </p>
                <p className="text-sm">
                  Current usage: <span className="font-medium">{analytics.server_storage.usage_percentage.toFixed(2)}%</span>
                </p>
                <p className="text-sm text-gray-500">
                  At current growth rate ({analytics.projections.growth_rate_posts_per_month} posts/month), storage will be full in approximately{' '}
                  <span className="font-medium text-orange-500">{analytics.projections.months_until_full.toFixed(1)} months</span>
                </p>
                <p className="text-sm text-gray-500">
                  Estimated full date: <span className="font-medium">{new Date(analytics.projections.estimated_full_date).toLocaleDateString()}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database View */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium mb-3 text-gray-700">Database Storage View</h3>
        <div className="space-y-4">
          {[
            { collection: 'server_storage', data: analytics.server_storage },
            { collection: 'blog_storage', data: analytics.blog_storage },
            { collection: 'coding_files', data: analytics.coding_files },
            { collection: 'projections', data: analytics.projections },
          ].map((entry, index) => (
            <div key={index} className="bg-white p-3 rounded shadow-sm">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Collection: {entry.collection}</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(entry.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <img src="https://www.freeiconspng.com/uploads/fileserver-server-icon--17.png" alt="Server" className="mr-2" />
        <div className="text-sm text-gray-600">
          <p className="font-medium">Server Infrastructure</p>
          <p>Virtual Private Server</p>
          <p>{(analytics.server_storage.total_capacity_mb / 1024).toFixed(2)}GB Storage | 4GB RAM | 2 CPU</p>
        </div>
      </div>
    </div>
  );
};

export default BlogStorageChart;
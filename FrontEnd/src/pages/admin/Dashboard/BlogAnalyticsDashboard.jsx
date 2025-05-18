import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis, ComposedChart, Line
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import { Navigate } from 'react-router-dom';

// Backend base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

const BlogAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState('30');
  const [analytics, setAnalytics] = useState({
    blogs: [],
    totalViews: 0,
    totalLikes: 0,
    totalShares: 0,
    totalComments: 0,
    averageReadTime: 0,
    topCategories: [],
    engagementRate: 0,
    postFrequency: [],
    growth: [],
    weeklyActivity: [],
    performanceByLength: [],
  });
  const [activeAuthors, setActiveAuthors] = useState([]);
  const [viewMode, setViewMode] = useState('overview'); // ['overview', 'detailed', 'trends']
  const [selectedMetric, setSelectedMetric] = useState('views'); // ['views', 'engagement', 'comments']

  const { user } = useSelector((state) => state.auth);

  // Redirect non-admins
  if (!user || user.role !== 'admin') {
    toast.error('Access restricted to admins');
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch analytics data
        const analyticsResponse = await axios.get(
          `${API_URL}/api/analytics/dashboard?dateRange=${selectedDateRange}`,
          { withCredentials: true }
        );

        const { overview, topViewedBlogs, topCategories, postFrequency, activityByDay, performanceByLength, growthTrend } = analyticsResponse.data;

        // Fix for performanceByLength data structure
        const formattedPerformanceByLength = performanceByLength.map(item => ({
          subject: item.range || item.subject,
          A: typeof item.engagement === 'number' ? item.engagement : item.A
        }));

        // Normalize category data structure
        const formattedCategories = topCategories.map(category => ({
          name: category.name || category.category || 'Unknown',
          value: category.value || category.count || 0
        }));

        setAnalytics({
          blogs: topViewedBlogs,
          totalViews: overview.totalViews,
          totalLikes: overview.totalLikes,
          totalShares: overview.totalShares,
          totalComments: overview.totalComments,
          averageReadTime: overview.avgReadTime,
          topCategories: formattedCategories,
          engagementRate: overview.engagementRate,
          postFrequency,
          growth: growthTrend,
          weeklyActivity: activityByDay.map(day => ({
            name: day.name || day.day,
            posts: day.posts,
            comments: day.comments
          })),
          performanceByLength: formattedPerformanceByLength,
        });

        // Fetch active authors (isolated to prevent dashboard failure)
        let authors = [];
        try {
          const authorsResponse = await axios.get(
            `${API_URL}/api/auth/login-tracking`,
            { withCredentials: true }
          );
          authors = authorsResponse.data.users?.filter((u) => u.isOnline) || [];
        } catch (authorErr) {
          console.error('Error fetching active authors:', authorErr);
          toast.warn('Failed to load active authors data');
        }
        setActiveAuthors(authors);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        const status = err.response?.status;
        let errorMessage = 'Failed to load analytics data. Please try again later.';
        if (status === 401) errorMessage = 'Unauthorized access. Please log in.';
        else if (status === 404) errorMessage = 'Analytics endpoint not found. Please check the backend server.';
        else if (status === 500) errorMessage = 'Server error. Please contact support.';
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDateRange]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#FF6B6B', '#6A7FDB', '#61DAFB'];

  // Memoized helper functions
  const getReadTimeEngagementData = useMemo(() => {
    return () => {
      console.log('Blogs for readTime:', analytics.blogs); // Debug
      if (!analytics.blogs.length) {
        console.warn('No blogs for readTime vs engagement');
        return [];
      }
      return analytics.blogs.map((blog) => ({
        name: blog.title?.length > 20 ? `${blog.title.substring(0, 17)}...` : blog.title || 'Untitled',
        readTime: blog.readCount > 0 ? Math.round(blog.readTime / blog.readCount / 60) : 0,
        engagement: (blog.likes || 0) + (blog.shares || 0) + (blog.commentCount || 0),
        views: blog.views || 0,
      })).filter(item => item.readTime > 0 || item.engagement > 0); // Relaxed filter
    };
  }, [analytics.blogs]);

  const getCategoryEngagementData = useMemo(() => {
    return () => {
      return analytics.topCategories.map((category) => {
        const categoryBlogs = analytics.blogs.filter(blog => blog.category === category.name);
        const totalViews = categoryBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
        const totalEngagement = categoryBlogs.reduce((sum, blog) => 
          sum + (blog.likes || 0) + (blog.shares || 0) + (blog.commentCount || 0), 0);
        
        return {
          name: category.name,
          postCount: category.value,
          views: totalViews,
          engagement: totalEngagement,
          engagementRate: totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0
        };
      });
    };
  }, [analytics.topCategories, analytics.blogs]);

  const getActiveAuthorBlogs = useMemo(() => {
    return () => {
      return analytics.blogs
        .filter((blog) => activeAuthors.some((author) => author._id === blog.author?.id))
        .map((blog) => ({
          id: blog.id,
          title: blog.title,
          views: blog.views,
          likes: blog.likes,
          shares: blog.shares,
          comments: blog.commentCount,
          category: blog.category,
          createdAt: blog.createdAt,
        }));
    };
  }, [analytics.blogs, activeAuthors]);

  const getBlogsTrend = useMemo(() => {
    return () => {
      // Group posts by week and calculate metrics
      const postsByWeek = {};
      analytics.blogs.forEach(blog => {
        const date = new Date(blog.createdAt);
        const weekNumber = Math.floor((date - new Date(date.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
        const weekKey = `${date.getFullYear()}-W${weekNumber}`;
        
        if (!postsByWeek[weekKey]) {
          postsByWeek[weekKey] = {
            week: weekKey,
            posts: 0,
            views: 0,
            engagement: 0,
            date: date.toISOString().split('T')[0]
          };
        }
        
        postsByWeek[weekKey].posts += 1;
        postsByWeek[weekKey].views += blog.views || 0;
        postsByWeek[weekKey].engagement += 
          (blog.likes || 0) + (blog.shares || 0) + (blog.commentCount || 0);
      });
      
      return Object.values(postsByWeek).sort((a, b) => new Date(a.date) - new Date(b.date));
    };
  }, [analytics.blogs]);

  // Filter blogs by selected metric
  const getTopBlogs = useMemo(() => {
    return () => {
      console.log('Blogs for top blogs:', analytics.blogs); // Debug
      if (!analytics.blogs.length) {
        console.warn('No blogs available for top blogs');
        return [];
      }
      
      const sortedBlogs = [...analytics.blogs].map(blog => ({
        ...blog,
        id: blog.id || blog._id?.toString(), // Normalize ID
        views: blog.views || 0,
        likes: blog.likes || 0,
        shares: blog.shares || 0,
        commentCount: blog.commentCount || 0,
        title: blog.title || 'Untitled',
        category: blog.category || 'Uncategorized',
        createdAt: blog.createdAt || new Date(),
      }));
      
      if (selectedMetric === 'views') {
        return sortedBlogs.sort((a, b) => b.views - a.views);
      } else if (selectedMetric === 'engagement') {
        return sortedBlogs.sort((a, b) => {
          const engagementA = a.likes + a.shares + a.commentCount;
          const engagementB = b.likes + b.shares + b.commentCount;
          return engagementB - engagementA;
        });
      } else if (selectedMetric === 'comments') {
        return sortedBlogs.sort((a, b) => b.commentCount - a.commentCount);
      }
      
      return sortedBlogs;
    };
  }, [analytics.blogs, selectedMetric]);

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen justify-center items-center">
        <div className="text-center text-red-500 bg-red-50 p-6 rounded-lg shadow">
          <svg className="w-12 h-12 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="mt-4 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Blog Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Track and analyze your blog performance metrics</p>
          
          {/* View Mode Tabs */}
          <div className="mt-4 border-b border-gray-200">
            <nav className="flex -mb-px">
              {['overview', 'detailed', 'trends'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    viewMode === mode
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Date Range Filter */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow flex flex-wrap items-center justify-between">
          <div>
            <label htmlFor="dateRange" className="mr-2 font-medium text-gray-700">Time Period:</label>
            <select
              id="dateRange"
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="p-2 border rounded bg-white text-gray-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 3 Months</option>
              <option value="180">Last 6 Months</option>
              <option value="365">Last Year</option>
              <option value="3650">All Time</option>
            </select>
          </div>

          {/* Metric selector for "detailed" view */}
          {viewMode === 'detailed' && (
            <div className="mt-2 md:mt-0">
              <label htmlFor="metricSelector" className="mr-2 font-medium text-gray-700">Sort By:</label>
              <select
                id="metricSelector"
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="p-2 border rounded bg-white text-gray-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="views">Views</option>
                <option value="engagement">Engagement</option>
                <option value="comments">Comments</option>
              </select>
            </div>
          )}
        </div>

        {/* Overview Mode */}
        {viewMode === 'overview' && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { title: 'Total Posts', value: analytics.blogs.length },
                { title: 'Total Views', value: analytics.totalViews.toLocaleString() },
                { title: 'Avg. Read Time', value: `${analytics.averageReadTime.toFixed(1)} min` },
                { title: 'Engagement Rate', value: `${analytics.engagementRate.toFixed(1)}%` },
              ].map((card) => (
                <div key={card.title} className="bg-white p-4 md:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{card.title}</h3>
                  <p className="text-2xl md:text-3xl font-bold">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Charts: Top Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <h2 className="text-lg md:text-xl font-bold mb-4">Engagement Metrics</h2>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Likes', value: analytics.totalLikes },
                          { name: 'Comments', value: analytics.totalComments },
                          { name: 'Shares', value: analytics.totalShares },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {['#0088FE', '#00C49F', '#FFBB28'].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value.toLocaleString(), 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <h2 className="text-lg md:text-xl font-bold mb-4">Category Distribution</h2>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.topCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {analytics.topCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value.toLocaleString(), 'Posts']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Charts: Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <h2 className="text-lg md:text-xl font-bold mb-4">Cumulative Views Over Time</h2>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analytics.growth}
                      margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
                    >
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis
                        dataKey="date"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                      />
                      <YAxis tickFormatter={(value) => value.toLocaleString()} />
                      <Tooltip
                        formatter={(value) => [value.toLocaleString(), 'Total Views']}
                        labelFormatter={(value) => `Date: ${value}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorViews)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <h2 className="text-lg md:text-xl font-bold mb-4">Post Frequency by Month</h2>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.postFrequency}
                      margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis
                        dataKey="month"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'Posts']} />
                      <Bar dataKey="count" name="Posts" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Charts: Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <h2 className="text-lg md:text-xl font-bold mb-4">Content Performance by Length</h2>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={90} data={analytics.performanceByLength}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Engagement Rate"
                        dataKey="A"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Engagement Rate']} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <h2 className="text-lg md:text-xl font-bold mb-4">Reading Time vs Engagement</h2>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis
                        type="number"
                        dataKey="readTime"
                        name="Reading Time"
                        unit=" min"
                        domain={[0, 'dataMax']}
                      />
                      <YAxis
                        type="number"
                        dataKey="engagement"
                        name="Engagement"
                        unit=" actions"
                      />
                      <ZAxis dataKey="views" range={[60, 600]} name="Views" />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value, name) => {
                          if (name === 'readTime') return [`${value} minutes`, 'Reading Time'];
                          if (name === 'engagement') return [`${value} actions`, 'Engagement'];
                          if (name === 'views') return [`${value} views`, 'Views'];
                          return [value, name];
                        }}
                        labelFormatter={(value) => `Blog: ${value}`}
                      />
                      <Scatter
                        name="Reading Time vs Engagement"
                        data={getReadTimeEngagementData()}
                        fill="#8884d8"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Detailed Mode */}
        {viewMode === 'detailed' && (
          <>
            {/* Detailed Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Engagement Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Likes</span>
                    <span className="font-medium">{analytics.totalLikes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Comments</span>
                    <span className="font-medium">{analytics.totalComments.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shares</span>
                    <span className="font-medium">{analytics.totalShares.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total Engagement</span>
                      <span className="font-semibold">{(analytics.totalLikes + analytics.totalComments + analytics.totalShares).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Top Categories</h3>
                <div className="space-y-3">
                  {analytics.topCategories.slice(0, 5).map((category, index) => (
                    <div key={category.name} className="flex justify-between">
                      <span className="text-gray-600">{category.name}</span>
                      <span className="font-medium">{category.value} posts</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Weekly Activity</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.weeklyActivity}>
                      <XAxis dataKey="name" />
                      <YAxis hide />
                      <Tooltip />
                      <Bar dataKey="posts" fill="#8884d8" name="Posts" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Category Performance Chart */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow mb-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">Category Performance</h2>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={getCategoryEngagementData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="views" name="Views" fill="#8884d8" />
                    <Bar yAxisId="left" dataKey="engagement" name="Engagement" fill="#82ca9d" />
                    <Line yAxisId="right" type="monotone" dataKey="engagementRate" name="Engagement Rate (%)" stroke="#ff7300" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Blogs Table */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg md:text-xl font-bold">Top Performing Blogs</h2>
                <span className="text-sm text-gray-500">Sorted by {selectedMetric}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blog Title</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Likes</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getTopBlogs().slice(0, 10).map((blog) => (
                      <tr key={blog.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {blog.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {blog.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {blog.views.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {blog.likes.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {blog.commentCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {blog.shares.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getTopBlogs().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No blog data available for the selected time period or metric. Try adjusting the date range or metric.
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Trends Mode */}
        {viewMode === 'trends' && (
          <>
            {/* Trends Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <h2 className="text-lg md:text-xl font-bold mb-4">Growth Trends</h2>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={getBlogsTrend()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis 
                        dataKey="week"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value, name) => [value.toLocaleString(), name]}
                        labelFormatter={(value) => `Week: ${value}`}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="posts" name="Post Count" fill="#8884d8" />
                      <Line yAxisId="right" type="monotone" dataKey="views" stroke="#ff7300" name="Views" />
                      <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#82ca9d" name="Engagement" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <h2 className="text-lg md:text-xl font-bold mb-4">Content Performance by Length </h2> 
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.performanceByLength}
                      margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Engagement Rate']} />
                      <Bar dataKey="A" name="Engagement Rate" fill="#8884d8">
                        {analytics.performanceByLength.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <h2 className="text-lg md:text-xl font-bold mb-4">Category Distribution</h2>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.topCategories}
                      margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis 
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => [value.toLocaleString(), 'Posts']} />
                      <Bar dataKey="value" name="Posts" fill="#8884d8">
                        {analytics.topCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <h2 className="text-lg md:text-xl font-bold mb-4">Reading Time vs Engagement</h2>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis
                        type="number"
                        dataKey="readTime"
                        name="Reading Time"
                        unit=" min"
                        domain={[0, 'dataMax']}
                      />
                      <YAxis
                        type="number"
                        dataKey="engagement"
                        name="Engagement"
                        unit=" actions"
                      />
                      <ZAxis dataKey="views" range={[60, 600]} name="Views" />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value, name) => {
                          if (name === 'Reading Time') return [`${value} minutes`, name];
                          if (name === 'Engagement') return [`${value} actions`, name];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Scatter
                        name="Blogs"
                        data={getReadTimeEngagementData()}
                        fill="#8884d8"
                      >
                        {getReadTimeEngagementData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow mb-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">Advanced Metrics</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-md font-semibold mb-2">Active Authors</h3>
                  <div className="space-y-3">
                    {activeAuthors.length > 0 ? (
                      activeAuthors.slice(0, 5).map((author) => (
                        <div key={author._id} className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm">{author.name || author.email}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">No active authors</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-2">Engagement Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Posts per Author</span>
                      <span className="text-sm font-medium">
                        {activeAuthors.length > 0 
                          ? (analytics.blogs.length / activeAuthors.length).toFixed(1) 
                          : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Comments per Post</span>
                      <span className="text-sm font-medium">
                        {analytics.blogs.length > 0 
                          ? (analytics.totalComments / analytics.blogs.length).toFixed(1) 
                          : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Views per Post</span>
                      <span className="text-sm font-medium">
                        {analytics.blogs.length > 0 
                          ? (analytics.totalViews / analytics.blogs.length).toFixed(1) 
                          : '0'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-2">Content Health Score</h3>
                  <div className="mb-2">
                    {(() => {
                      const avgViews = analytics.blogs.length > 0 ? analytics.totalViews / analytics.blogs.length : 0;
                      const avgEngagement = analytics.blogs.length > 0 ? 
                        (analytics.totalLikes + analytics.totalComments + analytics.totalShares) / analytics.blogs.length : 0;
                      const consistencyScore = analytics.postFrequency.length > 0 ? 
                        (analytics.blogs.length / analytics.postFrequency.length) / 10 : 0;
                      
                      const score = Math.min(100, Math.floor(
                        (avgViews / 100) * 30 +
                        (avgEngagement / 10) * 40 +
                        consistencyScore * 30
                      ));
                      
                      let color, label;
                      if (score >= 80) {
                        color = 'bg-green-600';
                        label = 'Excellent';
                      } else if (score >= 60) {
                        color = 'bg-blue-500';
                        label = 'Good';
                      } else if (score >= 40) {
                        color = 'bg-yellow-500';
                        label = 'Average';
                      } else {
                        color = 'bg-red-500';
                        label = 'Needs Improvement';
                      }
                      
                      return (
                        <>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{score}/100 ({label})</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className={`${color} h-2.5 rounded-full`} style={{ width: `${score}%` }}></div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Based on views, engagement, and publishing consistency
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow">
              <h2 className="text-lg md:text-xl font-bold mb-4">Recent Blog Activity</h2>
              <div className="flow-root">
                <ul className="-mb-8">
                  {getTopBlogs().slice(0, 5).map((blog, index) => (
                    <li key={blog.id}>
                      <div className="relative pb-8">
                        {index !== getTopBlogs().slice(0, 5).length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          ></span>
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-blue-500">
                              <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                <span className="font-medium text-gray-900">{blog.title}</span>
                                {' '}received{' '}
                                <span className="font-medium text-gray-900">{blog.views}</span>{' '}
                                views, {' '}
                                <span className="font-medium text-gray-900">{blog.likes}</span>{' '}
                                likes, and {' '}
                                <span className="font-medium text-gray-900">{blog.commentCount}</span>{' '}
                                comments
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BlogAnalyticsDashboard;
const Blog = require('../models/blog.model');
const Comment = require('../models/comment.model');

const getAnalyticsDashboard = async (req, res) => {
  try {
    const { dateRange } = req.query;
    const days = parseInt(dateRange) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch blogs within the date range
    const blogs = await Blog.find({ createdAt: { $gte: startDate } })
      .populate('author', 'username')
      .lean();

    // Calculate overview metrics
    const overview = {
      totalViews: blogs.reduce((sum, blog) => sum + (blog.views || 0), 0),
      totalLikes: blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0),
      totalShares: blogs.reduce((sum, blog) => sum + (blog.shares || 0), 0),
      totalComments: blogs.reduce((sum, blog) => sum + (blog.commentCount || 0), 0),
      avgReadTime: blogs.length
        ? blogs.reduce((sum, blog) => sum + (blog.readTime || 0), 0) / blogs.length / 60
        : 0,
      engagementRate: blogs.length
        ? ((blogs.reduce((sum, blog) => sum + (blog.likes || 0) + (blog.shares || 0) + (blog.commentCount || 0), 0) /
            blogs.reduce((sum, blog) => sum + (blog.views || 0), 1)) * 100).toFixed(1)
        : 0,
    };

    // Top viewed blogs
    const topViewedBlogs = blogs
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(blog => ({
        id: blog._id,
        title: blog.title,
        views: blog.views || 0,
        likes: blog.likes || 0,
        shares: blog.shares || 0,
        commentCount: blog.commentCount || 0,
        readTime: blog.readTime || 0,
        readCount: blog.readCount || 0,
        category: blog.category || 'Uncategorized',
        createdAt: blog.createdAt,
        author: blog.author ? { id: blog.author._id, username: blog.author.username } : null,
      }));

    // Top categories
    const categoryCounts = blogs.reduce((acc, blog) => {
      const cat = blog.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    const topCategories = Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Post frequency by month
    const postFrequency = blogs.reduce((acc, blog) => {
      const month = new Date(blog.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    const postFrequencyArray = Object.entries(postFrequency)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));

    // Weekly activity (simplified, update with comment data if needed)
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeekCounts = Array(7).fill(0);
    blogs.forEach(blog => {
      const dayOfWeek = new Date(blog.createdAt).getDay();
      dayOfWeekCounts[dayOfWeek]++;
    });
    const activityByDay = daysOfWeek.map((day, index) => ({
      name: day,
      posts: dayOfWeekCounts[index],
      comments: 0, // Replace with actual comment counts if available
    }));

    // Performance by length (placeholder, update with real data)
    const performanceByLength = [
      { subject: 'Short (<500 words)', A: Math.random() * 100 },
      { subject: 'Medium (500-1000 words)', A: Math.random() * 100 },
      { subject: 'Long (>1000 words)', A: Math.random() * 100 },
    ];

    // Growth trend
    const growthTrend = blogs.reduce((acc, blog) => {
      const date = new Date(blog.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + (blog.views || 0);
      return acc;
    }, {});
    const growth = Object.entries(growthTrend)
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      overview,
      topViewedBlogs,
      topCategories,
      postFrequency: postFrequencyArray,
      activityByDay,
      performanceByLength,
      growthTrend: growth,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAnalyticsDashboard };
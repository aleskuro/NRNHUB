const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Blog = require('../model/blog.model');
const Comment = require('../model/comment.model');


// Get consolidated blog analytics - Admin only
router.get('/dashboard', async (req, res) => {
  try {
    const timeFilter = {};
    
    // Apply date range filter if provided
    if (req.query.dateRange) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(req.query.dateRange));
      timeFilter.createdAt = { $gte: cutoffDate };
    }
    
    // Fetch all blogs with the applied time filter
    const blogs = await Blog.find(timeFilter)
      .populate('author', 'email name')
      .lean();
    
    console.log('Fetched blogs:', blogs.length); // Debug
    
    // Fetch comments for accurate commentCount
    const comments = await Comment.find(timeFilter).lean();
    const commentCounts = {};
    comments.forEach(comment => {
      const postId = comment.postId.toString();
      commentCounts[postId] = (commentCounts[postId] || 0) + 1;
    });
    
    // Calculate aggregated metrics
    const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
    const totalLikes = blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0);
    const totalShares = blogs.reduce((sum, blog) => sum + (blog.shares || 0), 0);
    const totalPosts = blogs.length;
    const totalComments = comments.length;
    
    // Calculate average read time
    const validReadTimePosts = blogs.filter(blog => blog.readCount > 0);
    const avgReadTime = validReadTimePosts.length > 0
      ? validReadTimePosts.reduce((sum, blog) => sum + (blog.readTime / blog.readCount), 0) / validReadTimePosts.length / 60
      : 0;
    
    // Calculate engagement rate
    const engagementRate = totalViews > 0
      ? ((totalLikes + totalShares + totalComments) / totalViews) * 100
      : 0;
    
    // Top performing blogs
    const topViewedBlogs = [...blogs]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10)
      .map(blog => ({
        id: blog._id.toString(), // Ensure string ID
        title: blog.title || 'Untitled',
        views: blog.views || 0,
        likes: blog.likes || 0,
        shares: blog.shares || 0,
        commentCount: commentCounts[blog._id.toString()] || blog.commentCount || 0,
        category: blog.category || 'Uncategorized',
        createdAt: blog.createdAt,
        readTime: blog.readTime || 0, // Include for consistency
        readCount: blog.readCount || 0, // Include for consistency
      }));
    
    console.log('Top Viewed Blogs:', topViewedBlogs); // Debug
    
    // Top categories
    const categoryData = {};
    blogs.forEach(blog => {
      const category = blog.category || 'Uncategorized';
      categoryData[category] = (categoryData[category] || 0) + 1;
    });
    const topCategories = Object.entries(categoryData)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    // Post frequency by month
    const postsByMonth = {};
    blogs.forEach(blog => {
      const date = new Date(blog.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      postsByMonth[monthKey] = (postsByMonth[monthKey] || 0) + 1;
    });
    
    const postFrequency = Object.entries(postsByMonth)
      .map(([month, count]) => {
        const [year, monthNum] = month.split('-');
        return {
          month: `${new Date(0, monthNum - 1).toLocaleString('default', { month: 'short' })} ${year}`,
          count
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA - dateB;
      });
    
    // Posts and comments by day of week
    const dayOfWeekCounts = Array(7).fill(0);
    blogs.forEach(blog => {
      const dayOfWeek = new Date(blog.createdAt).getDay();
      dayOfWeekCounts[dayOfWeek]++;
    });
    
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const activityByDay = daysOfWeek.map((day, index) => ({
      day,
      posts: dayOfWeekCounts[index],
      comments: Math.round(totalComments / 7) // Placeholder
    }));
    
    // Calculate performance by content length
    const performanceByLength = [
      { range: 'Short (< 5 min)', engagement: calculatePerformanceByLength(blogs, 0, 5) },
      { range: 'Medium (5-10 min)', engagement: calculatePerformanceByLength(blogs, 5, 10) },
      { range: 'Long (10-15 min)', engagement: calculatePerformanceByLength(blogs, 10, 15) },
      { range: 'Very Long (15+ min)', engagement: calculatePerformanceByLength(blogs, 15, Infinity) }
    ];
    
    // Calculate growth trends
    const sortedBlogs = [...blogs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const growthTrend = sortedBlogs.map((blog, index) => ({
      date: new Date(blog.createdAt).toLocaleDateString(),
      views: blogs.slice(0, index + 1).reduce((sum, b) => sum + (b.views || 0), 0)
    }));
    
    res.status(200).json({
      overview: {
        totalPosts,
        totalViews,
        totalLikes,
        totalShares,
        totalComments,
        avgReadTime,
        engagementRate
      },
      topViewedBlogs,
      topCategories,
      postFrequency,
      activityByDay,
      performanceByLength,
      growthTrend
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ message: 'Server error when fetching analytics data' });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    blog.likes = (blog.likes || 0) + 1;
    await blog.save();
    res.status(200).json({ message: 'Blog liked', likes: blog.likes });
  } catch (error) {
    console.error('Error liking blog:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get storage analytics
router.get('/storage', async (req, res) => {
  try {
    // Fetch all blogs and comments
    const blogs = await Blog.find().lean();
    const comments = await Comment.find().lean();

    // Server configuration (hardcoded for now)
    const totalCapacityMb = 25 * 1024; // 25 GB
    const codingFilesMb = 4 * 1024; // 4 GB

    // Estimate storage per blog
    const totalPosts = blogs.length;
    const avgPostSizeMb = 32.34; // Skewed average post size
    const totalBlogSizeMb = totalPosts * avgPostSizeMb;

    // Estimate component breakdown (using proportions from previous example)
    const componentProportions = {
      text_metadata: 0.5, // 50% (3,234 MB / 6,468 MB)
      images: 0.315, // ~31.5% (2,037 MB / 6,468 MB)
      comments: 0.185, // ~18.5% (1,197 MB / 6,468 MB)
    };

    const breakdown = {
      text_metadata_mb: totalBlogSizeMb * componentProportions.text_metadata,
      images_mb: totalBlogSizeMb * componentProportions.images,
      comments_mb: totalBlogSizeMb * componentProportions.comments,
    };

    // Calculate total used and available space
    const totalUsedMb = codingFilesMb + totalBlogSizeMb;
    const availableMb = totalCapacityMb - totalUsedMb;
    const usagePercentage = ((totalUsedMb / totalCapacityMb) * 100).toFixed(2);

    // Estimate growth rate (posts/month in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentBlogs = await Blog.find({ createdAt: { $gte: thirtyDaysAgo } }).lean();
    const growthRate = recentBlogs.length; // Posts in last 30 days

    // Projections
    const postsUntilFull = Math.floor(availableMb / avgPostSizeMb);
    const monthsUntilFull = growthRate > 0 ? Math.floor(postsUntilFull / growthRate) : 0;
    const estimatedFullDate = new Date();
    estimatedFullDate.setMonth(estimatedFullDate.getMonth() + monthsUntilFull);

    // Component size ranges (scaled to 32.34 MB/post)
    const componentRanges = {
      text_metadata: { min: 1.62, max: 4.85 }, // MB
      images: { min: 2.02, max: 20.24 },
      comments: { min: 0.94, max: 3.13 },
    };

    res.status(200).json({
      server_storage: {
        total_capacity_mb: totalCapacityMb,
        used_mb: totalUsedMb,
        available_mb: availableMb,
        usage_percentage: parseFloat(usagePercentage),
        last_updated: new Date().toISOString(),
      },
      blog_storage: {
        total_posts: totalPosts,
        avg_post_size_mb: avgPostSizeMb,
        total_size_mb: totalBlogSizeMb,
        breakdown,
      },
      coding_files: {
        total_size_mb: codingFilesMb,
        description: 'Application code, libraries, and static assets',
      },
      projections: {
        posts_until_full: postsUntilFull,
        growth_rate_posts_per_month: growthRate,
        months_until_full: monthsUntilFull,
        estimated_full_date: estimatedFullDate.toISOString(),
      },
      component_ranges: componentRanges,
    });
  } catch (error) {
    console.error('Error fetching storage analytics:', error);
    res.status(500).json({ message: 'Server error when fetching storage analytics' });
  }
});

// Get top performing posts
router.get('/top-posts',  async (req, res) => {
  try {
    const { metric = 'views', limit = 10 } = req.query;
    const validMetrics = ['views', 'likes', 'shares', 'commentCount'];
    
    if (!validMetrics.includes(metric)) {
      return res.status(400).json({ message: 'Invalid metric parameter' });
    }
    
    const sortCriteria = {};
    sortCriteria[metric] = -1;
    
    const topPosts = await Blog.find()
      .sort(sortCriteria)
      .limit(parseInt(limit))
      .populate('author', 'name email')
      .lean();
    
    res.status(200).json(topPosts);
  } catch (error) {
    console.error('Error fetching top posts:', error);
    res.status(500).json({ message: 'Server error when fetching top posts' });
  }
});

// Get reading time statistics
router.get('/read-time-stats',  async (req, res) => {
  try {
    const blogs = await Blog.find({ readCount: { $gt: 0 } }).lean();
    
    // Calculate average read time for all blogs
    const totalReadTime = blogs.reduce((sum, blog) => sum + blog.readTime, 0);
    const totalReadCount = blogs.reduce((sum, blog) => sum + blog.readCount, 0);
    const overallAvgReadTime = totalReadCount > 0 ? (totalReadTime / totalReadCount) / 60 : 0; // in minutes
    
    // Group blogs by read time duration
    const readTimeDistribution = {
      'less_than_5_min': 0,
      '5_to_10_min': 0,
      '10_to_15_min': 0,
      'more_than_15_min': 0
    };
    
    blogs.forEach(blog => {
      const avgMinutes = blog.readCount > 0 ? (blog.readTime / blog.readCount) / 60 : 0;
      
      if (avgMinutes < 5) {
        readTimeDistribution.less_than_5_min++;
      } else if (avgMinutes < 10) {
        readTimeDistribution['5_to_10_min']++;
      } else if (avgMinutes < 15) {
        readTimeDistribution['10_to_15_min']++;
      } else {
        readTimeDistribution.more_than_15_min++;
      }
    });
    
    // Calculate engagement correlation with read time
    const readTimeToEngagement = blogs.map(blog => {
      const avgReadTime = blog.readCount > 0 ? (blog.readTime / blog.readCount) / 60 : 0;
      const engagement = (blog.likes || 0) + (blog.shares || 0) + (blog.commentCount || 0);
      return {
        blogId: blog._id,
        title: blog.title,
        avgReadTime: avgReadTime.toFixed(2),
        engagement
      };
    });
    
    res.status(200).json({
      overallAvgReadTime: overallAvgReadTime.toFixed(2),
      readTimeDistribution,
      readTimeToEngagement
    });
  } catch (error) {
    console.error('Error fetching read time statistics:', error);
    res.status(500).json({ message: 'Server error when fetching read time statistics' });
  }
});

// Get engagement metrics (likes, comments, shares)
router.get('/engagement',  async (req, res) => {
  try {
    const blogs = await Blog.find().lean();
    const comments = await Comment.find().lean();
    
    // Calculate total engagement
    const totalLikes = blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0);
    const totalShares = blogs.reduce((sum, blog) => sum + (blog.shares || 0), 0);
    const totalComments = comments.length;
    const totalEngagements = totalLikes + totalShares + totalComments;
    
    // Calculate engagement by category
    const categoryEngagement = {};
    blogs.forEach(blog => {
      if (!blog.category) return;
      
      if (!categoryEngagement[blog.category]) {
        categoryEngagement[blog.category] = {
          likes: 0,
          shares: 0,
          comments: 0,
          total: 0,
          posts: 0
        };
      }
      
      categoryEngagement[blog.category].likes += blog.likes || 0;
      categoryEngagement[blog.category].shares += blog.shares || 0;
      categoryEngagement[blog.category].comments += blog.commentCount || 0;
      categoryEngagement[blog.category].total += (blog.likes || 0) + (blog.shares || 0) + (blog.commentCount || 0);
      categoryEngagement[blog.category].posts += 1;
    });
    
    // Calculate engagement over time (by month)
    const engagementByMonth = {};
    blogs.forEach(blog => {
      const date = new Date(blog.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!engagementByMonth[monthKey]) {
        engagementByMonth[monthKey] = {
          month: `${new Date(0, date.getMonth()).toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`,
          likes: 0,
          shares: 0,
          comments: 0
        };
      }
      
      engagementByMonth[monthKey].likes += blog.likes || 0;
      engagementByMonth[monthKey].shares += blog.shares || 0;
      engagementByMonth[monthKey].comments += blog.commentCount || 0;
    });
    
    // Sort the months chronologically
    const sortedEngagementByMonth = Object.values(engagementByMonth)
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA - dateB;
      });
    
    res.status(200).json({
      totalEngagements,
      breakdown: {
        likes: totalLikes,
        shares: totalShares,
        comments: totalComments
      },
      categoryEngagement,
      engagementOverTime: sortedEngagementByMonth
    });
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    res.status(500).json({ message: 'Server error when fetching engagement metrics' });
  }
});

// Get category analytics
router.get('/categories',  async (req, res) => {
  try {
    const blogs = await Blog.find().lean();
    
    // Calculate category distribution
    const categoryDistribution = {};
    blogs.forEach(blog => {
      const category = blog.category || 'Uncategorized';
      if (!categoryDistribution[category]) {
        categoryDistribution[category] = {
          count: 0,
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0
        };
      }
      
      categoryDistribution[category].count += 1;
      categoryDistribution[category].views += blog.views || 0;
      categoryDistribution[category].likes += blog.likes || 0;
      categoryDistribution[category].shares += blog.shares || 0;
      categoryDistribution[category].comments += blog.commentCount || 0;
    });
    
    // Convert to array and calculate averages
    const categoryAnalytics = Object.entries(categoryDistribution).map(([category, stats]) => ({
      category,
      postCount: stats.count,
      totalViews: stats.views,
      avgViewsPerPost: stats.count > 0 ? Math.round(stats.views / stats.count) : 0,
      totalEngagement: stats.likes + stats.shares + stats.comments,
      avgEngagementPerPost: stats.count > 0 ? Math.round((stats.likes + stats.shares + stats.comments) / stats.count) : 0
    }));
    
    res.status(200).json(categoryAnalytics);
  } catch (error) {
    console.error('Error fetching category analytics:', error);
    res.status(500).json({ message: 'Server error when fetching category analytics' });
  }
});

// Get author performance metrics
router.get('/author-performance',  async (req, res) => {
  try {
    const blogs = await Blog.find().populate('author', 'name email').lean();
    
    // Group blogs by author
    const authorPerformance = {};
    blogs.forEach(blog => {
      if (!blog.author) return;
      
      const authorId = blog.author._id.toString();
      if (!authorPerformance[authorId]) {
        authorPerformance[authorId] = {
          author: {
            id: authorId,
            name: blog.author.name,
            email: blog.author.email
          },
          postCount: 0,
          totalViews: 0,
          totalLikes: 0,
          totalShares: 0,
          totalComments: 0,
          avgEngagementPerPost: 0
        };
      }
      
      authorPerformance[authorId].postCount += 1;
      authorPerformance[authorId].totalViews += blog.views || 0;
      authorPerformance[authorId].totalLikes += blog.likes || 0;
      authorPerformance[authorId].totalShares += blog.shares || 0;
      authorPerformance[authorId].totalComments += blog.commentCount || 0;
    });
    
    // Calculate averages and format for response
    const formattedAuthorPerformance = Object.values(authorPerformance).map(author => {
      const totalEngagement = author.totalLikes + author.totalShares + author.totalComments;
      return {
        ...author,
        avgViewsPerPost: author.postCount > 0 ? Math.round(author.totalViews / author.postCount) : 0,
        avgEngagementPerPost: author.postCount > 0 ? Math.round(totalEngagement / author.postCount) : 0,
        totalEngagement
      };
    }).sort((a, b) => b.totalViews - a.totalViews);
    
    res.status(200).json(formattedAuthorPerformance);
  } catch (error) {
    console.error('Error fetching author performance metrics:', error);
    res.status(500).json({ message: 'Server error when fetching author performance metrics' });
  }
});

// Helper function to calculate performance by content length
function calculatePerformanceByLength(blogs, minMinutes, maxMinutes) {
  const postsInRange = blogs.filter(blog => {
    const avgReadTime = blog.readCount > 0 ? blog.readTime / blog.readCount / 60 : 0;
    return avgReadTime >= minMinutes && avgReadTime < maxMinutes;
  });
  
  if (postsInRange.length === 0) return 0;
  
  // Calculate engagement per view for posts in this range
  const totalEngagement = postsInRange.reduce((sum, blog) => 
    sum + (blog.likes || 0) + (blog.shares || 0) + (blog.commentCount || 0), 0);
  const totalViews = postsInRange.reduce((sum, blog) => sum + (blog.views || 0), 0);
  
  // Normalize to a 0-100 scale
  return totalViews > 0 ? Math.min(100, (totalEngagement / totalViews) * 100) : 0;
}

module.exports = router;
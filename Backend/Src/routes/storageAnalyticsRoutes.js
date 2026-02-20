const express = require('express');
const router = express.Router();
const Blog = require('../model/blog.model');
const Comment = require('../model/comment.model');
const CoverImage = require('../model/CoverImage');
const Ad = require('../model/Ad');
const AdInquiry = require('../model/AdInquiry');
const User = require('../model/user.model');
const fs = require('fs').promises;
const path = require('path');

// Storage analytics endpoint
router.get('/analytics/storage', async (req, res) => {
  try {
    // Server specs
    const totalCapacityMb = 25 * 1024; // 25GB in MB
    const lastUpdated = new Date().toISOString();

    // Blog storage
    const blogs = await Blog.find();
    const totalPosts = blogs.length;
    const avgPostSizeMb = 32.34; // From frontend, can be refined with actual file sizes
    const blogCoverImages = await CoverImage.find();
    const blogStorageBreakdown = {
      text_metadata_mb: totalPosts * 3.235, // Average of 1.62–4.85 MB
      images_mb: blogCoverImages.length * 11.13, // Average of 2.02–20.24 MB
      comments_mb: 0, // Will calculate below
    };
    const totalBlogSizeMb = blogStorageBreakdown.text_metadata_mb + blogStorageBreakdown.images_mb;

    // Comments
    const totalComments = await Comment.countDocuments();
    blogStorageBreakdown.comments_mb = totalComments * 2.035; // Average of 0.94–3.13 MB

    // Ads
    const ads = await Ad.findOne().lean();
    let adImagesMb = 0;
    if (ads && ads.adImages) {
      for (const adType of Object.keys(ads.adImages)) {
        const imagePath = path.join(__dirname, '..', 'Uploads', 'ads', ads.adImages[adType].split('/ads/')[1]);
        try {
          const stats = await fs.stat(imagePath);
          adImagesMb += stats.size / (1024 * 1024); // Convert bytes to MB
        } catch (err) {
          console.warn(`Ad image not found: ${imagePath}`);
        }
      }
    }
    const adMetadataMb = (Object.keys(ads?.adImages || {}).length * 1) / 1024; // ~1KB per ad type

    // Ad Inquiries
    const totalInquiries = await AdInquiry.countDocuments();
    const inquiriesMb = (totalInquiries * 1) / 1024; // ~1KB per inquiry

    // Users
    const users = await User.find();
    const totalUsers = users.length;
    const userDataMb = (totalUsers * 2) / 1024; // ~2KB per user
    let userHistoryMb = 0;
    users.forEach((user) => {
      userHistoryMb += ((user.loginHistory?.length || 0) + (user.sessions?.length || 0)) * 0.5 / 1024; // ~0.5KB per entry
    });

    // Coding files (static assumption)
    const codingFilesMb = 4096; // 4GB as per frontend

    // Total used storage
    const totalUsedMb = totalBlogSizeMb + blogStorageBreakdown.comments_mb + adImagesMb + adMetadataMb + inquiriesMb + userDataMb + userHistoryMb + codingFilesMb;
    const availableMb = totalCapacityMb - totalUsedMb;
    const usagePercentage = (totalUsedMb / totalCapacityMb) * 100;

    // Projections
    const growthRatePostsPerMonth = 10; // Example value, can be calculated from historical data
    const postsUntilFull = Math.floor(availableMb / avgPostSizeMb);
    const monthsUntilFull = postsUntilFull / growthRatePostsPerMonth;
    const estimatedFullDate = new Date();
    estimatedFullDate.setMonth(estimatedFullDate.getMonth() + monthsUntilFull);

    const response = {
      server_storage: {
        total_capacity_mb: totalCapacityMb,
        used_mb: totalUsedMb,
        available_mb: availableMb,
        usage_percentage: usagePercentage,
        last_updated: lastUpdated,
      },
      blog_storage: {
        total_posts: totalPosts,
        avg_post_size_mb: avgPostSizeMb,
        total_size_mb: totalBlogSizeMb,
        breakdown: blogStorageBreakdown,
      },
      coding_files: {
        total_size_mb: codingFilesMb,
        description: 'Application code, libraries, and static assets',
      },
      projections: {
        posts_until_full: postsUntilFull,
        growth_rate_posts_per_month: growthRatePostsPerMonth,
        months_until_full: monthsUntilFull,
        estimated_full_date: estimatedFullDate.toISOString(),
      },
      component_ranges: {
        text_metadata: { min: 1.62, max: 4.85 },
        images: { min: 2.02, max: 20.24 },
        comments: { min: 0.94, max: 3.13 },
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Error calculating storage analytics:', error);
    res.status(500).json({ message: 'Failed to calculate storage analytics', error: error.message });
  }
});

module.exports = router;
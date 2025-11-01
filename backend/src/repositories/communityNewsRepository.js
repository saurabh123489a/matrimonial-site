import CommunityNews from '../models/CommunityNews.js';

export const communityNewsRepository = {
  create: async (newsData) => {
    return await CommunityNews.create(newsData);
  },

  findById: async (newsId) => {
    return await CommunityNews.findById(newsId)
      .populate('author', 'name photos')
      .populate('approvedBy', 'name');
  },

  getByLocation: async (userDistrict, userState, userCountry, options = {}) => {
    const { skip = 0, limit = 20 } = options;
    
    // Build query: Get news for user's district, state, country, or global
    const query = {
      isActive: true,
      isPublished: true,
      $or: [
        // Global news
        { 'targetLocation.type': 'global' },
        // Country-level
        { 
          'targetLocation.type': 'country',
          'targetLocation.countries': { $in: [userCountry || 'India'] }
        },
        // State-level
        {
          'targetLocation.type': 'state',
          'targetLocation.states': { $in: [userState] }
        },
        // District-level
        {
          'targetLocation.type': 'district',
          'targetLocation.districts': { $in: [userDistrict] }
        },
      ],
    };

    return await CommunityNews.find(query)
      .populate('author', 'name photos')
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
  },

  getFeatured: async (options = {}) => {
    const { skip = 0, limit = 10 } = options;
    const query = {
      isActive: true,
      isPublished: true,
      isFeatured: true,
    };

    return await CommunityNews.find(query)
      .populate('author', 'name photos')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  },

  getByCategory: async (category, options = {}) => {
    const { skip = 0, limit = 20 } = options;
    const query = {
      category,
      isActive: true,
      isPublished: true,
    };

    return await CommunityNews.find(query)
      .populate('author', 'name photos')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  },

  search: async (filters, options = {}) => {
    const { skip = 0, limit = 20, sortBy = 'createdAt', sortOrder = -1 } = options;

    return await CommunityNews.find(filters)
      .populate('author', 'name photos')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);
  },

  count: async (filters = {}) => {
    return await CommunityNews.countDocuments({ ...filters, isActive: true, isPublished: true });
  },

  updateById: async (newsId, updateData) => {
    return await CommunityNews.findByIdAndUpdate(
      newsId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  },

  incrementViews: async (newsId) => {
    return await CommunityNews.findByIdAndUpdate(
      newsId,
      { $inc: { views: 1 } },
      { new: true }
    );
  },

  incrementLikes: async (newsId) => {
    return await CommunityNews.findByIdAndUpdate(
      newsId,
      { $inc: { likes: 1 } },
      { new: true }
    );
  },
};


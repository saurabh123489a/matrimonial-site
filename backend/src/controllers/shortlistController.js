import { shortlistService } from '../services/shortlistService.js';

export const addToShortlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { shortlistedUserId } = req.body;

    if (!shortlistedUserId) {
      return res.status(400).json({
        status: false,
        message: 'shortlistedUserId is required'
      });
    }

    const shortlist = await shortlistService.addToShortlist(userId, shortlistedUserId);
    
    res.status(201).json({
      status: true,
      message: 'Added to shortlist successfully',
      data: shortlist
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromShortlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { shortlistedUserId } = req.params;

    if (!shortlistedUserId) {
      return res.status(400).json({
        status: false,
        message: 'shortlistedUserId is required'
      });
    }

    const result = await shortlistService.removeFromShortlist(userId, shortlistedUserId);
    
    res.json({
      status: true,
      message: result.message,
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const getShortlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const shortlist = await shortlistService.getShortlist(userId);
    
    res.json({
      status: true,
      message: 'Shortlist retrieved successfully',
      data: shortlist
    });
  } catch (error) {
    next(error);
  }
};

export const checkIfShortlisted = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { shortlistedUserId } = req.params;

    const isShortlisted = await shortlistService.checkIfShortlisted(userId, shortlistedUserId);
    
    res.json({
      status: true,
      message: 'Status retrieved successfully',
      data: { isShortlisted: !!isShortlisted }
    });
  } catch (error) {
    next(error);
  }
};


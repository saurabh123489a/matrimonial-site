import { interestService } from '../services/interestService.js';

export const sendInterest = async (req, res, next) => {
  try {
    const fromUserId = req.user.id;
    const { toUserId } = req.body;

    if (!toUserId) {
      return res.status(400).json({
        status: false,
        message: 'toUserId is required'
      });
    }

    const interest = await interestService.sendInterest(fromUserId, toUserId);
    
    res.status(201).json({
      status: true,
      message: 'Interest sent successfully',
      data: interest
    });
  } catch (error) {
    next(error);
  }
};

export const respondToInterest = async (req, res, next) => {
  try {
    const toUserId = req.user.id;
    const { fromUserId, response } = req.body;

    if (!fromUserId || !response) {
      return res.status(400).json({
        status: false,
        message: 'fromUserId and response (accept/reject) are required'
      });
    }

    if (!['accept', 'reject'].includes(response)) {
      return res.status(400).json({
        status: false,
        message: 'response must be either "accept" or "reject"'
      });
    }

    const interest = await interestService.respondToInterest(fromUserId, toUserId, response);
    
    res.json({
      status: true,
      message: `Interest ${response}ed successfully`,
      data: interest
    });
  } catch (error) {
    next(error);
  }
};

export const getIncomingInterests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const interests = await interestService.getIncomingInterests(userId);
    
    res.json({
      status: true,
      message: 'Incoming interests retrieved successfully',
      data: interests
    });
  } catch (error) {
    next(error);
  }
};

export const getOutgoingInterests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const interests = await interestService.getOutgoingInterests(userId);
    
    res.json({
      status: true,
      message: 'Outgoing interests retrieved successfully',
      data: interests
    });
  } catch (error) {
    next(error);
  }
};


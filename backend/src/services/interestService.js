import { interestRepository } from '../repositories/interestRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { notificationService } from './notificationService.js';

export const interestService = {
  async sendInterest(fromUserId, toUserId) {
    // Check if users exist
    const [fromUser, toUser] = await Promise.all([
      userRepository.findById(fromUserId),
      userRepository.findById(toUserId),
    ]);

    if (!fromUser || !toUser) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    // Cannot send interest to yourself
    if (fromUserId.toString() === toUserId.toString()) {
      const error = new Error('Cannot send interest to yourself');
      error.status = 400;
      throw error;
    }

    // Check if interest already exists
    const existing = await interestRepository.findByPair(fromUserId, toUserId);
    if (existing) {
      const error = new Error('Interest already sent');
      error.status = 409;
      throw error;
    }

    // Create interest
    const interest = await interestRepository.create({
      fromUser: fromUserId,
      toUser: toUserId,
      status: 'pending',
    });

    // Create notification for the receiver
    await notificationService.createNotification({
      userId: toUserId,
      type: 'interest_received',
      title: 'Interest Received',
      message: `${fromUser.name} sent you an interest`,
      relatedUserId: fromUserId,
      relatedId: interest._id,
      metadata: {
        interestStatus: 'pending',
      },
    });

    return interest;
  },

  async respondToInterest(fromUserId, toUserId, response) {
    // Find the interest
    const interest = await interestRepository.findByPair(fromUserId, toUserId);
    
    if (!interest) {
      const error = new Error('Interest not found');
      error.status = 404;
      throw error;
    }

    // Verify the interest is directed to the current user
    const interestToUserId = interest.toUser?.toString() || interest.toUser?._id?.toString() || String(interest.toUser);
    const currentUserId = toUserId?.toString() || String(toUserId);
    
    if (interestToUserId !== currentUserId) {
      const error = new Error('Unauthorized');
      error.status = 403;
      throw error;
    }

    // Update status
    const status = response === 'accept' ? 'accepted' : 'rejected';
    const updated = await interestRepository.updateStatus(fromUserId, toUserId, status);
    
    // Create notification for the sender if accepted
    if (status === 'accepted') {
      const toUser = await userRepository.findById(toUserId);
      await notificationService.createNotification({
        userId: fromUserId,
        type: 'interest_accepted',
        title: 'Interest Accepted',
        message: `${toUser.name} accepted your interest`,
        relatedUserId: toUserId,
        relatedId: updated._id,
        metadata: {
          interestStatus: 'accepted',
        },
      });
    }
    
    return updated;
  },

  async getIncomingInterests(userId) {
    return await interestRepository.getIncoming(userId);
  },

  async getOutgoingInterests(userId) {
    return await interestRepository.getOutgoing(userId);
  },
};


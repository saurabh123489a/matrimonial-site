import OTP from '../models/OTP.js';

export const otpRepository = {
  async create(data) {
    return await OTP.create(data);
  },

  async findByPhoneAndCode(phone, code) {
    return await OTP.findOne({
      phone,
      code,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });
  },

  async markAsUsed(otpId) {
    return await OTP.findByIdAndUpdate(
      otpId,
      { isUsed: true },
      { new: true }
    );
  },

  async incrementAttempts(otpId) {
    return await OTP.findByIdAndUpdate(
      otpId,
      { $inc: { attempts: 1 } },
      { new: true }
    );
  },

  async deleteExpired() {
    return await OTP.deleteMany({ expiresAt: { $lt: new Date() } });
  },

  async findByPhone(phone) {
    return await OTP.find({ phone, isUsed: false }).sort({ createdAt: -1 });
  },
};


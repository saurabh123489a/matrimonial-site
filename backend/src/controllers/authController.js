import { authService } from '../services/authService.js';

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const { token, user } = await authService.login(identifier, password, req);
    return res.json({ status: true, message: 'Login successful', data: { token, user } });
  } catch (err) {
    next(err);
  }
};



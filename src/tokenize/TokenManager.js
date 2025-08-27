import jwt from 'jsonwebtoken';
import InvariantError from '../exceptions/InvariantError.js';

const TokenManager = {
  createAccessToken: (payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
  },

  createRefreshToken: (payload) => {
    const token = jwt.sign(payload, process.env.REFRESH_JWT_SECRET, { expiresIn: '15d' });
    return token;
  },

  verifyAccessToken: (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new InvariantError('Invalid access token');
    }
  },

  verifyRefreshToken: (token) => {
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new InvariantError('Invalid refresh token');
    }
  },
}

export default TokenManager;

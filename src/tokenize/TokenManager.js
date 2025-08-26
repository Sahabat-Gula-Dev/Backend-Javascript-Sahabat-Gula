import jwt from 'jsonwebtoken';

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
      throw new Error('Invalid access token');
    }
  },

  verifyRefreshToken: (token) => {
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  },
}

export default TokenManager;

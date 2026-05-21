import bcrypt from 'bcryptjs';
import { pool } from '../../db';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import config from '../../config/env';

const loginUserIntoDB = async (payLoad: { email: string; password: string }) => {
  const { email, password } = payLoad;
  // 1. check if the user exists
  // 2. Compare the password
  // 3. Generate Token
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1 `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error('User not found');
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error('Password is incorrect');
  }

  // Token Generate
  const jwtpayLoad = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    is_active: user.is_active,
  };
  const accessToken = jwt.sign(jwtpayLoad, config.secret as string, { expiresIn: '1h' });

  const refreshToken = jwt.sign(jwtpayLoad, config.refresh_secret as string, {
    expiresIn: '30d',
  });
  return { accessToken, refreshToken };
};

const generateRefreshToken = async (token: string) => {
  if (!token) {
    throw new Error('Refresh token is required');
  }

  const decoded = jwt.verify(token as string, config.refresh_secret as string) as JwtPayload;

  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [decoded.email]
  );

  const user = userData.rows[0];

  if (userData.rows.length === 0) {
    throw new Error('User not found');
  }

  if (!user.is_active) {
    throw new Error('User is not active');
  }

  const jwtpayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    is_active: user.is_active,
    email: user.email,
  };
  const accessToken = jwt.sign(jwtpayload, config.secret as string, {
    expiresIn: '1d',
  });

  return { accessToken };
};

export const authService = {
  loginUserIntoDB,
  generateRefreshToken,
};

import bcrypt from 'bcryptjs';
import { pool } from '../../db';
import jwt from 'jsonwebtoken';
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
    is_active: user.is_active,
  };
  const accessToken = jwt.sign(jwtpayLoad, config.secret as string, { expiresIn: '1h' });
  return { accessToken };
};
export const authService = {
  loginUserIntoDB,
};

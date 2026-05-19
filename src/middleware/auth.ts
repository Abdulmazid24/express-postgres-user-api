import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import config from '../config/env';
import { pool } from '../db';

export const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // console.log(req.headers.authorization);
      // 1. Check if the token exists
      //2. Verify the token
      // 3. find the user into database
      //  4. if the user active or not ?
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
          data: null,
        });
      }

      const decoded = jwt.verify(token as string, config.secret as string) as JwtPayload;

      const userData = await pool.query(
        `
      SELECT * FROM users  WHERE email=$1
      `,
        [decoded.email]
      );
      const user = userData.rows[0];
      // console.log(user);
      if (userData.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User Not Found',
          data: null,
        });
      }

      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden',
          data: 'Your account is not active',
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
export default auth;

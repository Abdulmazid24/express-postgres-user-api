import type { Request, Response } from 'express';
import { authService } from './auth.service';
import sendResponse from '../../utility/sendResponse';

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    const { refreshToken } = result;

    res.cookie('refreshToken', refreshToken, {
      secure: false, // Set to true in production (requires HTTPS)
      httpOnly: true,
      sameSite: 'lax',
    });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User logged in successfully',
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const refreshToken = async (req: Request, res: Response) => {
  try {
    const result = await authService.generateRefreshToken(req.cookies.refreshToken);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: ' Access Token generated successfully',
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const authController = {
  loginUser,
  refreshToken,
};

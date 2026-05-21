import type { Request, Response } from 'express';
import { pool } from '../../db';
import { userService } from './user.service';
import sendResponse from '../../utility/sendResponse';

const createUser = async (req: Request, res: Response) => {
  try {
    // const { name, email, password, age } = req.body;
    const result = await userService.createUserIntoDB(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'User created successfully',
      data: result.rows[0],
    });
    // console.log(result);
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  console.log('userController: ', req.user);
  try {
    const result = await userService.getAllUsersFromDB();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Users retrieved successfully',
      data: result.rows,
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

const getSingleUser = async (req: Request, res: Response) => {
  // const id = req.params.id;
  const { id } = req.params;
  try {
    const result = await userService.getSingleUserFromDB(id as string);
    if (result.rows.length === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'User Not found',
        data: {},
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Single user retrieved successfully',
      data: result.rows[0],
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

const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await userService.updateUserIntoDB(id as string, req.body);
    if (result.rows.length === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'User Not Found',
        data: {},
      });
    }

    // console.log(result);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'user updated successfully',
      data: result.rows[0],
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

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await userService.deleteUserFromDB(id as string);
    if (result.rowCount === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'User Not Found',
        data: {},
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User Deleted successfully',
      data: result.rows[0],
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

export const userController = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};

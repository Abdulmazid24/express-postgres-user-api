import type { Request, Response } from 'express';
import { pool } from '../../db';
import { userService } from './user.service';

const createUser = async (req: Request, res: Response) => {
  try {
    // const { name, email, password, age } = req.body;
    const result = await userService.createUserIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: 'User Created Successfully',
      data: result.rows[0],
    });
    // console.log(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await userService.getAllUsersFromDB();
    res.status(200).json({
      success: true,
      message: 'Users retrived successfully',
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
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
      return res.status(404).json({
        success: false,
        message: 'User Not found',
        data: {},
      });
    }

    res.status(200).json({
      success: true,
      message: 'Single user retrived successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
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
      return res.status(404).json({
        success: false,
        message: 'User Not Found',
        data: {},
      });
    }

    // console.log(result);
    res.status(200).json({
      success: true,
      message: 'user updated successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
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
      return res.status(404).json({
        success: false,
        message: 'User Not Found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User Deleted successfuly',
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error,
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

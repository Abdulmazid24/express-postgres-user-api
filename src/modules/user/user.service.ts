import { pool } from '../../db';
import type { IUser } from './user.interface';
import bcrypt from 'bcryptjs';

const createUserIntoDB = async (payLoad: IUser) => {
  const { name, email, password, age, role } = payLoad;
  const hashPassword = await bcrypt.hash(password, 10);
  console.log(hashPassword);
  const result = await pool.query(
    `
    INSERT INTO users(name,email,password,age,role) VALUES($1,$2,$3,$4, COALESCE($5, 'user')) RETURNING *
    `,
    [name, email, hashPassword, age, role]
  );
  delete result.rows[0].password;
  return result;
};

const getAllUsersFromDB = async () => {
  const result = await pool.query(`
   SELECT *  FROM users
  `);
  return result;
};

const getSingleUserFromDB = async (id: string) => {
  const result = await pool.query(
    `
  SELECT * FROM users WHERE id=$1 `,
    [id]
  );
  return result;
};

const updateUserIntoDB = async (id: string, payLoad: IUser) => {
  const { name, password, age, is_active } = payLoad;
  const result = await pool.query(
    `
  UPDATE users SET name=COALESCE ($1, name),
   password=COALESCE($2, password),
   age=COALESCE($3, age),
    is_active=COALESCE($4,is_active)
  WHERE id=$5 RETURNING *`,
    [name, password, age, is_active, id]
  );
  return result;
};

const deleteUserFromDB = async (id: string) => {
  const result = await pool.query(
    `
      DELETE FROM users WHERE id=$1
      `,
    [id]
  );
  return result;
};

export const userService = {
  createUserIntoDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserIntoDB,
  deleteUserFromDB,
};

import express, { type Application, type Request, type Response } from 'express';
import { Pool } from 'pg';
import config from './config/env';
const app: Application = express();
const port = config.port;

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  connectionString: config.connection_string,
});

const initDB = async () => {
  try {
    await pool.query(`
  CREATE TABLE IF NOT EXISTS users(
  id SERIAL PRIMARY KEY,
  name VARCHAR(20),
  email VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  age INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
  )
  
  `);
    console.log('Database connected successfully');
  } catch (error) {
    console.log(error);
  }
};

initDB();
app.get('/', (req: Request, res: Response) => {
  // res.send('Hello world ! This is Express Server');
  res.status(200).json({
    message: ' Hellow world! This is Express Server',
    author: 'Abdul Mazid',
  });
});

app.post('/api/users', async (req: Request, res: Response) => {
  try {
    // console.log(req.body);
    // const body = req.body;
    const { name, email, password, age } = req.body;
    const result = await pool.query(
      `
    INSERT INTO users(name,email,password,age) VALUES($1,$2,$3,$4) RETURNING *
    `,
      [name, email, password, age]
    );
    // console.log(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
});

app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
   SELECT *  FROM users
  `);
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
});

app.get('/api/users/:id', async (req: Request, res: Response) => {
  // const id = req.params.id;
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
  SELECT * FROM users WHERE id=$1 `,
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({
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
});

app.put('/api/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, password, age, is_active } = req.body;

  try {
    const result = await pool.query(
      `
  UPDATE users SET name=COALESCE ($1, name),
   password=COALESCE($2, password),
   age=COALESCE($3, age),
    is_active=COALESCE($4,is_active)
  WHERE id=$5 RETURNING *`,
      [name, password, age, is_active, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
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
});

app.delete('/api/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      DELETE FROM users WHERE id=$1
      `,
      [id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({
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
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

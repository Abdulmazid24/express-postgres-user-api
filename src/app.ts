import express, { response, type Application, type Request, type Response } from 'express';
import { userRoute } from './modules/user/user.route';
import { profileRoute } from './modules/profile/profile.route';
const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  // res.send('Hello world ! This is Express Server');
  res.status(200).json({
    message: ' Hellow world! This is Express Server',
    author: 'Abdul Mazid',
  });
});

app.use('/api/users', userRoute);
app.use('/api/profile', profileRoute);

export default app;

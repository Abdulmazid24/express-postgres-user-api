export interface IUser {
  name: string;
  email: string;
  password: string;
  age: number;
  role?: string; //admin, agent, user
  is_active: boolean;
}

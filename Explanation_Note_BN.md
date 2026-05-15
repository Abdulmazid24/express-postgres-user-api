# The Ultimate Deep-Dive: Modular Architecture Line-by-Line Anatomy

**Author:** Abdul Mazid  
**Profile:** Full-Stack MERN Developer | Distributed Systems Enthusiast  
**Date:** May 16, 2026

একজন বিশ্বসেরা ইঞ্জিনিয়ার হতে হলে কোডের শুধু আউটপুট দেখলে হয় না, বরং "প্রতিটি লাইন কী কাজ করছে এবং কেন করছে"—তার পেছনের বিজ্ঞান বুঝতে হয়। এই নোটে আমি আমাদের প্রোজেক্টের পুরো মডুলার আর্কিটেকচার (MVC Pattern) এবং রিলেশনাল ডাটাবেসের কোডকে "মাইক্রোস্কোপিক লেভেলে" ধরে ধরে এক্সপ্লেইন করেছি।

---

## ১. এনভায়রনমেন্ট এবং ডাটাবেস লেয়ার (Core Configuration)

### ১.১ `src/config/env.ts` (পরিবেশ সেটআপ)
```typescript
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const config = {
  connection_string: process.env.CONNECTION_STRING as string,
  port: process.env.PORT as string,
};
```
*   **`dotenv.config(...)`:** এই লাইনটি `.env` ফাইলের ডেটাগুলোকে Node.js এর মেমোরিতে (RAM) লোড করে।
*   **`process.cwd()`:** CWD মানে "Current Working Directory"। আপনি যে ফোল্ডার থেকে সার্ভার রান করছেন, সেটির পাথ এটি অটোমেটিক বের করে নেয়।
*   **`as string`:** এটি টাইপস্ক্রিপ্টের একটি ম্যাজিক যাকে বলা হয় Type Assertion। আমরা কম্পাইলারকে গ্যারান্টি দিচ্ছি যে, "তুমি চিন্তা করো না, `CONNECTION_STRING` এর মান অবশ্যই স্ট্রিং হবে, `undefined` হবে না।"

### ১.২ `src/db/index.ts` (ডাটাবেস কানেকশন ও স্কিমা)
```typescript
export const pool = new Pool({ connectionString: config.connection_string });
```
*   **`new Pool(...)`:** এটি ডাটাবেসের সাথে একটি পার্মানেন্ট কানেকশন পুল (Connection Pipeline) তৈরি করে। ক্লায়েন্টের বদলে পুল ব্যবহার করার কারণ হলো, এটি মেমোরিতে ১০-২০টি কানেকশন আগে থেকেই রেডি রাখে। ফলে বারবার TCP হ্যান্ডশেক করতে হয় না এবং সার্ভার রকেটের মতো ফাস্ট কাজ করে।

```sql
CREATE TABLE IF NOT EXISTS profiles(
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
...
```
*   **`IF NOT EXISTS`:** এটি চেক করে যে ডাটাবেসে আগে থেকেই `profiles` নামে কোনো টেবিল আছে কি না। থাকলে সে নতুন করে আর বানাবে না।
*   **`REFERENCES users(id)`:** এটি হলো ডাটাবেসের **Foreign Key**। এটি ডাটাবেসকে বলে দিচ্ছে, "আমার টেবিলের `user_id` কলামে শুধু সেই আইডিতেই প্রোফাইল বানাতে পারবে, যেই আইডির ইউজার `users` টেবিলে আগে থেকেই আছে।" এটি ডাটাবেসে অবৈধ ডাটা ঢুকতে বাধা দেয়।
*   **`ON DELETE CASCADE`:** এটি একটি স্বয়ংক্রিয় ট্রিগার। যদি কখনো `users` টেবিল থেকে ইউজারটি ডিলিট হয়ে যায়, তবে ডাটাবেস নিজে থেকেই এই `profiles` টেবিলে এসে ওই ইউজারের প্রোফাইলটিও ডিলিট করে দেবে। এর ফলে মেমোরিতে কোনো আবর্জনা (Orphan Data) জমে থাকে না।

---

## ২. অ্যাপ্লিকেশনের হার্ট ও ব্রেইন: `server.ts` বনাম `app.ts`

### ২.১ `src/server.ts` (The Entry Point)
```typescript
const main = () => {
  initDB();
  app.listen(config.port, () => {
    console.log(`This app listening on port ${config.port}`);
  });
};
main();
```
*   **কেন আলাদা ফাইল?** সার্ভার স্টার্ট করা এবং পোর্ট লিসেন করা একটি কাজ, আর API রাউটিং করা সম্পূর্ণ আলাদা কাজ (Separation of Concerns)। কালকে যদি আমরা টেস্টিং (Jest) করি, তখন আমাদের শুধু `app` দরকার হবে, `app.listen` দরকার হবে না। তাই একে আলাদা ফাইলে রাখা হয়েছে।

### ২.২ `src/app.ts` (The Traffic Police)
```typescript
app.use(express.json());
app.use('/api/users', userRoute);
app.use('/api/profile', profileRoute);
```
*   **`express.json()`:** ইন্টারনেট দিয়ে ডাটা আদান-প্রদান হয় বাইনারি বাফার (Buffer) হিসেবে। এই মিডলওয়্যারটি সেই বাফারকে পার্স করে জাভাস্ক্রিপ্ট অবজেক্টে রূপান্তর করে এবং `req.body` তে যুক্ত করে।
*   **`app.use('/api/users', userRoute)`:** ক্লায়েন্ট যখন `localhost:5000/api/users` এ হিট করবে, এক্সপ্রেস এই পাথটি ম্যাচ করে রিকোয়েস্টটিকে সোজা `userRoute` এর কাছে পাঠিয়ে দেবে।

---

## ৩. মডুলার আর্কিটেকচার: ইউজার মডিউল (MVC Deep Dive)

প্রতিটি মডিউলে (যেমন `user`) ৪টি করে ফাইল আছে। চলুন দেখি একটি રিকোয়েস্ট কীভাবে এক ফাইল থেকে অন্য ফাইলে যায়।

### ৩.১ `user.route.ts` (The Router)
```typescript
const router = Router();
router.post('/', userController.createUser);
router.get('/:id', userController.getSingleUser);
```
*   **`Router()`:** এটি এক্সপ্রেসের একটি মিনি-অ্যাপ্লিকেশন। এর কাজ শুধু ইনকামিং রিকোয়েস্টের মেথড (GET/POST/PUT) দেখা এবং সেই অনুযায়ী সঠিক কন্ট্রোলারকে কল করা। এখানে কোনো লজিক থাকে না।

### ৩.২ `user.controller.ts` (The Manager)
```typescript
const createUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```
*   **কী কাজ করছে?** কন্ট্রোলার হলো একজন ম্যানেজারের মতো। সে ফ্রন্টএন্ড থেকে আসা ডাটা (`req.body`) রিসিভ করে এবং সার্ভিসকে (Service) বলে, "এই ডাটা নাও এবং ডাটাবেসে সেভ করে আমাকে রেজাল্ট দাও।"
*   **`res.status(201).json(...)`:** সার্ভিস যখন ডাটা সেভ করে রেজাল্ট ফেরত দেয়, কন্ট্রোলার তখন সুন্দর একটি JSON ফরম্যাট বানিয়ে ফ্রন্টএন্ডে পাঠিয়ে দেয়। (201 মানে Created)।
*   **কেন আলাদা?** কন্ট্রোলারের ভেতরে কখনোই ডাটাবেসের SQL কুয়েরি লেখা উচিত নয়। কারণ কালকে যদি আমরা PostgreSQL এর বদলে MongoDB ব্যবহার করি, তবে কন্ট্রোলারে হাত দেওয়ার কোনো প্রয়োজন হবে না, শুধু সার্ভিসে হাত দিলেই হবে। এটিই ক্লিন কোডের মূলমন্ত্র।

### ৩.৩ `user.service.ts` (The Real Worker)
```typescript
const createUserIntoDB = async (payLoad: IUser) => {
  const { name, email, password, age } = payLoad;
  const result = await pool.query(
    `INSERT INTO users(name,email,password,age) VALUES($1,$2,$3,$4) RETURNING *`,
    [name, email, password, age]
  );
  return result;
};
```
*   **কী কাজ করছে?** এটি হলো মূল বিজনেস লজিক। কন্ট্রোলার একে কল করে। সে ডাটাবেসের পুল (`pool.query`) ব্যবহার করে সরাসরি SQL কুয়েরি চালায়।
*   **`VALUES($1, $2, ...)`:** এটি হলো প্যারামিটারাইজড কুয়েরি (Parameterized Query)। ডাটা সরাসরি SQL এ না বসিয়ে `$1` দিয়ে বসানোর কারণ হলো, এটি হ্যাকারদের SQL Injection থেকে ডাটাবেসকে ১০০% নিরাপদ রাখে।
*   **`RETURNING *`:** ইনসার্ট হওয়ার পর নতুন ডাটাটি দেখার জন্য আমাদের আবার `SELECT` কুয়েরি চালাতে হয় না। এই কমান্ডটি একই নেটওয়ার্ক কলের মধ্যে ডাটাটি ডাটাবেস থেকে ফেরত পাঠায়।

```typescript
// Update User in user.service.ts
`UPDATE users SET name=COALESCE ($1, name), age=COALESCE($3, age) WHERE id=$5 RETURNING *`
```
*   **`COALESCE` এর ম্যাজিক:** আপডেট করার সময় ফ্রন্টএন্ড থেকে ইউজার যদি শুধু `age` পাঠায় (নাম না পাঠায়), তবে `$1` এর মান হবে `NULL`। `COALESCE` ফাংশন চেক করে যে, নতুন ভ্যালু ফাঁকা হলে সে ডাটাবেসে থাকা আগের নামটাই রেখে দিবে। এর ফলে একটি রাউট দিয়েই Partial Update (PATCH) এর কাজ হয়ে যাচ্ছে। এটি সম্পূর্ণ Atomic Operation।

### ৩.৪ `profile.service.ts` (Cross-Table Logic)
```typescript
const createProfileIntoDB = async (payLoad: any) => {
  const user = await pool.query(`SELECT * FROM users WHERE id=$1`, [payLoad.user_id]);
  
  if (user.rows.length === 0) {
    throw new Error('User not found');
  }

  const result = await pool.query(`INSERT INTO profiles(...) VALUES(...) RETURNING *`, [...]);
  return result;
};
```
*   **লজিকের গভীরতা:** একটি প্রোফাইল তৈরি করার আগে সার্ভিস চেক করছে যে, ওই ইউজারটি আসলে `users` টেবিলে আছে কি না। `user.rows.length === 0` মানে হলো ডাটাবেস কোনো ইউজার পায়নি। তখন আমরা `throw new Error` দিয়ে একটি এরর তৈরি করছি। 
*   এই এররটি সরাসরি ক্যাচ (Catch) ব্লকে চলে যাবে এবং কন্ট্রোলার সেটি ধরে ক্লায়েন্টকে `500 Internal Server Error` পাঠিয়ে দেবে। ডাটাবেস লেভেলের ফরেন-কী এররের উপর নির্ভর না করে অ্যাপ্লিকেশন লেভেলেই আমরা এই ভ্যালিডেশনটি করে নিচ্ছি।

---

## উপসংহার (The Execution Flow)

একটি রিকোয়েস্ট যখন সার্ভারে আসে, তখন তার জার্নিটা ঠিক এমন হয়:
1.  **Postman** -> `POST http://localhost:5000/api/users`
2.  **`app.ts`** -> রিকোয়েস্ট রিসিভ করে এবং দেখে পাথ `/api/users`, তাই সে রিকোয়েস্টকে `userRoute` এর কাছে পাঠায়।
3.  **`user.route.ts`** -> দেখে রিকোয়েস্ট মেথড `POST`, তাই সে ডাটাগুলোকে `userController.createUser` এর কাছে পাঠিয়ে দেয়।
4.  **`user.controller.ts`** -> ডাটাগুলো (`req.body`) নিয়ে `userService.createUserIntoDB()` ফাংশনকে কল করে এবং রেজাল্টের জন্য অপেক্ষা করে।
5.  **`user.service.ts`** -> ডাটাবেসের সাথে কানেক্ট করে SQL কুয়েরি চালায়, ডাটা সেভ করে এবং ডাটাবেস থেকে পাওয়া রেজাল্ট কন্ট্রোলারকে ফেরত দেয়।
6.  **`user.controller.ts`** -> সার্ভিস থেকে রেজাল্ট পাওয়ার পর একটি সুন্দর JSON রেসপন্স বানিয়ে পোস্টম্যানকে (Postman) ফেরত দেয়।

এভাবেই একটি মনোলিথিক প্রজেক্টকে ভেঙে আমরা একটি প্রফেশনাল, স্কেলেবল এবং এন্টারপ্রাইজ-গ্রেড মডুলার আর্কিটেকচারে (Modular Architecture) রূপান্তর করেছি!

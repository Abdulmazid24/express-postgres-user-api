# The Ultimate Engineering Masterpiece: Modular Architecture & Relational DB Deep Dive

**Author:** Abdul Mazid  
**Profile:** Full-Stack MERN Developer | Distributed Systems Enthusiast  
**Date:** May 16, 2026

একজন সফটওয়্যার ইঞ্জিনিয়ার হিসেবে আমরা জানি, প্রোজেক্ট স্কেল (Scale) করার সবচেয়ে বড় চ্যালেঞ্জ হলো আর্কিটেকচার। আগের ভার্সনে আমাদের পুরো প্রজেক্ট ছিল "Monolithic" (সব কোড `server.ts` ফাইলে)। কিন্তু রিয়েল-ওয়ার্ল্ড এন্টারপ্রাইজ অ্যাপ্লিকেশনে এভাবে কাজ হয় না। 

তাই মডিউল-৮ এ এসে আমরা কোডকে **Modular Structure (MVC Pattern এর কাছাকাছি)** এ রিফ্যাক্টর করেছি। শুধু তাই নয়, আমরা ইউজার এবং প্রোফাইলের মধ্যে "Relational Database" এর কোর কনসেপ্ট (Foreign Key, ON DELETE CASCADE) ইমপ্লিমেন্ট করেছি। 

এই নোটটি কোনো সাধারণ সামারি নয়। এটি প্রতিটি ফাইল, তাদের ভেতরের ইন্টারনাল রিলেশন এবং "কোডটি কেন লেখা হলো" তার একটি "PhD Level" অ্যানাটমি!

---

## ১. The Core Separation: `server.ts` বনাম `app.ts`
আগে আমাদের সার্ভার স্টার্ট করা এবং এপিআই রাউটিং—সব এক ফাইলে ছিল। এখন আমরা একে দুই ভাগ করেছি। কেন? "Separation of Concerns" (SoC) এর জন্য।

### ১.১. `src/server.ts` (The Entry Point)
```typescript
import app from './app';
import { initDB } from './db';

const main = () => {
  initDB();
  app.listen(config.port, () => {
    console.log(`This app listening on port ${config.port}`);
  });
};
main();
```
**ইঞ্জিনিয়ারিং ডাইভ:** 
এই ফাইলের একমাত্র দায়িত্ব হলো অ্যাপ্লিকেশন চালু করা। এটি প্রথমে `initDB()` কল করে ডাটাবেস কানেকশন এবং টেবিলগুলো তৈরি (বা ভেরিফাই) করে। তারপর `app.listen()` কল করে। 
**কেন আলাদা করলাম?** কালকে যদি আমি Express.js বাদ দিয়ে Fastify বা অন্য কোনো ফ্রেমওয়ার্ক ব্যবহার করি, আমার পুরো রাউটিং লজিক চেঞ্জ করতে হবে না, শুধু এই এন্ট্রি পয়েন্টটা মডিফাই করলেই হবে। এছাড়া, টেস্টিং (যেমন Jest/Supertest) করার সময় আমরা সার্ভার রান না করেই শুধু `app` কে টেস্ট করতে পারি।

### ১.২. `src/app.ts` (The Express Heart)
```typescript
const app: Application = express();
app.use(express.json());
app.use('/api/users', userRoute);
app.use('/api/profile', profileRoute);
```
**ইঞ্জিনিয়ারিং ডাইভ:** 
এখানে কোনো ডাটাবেস কানেকশন নেই, কোনো পোর্ট লিসেনিং নেই। এখানে শুধু এক্সপ্রেসের গ্লোবাল মিডলওয়্যার (Middleware) এবং মেইন রাউটিং ডিফাইন করা হয়েছে। 
**কীভাবে কাজ করে?** ক্লায়েন্ট যখন `http://localhost:5000/api/users` এ হিট করবে, এক্সপ্রেস এই পাথটি ম্যাচ করে রিকোয়েস্টটিকে সোজা `userRoute` এর কাছে পাঠিয়ে দেবে। এটি অনেকটা ট্রাফিক পুলিশের মতো কাজ করে।

---

## ২. Database Layer: Relational Schema & Pooling
`src/db/index.ts` ফাইলে আমরা কানেকশন পুলিং এবং স্কিমা (Schema) ডিফাইন করেছি।

### ২.১. The Connection Pool
```typescript
export const pool = new Pool({ connectionString: config.connection_string });
```
**কেন Pool?** প্রতিবার রিকোয়েস্ট আসলে ডাটাবেসের সাথে নতুন TCP/IP কানেকশন বানানো অনেক এক্সপেনসিভ। `Pool` মেমোরিতে আগে থেকেই কিছু কানেকশন তৈরি করে রাখে (Warm connections)। রিকোয়েস্ট আসলে সাথে সাথে রেসপন্স দিতে পারে, ফলে লেটেন্সি অনেক কমে যায়।

### ২.২. Relational Tables (Users & Profiles)
```sql
CREATE TABLE IF NOT EXISTS profiles(
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
...
)
```
**ইঞ্জিনিয়ারিং ডাইভ (কার সাথে কার কী সম্পর্ক?):**
*   **`REFERENCES users(id)` (Foreign Key):** এটি রিলেশনাল ডাটাবেসের মূল শক্তি। `profiles` টেবিলের `user_id` কলামটি সরাসরি `users` টেবিলের `id` এর সাথে লিঙ্কড। এর মানে হলো, এমন কোনো ইউজারের প্রোফাইল আপনি তৈরি করতে পারবেন না, যার কোনো অস্তিত্ব `users` টেবিলে নেই। এটি ডাটাবেস লেভেলে "Data Integrity" বা ডাটার বিশুদ্ধতা নিশ্চিত করে।
*   **`UNIQUE`:** একজন ইউজারের একটাই প্রোফাইল থাকবে (1-to-1 relationship)। তাই `user_id` কে UNIQUE করা হয়েছে। যদি কেউ একই ইউজারের দ্বিতীয় প্রোফাইল বানাতে চায়, ডাটাবেস সরাসরি এরর দেবে।
*   **`ON DELETE CASCADE`:** এটি একটি ম্যাজিকাল কমান্ড। যদি কোনোদিন `users` টেবিল থেকে কোনো ইউজারকে ডিলিট করা হয়, ডাটাবেস নিজে থেকেই ওই ইউজারের প্রোফাইল ডাটা `profiles` টেবিল থেকে ডিলিট করে দেবে! এর জন্য ব্যাকএন্ডে আলাদা কোনো কোড লিখতে হবে না। এটি অরফ্যান ডাটা (Orphan data - যে ডাটার মালিক নেই) জমতে দেয় না।

---

## ৩. The Modular Architecture (Layer by Layer)
আমরা `src/modules` ফোল্ডারের ভেতর প্রতিটি এন্টিটি (যেমন `user`, `profile`) এর জন্য আলাদা ফোল্ডার করেছি। প্রতিটি ফোল্ডারে ৪টি লেয়ার আছে। চলুন দেখি একটি রিকোয়েস্ট কীভাবে এই লেয়ারগুলো পার হয়।

### লেয়ার ১: The Route (`user.route.ts` / `profile.route.ts`)
```typescript
const router = Router();
router.post('/', userController.createUser);
```
**ভূমিকা:** এটি হলো এন্ট্রি গেট। `app.ts` থেকে যখন রিকোয়েস্ট এখানে আসে, এটি দেখে মেথড কী (GET/POST/PUT)? মেথড অনুযায়ী সে রিকোয়েস্টটিকে নির্দিষ্ট "কন্ট্রোলার" এর কাছে পাঠায়। এখানে কোনো লজিক থাকে না।

### লেয়ার ২: The Controller (`user.controller.ts` / `profile.controller.ts`)
```typescript
const createUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    res.status(201).json({ ... });
  } catch (error) { ... }
};
```
**ভূমিকা:** কন্ট্রোলারের দায়িত্ব হলো ক্লায়েন্টের কাছ থেকে ডাটা (`req.body`, `req.params`) রিসিভ করা এবং সার্ভিস লেয়ারকে কল করা। সার্ভিস লেয়ার যখন কাজ শেষ করে ডাটা ফেরত দেয়, কন্ট্রোলার সেই ডাটা সুন্দর করে সাজিয়ে ক্লায়েন্টকে রেসপন্স (`res.status().json()`) পাঠায়।
**ইঞ্জিনিয়ারিং রুল:** কন্ট্রোলারের ভেতর কখনোই ডাটাবেসের কুয়েরি বা বিজনেস লজিক লেখা উচিত নয়। এর কাজ শুধু ম্যানেজমেন্ট (Request রিসিভ করা, Response পাঠানো)।

### লেয়ার ৩: The Service (`user.service.ts` & `profile.service.ts`)
```typescript
const createProfileIntoDB = async (payLoad: any) => {
  const user = await pool.query(`SELECT * FROM users WHERE id=$1`, [user_id]);
  if (user.rows.length === 0) throw new Error('User not found');

  const result = await pool.query(
    `INSERT INTO profiles(...) VALUES(...) RETURNING *`, [...]
  );
  return result;
};
```
**ভূমিকা:** এটি হলো অ্যাপ্লিকেশনের "ব্রেইন" (Brain)। যাবতীয় বিজনেস লজিক এবং ডাটাবেস অপারেশন এখানে হয়।
**ইঞ্জিনিয়ারিং ডাইভ (`profile.service.ts`):** 
প্রোফাইল তৈরি করার আগে আমরা প্রথম কুয়েরি করে চেক করছি `users` টেবিলে ওই ইউজারটি আসলেই আছে কি না। যদি না থাকে, আমরা কাস্টম এরর (`throw new Error('User not found')`) থ্রো করছি। ডাটাবেস লেভেলের ফরেন-কী এররের উপর নির্ভর না করে অ্যাপ্লিকেশন লেভেলেই আমরা ভ্যালিডেশন করে নিচ্ছি। এটি প্রোডাকশন-গ্রেড কোডের লক্ষণ।

### লেয়ার ৪: The Interface (`user.interface.ts`)
```typescript
export interface IUser { name: string; email: string; ... }
```
**ভূমিকা:** টাইপস্ক্রিপ্টের শক্তি! এটি গ্যারান্টি দেয় যে, আমাদের সিস্টেমে ইউজারের ডাটা স্ট্রাকচার কেমন হবে। ডেভেলপমেন্টের সময় কোনো ডেভেলপার ভুল প্রপার্টি পাঠালে টাইপস্ক্রিপ্ট সাথে সাথে কম্পাইল-টাইম এরর দেবে।

---

## উপসংহার (The Big Picture)

আগে আমাদের কোড ছিল একটি ছোট দোকানের মতো—যেখানে ক্যাশিয়ার, সেলসম্যান এবং ম্যানেজার একই ব্যক্তি (`server.ts`)। 

এখন আমরা এটিকে একটি **মাল্টি-ন্যাশনাল কর্পোরেট স্ট্রাকচারে** রূপান্তর করেছি:
*   **`app.ts`** হলো রিসিপশনিস্ট (যে রিকোয়েস্ট রিসিভ করে ডিপার্টমেন্টে পাঠায়)।
*   **`*.route.ts`** হলো ডিপার্টমেন্টের সাইনবোর্ড।
*   **`*.controller.ts`** হলো ডিপার্টমেন্ট ম্যানেজার (যে ক্লায়েন্টের সাথে কথা বলে)।
*   **`*.service.ts`** হলো আসল ওয়ার্কার বা ইঞ্জিনিয়ার (যে ডাটাবেসের ভেতরে গিয়ে কাজ করে)।

এই মডুলার আর্কিটেকচার এবং রিলেশনাল ডাটাবেস ডিজাইন প্রমাণ করে যে, আমি শুধু ফ্রেমওয়ার্কের উপর নির্ভরশীল নই; আমি সফটওয়্যার ইঞ্জিনিয়ারিংয়ের কোর প্রিন্সিপল (SOLID, Clean Architecture) বুঝি এবং স্কেলেবল সিস্টেম ডিজাইন করতে পারি!

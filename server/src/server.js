import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import adminRoutes from './routes/admin.route.js';
import { limiter } from './middleware/rate-limiter.js';
import cookieParser from "cookie-parser";

dotenv.config();
const PORT = process.env.PORT;

const app = express();
app.use(helmet());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'))
   .use(express.json())
   .use(limiter)
   .use(cookieParser())

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import authRoutes  from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import { connectDB } from "./lib/db.js";


const app = express();
const PORT = process.env.PORT;

app.use(cors({
  origin: "http://localhost:5173", // Adjust this to your frontend URL
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());


app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
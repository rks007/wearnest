# 🛒 Wearnest

A full-featured E-Commerce platform built using the **MERN Stack** (MongoDB, Express.js, React, Node.js) with **Zustand** for global state, **Cloudinary** for image handling, and **Redis** for token storage and caching featured products. Includes a secure **Admin Dashboard** to manage products and inventory.

---

## 🚀 Features

- 🔐 **User Authentication** – JWT & Refresh Token auth with Redis session storage
- 🛒 **Shopping Cart** – Add/remove items (Zustand-powered)
- 🛍️ **Product Listings** – View and filter all products
- 💳 **Checkout System** – Simulated order process
- 🌟 **Featured Products** – Cached with Redis for high-performance fetching
- 📦 **Admin Dashboard** – Add/delete products, mark as featured, view total count
- ☁️ **Cloudinary Integration** – Image upload & CDN delivery
- 📱 **Responsive UI** – Built with Tailwind CSS

---

## ⚙️ Tech Stack

**Frontend:**
- React.js
- Zustand
- Tailwind CSS
- Axios

**Backend:**
- Node.js + Express.js
- MongoDB (with Mongoose)
- Redis (for token storage & featured product caching)
- Cloudinary (for media)

---

## 🛠️ Admin Dashboard Features

- ➕ Add products with image uploads
- ❌ Delete products
- 🌟 Mark/unmark products as **Featured**
- 📊 View total product count
- 🔐 Access restricted to admin users (Role-based)

---

## ⚡ Redis-Powered Features

- **Featured Products Caching**  
  Admins can mark products as "featured", which are stored in Redis to speed up homepage and product highlight queries.

- **Access & Refresh Token Management**  
  - Refresh tokens stored securely in Redis with expiration.
  - Improved security by enabling session invalidation and token rotation.




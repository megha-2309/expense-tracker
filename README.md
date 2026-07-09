# Spendly - Expense Tracking App

Full-stack expense tracking application built with **Next.js**, **Express**, and **MongoDB**.

## 🌟 Features

- 🔐 User authentication with JWT
- 💰 Expense & category management
- 📊 Analytics dashboard with charts
- 🔄 Password reset via email
- 🌙 Dark/light mode support
- 📱 Fully responsive design

## 🛠️ Tech Stack

**Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Nodemailer  
**Frontend**: Next.js, React, Redux, Tailwind CSS, shadcn/ui, Recharts

## 📋 Prerequisites

- Node.js (v18+)
- MongoDB
- Git

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
# Create .env file
npm run dev
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

## 📚 Scripts

**Backend**: `npm run dev` | `npm run build` | `npm start`  
**Frontend**: `npm run dev` | `npm run build` | `npm start` | `npm run lint`

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/expenses` | Get all expenses |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/categories` | Get categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

## 📊 Database Models

- **User**: Email, password, name, timestamps
- **Expense**: User ref, amount, description, date, category
- **Category**: User ref, name, color/icon
- **PasswordResetToken**: User ref, token, expiration

## 🔐 Security

- Password hashing with bcryptjs
- JWT authentication
- Protected API routes
- Email verification
- Input validation with Zod

## 📝 Environment Variables

**Backend (.env)**:
```
MONGO_URI=your_mongo_connection
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:3000
PORT=5000
```

**Frontend (.env.local)**:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📄 License

MIT License - feel free to use this project!

---

**Happy Spending! 💰**

# Express TypeScript User Authentication API

A robust user authentication API built with Express.js, TypeScript, and MongoDB. Features user registration, login, JWT token authentication, and comprehensive validation.

## Features

- ✅ User registration with password hashing
- ✅ User login with JWT token generation
- ✅ Input validation and error handling
- ✅ MongoDB integration with Mongoose
- ✅ TypeScript support
- ✅ JWT-based authentication
- ✅ Comprehensive API documentation
- ✅ Test scripts included

## Tech Stack

- **Backend**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Custom validation logic
- **Development**: ts-node-dev for hot reloading

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd express-ts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=1d
   NODE_ENV=development
   ```

4. **Database Setup**
   
   Make sure your MongoDB instance is running. The application will automatically create the necessary collections.

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Base URL
```
http://localhost:3000/api/users
```

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login existing user |

## Quick Start Examples

### Register a New User

**Request:**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "securePassword123",
    "age": 25
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "age": 25,
      "todos": [],
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User

**Request:**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "age": 25,
      "todos": [],
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Testing

### Run Test Script
```bash
node test-api.js
```

This will run comprehensive tests including:
- User registration
- User login
- Validation errors
- Duplicate email handling

### Manual Testing with JavaScript

```javascript
// Register a new user
const registerUser = async () => {
  const response = await fetch('http://localhost:3000/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'securePassword123',
      age: 25
    })
  });
  
  const data = await response.json();
  console.log(data);
};

// Login with existing user
const loginUser = async () => {
  const response = await fetch('http://localhost:3000/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'john.doe@example.com',
      password: 'securePassword123'
    })
  });
  
  const data = await response.json();
  console.log(data);
};
```

## Validation Rules

### Registration
- **name**: Required, string
- **email**: Required, valid email format, must be unique
- **password**: Required, minimum 6 characters
- **age**: Optional, number

### Login
- **email**: Required, string
- **password**: Required, string

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "Specific field error"
  }
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created (registration)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials)
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error

## Project Structure

```
src/
├── config/          # Configuration files
│   └── user.controller.ts
├── controllers/     # Route controllers
│   └── user.controller.ts
├── middlewares/     # Express middlewares
│   ├── auth.middleware.ts
│   └── error.middleware.ts
├── models/          # Mongoose models
│   ├── user.model.ts
│   └── todo.model.ts
├── routes/          # API routes
│   ├── user.routes.ts
│   └── todo.routes.ts
├── services/        # Business logic
├── app.ts           # Express app setup
└── index.ts         # Server entry point
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs with salt rounds of 12
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Comprehensive validation for all inputs
- **Error Handling**: Secure error responses that don't leak sensitive information
- **Environment Variables**: Sensitive data stored in environment variables

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT token expiration | 1d |
| `NODE_ENV` | Environment mode | development |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository. 
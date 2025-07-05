# User Authentication API Documentation

## Base URL
```
http://localhost:3000/api/users
```

## Register User

### Endpoint
```
POST /register
```

### Description
Registers a new user with the provided information. The password is automatically hashed before storing in the database.

### Request Headers
```
Content-Type: application/json
```

### Request Body (Sample Payload)

#### Valid Registration Payload
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "age": 25
}
```

#### Minimal Registration Payload
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "password": "password123"
}
```

### Validation Rules
- **name**: Required, string
- **email**: Required, valid email format, must be unique
- **password**: Required, minimum 6 characters
- **age**: Optional, number

### Response Examples

#### Success Response (201 Created)
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
      "updatedAt": "2023-09-06T10:30:00.000Z",
      "__v": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZjhhMWIyYzNkNGU1ZjZhN2I4YzlkMCIsImlhdCI6MTY5Mzk5NzQwMCwiZXhwIjoxNjk0MDgzODAwfQ.example_signature"
  }
}
```

#### Error Response - Missing Required Fields (400 Bad Request)
```json
{
  "success": false,
  "message": "Missing required fields",
  "errors": {
    "name": "Name is required",
    "email": "Email is required",
    "password": "Password is required"
  }
}
```

#### Error Response - Invalid Email Format (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

#### Error Response - Password Too Short (400 Bad Request)
```json
{
  "success": false,
  "message": "Password must be at least 6 characters long"
}
```

#### Error Response - Email Already Exists (409 Conflict)
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

#### Error Response - Server Error (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Login User

### Endpoint
```
POST /login
```

### Description
Authenticates a user with email and password, returning a JWT token for subsequent authenticated requests.

### Request Headers
```
Content-Type: application/json
```

### Request Body (Sample Payload)

#### Valid Login Payload
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

### Validation Rules
- **email**: Required, string
- **password**: Required, string

### Response Examples

#### Success Response (200 OK)
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
      "updatedAt": "2023-09-06T10:30:00.000Z",
      "__v": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZjhhMWIyYzNkNGU1ZjZhN2I4YzlkMCIsImlhdCI6MTY5Mzk5NzQwMCwiZXhwIjoxNjk0MDgzODAwfQ.example_signature"
  }
}
```

#### Error Response - Missing Fields (400 Bad Request)
```json
{
  "success": false,
  "message": "Email and password are required",
  "errors": {
    "email": "Email is required",
    "password": "Password is required"
  }
}
```

#### Error Response - Invalid Credentials (401 Unauthorized)
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### Error Response - Server Error (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Testing with cURL

### Register a new user
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

### Login with existing user
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

## Testing with JavaScript/Fetch

### Register a new user
```javascript
const registerUser = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'securePassword123',
        age: 25
      })
    });
    
    const data = await response.json();
    console.log('Registration response:', data);
    
    if (data.success) {
      // Store token for future requests
      localStorage.setItem('token', data.data.token);
    }
  } catch (error) {
    console.error('Registration error:', error);
  }
};
```

### Login with existing user
```javascript
const loginUser = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'john.doe@example.com',
        password: 'securePassword123'
      })
    });
    
    const data = await response.json();
    console.log('Login response:', data);
    
    if (data.success) {
      // Store token for future requests
      localStorage.setItem('token', data.data.token);
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

## Using the JWT Token

After successful registration or login, you'll receive a JWT token. Use this token in the Authorization header for protected routes:

```javascript
const makeAuthenticatedRequest = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/api/protected-route', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  console.log('Protected route response:', data);
};
```

## Error Handling

All API responses follow a consistent format:

- **Success responses**: Include `success: true` and data in the `data` field
- **Error responses**: Include `success: false` and error details in the `message` field
- **Validation errors**: Include specific field errors in the `errors` object
- **Server errors**: In development mode, include the actual error message; in production, only include a generic message 
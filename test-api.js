const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/users';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test.user@example.com',
  password: 'testPassword123',
  age: 30
};

// Function to test registration
async function testRegistration() {
  console.log('🧪 Testing User Registration...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    
    console.log('📤 Request Payload:');
    console.log(JSON.stringify(testUser, null, 2));
    console.log('\n📥 Response:');
    console.log(`Status: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ Registration successful!');
      return data.data.token;
    } else {
      console.log('\n❌ Registration failed!');
      return null;
    }
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    return null;
  }
}

// Function to test login
async function testLogin() {
  console.log('\n🧪 Testing User Login...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const data = await response.json();
    
    console.log('📤 Request Payload:');
    console.log(JSON.stringify({
      email: testUser.email,
      password: testUser.password
    }, null, 2));
    console.log('\n📥 Response:');
    console.log(`Status: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ Login successful!');
      return data.data.token;
    } else {
      console.log('\n❌ Login failed!');
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return null;
  }
}

// Function to test validation errors
async function testValidationErrors() {
  console.log('\n🧪 Testing Validation Errors...\n');
  
  // Test missing required fields
  console.log('📝 Testing missing required fields...');
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User'
        // Missing email and password
      })
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test invalid email format
  console.log('\n📝 Testing invalid email format...');
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test short password
  console.log('\n📝 Testing short password...');
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: '123'
      })
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Function to test duplicate email
async function testDuplicateEmail() {
  console.log('\n🧪 Testing Duplicate Email...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser) // Same user data again
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  // Test registration
  const registrationToken = await testRegistration();
  
  // Test login
  const loginToken = await testLogin();
  
  // Test validation errors
  await testValidationErrors();
  
  // Test duplicate email
  await testDuplicateEmail();
  
  console.log('\n🎉 All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testRegistration,
  testLogin,
  testValidationErrors,
  testDuplicateEmail,
  runTests
}; 
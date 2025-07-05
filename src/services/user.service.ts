// User service - keeping only register logic
// This file can be used for additional user-related business logic if needed in the future

const dummyUsers = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];
  
  export const getUsers = () => {
    return dummyUsers;
  };
  
import { useState } from 'react';

const API = 'http://localhost:3000';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [users, setUsers] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const signup = async () => {
    await fetch(`${API}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    alert('User signed up!');
  };

  const signin = async () => {
    const res = await fetch(`${API}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      setIsSignedIn(true);
      alert('Signed in!');
    } else {
      alert('Login failed');
    }
  };

  const fetchUsers = async () => {
    const res = await fetch(`${API}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setUsers(data);
  };

  return (
    <div style={{ padding: 20 }}>
      {!isSignedIn ? (
        <>
          <h2>Signup / Signin</h2>
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          /><br /><br />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          /><br /><br />
          <button onClick={signup}>Signup</button>
          <button onClick={signin}>Signin</button>
        </>
      ) : (
        <>
          <h2>Users List (excluding you)</h2>
          <button onClick={fetchUsers}>Load Users</button>
          <ul>
            {users.map((u) => (
              <li key={u._id}>{u.username}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;

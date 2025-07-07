import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const API = 'http://localhost:3000';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [users, setUsers] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [CURRENT_USER_ID, setCurrentUserId] = useState(null);

  // Load token from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
      setIsSignedIn(true);
    }
  }, []);

  // Setup socket connection when signed in
  useEffect(() => {
    if (isSignedIn && token) {
      const newSocket = io('http://localhost:3000');
      setSocket(newSocket);

      // Decode token to get user ID
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(tokenPayload.id);
      
      // Join the socket room with user ID
      newSocket.emit('join', tokenPayload.id);

      // Listen for new messages
      newSocket.on('newMessage', () => {
        if (selectedUser) {
          fetchMessages(selectedUser._id);
        }
      });

      // Listen for message sent confirmation
      newSocket.on('messageSent', () => {
        if (selectedUser) {
          fetchMessages(selectedUser._id);
        }
      });

      return () => {
        newSocket.close();
      };
    }
  }, [isSignedIn, token, selectedUser]);

  // Fetch users when signed in
  useEffect(() => {
    if (isSignedIn && token) {
      fetchUsers();
    }
  }, [isSignedIn, token]);

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
      localStorage.setItem('authToken', data.token);
      alert('Signed in!');
    } else {
      alert('Login failed');
    }
  };

  const signout = () => {
    if (socket) {
      socket.close();
    }
    setToken('');
    setIsSignedIn(false);
    setUsers([]);
    setSelectedUser(null);
    setMessages([]);
    setNewMessage('');
    setSocket(null);
    setCurrentUserId(null);
    localStorage.removeItem('authToken');
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

  const fetchMessages = async (userId) => {
    const res = await fetch(`${API}/chat/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setMessages(data);
  };

  const openChat = async (user) => {
    setSelectedUser(user);
    await fetchMessages(user._id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const res = await fetch(`${API}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        receiverId: selectedUser._id,
        message: newMessage,
      }),
    });
    
    if (res.ok) {
      setNewMessage('');
    }
  };

  const closeChat = () => {
    setSelectedUser(null);
    setMessages([]);
    setNewMessage('');
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
      ) : selectedUser ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2>Chat with {selectedUser.username}</h2>
            <div>
              <button onClick={closeChat} style={{ marginRight: 10 }}>Cancel Chat</button>
              <button onClick={signout}>Sign Out</button>
            </div>
          </div>
          <div style={{ border: '1px solid #ccc', height: 300, overflowY: 'scroll', padding: 10, marginBottom: 10 }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ marginBottom: 10 }}>
                <strong>
                  {msg.senderId && typeof msg.senderId === 'object' ? msg.senderId.username : 
                   msg.senderId === CURRENT_USER_ID ? 'You' : 'Unknown'}:
                </strong> {msg.message}
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(msg.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              style={{ flex: 1 }}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2>Users List (excluding you)</h2>
            <button onClick={signout}>Sign Out</button>
          </div>
          <ul>
            {users.map((u) => (
              <li key={u._id} style={{ cursor: 'pointer', marginBottom: 5 }}>
                <span onClick={() => openChat(u)} style={{ color: 'blue', textDecoration: 'underline' }}>
                  {u.username}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;

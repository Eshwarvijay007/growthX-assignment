import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [task, setTask] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isAdmin ? '/api/admin/login' : '/api/users/login';
      const res = await axios.post(`http://localhost:5000${endpoint}`, { username, password });
      setUser({ username, token: res.data.token, isAdmin });
    } catch (err) {
      alert('Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isAdmin ? '/api/admin/register' : '/api/users/register';
      const res = await axios.post(`http://localhost:5000${endpoint}`, { username, password });
      setUser({ username, token: res.data.token, isAdmin });
    } catch (err) {
      alert('Registration failed');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUsername('');
    setPassword('');
    setIsAdmin(false);
    setTask('');
    setAdminUsername('');
    setAssignments([]);
    setSelectedAdmin('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      //await axios.post('http://localhost:5000/api/users/upload', 
       await axios.post('http://localhost:5000/assignments', 
        { task, adminId: selectedAdmin },
        { headers: { 
          'x-auth-token': user.token,
          'Content-Type': 'application/json'
        }  }
      );
      alert('Assignment uploaded successfully');
      setTask('');
      setAdminUsername('');
    } catch (err) {
      alert('Upload failed' + err.response.data.message);
    }
  };

  const handleFetchAssignments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/assignments', 
        { headers: { 'x-auth-token': user.token } }
      );
      setAssignments(res.data);
    } catch (err) {
      alert('Failed to fetch assignments');
    }
  };

  const handleAssignmentAction = async (id, action) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/assignments/${id}/${action}`, 
        {},
        { headers: { 'x-auth-token': user.token } }
      );
      handleFetchAssignments();
    } catch (err) {
      alert(`Failed to ${action} assignment`);
    }
  };

  //to fetch the list of admins in DB
  useEffect(() => {
    if (user && !user.isAdmin) {
      fetchAdmins();
    }
  }, [user]);

  const fetchAdmins = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admins');
      setAdmins(res.data);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    }
  };

  return (
    <div className="App">
       {user && (
        <button 
          onClick={handleLogout} 
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      )}
      <h1>Assignment Submission Portal</h1>
      {!user ? (
        <div>
          <h2>Login / Register</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="text" 
              placeholder="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <label>
              <input 
                type="checkbox" 
                checked={isAdmin} 
                onChange={(e) => setIsAdmin(e.target.checked)} 
              /> 
              Register/Login as Admin
            </label>
            <button type="submit">Login</button>
            <button type="button" onClick={handleRegister}>Register</button>
          </form>
        </div>
      ) : (
        <div>
          <h2>Welcome, {user.username}! ({user.isAdmin ? 'Admin' : 'User'})</h2>
          {!user.isAdmin && (
            <>
              <h3>Upload Assignment</h3>
              <form onSubmit={handleUpload}>
            <input 
              type="text" 
              placeholder="Task" 
              value={task} 
              onChange={(e) => setTask(e.target.value)} 
            />
            <select 
              value={selectedAdmin} 
              onChange={(e) => setSelectedAdmin(e.target.value)}
              required
            >
              <option value="">Select an admin</option>
              {admins.map((admin) => (
                <option key={admin._id} value={admin._id}>
                  {admin.username}
                </option>
              ))}
            </select>
            <button type="submit">Upload</button>
          </form>
            </>
          )}
          {user.isAdmin && (
            <>
              <h3>Admin Functions</h3>
              <button onClick={handleFetchAssignments}>Fetch Assignments</button>
              <ul>
                {assignments.map((assignment) => (
                  <li key={assignment._id}>
                    <p>User: {assignment.userId.username}</p>
                    <p>Task: {assignment.task}</p>
                    <p>Status: {assignment.status}</p>
                    <p>Submitted: {new Date(assignment.createdAt).toLocaleString()}</p>
                    {assignment.status === 'pending' && (
                      <div>
                        <button onClick={() => handleAssignmentAction(assignment._id, 'accept')}>Accept</button>
                        <button onClick={() => handleAssignmentAction(assignment._id, 'reject')}>Reject</button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
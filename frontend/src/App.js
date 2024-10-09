import React, { useState } from 'react';
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

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users/upload', 
        { task, admin: adminUsername },
        { headers: { 'x-auth-token': user.token } }
      );
      alert('Assignment uploaded successfully');
      setTask('');
      setAdminUsername('');
    } catch (err) {
      alert('Upload failed');
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

  return (
    <div className="App">
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
                <input 
                  type="text" 
                  placeholder="Admin Username" 
                  value={adminUsername} 
                  onChange={(e) => setAdminUsername(e.target.value)} 
                />
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
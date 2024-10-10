import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // State variables 
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [task, setTask] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState('');

  // Function to handle login
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevents the default form submission 
    try {
      const endpoint = isAdmin ? '/api/admin/login' : '/api/users/login';
      // Makes a POST request
      const res = await axios.post(`http://localhost:5000${endpoint}`, { username, password });
      // Sets the user state with the response data
      setUser({ username, token: res.data.token, isAdmin });
    } catch (err) {
      alert('Login failed'); 
    }
  };

  // Function to handle registration
  const handleRegister = async (e) => {
    e.preventDefault(); 
    try {
      const endpoint = isAdmin ? '/api/admin/register' : '/api/users/register';
      // Makes a POST request 
      const res = await axios.post(`http://localhost:5000${endpoint}`, { username, password });
      // Sets the user state with the response data
      setUser({ username, token: res.data.token, isAdmin });
    } catch (err) {
      alert('Registration failed'); 
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    // when logout button is clicked all the session data willbe set to null
    setUser(null);
    setUsername('');
    setPassword('');
    setIsAdmin(false);
    setTask('');
    setAdminUsername('');
    setAssignments([]);
    setSelectedAdmin('');
  };

  // Function to handle assignment upload
  const handleUpload = async (e) => {
    e.preventDefault(); 
    try {
      // Makes a POST request to the assignments endpoint with task and adminId
      await axios.post('http://localhost:5000/assignments', 
        { task, adminId: selectedAdmin },
        { headers: { 
          'x-auth-token': user.token, // Includes the user's token in the request headers
          'Content-Type': 'application/json'
        }  }
      );
      alert('Assignment uploaded successfully'); 
      // Resets task and adminUsername state variables
      setTask('');
      setAdminUsername('');
    } catch (err) {
      alert('Upload failed' + err.response.data.message);
    }
  };

  // Function to fetch assignments
  const handleFetchAssignments = async () => {
    try {
      // Makes a GET request to the assignments endpoint
      const res = await axios.get('http://localhost:5000/api/admin/assignments', 
        { headers: { 'x-auth-token': user.token } } // Includes the user's token in the request headers
      );
      // Sets the assignments state with the response data
      setAssignments(res.data);
    } catch (err) {
      alert('Failed to fetch assignments'); 
    }
  };

  // Function to handle assignment actions (accept or reject)
  const handleAssignmentAction = async (id, action) => {
    try {
      // Makes a POST request to the assignment action endpoint with the assignment ID and action
      await axios.post(`http://localhost:5000/api/admin/assignments/${id}/${action}`, 
        {},
        { headers: { 'x-auth-token': user.token } } // Includes the user's token in the request headers
      );
      // update the assignments state
      handleFetchAssignments();
    } catch (err) {
      alert(`Failed to ${action} assignment`); 
    }
  };

  // Effect to fetch admins if the user is not an admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      fetchAdmins(); // Calls the fetchAdmins function
    }
  }, [user]);

  // Function to fetch admins
  const fetchAdmins = async () => {
    try {
      // Makes a GET request to the admins endpoint
      const res = await axios.get('http://localhost:5000/api/admins');
      // Sets the admins state with the response data
      setAdmins(res.data);
    } catch (err) {
      console.error('Failed to fetch admins:', err); 
    }
  };

  // JSX for the App component
  return (
    <div className="App">
       {user && (
        //logout button with css
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
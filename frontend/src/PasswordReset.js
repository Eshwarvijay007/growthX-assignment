import React, { useState } from 'react';
import axios from 'axios';

function PasswordReset({ isAdmin }) {
  const [username, setUsername] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/reset-password-request', { username, isAdmin });
      setResetToken(res.data.resetToken);
      setMessage('Reset token generated. Please enter your new password.');
      setStep(2);
    } catch (err) {
      setMessage(err.response.data.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/reset-password', { token: resetToken, newPassword, isAdmin });
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      setMessage(err.response.data.message);
    }
  };

  return (
    <div>
      <h2>Reset {isAdmin ? 'Admin' : 'User'} Password</h2>
      {step === 1 && (
        <form onSubmit={handleRequestReset}>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button type="submit">Request Password Reset</button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleResetPassword}>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
      )}
      {step === 3 && (
        <p>Password reset successful. You can now login with your new password.</p>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

export default PasswordReset;
//dont have enough time to implement the forget password and OAuth.
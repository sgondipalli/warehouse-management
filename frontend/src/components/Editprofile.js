import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import styles from '../styles/EditProfile.module.css';

const EditProfile = () => {
  const { authState } = useAuth();
  const [formData, setFormData] = useState({
    username: authState.user?.username || '',
    password: '',
    firstName: authState.user?.firstName || '',
    lastName: authState.user?.lastName || '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        'http://localhost:5001/api/edit-profile',
        formData,
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div className={styles.editProfileContainer}>
      <h2>Edit Profile</h2>

      <div className={styles.readOnlyFields}>
        <p><strong>ID:</strong> {authState.user?.id}</p>
        <p><strong>Email:</strong> {authState.user?.email}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <label>Username:
          <input name="username" value={formData.username} onChange={handleChange} required />
        </label>

        <label>Password (leave blank to keep current):
          <input type="password" name="password" value={formData.password} onChange={handleChange} />
        </label>

        <label>First Name:
          <input name="firstName" value={formData.firstName} onChange={handleChange} />
        </label>

        <label>Last Name:
          <input name="lastName" value={formData.lastName} onChange={handleChange} />
        </label>

        <button type="submit">Save Changes</button>
      </form>

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default EditProfile;

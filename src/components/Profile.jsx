import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/profile.css';

const DEFAULT_AVATAR = '/avatars/680dd39a0e41fa54308ac416.png';

const Profile = ({ user, onLogout, onUpdateUser }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [bio, setBio] = useState(user?.bio || '');
  const [socialLinks, setSocialLinks] = useState(user?.socialLinks || {});
  const [socialLinkErrors, setSocialLinkErrors] = useState({});
  const [preferences, setPreferences] = useState(user?.preferences || {});
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [watchlistError, setWatchlistError] = useState(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit');
        return;
      }
      if (photoURL && photoURL.startsWith('blob:')) {
        URL.revokeObjectURL(photoURL);
      }
      setAvatarFile(file);
      setPhotoURL(URL.createObjectURL(file));
      setError(null);
    }
  };

  const validateUrl = (url) => {
    if (!url) return true; // Empty is allowed
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSocialLinkChange = (key, value) => {
    setSocialLinks((prev) => ({ ...prev, [key]: value }));
    setSocialLinkErrors((prev) => ({
      ...prev,
      [key]: !validateUrl(value),
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }
    setLoading(true);
    try {
      await api.put('/users/password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPasswordSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      let updatedUser = null;

      // If avatarFile is selected, upload it first
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        const uploadResponse = await api.put('/users/profile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        updatedUser = uploadResponse.data;
        setPhotoURL(updatedUser.photoURL || '');
      }

      // Prepare profile data to update
      const profileData = {
        username,
        bio,
        socialLinks,
        preferences,
      };

      // If avatar was uploaded, include photoURL from updatedUser
      if (updatedUser && updatedUser.photoURL) {
        profileData.photoURL = updatedUser.photoURL;
      }

      // Update other profile fields
      const response = await api.put('/users/profile', profileData);

      if (onUpdateUser) {
        onUpdateUser(response.data);
      } else {
        const userResponse = await api.get('/users/profile');
        onUpdateUser?.(userResponse.data);
      }

      setSuccessMessage('Profile updated successfully');
      setEditing(false);
      setAvatarFile(null);
      if (photoURL && photoURL.startsWith('blob:')) {
        URL.revokeObjectURL(photoURL);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!editing && !successMessage) {
      setUsername(user?.username || '');
      setPhotoURL(user?.photoURL || '');
      setBio(user?.bio || '');
      setSocialLinks(user?.socialLinks || {});
      setPreferences(user?.preferences || {});
    }
  }, [user, editing, successMessage]);

  useEffect(() => {
    // Fetch watchlist on component mount
    const fetchWatchlist = async () => {
      setWatchlistLoading(true);
      setWatchlistError(null);
      try {
        const response = await api.get('/users/watchlist');
        setWatchlist(response.data);
      } catch (err) {
        setWatchlistError('Failed to load watchlist');
      } finally {
        setWatchlistLoading(false);
      }
    };
    fetchWatchlist();
  }, []);

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    setEditing(false);
    setError(null);
    setSuccessMessage(null);
    if (photoURL && photoURL.startsWith('blob:')) {
      URL.revokeObjectURL(photoURL);
      setPhotoURL(user?.photoURL || '');
    }
  };

  return (
    <div className={`profile-container ${preferences.theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <div
        className="profile-summary"
        onClick={toggleSettings}
        tabIndex={0}
        role="button"
        aria-label="Toggle profile settings"
      >
        {photoURL ? (
          <img
            src={photoURL || DEFAULT_AVATAR}
            alt={`${username || 'User'} avatar`}
            className="profile-avatar"
            onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
          />
        ) : (
          <div className="profile-avatar-placeholder">No Image</div>
        )}
        <span className="profile-name">{username || 'User'}</span>
        <span className="profile-arrow">{showSettings ? '▲' : '▼'}</span>
      </div>
      {showSettings && (
        <div className="profile-settings">
          {editing ? (
            <>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                disabled={loading}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
                disabled={loading}
                rows={3}
              />
              <div className="social-links">
                <label>Twitter:</label>
                <input
                  type="text"
                  value={socialLinks.twitter || ''}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  disabled={loading}
                  className={socialLinkErrors?.twitter ? 'input-error' : ''}
                />
                <label>Facebook:</label>
                <input
                  type="text"
                  value={socialLinks.facebook || ''}
                  onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                  disabled={loading}
                  className={socialLinkErrors?.facebook ? 'input-error' : ''}
                />
                <label>Instagram:</label>
                <input
                  type="text"
                  value={socialLinks.instagram || ''}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  disabled={loading}
                  className={socialLinkErrors?.instagram ? 'input-error' : ''}
                />
                <label>Website:</label>
                <input
                  type="text"
                  value={socialLinks.website || ''}
                  onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                  disabled={loading}
                  className={socialLinkErrors?.website ? 'input-error' : ''}
                />
              </div>
              <div className="preferences">
                <label>
                  Theme:
                  <select
                    value={preferences.theme || 'light'}
                    onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                    disabled={loading}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </label>
              </div>
              {loading && <p className="loading-message">Saving...</p>}
              <button
                className="profile-settings-button"
                onClick={handleSave}
                disabled={loading}
              >
                Save
              </button>
              <button
                className="profile-settings-button"
                onClick={() => {
                  setEditing(false);
                  setError(null);
                  setSuccessMessage(null);
                  setUsername(user?.username || '');
                  setPhotoURL(user?.photoURL || '');
                  setBio(user?.bio || '');
                  setSocialLinks(user?.socialLinks || {});
                  setPreferences(user?.preferences || {});
                  setAvatarFile(null);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError(null);
                  setPasswordSuccess(null);
                }}
                disabled={loading}
              >
                Cancel
              </button>
              {error && <p className="error-message">{error}</p>}
              {successMessage && <p className="success-message">{successMessage}</p>}
            </>
          ) : (
            <>
              <button
                className="profile-settings-button"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
              <button className="profile-settings-button" onClick={onLogout}>
                Logout
              </button>
            </>
          )}
          <div className="password-change">
            <h4>Change Password</h4>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
            <button
              className="profile-settings-button"
              onClick={handlePasswordChange}
              disabled={loading}
            >
              Change Password
            </button>
            {passwordError && <p className="error-message">{passwordError}</p>}
            {passwordSuccess && <p className="success-message">{passwordSuccess}</p>}
          </div>
          <div className="profile-watchlist">
            <h4>Watchlist</h4>
            {watchlistLoading ? (
              <p>Loading watchlist...</p>
            ) : watchlistError ? (
              <p className="error-message">{watchlistError}</p>
            ) : watchlist.length === 0 ? (
              <p>No movies in watchlist.</p>
            ) : (
              <ul>
                {watchlist.map((item) => (
                  <li key={item.movie.id} className="watchlist-item">
                    <img
                      src={item.movie.thumbnail || ''}
                      alt={item.movie.title}
                      className="watchlist-thumbnail"
                      onError={(e) => { e.target.src = ''; }}
                    />
                    <div className="watchlist-info">
                      <span className="watchlist-title">{item.movie.title}</span>
                      <span className="watchlist-year">{item.movie.year}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      <div className="profile-extra-info">
        <h3>User Information</h3>
        <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
        <p><strong>Member since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
      </div>
    </div>
  );
};

export default Profile;
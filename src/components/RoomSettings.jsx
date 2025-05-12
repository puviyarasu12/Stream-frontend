import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/room-settings.css';

const RoomSettings = ({ room, onSettingsUpdate, currentUserId }) => {
  const [settings, setSettings] = useState({
    videoLink: ''
  });

  const isCreator = room.creator && (
    (typeof room.creator === 'string' && room.creator === currentUserId) ||
    (room.creator._id && room.creator._id === currentUserId)
  );

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Debug creator status
  useEffect(() => {
    console.log('RoomSettings: isCreator=', isCreator, 'currentUserId=', currentUserId, 'room.creator=', room.creator);
  }, [isCreator, currentUserId, room.creator]);

  // Initialize settings from room data
  useEffect(() => {
    if (room.settings) {
      setSettings(prev => ({ ...prev, ...room.settings }));
    }
  }, [room.settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isCreator) {
      setError('Only the room creator can update settings.');
      return;
    }
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      console.log('RoomSettings: Sending videoLink update:', settings.videoLink);
      const response = await api.patch(`/rooms/${room._id}/settings`, { videoLink: settings.videoLink });
      console.log('RoomSettings: VideoLink update response:', response.data);
      onSettingsUpdate(response.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to update video link. Please try again.';
      console.error('RoomSettings: Error updating video link:', errorMsg, error);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isCreator) {
      setError('Only the room creator can delete the room.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this Zone? This action cannot be undone.')) {
      return;
    }
    setError(null);
    setLoading(true);
    try {
      console.log('RoomSettings: Deleting room:', room._id);
      await api.delete(`/rooms/${room._id}`);
      console.log('RoomSettings: Room deleted successfully');
      onSettingsUpdate(null, true);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to delete room. Please try again.';
      console.error('RoomSettings: Error deleting room:', errorMsg, error);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-settings">
      <h3>Zone Settings</h3>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Settings updated successfully!</div>}
      {!isCreator && (
        <div className="error-message">You are not authorized to modify these settings.</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="settings-group">
          <label>
            Video Link (YouTube or any URL):
            <input
              type="url"
              name="videoLink"
              value={settings.videoLink}
              onChange={handleChange}
              placeholder="Enter video URL"
              disabled={loading || !isCreator}
            />
          </label>
        </div>
        <button
          type="submit"
          className="save-settings-btn"
          disabled={loading || !isCreator}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
      <button
        onClick={handleDelete}
        className="delete-room-btn"
        disabled={loading || !isCreator}
      >
        {loading ? 'Processing...' : 'Delete Room'}
      </button>
    </div>
  );
};

export default RoomSettings;
import React, { useState, useRef } from 'react';
import { useAuth } from '../App';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  User, Mail, Phone, Building, GraduationCap, Camera, 
  Edit2, Save, X, Check, Calendar, Upload, Gift, Copy, Users
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [copyMessage, setCopyMessage] = useState('');
  const fileInputRef = useRef(null);

  const [editData, setEditData] = useState({
    email: user?.email || '',
    phone_number: user?.phone_number || '',
  });

  const handleEditToggle = () => {
    if (isEditing) {
      setEditData({
        email: user?.email || '',
        phone_number: user?.phone_number || '',
      });
    }
    setIsEditing(!isEditing);
    setMessage({ type: '', text: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.patch(`${API_URL}/api/profile/me`, editData);
      updateUser(response.data);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)' });
      return;
    }

    setUploadingPhoto(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/api/upload/profile-picture`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser({ profile_picture: response.data.profile_picture });
      setMessage({ type: 'success', text: 'Profile picture updated!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to upload photo' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCopyReferralCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      setCopyMessage('Copied!');
      setTimeout(() => setCopyMessage(''), 2000);
    }
  };

  const profileFields = [
    { key: 'name', label: 'Full Name', icon: User, editable: false },
    { key: 'register_number', label: 'Register Number', icon: User, editable: false },
    { key: 'email', label: 'Email Address', icon: Mail, editable: true },
    { key: 'phone_number', label: 'Phone Number', icon: Phone, editable: true },
    { key: 'department', label: 'Department', icon: Building, editable: false },
    { key: 'year_of_study', label: 'Year of Study', icon: GraduationCap, editable: false },
  ];

  const getProfilePictureUrl = () => {
    if (!user?.profile_picture) return null;
    if (user.profile_picture.startsWith('http')) return user.profile_picture;
    return `${API_URL}${user.profile_picture}`;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 page-transition">
      {/* Page Header */}
      <div className="max-w-4xl mx-auto mb-6 md:mb-8">
        <h1 className="font-heading text-2xl md:text-4xl mb-2">My Profile</h1>
        <p className="font-body text-xs md:text-sm text-gray-600">Manage your PERSOFEST'26 registration details</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className="max-w-4xl mx-auto mb-6">
          <div
            className={`p-4 border-2 border-black font-body text-sm flex items-center gap-2 ${
              message.type === 'success' ? 'bg-accent' : 'bg-primary'
            }`}
            data-testid="message-banner"
          >
            {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
            {message.text}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4">
          {/* Profile Picture Card */}
          <div className="md:col-span-1">
            <div className="card-brutal p-4 md:p-6 text-center h-full transition-all duration-300 hover:shadow-brutal-lg">
              <h3 className="font-heading text-xs md:text-sm uppercase tracking-widest mb-3 md:mb-4">Profile Photo</h3>
              
              <div 
                className="relative w-32 h-32 mx-auto mb-4 cursor-pointer group"
                onClick={handlePhotoClick}
              >
                {getProfilePictureUrl() ? (
                  <img
                    src={getProfilePictureUrl()}
                    alt={user?.name}
                    className="w-full h-full object-cover border-4 border-black"
                    data-testid="profile-picture"
                  />
                ) : (
                  <div className="w-full h-full bg-muted border-4 border-black flex items-center justify-center">
                    <User size={48} className="text-gray-500" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-4 border-black">
                  {uploadingPhoto ? (
                    <div className="text-white font-body text-xs">Uploading...</div>
                  ) : (
                    <Camera size={24} className="text-white" />
                  )}
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
                data-testid="photo-upload-input"
              />
              
              <button
                onClick={handlePhotoClick}
                disabled={uploadingPhoto}
                className="btn-brutal-outline text-xs w-full flex items-center justify-center gap-2"
                data-testid="upload-photo-button"
              >
                <Upload size={14} />
                {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>
          </div>

          {/* Main Info Card */}
          <div className="md:col-span-2">
            <div className="card-brutal p-4 md:p-6 h-full transition-all duration-300 hover:shadow-brutal-lg">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="font-heading text-xs md:text-sm uppercase tracking-widest">Personal Information</h3>
                <button
                  onClick={isEditing ? handleSave : handleEditToggle}
                  disabled={loading}
                  className={`btn-brutal text-xs flex items-center gap-2 px-4 py-2 ${
                    isEditing ? 'bg-accent' : 'bg-secondary text-white'
                  }`}
                  data-testid="edit-toggle-button"
                >
                  {loading ? (
                    'Saving...'
                  ) : isEditing ? (
                    <>
                      <Save size={14} />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit2 size={14} />
                      Edit
                    </>
                  )}
                </button>
              </div>

              {isEditing && (
                <button
                  onClick={handleEditToggle}
                  className="absolute top-4 right-16 btn-brutal-ghost text-xs p-2"
                  data-testid="cancel-edit-button"
                >
                  <X size={16} />
                </button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {profileFields.map((field, index) => {
                  const Icon = field.icon;
                  const value = user?.[field.key] || '-';
                  const isFieldEditable = field.editable && isEditing;

                  return (
                    <div 
                      key={field.key} 
                      className={`p-3 md:p-4 border-2 border-black transition-all duration-300 ${isFieldEditable ? 'bg-accent/20' : 'bg-white'}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                      data-testid={`field-${field.key}`}
                    >
                      <div className="flex items-center gap-2 mb-1 md:mb-2">
                        <Icon size={14} className="text-secondary md:w-4 md:h-4" strokeWidth={2.5} />
                        <span className="label-brutal mb-0 text-[10px] md:text-xs">{field.label}</span>
                      </div>
                      
                      {isFieldEditable ? (
                        <input
                          type={field.key === 'email' ? 'email' : 'text'}
                          name={field.key}
                          value={editData[field.key]}
                          onChange={handleChange}
                          className="input-brutal h-9 md:h-10 text-xs md:text-sm"
                          data-testid={`edit-${field.key}`}
                        />
                      ) : (
                        <p className="font-body text-xs md:text-sm font-bold truncate" title={value}>
                          {value}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Referral Code Card */}
          <div className="md:col-span-2">
            <div className="card-brutal p-4 md:p-6 bg-accent transition-all duration-300 hover:shadow-brutal-lg">
              <div className="flex items-center gap-2 mb-3">
                <Gift size={18} strokeWidth={2.5} className="md:w-5 md:h-5" />
                <h3 className="font-heading text-xs md:text-sm uppercase tracking-widest">Your Referral Code</h3>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1 bg-white border-4 border-black p-3 md:p-4">
                  <p className="font-heading text-2xl md:text-3xl tracking-widest text-center">
                    {user?.referral_code || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={handleCopyReferralCode}
                  className="btn-brutal bg-secondary text-white flex items-center gap-2 px-4 py-3 w-full sm:w-auto"
                  data-testid="copy-referral-button"
                >
                  {copyMessage ? (
                    <>
                      <Check size={16} />
                      {copyMessage}
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy Code
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3 p-2 bg-white border-2 border-black">
                <Users size={14} strokeWidth={2.5} />
                <p className="font-body text-xs md:text-sm">
                  <span className="font-bold">{user?.referral_count || 0}</span> people joined using your code
                </p>
              </div>
            </div>
          </div>

          {/* QR Code Card */}
          <div className="md:col-span-1">
            <div className="card-brutal p-4 md:p-6 text-center transition-all duration-300 hover:shadow-brutal-lg">
              <h3 className="font-heading text-xs md:text-sm uppercase tracking-widest mb-3 md:mb-4">Check-in QR</h3>
              <div className="bg-white p-3 border-4 border-black inline-block">
                <QRCodeCanvas 
                  value={JSON.stringify({
                    register_number: user?.register_number,
                    name: user?.name,
                    event: 'PERSOFEST26'
                  })}
                  size={120}
                  level="H"
                />
              </div>
              <p className="font-body text-[10px] md:text-xs text-gray-600 mt-3">
                Show this at event check-in
              </p>
            </div>
          </div>

          {/* Registration Info Card */}
          <div className="md:col-span-3">
            <div className="card-brutal p-4 md:p-6 bg-secondary text-white transition-all duration-300 hover:shadow-brutal-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} strokeWidth={2.5} className="md:w-5 md:h-5" />
                <h3 className="font-heading text-xs md:text-sm uppercase tracking-widest">Registration Status</h3>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4">
                <span className="badge-brutal bg-accent text-black text-xs">
                  Registered
                </span>
                <p className="font-body text-xs md:text-sm">
                  You're all set for PERSOFEST'26! Keep an eye out for event updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

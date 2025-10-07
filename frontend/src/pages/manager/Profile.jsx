import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/useAuth';
import { getAvatarUrl } from '@/utils/avatarUtils';
import { fetchManagerActivity } from '@/services/managerApi';

export default function ManagerProfile() {
  const { user, refreshAuth } = useAuth();
  
  const [form, setForm] = useState({
    name: user?.fullName || user?.name || 'Manager Name',
    email: user?.email || 'manager@example.com',
    password: '',
    role: user?.role || 'Inventory Manager',
  });
  
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // Fetch real manager activity
  useEffect(() => {
    if (user?.id && user?.role === 'manager') {
      let active = true;
      setActivityLoading(true);
      (async () => {
        try {
          const activityData = await fetchManagerActivity(user.id);
          if (active) {
            setActivity(activityData);
          }
        } catch (error) {
          console.error('Failed to fetch manager activity:', error);
          if (active) setActivity([]);
        } finally {
          if (active) setActivityLoading(false);
        }
      })();
      return () => { active = false; };
    }
  }, [user?.id, user?.role]);

  // Avatar upload functionality
  const fileRef = useRef(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickFile = () => fileRef.current?.click();
  const onFileChange = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const savePhoto = async () => {
    if (!photoFile) return;
    setUploading(true);
    try {
      const fd = new FormData(); 
      fd.append('avatar', photoFile);
      const res = await fetch(`http://localhost:5000/api/users/${user.id}/avatar`, {
        method:'POST',
        headers:{ Authorization:'Bearer '+localStorage.getItem('auth_token') },
        body: fd
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error||'Upload failed');
      URL.revokeObjectURL(preview);
      setPhotoFile(null); 
      setPreview(null);
      alert('Avatar updated successfully!');
      // Refresh user data to update avatar in sidebar and other components
      if (refreshAuth) refreshAuth();
    } catch(e){ 
      alert(e.message); 
    }
    finally { 
      setUploading(false); 
    }
  };

  const cancelPhoto = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setPhotoFile(null);
  };

  const submit = e => {
    e.preventDefault();
    // TODO: call API to update profile
    console.log('Saving profile', form);
  };

  return (
    <div className="manager-profile" style={{padding: '2rem', maxWidth: '800px'}}>
      <h2>Manager Profile</h2>
      
      {/* Profile Photo Section */}
      <div style={{marginBottom: '2rem', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem'}}>
        <h3>Profile Photo</h3>
        <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem'}}>
          <img 
            src={preview || getAvatarUrl(user)}
            alt="Profile" 
            style={{
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              objectFit: 'cover',
              border: '3px solid #fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          />
          <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
            {!photoFile && (
              <button 
                type="button" 
                onClick={pickFile}
                style={{
                  background: '#4834d4',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Change Photo
              </button>
            )}
            {photoFile && (
              <>
                <button
                  type="button"
                  onClick={savePhoto}
                  disabled={uploading}
                  style={{
                    background: '#4834d4',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    opacity: uploading ? 0.7 : 1
                  }}
                >
                  {uploading ? 'Saving...' : 'Save Photo'}
                </button>
                <button
                  type="button"
                  onClick={cancelPhoto}
                  disabled={uploading}
                  style={{
                    background: '#ffffff',
                    color: '#1e293b',
                    border: '1px solid #cbd5e1',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    opacity: uploading ? 0.7 : 1
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{display:'none'}}
          onChange={onFileChange}
        />
        <small style={{fontSize: '0.8rem', color: '#64748b'}}>
          JPG/PNG up to 2MB. Changes will be visible immediately.
        </small>
      </div>

      {/* Profile Form */}
      <form onSubmit={submit} style={{marginBottom: '2rem'}}>
        <div style={{display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
          <label style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            <span style={{fontWeight: '600', fontSize: '0.9rem'}}>Name</span>
            <input 
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={{
                padding: '0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}
            />
          </label>
          <label style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            <span style={{fontWeight: '600', fontSize: '0.9rem'}}>Email</span>
            <input 
              value={form.email} 
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{
                padding: '0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}
            />
          </label>
          <label style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            <span style={{fontWeight: '600', fontSize: '0.9rem'}}>Password</span>
            <input 
              type="password" 
              value={form.password} 
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Leave blank to keep current"
              style={{
                padding: '0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}
            />
          </label>
          <label style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            <span style={{fontWeight: '600', fontSize: '0.9rem'}}>Role</span>
            <input 
              value={form.role} 
              onChange={e => setForm({ ...form, role: e.target.value })}
              disabled
              style={{
                padding: '0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.9rem',
                background: '#f1f5f9',
                cursor: 'not-allowed'
              }}
            />
          </label>
        </div>
        <button 
          type="submit"
          style={{
            marginTop: '1.5rem',
            background: '#4834d4',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          Save Profile
        </button>
      </form>

      <h3>Activity History</h3>
      {activityLoading ? (
        <div style={{padding: '1rem', textAlign: 'center', color: '#64748b'}}>
          Loading activity...
        </div>
      ) : activity.length > 0 ? (
        <ul style={{listStyle: 'none', padding: 0}}>
          {activity.map((a, i) => (
            <li 
              key={i}
              style={{
                padding: '0.75rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{a.description}</span>
              <strong style={{fontSize: '0.8rem', color: '#6366f1'}}>
                {a.timeAgo}
              </strong>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{
          padding: '1rem',
          textAlign: 'center',
          color: '#64748b',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        }}>
          No recent activity found. Start managing inventory to see your activity here.
        </div>
      )}
    </div>
  );
}
import React from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: ${p => (p.open ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 300;
`;

const Panel = styled.div`
  background: #fff;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  width: 420px;
  max-width: 90%;
`;

export default function SettingsModal({ open, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth token or user data
    localStorage.removeItem('authToken');
    // Navigate to login page
    navigate('/login');
  };

  if (!open) return null;
  return (
    <Backdrop open={open} onClick={onClose}>
      <Panel onClick={e => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Settings</h2>
        <p>Placeholder settings modal.</p>
        <button onClick={onClose}>Close</button>
      </Panel>
    </Backdrop>
  );
}

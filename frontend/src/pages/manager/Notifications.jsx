import React, { useEffect, useState } from 'react';

export default function ManagerNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // TODO: fetch from backend
    setNotifications([
      { id: 1, type: 'low-stock', msg: 'Seeds below threshold.' },
      { id: 2, type: 'pending-request', msg: '3 requests awaiting approval.' },
      { id: 3, type: 'system', msg: 'Excel upload succeeded.' },
    ]);
  }, []);

  return (
    <div className="manager-notifications">
      <h2>Notifications</h2>
      <ul>
        {notifications.map(n => (
          <li key={n.id}>
            <strong>{n.type}</strong>: {n.msg}
          </li>
        ))}
      </ul>
    </div>
  );
}
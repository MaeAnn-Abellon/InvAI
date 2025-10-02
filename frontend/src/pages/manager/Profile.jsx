import React, { useState } from 'react';

export default function ManagerProfile() {
  const [form, setForm] = useState({
    name: 'Manager Name',
    email: 'manager@example.com',
    password: '',
    role: 'Inventory Manager (Agri)',
  });
  const [activity] = useState([
    'Last Excel upload: 2025-09-20',
    'Last item edit: 2025-09-22',
  ]);

  const submit = e => {
    e.preventDefault();
    // TODO: call API
    console.log('Saving profile', form);
  };

  return (
    <div className="manager-profile">
      <h2>Profile</h2>
      <form onSubmit={submit}>
        <label>Name
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/>
        </label>
        <label>Email
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/>
        </label>
        <label>Password
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/>
        </label>
        <label>Role
          <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}/>
        </label>
        <button type="submit">Save</button>
      </form>

      <h3>Activity History</h3>
      <ul>
        {activity.map((a,i) => <li key={i}>{a}</li>)}
      </ul>
    </div>
  );
}
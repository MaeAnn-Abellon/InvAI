import React, { useState, useEffect } from 'react';

export default function InventoryManagement() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState({ category: '', department: '', status: '' });
  const [form, setForm] = useState({ id: null, name: '', category: '', qty: 0, status: 'active' });
  const [file, setFile] = useState(null);

  useEffect(() => {
    // TODO: load items
    setItems([
      { id: 1, name: 'Laptop', category: 'IT', department: 'IT', qty: 12, status: 'active' },
      { id: 2, name: 'Fertilizer', category: 'Agri', department: 'Agriculture', qty: 3, status: 'low' },
    ]);
  }, []);

  const saveItem = e => {
    e.preventDefault();
    if (form.id) {
      setItems(items.map(i => i.id === form.id ? form : i));
    } else {
      setItems([...items, { ...form, id: Date.now() }]);
    }
    setForm({ id: null, name: '', category: '', qty: 0, status: 'active' });
  };

  const editItem = item => setForm(item);
  const deleteItem = id => setItems(items.filter(i => i.id !== id));

  const filtered = items.filter(i =>
    (!filter.category || i.category === filter.category) &&
    (!filter.department || i.department === filter.department) &&
    (!filter.status || i.status === filter.status)
  );

  const uploadExcel = e => {
    e.preventDefault();
    if (!file) return;
    // TODO: send file to backend
    console.log('Uploading Excel', file);
  };

  return (
    <div className="inventory-management">
      <h2>Inventory Management</h2>

      <section>
        <h3>Bulk Upload (Excel)</h3>
        <form onSubmit={uploadExcel}>
          <input type="file" accept=".xlsx,.xls" onChange={e => setFile(e.target.files[0])}/>
          <button type="submit">Upload</button>
        </form>
      </section>

      <section>
        <h3>Add / Edit Item</h3>
        <form onSubmit={saveItem}>
          <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
          <input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/>
          <input placeholder="Qty" type="number" value={form.qty} onChange={e=>setForm({...form,qty:Number(e.target.value)})}/>
            <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
              <option value="active">Active</option>
              <option value="low">Low</option>
              <option value="inactive">Inactive</option>
            </select>
          <button type="submit">{form.id ? 'Update' : 'Add'}</button>
        </form>
      </section>

      <section>
        <h3>Search & Filter</h3>
        <div className="filters">
          <input placeholder="Category" value={filter.category} onChange={e=>setFilter({...filter,category:e.target.value})}/>
          <input placeholder="Department" value={filter.department} onChange={e=>setFilter({...filter,department:e.target.value})}/>
          <select value={filter.status} onChange={e=>setFilter({...filter,status:e.target.value})}>
            <option value="">Any Status</option>
            <option value="active">Active</option>
            <option value="low">Low</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </section>

      <section>
        <h3>Items</h3>
        <table>
          <thead>
            <tr><th>Name</th><th>Category</th><th>Dept</th><th>Qty</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id}>
                <td>{i.name}</td>
                <td>{i.category}</td>
                <td>{i.department}</td>
                <td>{i.qty}</td>
                <td>{i.status}</td>
                <td>
                  <button onClick={() => editItem(i)}>Edit</button>
                  <button onClick={() => deleteItem(i.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan="6">No items</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}
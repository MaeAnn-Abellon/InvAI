import React, { useEffect, useState, useCallback } from 'react';
import { inventoryApi } from '@/services/inventoryApi';
import { useNavigate } from 'react-router-dom';

export default function InventoryPage() {
  const [items,setItems] = useState([]);
  const [filters,setFilters] = useState({ category:'', status:'' });
  const [historyModal,setHistoryModal] = useState({ open:false, item:null, loading:false, rows:[], error:'' });
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [showForm,setShowForm] = useState(false);
  const [editing,setEditing] = useState(null);
  const [form,setForm] = useState({ name:'', description:'', category:'supplies', status:'in_stock', quantity:0 });
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await inventoryApi.list({ category: filters.category || undefined, status: filters.status || undefined });
      setItems(data.items);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, [filters.category, filters.status]);

  useEffect(() => { load(); }, [load]);

  const startCreate = () => { setEditing(null); setForm({ name:'', description:'', category:'supplies', status:'in_stock', quantity:0 }); setShowForm(true); };
  const startEdit = (item) => { setEditing(item); setForm(item); setShowForm(true); };
  const cancel = () => { setShowForm(false); setEditing(null); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (!form.name.trim()) return setError('Name required');
      if (editing) {
  const updated = await inventoryApi.update(editing.id, { ...form, quantity:Number(form.quantity)||0 });
        setItems(items.map(i => i.id === editing.id ? updated.item : i));
      } else {
  const created = await inventoryApi.create({ ...form, quantity:Number(form.quantity)||0 });
        setItems([created.item, ...items]);
      }
      cancel();
    } catch(e) { setError(e.message); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { await inventoryApi.remove(id); setItems(items.filter(i => i.id !== id)); } catch(e){ alert(e.message); }
  };

  const openHistory = (it) => {
    setHistoryModal({ open:true, item:it, loading:true, rows:[], error:'' });
    inventoryApi.history(it.id)
      .then(data => setHistoryModal(h => ({ ...h, loading:false, rows:data.history })))
      .catch(e => setHistoryModal(h => ({ ...h, loading:false, error:e.message })));
  };

  return (
    <div style={{ padding:'1.5rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
        <h2 style={{ margin:0 }}>Inventory</h2>
        <div style={{ display:'flex', gap:'.5rem' }}>
          <button onClick={startCreate} style={btnPrimary}>Add Item</button>
          <button onClick={() => navigate(-1)} style={btnSecondary}>Back</button>
        </div>
      </div>
      {/* Filters moved to top */}
      <div style={{ marginBottom:'1rem', display:'flex', gap:'.75rem', flexWrap:'wrap', alignItems:'flex-end' }}>
        <div style={filterGroup}>
          <label style={filterLabel}>Category</label>
          <select value={filters.category} onChange={e=>setFilters(f=>({...f, category:e.target.value}))} style={filterSelect}>
            <option value=''>All</option>
            <option value='supplies'>Supplies</option>
            <option value='equipment'>Equipment</option>
          </select>
        </div>
        <div style={filterGroup}>
          <label style={filterLabel}>Status</label>
          <select value={filters.status} onChange={e=>setFilters(f=>({...f, status:e.target.value}))} style={filterSelect}>
            <option value=''>All</option>
            {filters.category !== 'equipment' && <>
              <option value='in_stock'>In Stock</option>
              <option value='out_of_stock'>Out of Stock</option>
            </>}
            {filters.category !== 'supplies' && <>
              <option value='available'>Available</option>
              <option value='in_use'>In Use</option>
              <option value='for_repair'>For Repair</option>
              <option value='disposed'>Disposed</option>
            </>}
          </select>
        </div>
        {(filters.category || filters.status) && <button onClick={()=>setFilters({category:'',status:''})} style={clearFiltersBtn}>Clear Filters</button>}
      </div>
      {error && <div style={{ background:'#fee2e2', color:'#b91c1c', padding:'.5rem .75rem', borderRadius:6, fontSize:'.8rem', marginBottom:'.75rem' }}>{error}</div>}
      {loading ? <div>Loading...</div> : (
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.75rem' }}>
          <thead>
            <tr style={{ textAlign:'left', background:'#f1f5f9' }}>
              <th style={th}>Name</th>
              <th style={th}>Category</th>
              <th style={th}>Status</th>
              <th style={th}>Qty</th>
              <th style={th}>Updated</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} style={{ borderBottom:'1px solid #e2e8f0' }}>
                <td style={td}>{i.name}</td>
                <td style={td}>{i.category || '-'}</td>
                <td style={td}>{renderStatusBadge(i)}</td>
                <td style={td}>{i.quantity}</td>
                <td style={td}>{new Date(i.updatedAt).toLocaleString()}</td>
                <td style={td}>
                  <button onClick={() => startEdit(i)} style={actionBtn}>Edit</button>
                  <button onClick={() => openHistory(i)} style={historyBtn}>History</button>
                  <button onClick={() => remove(i.id)} style={dangerBtn}>Delete</button>
                </td>
              </tr>
            ))}
            {!items.length && <tr><td style={td} colSpan={5}>No items.</td></tr>}
          </tbody>
        </table>
      )}
      {showForm && (
        <div style={modalBackdrop}>
          <div style={modal}>
            <h3 style={{ margin:'0 0 .75rem', fontSize:'.9rem' }}>{editing? 'Edit Item':'Add Item'}</h3>
            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>
              <input autoFocus placeholder='Name' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={input} />
              <select value={form.category} onChange={e=>{
                  const cat = e.target.value;
                  setForm(f=>({ ...f, category:cat, status: cat==='supplies'?'in_stock':'available' }));
                }} style={input}>
                <option value='supplies'>Supplies</option>
                <option value='equipment'>Equipment</option>
              </select>
              <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={input}>
                {form.category === 'supplies' && <>
                  <option value='in_stock'>In Stock</option>
                  <option value='out_of_stock'>Out of Stock</option>
                </>}
                {form.category === 'equipment' && <>
                  <option value='available'>Available</option>
                  <option value='in_use'>In Use</option>
                  <option value='for_repair'>For Repair</option>
                  <option value='disposed'>Disposed</option>
                </>}
              </select>
              <input placeholder='Quantity' type='number' value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} style={input} />
              <textarea placeholder='Description' value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{...input, minHeight:70}} />
              <div style={{ display:'flex', gap:'.5rem', marginTop:'.25rem' }}>
                <button type='submit' style={btnPrimary}>{editing? 'Save':'Create'}</button>
                <button type='button' onClick={cancel} style={btnSecondary}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {historyModal.open && (
        <div style={modalBackdrop}>
          <div style={{ ...modal, maxWidth:520 }}>
            <h3 style={{ margin:'0 0 .75rem', fontSize:'.9rem' }}>Status History - {historyModal.item?.name}</h3>
            {historyModal.loading && <div>Loading...</div>}
            {historyModal.error && <div style={{ color:'#b91c1c', fontSize:'.65rem' }}>{historyModal.error}</div>}
            {!historyModal.loading && !historyModal.error && !historyModal.rows.length && <div style={{ fontSize:'.65rem' }}>No history.</div>}
            {!historyModal.loading && !!historyModal.rows.length && (
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.65rem', marginBottom:'.75rem' }}>
                <thead>
                  <tr style={{ textAlign:'left', background:'#f1f5f9' }}>
                    <th style={th}>Date</th>
                    <th style={th}>Action</th>
                    <th style={th}>User</th>
                    <th style={th}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {historyModal.rows.map((r, index) => (
                    <tr key={r.id || index} style={{ borderBottom:'1px solid #e2e8f0' }}>
                      <td style={td}>{new Date(r.changedAt).toLocaleString()}</td>
                      <td style={td}>
                        {r.actionType === 'claim' ? (
                          <span style={{
                            background: r.newStatus === 'claimed' ? '#dcfce7' : r.newStatus === 'claim_rejected' ? '#fee2e2' : '#fef9c3',
                            color: r.newStatus === 'claimed' ? '#166534' : r.newStatus === 'claim_rejected' ? '#b91c1c' : '#92400e',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.6rem',
                            fontWeight: '500'
                          }}>
                            {r.newStatus === 'claimed' ? 'Claimed' : 
                             r.newStatus === 'claim_rejected' ? 'Claim Rejected' : 
                             'Claim Pending'}
                          </span>
                        ) : (
                          <span>{r.oldStatus ? `${r.oldStatus} → ${r.newStatus}` : r.newStatus}</span>
                        )}
                      </td>
                      <td style={td}>
                        {r.changedByName ? (
                          <div>
                            <div style={{ fontWeight: '600' }}>{r.changedByName}</div>
                            <div style={{ color: '#64748b', fontSize: '0.6rem' }}>
                              {r.changedByRole} {r.changedByEmail && `• ${r.changedByEmail}`}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Unknown</span>
                        )}
                      </td>
                      <td style={td}>
                        {r.actionType === 'claim' ? (
                          <div>
                            {r.claimQuantity && <div>Qty: {r.claimQuantity}</div>}
                            {r.approvedByName && (
                              <div style={{ color: '#64748b', fontSize: '0.6rem' }}>
                                {r.newStatus === 'claimed' ? 'Approved' : 'Rejected'} by: {r.approvedByName}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span>Status change</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button onClick={()=>setHistoryModal({ open:false, item:null, loading:false, rows:[], error:'' })} style={btnSecondary}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const th = { padding:'.55rem .6rem', fontWeight:600, fontSize:'.65rem', letterSpacing:.5 };
const td = { padding:'.5rem .6rem', verticalAlign:'top' };
const btnPrimary = { background:'#4338ca', color:'#fff', border:'none', padding:'.45rem .8rem', borderRadius:6, fontSize:'.65rem', cursor:'pointer' };
const btnSecondary = { background:'#e2e8f0', color:'#1e293b', border:'none', padding:'.45rem .8rem', borderRadius:6, fontSize:'.65rem', cursor:'pointer' };
const actionBtn = { ...btnSecondary, background:'#f1f5f9', marginRight:4 };
const dangerBtn = { ...btnSecondary, background:'#fee2e2', color:'#b91c1c' };
const historyBtn = { ...btnSecondary, background:'#e0f2fe', color:'#075985' };
const input = { border:'1px solid #cbd5e1', borderRadius:6, padding:'.55rem .6rem', fontSize:'.7rem', outline:'none' };
const modalBackdrop = { position:'fixed', inset:0, background:'rgba(0,0,0,.35)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 };
const modal = { background:'#fff', padding:'1rem 1rem 1.1rem', borderRadius:12, width:'100%', maxWidth:420, boxShadow:'0 10px 25px -8px rgba(0,0,0,.3)' };
const filterGroup = { display:'flex', flexDirection:'column', gap:4 };
const filterLabel = { fontSize:'.55rem', fontWeight:600, letterSpacing:.5, textTransform:'uppercase', color:'#334155' };
const filterSelect = { ...input, padding:'.4rem .5rem', fontSize:'.65rem' };
const clearFiltersBtn = { ...btnSecondary, background:'#f1f5f9' };

function renderStatusBadge(item) {
  const v = item.status;
  if (!v) return '-';
  const map = {
    in_stock:    { bg:'#dcfce7', color:'#166534', label:'In Stock' },
    out_of_stock:{ bg:'#fee2e2', color:'#b91c1c', label:'Out of Stock' },
    available:   { bg:'#e0f2fe', color:'#075985', label:'Available' },
    in_use:      { bg:'#ede9fe', color:'#5b21b6', label:'In Use' },
    for_repair:  { bg:'#fef9c3', color:'#92400e', label:'For Repair' },
    disposed:    { bg:'#f1f5f9', color:'#475569', label:'Disposed' }
  };
  const meta = map[v] || { bg:'#e2e8f0', color:'#334155', label:v };
  return <span style={{ background:meta.bg, color:meta.color, padding:'.15rem .45rem', borderRadius:999, fontSize:'.55rem', fontWeight:600, letterSpacing:.5 }}>{meta.label}</span>;
}

// openHistory defined inside component scope using function declaration (has access to hooks state setters)


import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Sidebar from '../../components/Dashboard/Sidebar';
import styled from '@emotion/styled';
import { listUsers, createUser, updateUser, deleteUserApi } from '@/services/userApi';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterDept, setFilterDept] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ fullName:'', email:'', username:'', password:'', role:'student', department:'college', course:'', studentId:'' });
  const [editDraft, setEditDraft] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [editingUser, setEditingUser] = useState(null); // user object being edited (modal)
  const [showEditModal, setShowEditModal] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const list = await listUsers({ department: filterDept || undefined, course: filterCourse || undefined });
      setUsers(list);
    } catch(e){ setError(e.message||'Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDept, filterCourse]);

  // Exclude admin accounts from display & filter source
  const visibleUsers = useMemo(()=> users.filter(u=> u.role !== 'admin'), [users]);
  const departments = useMemo(()=> Array.from(new Set(visibleUsers.map(u=>u.department).filter(Boolean))), [visibleUsers]);
  const courses = useMemo(()=> Array.from(new Set(visibleUsers.map(u=>u.course).filter(Boolean))), [visibleUsers]);

  const startEdit = (u) => {
    setEditingUser(u);
    setEditDraft({ fullName:u.fullName, role:u.role, department:u.department, course:u.course, studentId:u.studentId, email:u.email, username:u.username });
    setShowEditModal(true);
  };
  const cancelEdit = () => { setShowEditModal(false); setEditingUser(null); setEditDraft({}); setEditErrors({}); };

  // Validation logic for edit modal
  const validateEdit = useCallback(() => {
    const errs = {};
    if (!editDraft.fullName || editDraft.fullName.trim().length < 2) errs.fullName = 'Name required (min 2 chars).';
    if (!editDraft.email) errs.email = 'Email required.'; else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(editDraft.email)) errs.email = 'Invalid email.';
    if (!editDraft.username) errs.username = 'Username required.';
    if (editDraft.password && editDraft.password.length < 6) errs.password = 'Password min 6 chars.';
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  }, [editDraft]);

  const saveEdit = useCallback(async () => {
    if (!editingUser) return;
    if (!validateEdit()) return;
    if (!window.confirm('Save changes to this user?')) return;
    try {
      const payload = { ...editDraft };
      if (!payload.password) delete payload.password; // do not send empty password
      const updated = await updateUser(editingUser.id, payload);
      setUsers(prev => prev.map(u=> u.id===editingUser.id? updated : u));
      cancelEdit();
    } catch(e){ alert(e.message); }
  }, [editingUser, editDraft, validateEdit]);

  // Modal keyboard handling
  useEffect(()=>{
    if (!showEditModal) return;
    const handler = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
      else if (e.key === 'Enter' && !e.shiftKey) {
        // Avoid submitting when focus is in an input for which we want default newline (none here)
        if (document.activeElement && document.activeElement.tagName === 'INPUT') {
          e.preventDefault();
          saveEdit();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return ()=> window.removeEventListener('keydown', handler);
  }, [showEditModal, editDraft, saveEdit]);

  const doDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await deleteUserApi(id); setUsers(prev=> prev.filter(u=>u.id!==id)); } catch(e){ alert(e.message); }
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    try {
      const u = await createUser(newUser);
      setUsers(prev=>[...prev, u]);
      setCreating(false);
      setNewUser({ fullName:'', email:'', username:'', password:'', role:'student', department:'college', course:'', studentId:'' });
    } catch(err){ alert(err.message); }
  };

  return (
    <>
    <Container>
      <Sidebar />
      <Content>
        <HeaderRow>
          <h1>User Management</h1>
          <div>
            <button onClick={()=>setCreating(c=>!c)}>{creating? 'Close':'Add User'}</button>
          </div>
        </HeaderRow>
        <Filters>
          <select value={filterDept} onChange={e=>setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d=> <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterCourse} onChange={e=>setFilterCourse(e.target.value)}>
            <option value="">All Courses</option>
            {courses.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={load} disabled={loading}>Reload</button>
        </Filters>
        {error && <ErrorBox>{error}</ErrorBox>}
        {creating && (
          <CreateForm onSubmit={submitCreate}>
            <div className="grid">
              <label>Full Name<input required value={newUser.fullName} onChange={e=>setNewUser({...newUser, fullName:e.target.value})} /></label>
              <label>Email<input required type="email" value={newUser.email} onChange={e=>setNewUser({...newUser, email:e.target.value})} /></label>
              <label>Username<input required value={newUser.username} onChange={e=>setNewUser({...newUser, username:e.target.value})} /></label>
              <label>Password<input required type="password" value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})} /></label>
              <label>Role<select value={newUser.role} onChange={e=>setNewUser({...newUser, role:e.target.value})}>
                <option value="student">student</option>
                <option value="teacher">teacher</option>
                <option value="staff">staff</option>
                <option value="manager">manager</option>
                <option value="admin">admin</option>
              </select></label>
              <label>Department<select value={newUser.department} onChange={e=>setNewUser({...newUser, department:e.target.value})}>
                <option value="college">college</option>
                <option value="senior_high">senior_high</option>
              </select></label>
              <label>Course<input value={newUser.course} onChange={e=>setNewUser({...newUser, course:e.target.value})} /></label>
              <label>Student ID<input value={newUser.studentId} onChange={e=>setNewUser({...newUser, studentId:e.target.value})} /></label>
            </div>
            <div className="actions">
              <button type="submit">Create</button>
            </div>
          </CreateForm>
        )}
        <TableWrapper>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Role</th><th>Dept</th><th>Course</th><th>Email</th><th>Username</th><th>Student ID</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={9}>Loading...</td></tr>}
              {!loading && visibleUsers.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.fullName}</td>
                  <td>{u.role}</td>
                  <td>{u.department}</td>
                  <td>{u.course}</td>
                  <td>{u.email}</td>
                  <td>{u.username}</td>
                  <td>{u.studentId}</td>
                  <td>
                    <button onClick={()=>startEdit(u)}>Edit</button>
                    <button onClick={()=>doDelete(u.id)} style={{background:'#b91c1c'}}>Delete</button>
                  </td>
                </tr>
              ))}
              {!loading && !visibleUsers.length && <tr><td colSpan={9}>No users found.</td></tr>}
            </tbody>
          </table>
        </TableWrapper>
      </Content>
    </Container>
    {showEditModal && (
      <EditModalBackdrop onClick={(e)=>{ if (e.target===e.currentTarget) cancelEdit(); }}>
        <EditModal role="dialog" aria-modal="true" aria-label="Edit User">
          <h2>Edit User</h2>
          <div className="grid">
            <label>Full Name<input value={editDraft.fullName||''} onChange={e=>setEditDraft({...editDraft, fullName:e.target.value})} />{editErrors.fullName && <span className="err">{editErrors.fullName}</span>}</label>
            <label>Email<input type="email" value={editDraft.email||''} onChange={e=>setEditDraft({...editDraft, email:e.target.value})} />{editErrors.email && <span className="err">{editErrors.email}</span>}</label>
            <label>Username<input value={editDraft.username||''} onChange={e=>setEditDraft({...editDraft, username:e.target.value})} />{editErrors.username && <span className="err">{editErrors.username}</span>}</label>
            <label>Role<select value={editDraft.role||''} onChange={e=>setEditDraft({...editDraft, role:e.target.value})}>
              {['student','teacher','staff','manager'].map(r=> <option key={r} value={r}>{r}</option>)}
            </select></label>
            <label>Department<select value={editDraft.department||''} onChange={e=>setEditDraft({...editDraft, department:e.target.value})}>
              <option value="college">college</option>
              <option value="senior_high">senior_high</option>
            </select></label>
            <label>Course<input value={editDraft.course||''} onChange={e=>setEditDraft({...editDraft, course:e.target.value})} /></label>
            <label>Student ID<input value={editDraft.studentId||''} onChange={e=>setEditDraft({...editDraft, studentId:e.target.value})} /></label>
            <label>Password (optional)<input type="password" value={editDraft.password||''} onChange={e=>setEditDraft({...editDraft, password:e.target.value})} placeholder="Leave blank to keep" />{editErrors.password && <span className="err">{editErrors.password}</span>}</label>
          </div>
          <div className="actions">
            <button onClick={saveEdit}>Save</button>
            <button onClick={cancelEdit} className="secondary">Cancel</button>
          </div>
        </EditModal>
      </EditModalBackdrop>
    )}
    </>
  );
}

const Container = styled.div`
  display: flex;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  h1 { margin-top:0; }
  button { cursor:pointer; }
`;

const HeaderRow = styled.div`
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:16px;
  gap:12px;
  button { background:#1e40af; color:#fff; border:none; padding:8px 14px; border-radius:6px; font-size:.8rem; font-weight:600; }
`;

const Filters = styled.div`
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  margin-bottom:16px;
  select, button { padding:6px 10px; font-size:.75rem; }
  button { background:#334155; color:#fff; border:none; border-radius:6px; }
`;

const ErrorBox = styled.div`
  background:#fee2e2;
  color:#b91c1c;
  padding:8px 12px;
  border-radius:6px;
  font-size:.75rem;
  margin-bottom:14px;
`;

const CreateForm = styled.form`
  background:#f8fafc;
  border:1px solid #e2e8f0;
  padding:16px;
  border-radius:10px;
  margin-bottom:24px;
  .grid { display:grid; gap:12px; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); }
  label { display:flex; flex-direction:column; font-size:.65rem; text-transform:uppercase; letter-spacing:.05em; font-weight:600; color:#475569; }
  input, select { margin-top:4px; padding:6px 8px; font-size:.7rem; border:1px solid #cbd5e1; border-radius:6px; }
  .actions { margin-top:12px; }
  button[type=submit]{ background:#0f766e; color:#fff; border:none; padding:8px 16px; border-radius:6px; font-size:.75rem; font-weight:600; }
`;

const TableWrapper = styled.div`
  overflow:auto;
  table { width:100%; border-collapse:collapse; font-size:.7rem; }
  th, td { padding:8px 10px; border-bottom:1px solid #e2e8f0; text-align:left; }
  th { background:#f1f5f9; font-size:.6rem; text-transform:uppercase; letter-spacing:.06em; }
  td button { margin-right:4px; background:#1e3a8a; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:.6rem; }
  td button:last-of-type { background:#b91c1c; }
`;

const EditModalBackdrop = styled.div`
  position:fixed; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:flex-start; justify-content:center; padding-top:6vh; z-index:1000;
`;

const EditModal = styled.div`
  background:#ffffff; width: min(820px,90%); border-radius:14px; padding:28px 28px 32px; box-shadow:0 10px 35px -5px rgba(0,0,0,0.25);
  h2 { margin:0 0 18px; font-size:1rem; }
  .grid { display:grid; gap:14px; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); margin-bottom:18px; }
  label { display:flex; flex-direction:column; font-size:.6rem; font-weight:600; letter-spacing:.05em; text-transform:uppercase; color:#475569; }
  input, select { margin-top:4px; padding:8px 10px; font-size:.7rem; border:1px solid #cbd5e1; border-radius:8px; }
  .actions { display:flex; gap:12px; justify-content:flex-end; }
  .actions button { background:#1e40af; color:#fff; border:none; padding:10px 18px; border-radius:8px; font-size:.7rem; font-weight:600; cursor:pointer; }
  .actions button.secondary { background:#64748b; }
`;
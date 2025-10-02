// import React, { useState } from 'react';
// import styled from '@emotion/styled';
// import { useAuth } from '@/context/AuthContext';

// const PageContainer = styled.div`
//   padding: 2rem;
//   background: #f8fafc;
//   max-width: 900px;
// `;

// const Heading = styled.h1`
//   font-size: 1.9rem;
//   margin: 0 0 1rem;
// `;

// const Section = styled.section`
//   background: #ffffff;
//   border: 1px solid #e2e8f0;
//   border-radius: 12px;
//   padding: 1.5rem 1.75rem;
//   margin-bottom: 1.5rem;
//   box-shadow: 0 1px 2px rgba(0,0,0,0.04);
// `;

// const SectionTitle = styled.h2`
//   font-size: 1.05rem;
//   margin: 0 0 1rem;
//   font-weight: 600;
//   color: #1e293b;
// `;

// const FormGrid = styled.div`
//   display: grid;
//   gap: 1rem 1.25rem;
//   grid-template-columns: repeat(auto-fill,minmax(220px,1fr));
// `;

// const Field = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 0.4rem;
//   label {
//     font-size: 0.75rem;
//     font-weight: 600;
//     text-transform: uppercase;
//     letter-spacing: 0.5px;
//     color: #475569;
//   }
//   input, select {
//     padding: 0.65rem 0.75rem;
//     border: 1px solid #cbd5e1;
//     border-radius: 8px;
//     background: #ffffff;
//     font-size: 0.9rem;
//     transition: border-color .15s, box-shadow .15s;
//     &:focus {
//       outline: none;
//       border-color: #4834d4;
//       box-shadow: 0 0 0 2px rgba(72,52,212,0.25);
//     }
//   }
//   input[disabled] {
//     background: #f1f5f9;
//     cursor: not-allowed;
//   }
// `;

// const Actions = styled.div`
//   display: flex;
//   gap: 0.75rem;
//   margin-top: 1.25rem;
// `;

// const Button = styled.button`
//   background: ${p => p.variant === 'outline' ? '#ffffff' : '#4834d4'};
//   border: 1px solid ${p => p.variant === 'outline' ? '#cbd5e1' : '#4834d4'};
//   color: ${p => p.variant === 'outline' ? '#1e293b' : '#ffffff'};
//   padding: 0.7rem 1.25rem;
//   font-size: 0.85rem;
//   border-radius: 8px;
//   cursor: pointer;
//   font-weight: 500;
//   transition: background .2s, border-color .2s;
//   &:hover {
//     background: ${p => p.variant === 'outline' ? '#f1f5f9' : '#372aaa'};
//     border-color: ${p => p.variant === 'outline' ? '#94a3b8' : '#372aaa'};
//   }
// `;

// const Divider = styled.hr`
//   border: none;
//   height: 1px;
//   background: #e2e8f0;
//   margin: 1.75rem 0;
// `;

// const DangerZone = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   background: #fef2f2;
//   border: 1px solid #fecaca;
//   border-radius: 10px;
//   padding: 1rem 1.25rem;
//   flex-wrap: wrap;
//   gap: 1rem;
//   h3 {
//     margin: 0 0 0.35rem;
//     font-size: 0.95rem;
//     color: #b91c1c;
//   }
//   p {
//     margin: 0;
//     font-size: 0.75rem;
//     color: #7f1d1d;
//   }
// `;

// const DangerButton = styled.button`
//   background: #dc2626;
//   border: 1px solid #dc2626;
//   color: #ffffff;
//   padding: 0.6rem 1rem;
//   font-size: 0.75rem;
//   border-radius: 6px;
//   cursor: pointer;
//   font-weight: 500;
//   &:hover {
//     background: #b91c1c;
//     border-color: #b91c1c;
//   }
// `;

// export default function Profile() {
//   const { user } = useAuth();

//   const [form, setForm] = useState({
//     name: user?.name || '',
//     email: user?.email || '',
//     role: user?.role || '',
//     studentId: user?.studentId || '',
//     department: user?.department || '',
//     password: '',
//     confirmPassword: ''
//   });

//   const [saving, setSaving] = useState(false);
//   const [editing, setEditing] = useState(false);

//   const onChange = e => {
//     const { name, value } = e.target;
//     setForm(f => ({ ...f, [name]: value }));
//   };

//   const onSave = e => {
//     e.preventDefault();
//     if (form.password && form.password !== form.confirmPassword) {
//       alert('Passwords do not match.');
//       return;
//     }
//     setSaving(true);
//     setTimeout(() => {
//       setSaving(false);
//       setEditing(false);
//       alert('Profile saved (mock). Connect API next.');
//     }, 800);
//   };

//   return (
//     <PageContainer>
//       <Heading>Profile / Account Settings</Heading>

//       <Section as="form" onSubmit={onSave}>
//         <SectionTitle>Account Information</SectionTitle>
//         <FormGrid>
//           <Field>
//             <label>Name</label>
//             <input
//               name="name"
//               value={form.name}
//               onChange={onChange}
//               disabled={!editing}
//             />
//           </Field>
//           <Field>
//             <label>Email</label>
//             <input
//               name="email"
//               type="email"
//               value={form.email}
//               onChange={onChange}
//               disabled={!editing}
//               placeholder="you@example.com"
//             />
//           </Field>
//           <Field>
//             <label>Role</label>
//             <input name="role" value={form.role} disabled />
//           </Field>
//           {form.role === 'student' && (
//             <Field>
//               <label>Student ID</label>
//               <input
//                 name="studentId"
//                 value={form.studentId}
//                 onChange={onChange}
//                 disabled={!editing}
//                 placeholder="e.g. 2023-12345"
//               />
//             </Field>
//           )}
//           {form.role === 'manager' && (
//             <Field>
//               <label>Department</label>
//               <input
//                 name="department"
//                 value={form.department}
//                 onChange={onChange}
//                 disabled={!editing}
//                 placeholder="e.g. IT"
//               />
//             </Field>
//           )}
//         </FormGrid>

//         <Divider />

//         <SectionTitle>Security</SectionTitle>
//         <FormGrid>
//           <Field>
//             <label>New Password</label>
//             <input
//               name="password"
//               type="password"
//               value={form.password}
//               onChange={onChange}
//               disabled={!editing}
//               placeholder="Leave blank to keep current"
//             />
//           </Field>
//           <Field>
//             <label>Confirm Password</label>
//             <input
//               name="confirmPassword"
//               type="password"
//               value={form.confirmPassword}
//               onChange={onChange}
//               disabled={!editing}
//             />
//           </Field>
//         </FormGrid>

//         <Actions>
//           {!editing && (
//             <Button type="button" onClick={() => setEditing(true)}>
//               Edit Profile
//             </Button>
//           )}
//           {editing && (
//             <>
//               <Button type="submit" disabled={saving}>
//                 {saving ? 'Saving...' : 'Save Changes'}
//               </Button>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => {
//                   setEditing(false);
//                   setForm(f => ({
//                     ...f,
//                     name: user?.name || '',
//                     email: user?.email || '',
//                     studentId: user?.studentId || '',
//                     department: user?.department || '',
//                     password: '',
//                     confirmPassword: ''
//                   }));
//                 }}
//               >
//                 Cancel
//               </Button>
//             </>
//           )}
//         </Actions>
//       </Section>

//       <Section>
//         <SectionTitle>Danger Zone</SectionTitle>
//         <DangerZone>
//           <div>
//             <h3>Delete Account</h3>
//             <p>This action is irreversible. All your data may be removed.</p>
//           </div>
//           <DangerButton
//             type="button"
//             onClick={() => {
//               if (window.confirm('Are you sure you want to delete your account?')) {
//                 alert('Account deletion flow not implemented.');
//               }
//             }}
//           >
//             Delete Account
//           </DangerButton>
//         </DangerZone>
//       </Section>
//     </PageContainer>
//   );
// }



// filepath: d:\Capstone\InvAI\frontend\src\pages\profile\Profile.jsx
import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { PageSurface, GradientHeading, GlassPanel, PrimaryButton, SubNote as GSubNote, Divider as GDivider } from '@/components/ui/Glass';
import { useAuth } from '@/context/useAuth';
import { inventoryApi } from '@/services/inventoryApi';
import defaultAvatar from '@/assets/avatar.png'; // add your default image

const PageContainer = styled(PageSurface)`padding:2rem 2.25rem 3rem; max-width:1100px; margin:0 auto;`;

const Heading = styled(GradientHeading)`font-size:2.05rem; margin:0 0 1.4rem;`;
const SummaryCard = styled(GlassPanel)`padding:1.1rem 1.25rem 1.25rem; border-radius:24px; margin:0 0 1.5rem; gap:.6rem;`;
const InlineBadges = styled.div`display:flex; flex-wrap:wrap; gap:.45rem;`;
const Pill = styled.span`background:${p=>p.variant==='role'?'#6366f1':'#f1f5f9'}; color:${p=>p.variant==='role'?'#fff':'#334155'}; font-size:.55rem; font-weight:600; padding:.3rem .6rem; border-radius:999px; letter-spacing:.5px; text-transform:uppercase;`;

const Section = styled(GlassPanel)`padding:1.6rem 1.75rem 1.9rem; border-radius:26px; margin-bottom:1.6rem;`;

const SectionTitle = styled.h2`
  font-size: 1.05rem;
  margin: 0 0 1rem;
  font-weight: 600;
  color: #1e293b;
`;

const FormGrid = styled.div`
  display: grid;
  gap: 1rem 1.25rem;
  grid-template-columns: repeat(auto-fill,minmax(220px,1fr));
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #475569;
  }
  input, select {
    padding: 0.65rem 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #ffffff;
    font-size: 0.9rem;
    transition: border-color .15s, box-shadow .15s;
    &:focus {
      outline: none;
      border-color: #4834d4;
      box-shadow: 0 0 0 2px rgba(72,52,212,0.25);
    }
  }
  input[disabled] {
    background: #f1f5f9;
    cursor: not-allowed;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
`;

const Button = styled(PrimaryButton)`font-size:.7rem; padding:.65rem 1.1rem; border-radius:12px; background:${p=>p.variant==='outline'?'rgba(255,255,255,.85)':'linear-gradient(135deg,#6366f1,#4834d4)'}; color:${p=>p.variant==='outline'?'#1e293b':'#fff'}; border:${p=>p.variant==='outline'?'1px solid #e2e8f0':'1px solid rgba(255,255,255,.25)'}; box-shadow:${p=>p.variant==='outline'?'0 2px 6px -2px rgba(31,41,55,.15)':'0 8px 22px -10px rgba(72,52,212,.55)'}; &:hover{filter:brightness(1.06);} `;

const Divider = styled.hr`
  border: none;
  height: 1px;
  background: #e2e8f0;
  margin: 1.75rem 0;
`;

const DangerZone = styled.div`
  display:flex; justify-content:space-between; align-items:center; background:linear-gradient(145deg,#fef2f2,#fff); border:1px solid #fecaca; border-radius:16px; padding:1rem 1.25rem; flex-wrap:wrap; gap:1rem; box-shadow:0 6px 20px -10px rgba(185,28,28,.35);
  h3{margin:0 0 .35rem; font-size:.95rem; color:#b91c1c;}
  p{margin:0; font-size:.7rem; color:#7f1d1d;}
`;

const DangerButton = styled(PrimaryButton)`background:linear-gradient(135deg,#f87171,#dc2626); border:1px solid rgba(255,255,255,.3); padding:.6rem 1rem; font-size:.65rem; box-shadow:0 8px 22px -10px rgba(220,38,38,.55); &:hover{filter:brightness(1.05);} `;

/* Added styles for profile photo */
const PhotoRow = styled.div`
  display:flex;
  align-items:center;
  gap:1.5rem;
  flex-wrap:wrap;
`;
const Avatar = styled.img`width:110px; height:110px; border-radius:50%; object-fit:cover; border:4px solid #fff; box-shadow:0 10px 24px -12px rgba(31,41,55,.4),0 0 0 1px rgba(255,255,255,.6); background:#fff;`;
const PhotoButtons = styled.div`
  display:flex;
  gap:.6rem;
  flex-wrap:wrap;
`;
const SmallNote = styled.small`
  display:block;
  margin-top:.55rem;
  font-size:.6rem;
  color:#64748b;
`;

export default function Profile() {
  const { user } = useAuth();

  // NEW state for avatar change
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
  // Toast system
  const [toasts,setToasts] = useState([]);
  const pushToast = (msg) => { const id=Date.now(); setToasts(t=>[...t,{id,msg}]); setTimeout(()=> setToasts(t=>t.filter(x=>x.id!==id)),3000); };

  const savePhoto = async () => {
    if (!photoFile) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('avatar', photoFile);
      const res = await fetch(`http://localhost:5000/api/users/${user.id}/avatar`, {
        method:'POST',
        headers:{ Authorization:'Bearer '+localStorage.getItem('auth_token') },
        body: fd
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error||'Upload failed');
      URL.revokeObjectURL(preview);
      setPhotoFile(null); setPreview(null);
      pushToast('Avatar updated');
    } catch(e){ alert(e.message); }
    finally { setUploading(false); }
  };
  const cancelPhoto = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setPhotoFile(null);
  };

  const [form, setForm] = useState({
    name: user?.fullName || user?.name || '',
    email: user?.email || '',
    role: user?.role || '',
    studentId: user?.studentId || '',
    department: user?.department || '',
    course: user?.course || '',
    password: '',
    confirmPassword: ''
  });

  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const onChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const onSave = e => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    (async()=>{
      setSaving(true);
      try {
        const body = {
          fullName: form.name,
          department: form.department,
          course: form.course,
          studentId: form.studentId || null
        };
        if (form.password) body.password = form.password;
        const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
          method:'PATCH',
          headers:{ 'Content-Type':'application/json', Authorization:'Bearer '+localStorage.getItem('auth_token') },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error||'Update failed');
        pushToast('Profile updated');
        setEditing(false);
        // Optionally refresh local form with canonical response
        if(data.user){
          setForm(f=>({...f, name: data.user.fullName || f.name }));
        }
      } catch(err){ alert(err.message); }
      finally { setSaving(false); }
    })();
  };

  // Derived stats (requests submitted, votes cast)
  const [stats,setStats] = useState({ requests:0, votes:0 });
  useEffect(()=>{
    let active=true;
    (async()=>{
      try {
        const reqRes = await inventoryApi.listRequests();
        const myReqs = (reqRes.requests||[]).filter(r=>r.requested_by===user?.id);
        const voteRes = await inventoryApi.listApprovedForVoting();
        const voted = (voteRes.requests||[]).filter(r=>r.voted).length;
        if(active) setStats({ requests: myReqs.length, votes: voted });
      } catch {/* ignore */}
    })();
    return ()=>{ active=false; };
  },[user?.id]);

  return (
    <>
    <PageContainer>
  <Heading>Profile / Account Settings</Heading>
      <SummaryCard>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:240}}>
            <h2 style={{margin:'0 0 .35rem', fontSize:'1.05rem'}}>Welcome, {form.name || 'User'} 👋</h2>
            <InlineBadges>
              {form.role && <Pill variant='role'>{form.role}</Pill>}
              {(form.department || form.course) && <Pill>{[form.department, form.course].filter(Boolean).join(' · ')}</Pill>}
              {form.studentId && <Pill>SID: {form.studentId}</Pill>}
              <Pill>Requests: {stats.requests}</Pill>
              <Pill>Votes: {stats.votes}</Pill>
            </InlineBadges>
          </div>
          <div style={{fontSize:'.6rem', color:'#64748b', lineHeight:'1rem', maxWidth:300}}>
            Manage your account information, academic/program details, and security settings. Department & course determine request and voting visibility.
          </div>
        </div>
      </SummaryCard>

      {/* NEW Profile Photo Section */}
      <Section>
        <SectionTitle>Profile Photo</SectionTitle>
        <PhotoRow>
          <Avatar
            src={preview || user?.avatarUrl || defaultAvatar}
            alt="Profile"
          />
          <PhotoButtons>
            {!photoFile && (
              <Button type="button" onClick={pickFile}>
                Change Photo
              </Button>
            )}
            {photoFile && (
              <>
                <Button
                  type="button"
                  onClick={savePhoto}
                  disabled={uploading}
                >
                  {uploading ? 'Saving...' : 'Save Photo'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelPhoto}
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </>
            )}
          </PhotoButtons>
        </PhotoRow>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{display:'none'}}
          onChange={onFileChange}
        />
        <SmallNote>JPG/PNG up to 2MB. Will persist after backend upload integration.</SmallNote>
      </Section>

      {/* NEW Manager Activity Section */}
      {user?.role === 'manager' && (
        <Section>
          <SectionTitle>Recent Manager Activity</SectionTitle>
          <ul style={{listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:'.55rem'}}>
            <li style={activityStyle}>Last Excel upload: <strong>IT_inventory.xlsx</strong> (2h ago)</li>
            <li style={activityStyle}>Last approved request: #101 (Markers)</li>
            <li style={activityStyle}>Last edit: Updated Headsets stock (yesterday)</li>
          </ul>
          <small style={{fontSize:'.55rem', color:'#64748b'}}>Replace with API data (GET /api/manager/activity).</small>
        </Section>
      )}

      {/* EXISTING sections below remain unchanged */}
  <Section as="form" onSubmit={onSave}>
        <SectionTitle>Account Information</SectionTitle>
        <FormGrid>
          <Field>
            <label>Name</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              disabled={!editing}
            />
          </Field>
            <Field>
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              disabled={!editing}
              placeholder="you@example.com"
            />
          </Field>
          <Field>
            <label>Role</label>
            <input name="role" value={form.role} disabled />
          </Field>
          {form.role === 'student' && (
            <Field>
              <label>Student ID</label>
              <input
                name="studentId"
                value={form.studentId}
                onChange={onChange}
                disabled={!editing}
                placeholder="e.g. 2023-12345"
              />
            </Field>
          )}
          <Field>
            <label>Department / Level</label>
            <input
              name="department"
              value={form.department}
              onChange={onChange}
              disabled={!editing}
              placeholder="college | senior_high"
            />
          </Field>
          <Field>
            <label>Course / Strand</label>
            <input
              name="course"
              value={form.course}
              onChange={onChange}
              disabled={!editing}
              placeholder="e.g. BSIT or STEM-A"
            />
          </Field>
        </FormGrid>

        <Divider />

        <SectionTitle>Security</SectionTitle>
        <FormGrid>
          <Field>
            <label>New Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              disabled={!editing}
              placeholder="Leave blank to keep current"
            />
          </Field>
          <Field>
            <label>Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={onChange}
              disabled={!editing}
            />
          </Field>
        </FormGrid>

        <Actions>
          {!editing && (
            <Button type="button" onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          )}
          {editing && (
            <>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setForm(f => ({
                    ...f,
                    name: user?.fullName || user?.name || '',
                    email: user?.email || '',
                    studentId: user?.studentId || '',
                    department: user?.department || '',
                    course: user?.course || '',
                    password: '',
                    confirmPassword: ''
                  }));
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </Actions>
      </Section>

      <Section>
        <SectionTitle>Danger Zone</SectionTitle>
        <DangerZone>
          <div>
            <h3>Delete Account</h3>
            <p>This action is irreversible. All your data may be removed.</p>
          </div>
          <DangerButton
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete your account?')) {
                alert('Account deletion flow not implemented.');
              }
            }}
          >
            Delete Account
          </DangerButton>
        </DangerZone>
      </Section>
    </PageContainer>
    { !!toasts.length && (
      <div style={{position:'fixed', bottom:'1rem', left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', gap:'.5rem', zIndex:6000}}>
        {toasts.map(t=> <div key={t.id} style={{background:'rgba(255,255,255,.9)', border:'1px solid #6366f1', padding:'.55rem .75rem', fontSize:'.55rem', fontWeight:600, color:'#312e81', borderRadius:'12px', boxShadow:'0 6px 22px -8px rgba(79,70,229,.45)', backdropFilter:'blur(6px) saturate(150%)'}}>{t.msg}</div>)}
      </div>
    ) }
    </>
  );
}

const activityStyle = {
  padding: '0.75rem',
  borderRadius: '8px',
  background: '#f0f9ff',
  border: '1px solid #bfdbfe',
  color: '#1e40af',
  fontSize: '0.9rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem'
};



import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound(){
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',textAlign:'center',fontFamily:'system-ui'}}>
      <h1 style={{fontSize:'3rem',margin:'0 0 1rem',background:'linear-gradient(135deg,#6366f1,#4f46e5)',WebkitBackgroundClip:'text',color:'transparent'}}>404</h1>
      <p style={{fontSize:'0.95rem',maxWidth:480,lineHeight:1.5,margin:'0 0 1.25rem'}}>The page you tried to open doesn&apos;t exist or was moved. If you refreshed a dashboard URL, the server didn&apos;t know that route – single‑page app routing will restore it once loaded.</p>
      <div style={{display:'flex',gap:'.75rem',flexWrap:'wrap',justifyContent:'center'}}>
        <Link to="/" style={{background:'#4f46e5',color:'#fff',padding:'.7rem 1.1rem',borderRadius:10,fontSize:'.8rem',fontWeight:600,textDecoration:'none'}}>Go to Landing</Link>
        <Link to="/dashboard" style={{background:'#0ea5e9',color:'#fff',padding:'.7rem 1.1rem',borderRadius:10,fontSize:'.8rem',fontWeight:600,textDecoration:'none'}}>Dashboard</Link>
        <Link to="/login" style={{background:'#1e293b',color:'#fff',padding:'.7rem 1.1rem',borderRadius:10,fontSize:'.8rem',fontWeight:600,textDecoration:'none'}}>Login</Link>
      </div>
      <small style={{marginTop:'1.75rem',fontSize:'.6rem',color:'#64748b'}}>If this persists after a deploy, ensure <code style={{background:'#e2e8f0',padding:'.15rem .35rem',borderRadius:4}}>vercel.json</code> includes a catch‑all rewrite to /index.html.</small>
    </div>
  );
}

import styled from '@emotion/styled';

// Shared gradient background wrapper matching auth & dashboard styling
export const PageSurface = styled.div`
  position:relative;
  min-height:100vh;
  padding:${p=>p.$pad || '2rem 2.25rem 3rem'};
  background:
    radial-gradient(circle at 12% 18%, rgba(99,102,241,.18), transparent 60%),
    radial-gradient(circle at 88% 72%, rgba(72,52,212,.20), transparent 55%),
    linear-gradient(135deg,#eef2f7,#f1f5f9);
  overflow:hidden;
  &:before,&:after {content:''; position:absolute; width:540px; height:540px; border-radius:50%; filter:blur(70px); opacity:.32; mix-blend-mode:soft-light; pointer-events:none;}
  &:before { top:-170px; left:-210px; background:radial-gradient(circle,#6366f1,#4834d4 60%); animation:blobA 19s linear infinite; }
  &:after { bottom:-190px; right:-200px; background:radial-gradient(circle,#6366f1,#312e81 60%); animation:blobB 23s linear infinite; }
  @keyframes blobA {0%{transform:translateY(0) rotate(0deg);}50%{transform:translateY(-40px) rotate(150deg);}100%{transform:translateY(0) rotate(360deg);} }
  @keyframes blobB {0%{transform:translateY(0) rotate(0deg);}50%{transform:translateY(55px) rotate(210deg);}100%{transform:translateY(0) rotate(360deg);} }
`;

export const GradientHeading = styled.h1`
  margin:0 0 1.25rem;
  font-size:clamp(1.6rem,3.4vw,1.95rem);
  font-weight:800;
  letter-spacing:.6px;
  background:linear-gradient(90deg,#312e81,#4834d4,#6366f1);
  -webkit-background-clip:text;
  color:transparent;
`;

export const GlassPanel = styled.div`
  position:relative;
  background:rgba(255,255,255,.72);
  border:1px solid rgba(255,255,255,.55);
  border-radius:${p=>p.$radius || '22px'};
  padding:${p=>p.$pad || '1.25rem 1.35rem 1.45rem'};
  display:flex;
  flex-direction:column;
  gap:${p=>p.$gap || '.9rem'};
  box-shadow:0 10px 32px -14px rgba(31,41,55,.35), 0 2px 6px -2px rgba(31,41,55,.15);
  backdrop-filter:blur(14px) saturate(180%);
  -webkit-backdrop-filter:blur(14px) saturate(180%);
  overflow:hidden;
  &:before{content:''; position:absolute; inset:0; pointer-events:none; background:linear-gradient(145deg,rgba(99,102,241,.18),rgba(255,255,255,0) 55%); opacity:.9;}
`;

export const PrimaryButton = styled.button`
  background:linear-gradient(135deg,#6366f1,#4834d4);
  color:#fff;
  border:1px solid rgba(255,255,255,.25);
  padding:.6rem 1.1rem;
  font-size:.7rem;
  font-weight:600;
  border-radius:12px;
  cursor:pointer;
  letter-spacing:.55px;
  display:inline-flex;
  align-items:center;
  gap:.45rem;
  box-shadow:0 8px 22px -10px rgba(72,52,212,.55), 0 0 0 1px rgba(255,255,255,.12) inset;
  backdrop-filter:blur(6px) saturate(160%);
  transition:filter .35s, transform .28s, box-shadow .4s;
  &:hover{filter:brightness(1.08); box-shadow:0 10px 28px -10px rgba(72,52,212,.65);} 
  &:active{transform:translateY(1px);} 
  &:disabled{opacity:.55; cursor:default; box-shadow:none;}
`;

export const SubNote = styled.small`
  font-size:.6rem; letter-spacing:.5px; color:#64748b; margin-top:-.35rem;
`;

export const Divider = styled.hr`
  border:none; height:1px; background:#e2e8f0; margin:.25rem 0 .5rem;
`;

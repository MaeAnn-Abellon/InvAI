import React from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

const Wrapper = styled.div`
  padding:2.2rem clamp(1.2rem,3vw,2.4rem) 3.4rem;
  max-width:1240px; margin:0 auto; line-height:1.55; position:relative;
  &:before, &:after{content:''; position:absolute; width:420px; height:420px; border-radius:50%; filter:blur(70px); opacity:.18; pointer-events:none;}
  &:before{top:-160px; left:-140px; background:radial-gradient(circle,#6366f1,#4834d4 60%); animation:orbA 22s linear infinite;}
  &:after{bottom:-160px; right:-140px; background:radial-gradient(circle,#312e81,#6366f1 60%); animation:orbB 28s linear infinite;}
  @keyframes orbA{0%{transform:translateY(0) rotate(0deg);}50%{transform:translateY(40px) rotate(160deg);}100%{transform:translateY(0) rotate(360deg);}}
  @keyframes orbB{0%{transform:translateY(0) rotate(0deg);}50%{transform:translateY(-40px) rotate(200deg);}100%{transform:translateY(0) rotate(360deg);}}
`;
const Heading = styled.h1`
  margin:0 0 .9rem; font-size:clamp(2rem,4.3vw,2.9rem); font-weight:800; letter-spacing:.5px;
  background:linear-gradient(90deg,#312e81,#4338ca,#6366f1); -webkit-background-clip:text; color:transparent;
  animation:fadeUp .8s ease;
  @keyframes fadeUp{0%{opacity:0; transform:translateY(16px);}100%{opacity:1; transform:translateY(0);}}
`;
const Section = styled.section`margin:2.2rem 0 0;`; 
const SubHeading = styled.h2`margin:0 0 .65rem; font-size:1.25rem; font-weight:700; color:#1e293b;`; 
const Paragraph = styled.p`margin:.4rem 0 .95rem; font-size:.9rem; color:#334155;`; 
const RoleGrid = styled.div`display:grid; gap:1rem; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); margin-top:1.2rem;`; 
// Moved Badge above RoleCard to prevent reference error
const Badge = styled.span`display:inline-block; background:#6366f1; color:#fff; font-size:.55rem; letter-spacing:.6px; padding:.35rem .6rem; border-radius:999px; font-weight:600; text-transform:uppercase; transition:filter .4s;`; 
const RoleCard = styled.div`
  --g1: var(--g1,#6366f1); --g2: var(--g2,#4338ca);
  background:linear-gradient(#ffffff,#ffffff) padding-box, linear-gradient(135deg,var(--g1),var(--g2)) border-box;
  border:1px solid transparent; border-radius:22px; padding:1rem 1rem 1.25rem; position:relative;
  box-shadow:0 6px 18px -6px rgba(0,0,0,.12), 0 2px 4px -2px rgba(0,0,0,.08);
  display:flex; flex-direction:column; gap:.55rem; overflow:hidden; isolation:isolate;
  transform:translateY(10px) scale(.98); opacity:0; animation:cardIn .7s cubic-bezier(.4,.8,.3,1) forwards; animation-delay:var(--d,0s);
  transition: box-shadow .5s, transform .55s;
  &:after{content:''; position:absolute; inset:0; background:radial-gradient(circle at 30% 20%,rgba(255,255,255,.65),rgba(255,255,255,0) 60%); mix-blend-mode:overlay; pointer-events:none; opacity:.85;}
  &:hover{box-shadow:0 12px 34px -10px rgba(0,0,0,.25), 0 3px 8px -2px rgba(0,0,0,.12); transform:translateY(-4px) scale(1.015);} 
  &:hover .about-badge{filter:brightness(1.08);} 
  @keyframes cardIn{to{transform:translateY(0) scale(1); opacity:1;}}
`;
const IconWrap = styled.span`
  width:40px; height:40px; border-radius:14px; display:flex; align-items:center; justify-content:center;
  background:linear-gradient(145deg,var(--g1),var(--g2)); color:#fff; font-size:1.05rem; font-weight:600;
  box-shadow:0 6px 14px -6px rgba(0,0,0,.35), 0 2px 4px -1px rgba(0,0,0,.22);
  position:relative; overflow:hidden; isolation:isolate;
  &:before{content:''; position:absolute; inset:0; background:linear-gradient(120deg,rgba(255,255,255,.4),rgba(255,255,255,.05)); mix-blend-mode:overlay;}
`;
const Small = styled.small`display:block; font-size:.6rem; color:#64748b; margin-top:.35rem; line-height:1.25;`; 
const List = styled.ul`margin:.2rem 0 1rem 1.1rem; padding:0; font-size:.8rem; color:#334155; display:flex; flex-direction:column; gap:.35rem;`; 
const HR = styled.hr`border:none; height:1px; background:#e2e8f0; margin:2rem 0;`; 
const Callout = styled.div`
  background:linear-gradient(135deg,#6366f1,#4338ca); color:#fff; padding:1.15rem 1.25rem 1.25rem; border-radius:22px; font-size:.85rem; font-weight:500;
  display:flex; flex-direction:column; gap:.55rem; box-shadow:0 18px 38px -16px rgba(99,102,241,.55);
  position:relative; overflow:hidden; isolation:isolate;
  &:before{content:''; position:absolute; top:-40%; left:-10%; width:60%; height:180%; background:linear-gradient(115deg,rgba(255,255,255,.35),rgba(255,255,255,0)); transform:translateX(-120%) rotate(8deg); animation:sheen 5.5s ease-in-out infinite;}
  @keyframes sheen{0%{transform:translateX(-120%) rotate(8deg);}55%{transform:translateX(220%) rotate(8deg);}100%{transform:translateX(220%) rotate(8deg);}}
`;
const TableWrap = styled.div`overflow:auto; border:1px solid #e2e8f0; border-radius:14px; background:#fff;`; 
const Table = styled.table`border-collapse:collapse; width:100%; font-size:.7rem; th,td{ padding:.55rem .65rem; text-align:left; border-top:1px solid #f1f5f9;} th{background:#f8fafc; font-weight:600; letter-spacing:.5px; font-size:.55rem; text-transform:uppercase;} tbody tr:nth-of-type(even){background:#f9fafb;} code{font-size:.65rem; background:#f1f5f9; padding:.15rem .35rem; border-radius:6px;} `;

export default function AboutApp(){
  return (
    <Wrapper>
      <Heading>InvAI</Heading>
      <Paragraph style={{fontSize:'1rem', maxWidth:'880px'}}>
        A focused, role‑aware platform that keeps <strong>school equipment</strong> & <strong>supplies</strong> visible, lets the community <strong>request</strong> & <strong>vote</strong> on what’s next, and empowers managers with clean approvals, history, and light AI forecasting.
      </Paragraph>

      <Section>
        <SubHeading>Core Snapshots</SubHeading>
        <RoleGrid style={{marginTop:'.6rem'}}>
          {[
            { t:'Inventory', d:'Real‑time view of equipment lifecycle & supply stock.', icon:'📦', colors:['#6366f1','#818cf8'] },
            { t:'Claims', d:'Request usage; approvals create in‑use records & history.', icon:'📝', colors:['#ec4899','#d946ef'] },
            { t:'Returns', d:'Equipment return flow keeps availability accurate.', icon:'🔄', colors:['#06b6d4','#3b82f6'] },
            { t:'Requests', d:'Submit new items. Approved ones enter the vote board.', icon:'➕', colors:['#10b981','#059669'] },
            { t:'Voting', d:'Peers prioritize what should be purchased next.', icon:'🗳️', colors:['#f59e0b','#f97316'] },
            { t:'Conversion', d:'Top voted → manager adds directly to inventory.', icon:'⚙️', colors:['#8b5cf6','#6366f1'] },
            { t:'History', d:'Unified status + claim + decision timeline.', icon:'📜', colors:['#0ea5e9','#6366f1'] },
            { t:'Forecast', d:'Simple AI depletion hints for supplies.', icon:'📈', colors:['#14b8a6','#0d9488'] },
          ].map((b,i)=> (
            <RoleCard key={b.t} style={{'--d': `${0.05*i+0.05}s`, '--g1': b.colors[0], '--g2': b.colors[1]}}>
              <IconWrap style={{'--g1': b.colors[0], '--g2': b.colors[1]}}>{b.icon}</IconWrap>
              <Badge className="about-badge" style={{background:'linear-gradient(135deg,'+b.colors[0]+','+b.colors[1]+')'}}>{b.t}</Badge>
              <Paragraph style={{marginTop:'.2rem', fontSize:'.78rem'}}>{b.d}</Paragraph>
            </RoleCard>
          ))}
        </RoleGrid>
      </Section>

      <Section>
        <SubHeading>Roles (Quick Read)</SubHeading>
        <RoleGrid>
          {[
            {r:'Student', d:'Request, vote, claim items; see own history.', icon:'🎓', colors:['#6366f1','#4f46e5']},
            {r:'Teacher', d:'Same as student; academic facilitation.', icon:'👩‍🏫', colors:['#10b981','#059669']},
            {r:'Staff', d:'Operational support; usage similar to teacher.', icon:'🛠️', colors:['#0ea5e9','#2563eb']},
            {r:'Manager', d:'Approve, convert, manage statuses & returns.', icon:'🗂️', colors:['#f59e0b','#d97706']},
            {r:'Admin', d:'Global oversight, users, full analytics.', icon:'🛡️', colors:['#ef4444','#dc2626']},
          ].map((x,i)=> (
            <RoleCard key={x.r} style={{'--d': `${0.06*i+.15}s`, '--g1': x.colors[0], '--g2': x.colors[1]}}>
              <IconWrap style={{'--g1': x.colors[0], '--g2': x.colors[1]}}>{x.icon}</IconWrap>
              <Badge className="about-badge" style={{background:'linear-gradient(135deg,'+x.colors[0]+','+x.colors[1]+')'}}>{x.r}</Badge>
              <Paragraph style={{marginTop:'.2rem', fontSize:'.78rem'}}>{x.d}</Paragraph>
            </RoleCard>
          ))}
        </RoleGrid>
      </Section>

      <Section>
        <SubHeading>Flow Mini‑Map</SubHeading>
        <Paragraph style={{maxWidth:'700px'}}>
          Request ➜ Approve ➜ Vote ➜ Convert ➜ Track usage / returns ➜ Forecast supplies. Repeat, smarter.
        </Paragraph>
      </Section>

      <Section>
        <SubHeading>Best Practices</SubHeading>
        <List style={{maxWidth:'760px'}}>
          <li>Be clear & concise when submitting a new request.</li>
          <li>Vote only once; avoid duplicates.</li>
          <li>Return equipment promptly.</li>
          <li>Managers: convert high‑impact winners early.</li>
          <li>Admins: watch trends for resource strain.</li>
        </List>
      </Section>

      <HR />
      <Callout>
        <strong style={{fontSize:'1rem'}}>Need Help?</strong>
        <span style={{fontSize:'.78rem'}}>Head to Requests to propose an item or contact your manager for escalation.</span>
        <span style={{fontSize:'.65rem', opacity:.9}}>Developed by: <strong>Mae Ann Abellon</strong></span>
        <span style={{fontSize:'.55rem', opacity:.85}}>Made with help from <strong>Copilot GPT-5</strong></span>
        <span style={{fontSize:'.55rem', opacity:.85}}>Consolatrix College of Toledo City, Inc.</span>
        <span style={{fontSize:'.55rem', opacity:.65}}>© {new Date().getFullYear()} InvAI / SmartStock</span>
      </Callout>
      <div style={{marginTop:'1.4rem'}}>
        <Link to="/" style={{fontSize:'.7rem', fontWeight:600, color:'#6366f1'}} aria-label="Return to Landing Page">← Back to Landing Page</Link>
      </div>
    </Wrapper>
  );
}

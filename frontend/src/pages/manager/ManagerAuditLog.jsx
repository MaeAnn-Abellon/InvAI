import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { fetchAuditLog } from '../../services/managerApi';

const Page = styled.div`padding:2rem 2.25rem 3rem; background:#f8fafc;`;
const Title = styled.h1`margin:0 0 1.2rem; font-size:1.45rem; font-weight:700;`;
const Card = styled.div`
  background:#fff; border:1px solid #e2e8f0; border-radius:22px;
  padding:1.3rem 1.5rem 1.55rem; box-shadow:0 4px 14px -5px rgba(0,0,0,.05);
  display:flex; flex-direction:column; gap:1rem;
`;
const List = styled.ul`
  list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:.55rem;
  li{
    background:#f1f5f9; padding:.6rem .75rem; border-radius:12px;
    font-size:.62rem; display:flex; justify-content:space-between; flex-wrap:wrap; gap:.6rem;
  }
  span.action{font-weight:600; color:#334155;}
  span.ts{font-size:.55rem; color:#64748b;}
`;

const ManagerAuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(25);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchAuditLog({ limit });
      setLogs(data);
      setLoading(false);
    })();
  }, [limit]);

  if (loading) return <div>Loading audit log...</div>;

  return (
    <Page>
      <Title>Audit Log</Title>
      <Card>
        <label>Show
          <select value={limit} onChange={e=>setLimit(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          entries
        </label>
        <List>
          {logs.map(l=>(
            <li key={l.id}>
              <span className="ts">{l.at}</span>
              <span className="action">{l.action}</span>
              <span>{l.details}</span>
            </li>
          ))}
          {!logs.length && <li>No entries</li>}
        </List>
      </Card>
    </Page>
  );
};

export default ManagerAuditLog;
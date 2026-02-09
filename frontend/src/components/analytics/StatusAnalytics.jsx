import React, { useMemo } from 'react';
import styled from '@emotion/styled';

/* Status analytics donut */
const StatusDonut = styled.div`
  --size:140px;
  width:var(--size);
  height:var(--size);
  border-radius:50%;
  background:${p=>p.segments};
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  &::after{
    content:'';
    position:absolute;
    width:58%;
    height:58%;
    background:#fff;
    border-radius:50%;
    box-shadow:inset 0 0 0 1px #e2e8f0;
  }
  span.center{
    position:absolute;
    width:60%;
    text-align:center;
    font-size:.9rem;
    font-weight:600;
    color:#1e293b;
    line-height:.85rem;
  }
`;

const Legend = styled.ul`
  list-style:none;
  margin:0;
  padding:0;
  display:flex;
  flex-direction:column;
  gap:.4rem;
  font-size:.9rem;
  li { display:flex; align-items:center; gap:.45rem; }
  i { width:12px; height:12px; border-radius:4px; display:inline-block; }
`;

const AnalyticsContainer = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  align-items: flex-start;
`;

const CategorySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  min-width: 300px;
`;

const CategoryTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
  text-align: center;
`;

const SubNote = styled.small`
  font-size:.9rem;
  color:#64748b;
  letter-spacing:.5px;
  text-align: center;
  display: block;
  margin-top: 0.5rem;
`;

export default function StatusAnalytics({ items }) {
  // Equipment status calculation
  const equipmentStatus = useMemo(() => {
    const counts = { available: 0, in_use: 0, for_repair: 0, disposed: 0 };
    for (const item of items) {
      if (item.category === 'equipment') {
        if (item.status === 'available') counts.available += (item.quantity || 0);
        else if (item.status === 'in_use') counts.in_use += (item.quantity || 0);
        else if (item.status === 'for_repair') counts.for_repair += (item.quantity || 0);
        else if (item.status === 'disposed') counts.disposed += (item.quantity || 0);
      }
    }
    return counts;
  }, [items]);

  // Supplies status calculation  
  const suppliesStatus = useMemo(() => {
    const counts = { available: 0, in_use: 0, for_repair: 0, disposed: 0 };
    for (const item of items) {
      if (item.category === 'supplies') {
        if (item.status === 'in_stock') counts.available += (item.quantity || 0);
        // For supplies, we don't typically have "in_use" but we can track if needed
        else if (item.status === 'in_use') counts.in_use += (item.quantity || 0);
        else if (item.status === 'for_repair') counts.for_repair += (item.quantity || 0);
        else if (item.status === 'disposed') counts.disposed += (item.quantity || 0);
      }
    }
    return counts;
  }, [items]);

  const palette = {
    available: '#10b981',
    in_use: '#6366f1', 
    for_repair: '#f59e0b',
    disposed: '#475569'
  };

  const labelMap = {
    available: 'Available',
    in_use: 'In Use',
    for_repair: 'For Repair',
    disposed: 'Disposed'
  };

  // Generate segments for donut chart
  const generateSegments = (statusCounts) => {
    const total = Math.max(1, Object.values(statusCounts).reduce((sum, val) => sum + val, 0));
    const entries = Object.entries(statusCounts).filter(([, v]) => v > 0);
    
    let acc = 0;
    const parts = [];
    entries.forEach(([key, value]) => {
      const start = acc;
      const slice = (value / total) * 360;
      const end = start + slice;
      acc += slice;
      parts.push(`${palette[key] || '#94a3b8'} ${start}deg ${end}deg`);
    });
    
    if (!parts.length) parts.push('#e2e8f0 0deg 360deg');
    return `conic-gradient(${parts.join(',')})`;
  };

  const equipmentTotal = Math.max(1, Object.values(equipmentStatus).reduce((sum, val) => sum + val, 0));
  const suppliesTotal = Math.max(1, Object.values(suppliesStatus).reduce((sum, val) => sum + val, 0));
  
  const equipmentSegments = generateSegments(equipmentStatus);
  const suppliesSegments = generateSegments(suppliesStatus);

  const equipmentEntries = Object.keys(equipmentStatus)
    .filter(k => equipmentStatus[k] > 0)
    .sort((a, b) => equipmentStatus[b] - equipmentStatus[a]);
  
  const suppliesEntries = Object.keys(suppliesStatus)
    .filter(k => suppliesStatus[k] > 0)
    .sort((a, b) => suppliesStatus[b] - suppliesStatus[a]);

  return (
    <AnalyticsContainer>
      {/* Equipment Analytics */}
      <CategorySection>
        <CategoryTitle>🔧 Equipment Status</CategoryTitle>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <StatusDonut segments={equipmentSegments}>
            <span className="center">{equipmentTotal}\nunits</span>
          </StatusDonut>
          <Legend>
            {equipmentEntries.length ? equipmentEntries.map(key => (
              <li key={key}>
                <i style={{ background: palette[key] || '#94a3b8' }} />
                {labelMap[key] || key} — <strong>{equipmentStatus[key]}</strong> ({Math.round(equipmentStatus[key] / equipmentTotal * 100)}%)
              </li>
            )) : <li style={{ color: '#64748b' }}>No equipment data.</li>}
          </Legend>
        </div>
        <SubNote>Equipment units by operational status</SubNote>
      </CategorySection>

      {/* Supplies Analytics */}
      <CategorySection>
        <CategoryTitle>📦 Supplies Status</CategoryTitle>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <StatusDonut segments={suppliesSegments}>
            <span className="center">{suppliesTotal}\nunits</span>
          </StatusDonut>
          <Legend>
            {suppliesEntries.length ? suppliesEntries.map(key => (
              <li key={key}>
                <i style={{ background: palette[key] || '#94a3b8' }} />
                {labelMap[key] || key} — <strong>{suppliesStatus[key]}</strong> ({Math.round(suppliesStatus[key] / suppliesTotal * 100)}%)
              </li>
            )) : <li style={{ color: '#64748b' }}>No supplies data.</li>}
          </Legend>
        </div>
        <SubNote>Supplies units by stock status</SubNote>
      </CategorySection>
    </AnalyticsContainer>
  );
}
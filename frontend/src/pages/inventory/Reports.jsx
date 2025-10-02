import React from 'react';
import Sidebar from '../../components/Dashboard/Sidebar';
import styled from '@emotion/styled';

const ReportsContainer = styled.div`
  display: flex;
`;

const ReportsContent = styled.div`
  flex: 1;
  padding: 20px;
`;

export default function Reports() {
  return (
    <ReportsContainer>
      <Sidebar />
      <ReportsContent>
        <h1>Reports</h1>
        {/* Add your reports content here */}
      </ReportsContent>
    </ReportsContainer>
  );
}
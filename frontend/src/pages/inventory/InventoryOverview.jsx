import React from 'react';
import Sidebar from '../../components/Dashboard/Sidebar';
import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
`;

export default function InventoryOverview() {
  return (
    <Container>
      <Sidebar />
      <Content>
        <h1>Inventory Overview (Admin)</h1>
        {/* Additional content can be added here */}
      </Content>
    </Container>
  );
}
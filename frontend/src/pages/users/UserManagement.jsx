import React from 'react';
import Sidebar from '../../components/Dashboard/Sidebar';
import styled from '@emotion/styled';

export default function UserManagement() {
  return (
    <Container>
      <Sidebar />
      <Content>
        <h1>User Management</h1>
        {/* Add your user management content here */}
      </Content>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
`;
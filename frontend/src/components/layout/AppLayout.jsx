import React from 'react';
import styled from '@emotion/styled';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Dashboard/Sidebar';

const Shell = styled.div`
  min-height:100vh;
  background:#f8fafc;
`;

const Main = styled.main`
  margin-left:240px;     /* match Sidebar width */
  min-height:100vh;
  padding:2rem 2.25rem 3rem;
  overflow-x:hidden;
`;

const AppLayout = () => (
  <Shell>
    <Sidebar />
    <Main>
      <Outlet />
    </Main>
  </Shell>
);

export default AppLayout;
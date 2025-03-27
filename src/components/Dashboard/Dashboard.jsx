import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import Sidebar from './Sidebar';
import sLogo from '../../assets/sLogo.png';
import stock from '../../assets/stock.gif';
import { Bell, Settings as SettingsIcon } from 'lucide-react';
import SettingsModal from '../SettingsModal';

// Styled components (no changes here — keeping your styles as-is)
const DashboardContainer = styled.div`
  display: flex;
`;

const MainContent = styled.div`
  flex: 1;
  background-color: #f8fafc;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  img {
    height: 40px;
  }
  span {
    font-weight: 600;
    font-size: 1rem;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #1e293b;
  display: flex;
  align-items: center;
  transition: color 0.2s;

  &:hover {
    color: #4834d4;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CastVoteButton = styled(Link)`
  background: #4834d4;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  text-decoration: none;

  &:hover {
    background: #372aaa;
  }
`;

const Content = styled.div`
  padding: 2rem;
`;

const WelcomeCard = styled.div`
  background: #1e40af;
  color: white;
  padding: 2rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
`;

const GifWrapper = styled.div`
  flex-shrink: 0;
  width: 200px;
  height: 200px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const WelcomeText = styled.div`
  flex: 1;
  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  p {
    font-size: 1rem;
    opacity: 0.9;
    max-width: 600px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const StatsCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const StatsTitle = styled.h2`
  font-size: 1.2rem;
  color: #1a1a1a;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  a {
    font-size: 0.9rem;
    color: #4834d4;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const VotingTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    color: #666;
    font-weight: 500;
  }
`;

const InventoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InventoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;

  .category {
    font-weight: 500;
  }

  .availability {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: ${(props) => {
        if (props.status >= 70) return '#22c55e';
        if (props.status >= 30) return '#eab308';
        return '#ef4444';
      }};
    }
  }
`;

const AnnouncementsSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const AnnouncementsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AnnouncementItem = styled.div`
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: ${(props) => (props.status === 'unread' ? 'bold' : 'normal')};
  cursor: pointer;

  &:hover {
    background: #f1f5f9;
  }
`;

const StatusLabel = styled.div`
  font-size: 0.85rem;
  color: ${(props) =>
    props.status === 'unread'
      ? '#000000'
      : props.status === 'starred'
      ? '#000000'
      : '#6b7280'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const notifications = [
  { message: '📢 Inventory Audit Schedule!', status: 'unread' },
  { message: '🆕 New Voting Round Open!', status: 'unread' },
  { message: '🔧 System Maintenance Notice', status: 'read' },
  { message: '📝 New AI-Based Print System', status: 'starred' },
  { message: '⏰ Request Deadline Reminder', status: 'read' },
];

const Dashboard = () => {
  const [openSettings, setOpenSettings] = useState(false);

  return (
    <DashboardContainer>
      <Sidebar />
      <MainContent>
        <Header>
          <HeaderTitle>
            <img src={sLogo} alt="Consolatrix College Logo" />
            <span>Consolatrix College of Toledo City, Inc.</span>
          </HeaderTitle>
          <HeaderActions>
            <CastVoteButton to="/voting">Cast a Vote</CastVoteButton>
            <IconButton>
              <Bell size={20} />
            </IconButton>
            <IconButton onClick={() => setOpenSettings(true)}>
              <SettingsIcon size={20} />
            </IconButton>
          </HeaderActions>
          <SettingsModal open={openSettings} onClose={() => setOpenSettings(false)} />
        </Header>

        <Content>
          <WelcomeCard>
            <WelcomeText>
              <h1>SMARTSTOCK</h1>
              <p>
                This is your control hub for managing school supplies. Vote for
                what needs restocking, check stock levels, and stay informed.
              </p>
            </WelcomeText>
            <GifWrapper>
              <img src={stock} alt="funny gif" />
            </GifWrapper>
          </WelcomeCard>

          <StatsGrid>
            <StatsCard>
              <StatsTitle>
                Voting Status
                <Link to="/voting">Go to Votes</Link>
              </StatsTitle>
              <VotingTable>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Supply Item</th>
                    <th>Votes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>🔥</td>
                    <td>Mouse</td>
                    <td>78</td>
                  </tr>
                  <tr>
                    <td>🥈</td>
                    <td>Kitchen Knife</td>
                    <td>65</td>
                  </tr>
                  <tr>
                    <td>🥉</td>
                    <td>Bond Papers</td>
                    <td>50</td>
                  </tr>
                </tbody>
              </VotingTable>
            </StatsCard>

            <StatsCard>
              <StatsTitle>
                Inventory Status
                <Link to="/inventory">Go to Inventory</Link>
              </StatsTitle>
              <InventoryList>
                <InventoryItem status={80}>
                  <span className="category">Writing Materials</span>
                  <div className="availability">
                    <span className="dot" />
                    <span>80%</span>
                  </div>
                </InventoryItem>
                <InventoryItem status={50}>
                  <span className="category">Paper Supplies</span>
                  <div className="availability">
                    <span className="dot" />
                    <span>50%</span>
                  </div>
                </InventoryItem>
                <InventoryItem status={20}>
                  <span className="category">Office Equipment</span>
                  <div className="availability">
                    <span className="dot" />
                    <span>20%</span>
                  </div>
                </InventoryItem>
              </InventoryList>
            </StatsCard>
          </StatsGrid>

          <AnnouncementsSection>
            <StatsTitle>Announcements</StatsTitle>
            <AnnouncementsList>
              {notifications.map((item, index) => (
                <AnnouncementItem key={index} status={item.status}>
                  <span>{item.message}</span>
                  <StatusLabel status={item.status}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    {item.status === 'starred' && <span>⭐</span>}
                  </StatusLabel>
                </AnnouncementItem>
              ))}
            </AnnouncementsList>
          </AnnouncementsSection>
        </Content>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;

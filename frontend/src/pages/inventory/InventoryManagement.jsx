import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Bell, Settings as SettingsIcon, MessageCircle } from 'lucide-react';
import SettingsModal from '@/components/settings/SettingsModal';

const PageContainer = styled.div`
  padding: 0;
  background-color: transparent;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
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

const Title = styled.div`
  h1 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }
  p {
    color: #666;
  }
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  margin-bottom: 2.5rem;
  font-size: 1rem;

  &::placeholder {
    color: #94a3b8;
  }
`;

const TabList = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  font-size: 0.95rem;
  color: ${p => (p.active ? '#1e40af' : '#64748b')};
  border-bottom: 2px solid ${p => (p.active ? '#1e40af' : 'transparent')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #1e40af;
  }
`;

const Table = styled.table`
  width: 100%;
  background: white;
  border-radius: 0.5rem;
  border-collapse: collapse;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  color: #1e40af;
  font-weight: 500;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;

  &:first-of-type { border-top-left-radius: 0.5rem; }
  &:last-of-type { border-top-right-radius: 0.5rem; }
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #1a1a1a;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${p => {
      switch (p.status) {
        case 'In Stock': return '#22c55e';
        case 'Low Stock': return '#eab308';
        case 'Out of Stock': return '#ef4444';
        default: return '#94a3b8';
      }
    }};
  }
`;

const LastUpdated = styled.span`
  color: #64748b;
  font-size: 0.9rem;
`;

const ChatbotContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const ChatbotButton = styled.button`
  background: #4834d4;
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  cursor: pointer;
  transition: background 0.3s;

  &:hover { background: #372aaa; }
`;

const ChatWindow = styled.div`
  background: white;
  width: 300px;
  height: 400px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  padding: 1rem;
  position: fixed;
  bottom: 80px;
  right: 20px;
  display: ${p => (p.open ? 'block' : 'none')};
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  margin-bottom: 10px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
`;

const InventoryManagement = () => {
  const [activeTab, setActiveTab] = useState('List');
  const [openSettings, setOpenSettings] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const supplies = [
    { id: 1, name: 'White Board Marker', quantity: '100 pcs', status: 'In Stock', lastUpdated: '2 days ago' },
    { id: 2, name: 'Printer Paper', quantity: '10 pcs', status: 'Low Stock', lastUpdated: '1 day ago' },
    { id: 3, name: 'Whiteboard erasers', quantity: '2 pcs', status: 'Low Stock', lastUpdated: '3 days ago' },
    { id: 4, name: 'LAN Cables', quantity: '50 pcs', status: 'In Stock', lastUpdated: '3 days ago' },
    { id: 5, name: 'Ballpoint Pens', quantity: '0 pcs', status: 'Out of Stock', lastUpdated: '4 days ago' },
    { id: 6, name: 'Alcohol and Sanitizers', quantity: '10 pcs', status: 'Low Stock', lastUpdated: '7 days ago' },
    { id: 7, name: 'Broom and Dustpan', quantity: '2 pcs', status: 'Low Stock', lastUpdated: '7 days ago' },
    { id: 8, name: 'Scientific Calculators', quantity: '0 pcs', status: 'Out of Stock', lastUpdated: '7 days ago' },
  ];

  const tabs = ['List', 'Recently Added', 'Upcoming', 'AI Predictions'];

  return (
    <PageContainer>
      <Header>
        <Title>
          <h1>Inventory Overview</h1>
          <p>Check Available Supplies and Stay Updated on Stock Levels.</p>
        </Title>
        <HeaderActions>
          <IconButton><Bell size={20} /></IconButton>
          <IconButton onClick={() => setOpenSettings(true)}>
            <SettingsIcon size={20} />
          </IconButton>
        </HeaderActions>
      </Header>

      <SearchBar placeholder="Browse Supplies..." />

      <TabList>
        {tabs.map(tab => (
          <Tab
            key={tab}
            active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Tab>
        ))}
      </TabList>

      <Table>
        <thead>
          <tr>
            <Th>Supply Name</Th>
            <Th>Quantity</Th>
            <Th>Status</Th>
            <Th>Last Updated</Th>
          </tr>
        </thead>
        <tbody>
          {supplies.map(supply => (
            <tr key={supply.id}>
              <Td>{supply.name}</Td>
              <Td>{supply.quantity}</Td>
              <Td>
                <StatusIndicator status={supply.status}>
                  {supply.status}
                </StatusIndicator>
              </Td>
              <Td><LastUpdated>{supply.lastUpdated}</LastUpdated></Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <SettingsModal open={openSettings} onClose={() => setOpenSettings(false)} />

      <ChatbotContainer>
        {chatOpen && (
          <ChatWindow open={chatOpen}>
            <ChatHeader>
              <span>AI Chatbot</span>
              <CloseButton onClick={() => setChatOpen(false)}>✖</CloseButton>
            </ChatHeader>
            <p>👋 Hello! How can I help you today?</p>
          </ChatWindow>
        )}
        <ChatbotButton onClick={() => setChatOpen(!chatOpen)}>
          <MessageCircle size={24} />
        </ChatbotButton>
      </ChatbotContainer>
    </PageContainer>
  );
};

export default InventoryManagement;

import React from 'react';
import styled from '@emotion/styled';
import Sidebar from '../Dashboard/Sidebar';
import { Bell, Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import SettingsModal from '../SettingsModal';
import RequestModal from '../Requests/RequestModal';

const PageContainer = styled.div`
  display: flex;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  background-color: #f8fafc;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
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
  margin-bottom: 2rem;
  font-size: 1rem;

  &::placeholder {
    color: #94a3b8;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
`;

const SuppliesSection = styled.div``;

const CategoryTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RequestButton = styled.button`
  background: #4834d4;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #372aaa;
  }
`;

const SuppliesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
`;

const SupplyCard = styled.div`
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  height: 230px;

  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  h3 {
    font-size: 1rem;
    text-align: center;
    min-height: 48px; /* consistent height for title */
    margin-bottom: 0.5rem;
  }

  .votes {
    text-align: center;
    color: #555;
    font-size: 0.9rem;
    margin-top: auto;
    margin-bottom: 1rem;
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: auto;
  }
`;

const VoteButton = styled.button`
  flex: 1;
  padding: 0.4rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.9rem;
  cursor: pointer;
  background: ${props => (props.primary ? '#4834d4' : '#e2e8f0')};
  color: ${props => (props.primary ? 'white' : '#1a1a1a')};

  &:hover {
    background: ${props => (props.primary ? '#372aaa' : '#cbd5e1')};
  }
`;

const RequestsSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
`;

const RequestsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RequestCard = styled.div`
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;

  h3 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .details {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.5rem;
  }

  .status {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
    background: ${props => {
      switch (props.status) {
        case 'pending':
          return '#fef3c7';
        case 'approved':
          return '#dcfce7';
        case 'declined':
          return '#fee2e2';
        default:
          return '#f1f5f9';
      }
    }};
    color: ${props => {
      switch (props.status) {
        case 'pending':
          return '#92400e';
        case 'approved':
          return '#166534';
        case 'declined':
          return '#991b1b';
        default:
          return '#475569';
      }
    }};
  }
`;

const VotingRequests = () => {
  const officeSupplies = [
    { id: 1, name: 'Whiteboard Markers (Assorted Colors)', votes: 98 },
    { id: 2, name: 'Printer Ink (Black & Color)', votes: 85 },
    { id: 3, name: 'Bond Paper (A4, Short, Long)', votes: 120 },
    { id: 4, name: 'Ballpoint Pens (Blue, Black, Red)', votes: 75 },
    { id: 5, name: 'Highlighters (Neon Pack)', votes: 45 },
    { id: 6, name: 'Correction Tape', votes: 90 },
    { id: 7, name: 'Sticky Notes (Assorted Colors)', votes: 60 },
    { id: 8, name: 'Folders & Envelopes (Plastic & Manila)', votes: 45 },
    { id: 9, name: 'Graphing Paper (Math & Engineering)', votes: 35 },
    { id: 10, name: 'Mouse (Wireless, Logitech)', votes: 164 }
  ];

  const requests = [
    { id: 1, item: 'Graphing Calculators', requestedBy: 'Emie Estrella', date: '2024-03-20', status: 'pending' },
    { id: 2, item: 'Water Color Set', requestedBy: 'Fretzei Gemelo', date: '2024-03-19', status: 'pending' },
    { id: 3, item: 'Stopwatches & Whistles', requestedBy: 'Angelo Estrella', date: '2024-03-18', status: 'declined' },
    { id: 4, item: 'Book Stands', requestedBy: 'Robert Mahinay', date: '2024-03-17', status: 'approved' },
    { id: 5, item: 'USB Flash Drive 32GB', requestedBy: 'Laurence Barnido', date: '2024-03-16', status: 'approved' }
  ];

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [showRequestModal, setShowRequestModal] = useState(false);

  return (
    <PageContainer>
      <Sidebar />
      <MainContent>
        <Header>
          <Title>
            <h1>Voting and Requests Page</h1>
            <p>Vote for needed supplies, request new items, and track approvals.</p>
          </Title>
          <HeaderActions>
            <RequestButton onClick={() => setShowRequestModal(true)}>
              <span>+</span> Request New Supply
            </RequestButton>
            <RequestModal open={showRequestModal} onClose={() => setShowRequestModal(false)} />
            <IconButton><Bell size={20} /></IconButton>
            <IconButton onClick={() => setShowSettingsModal(true)}>
              <SettingsIcon size={20} />
            </IconButton>
          </HeaderActions>
          <SettingsModal open={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
        </Header>

        <SearchBar placeholder="Browse Supplies..." />

        <ContentGrid>
          <SuppliesSection>
            <CategoryTitle>Office Supplies</CategoryTitle>
            <SuppliesGrid>
              {officeSupplies.map(supply => (
                <SupplyCard key={supply.id}>
                  <div className="card-content">
                    <h3>{supply.name}</h3>
                    <div className="votes">{supply.votes} votes</div>
                  </div>
                  <div className="actions">
                    <VoteButton>Details</VoteButton>
                    <VoteButton primary>Vote</VoteButton>
                  </div>
                </SupplyCard>
              ))}
            </SuppliesGrid>
          </SuppliesSection>

          <RequestsSection>
            <h2>Requests</h2>
            <RequestsList>
              {requests.map(request => (
                <RequestCard key={request.id} status={request.status}>
                  <h3>{request.item}</h3>
                  <div className="details">Requested by: {request.requestedBy}</div>
                  <div className="status">
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </div>
                </RequestCard>
              ))}
            </RequestsList>
          </RequestsSection>
        </ContentGrid>
      </MainContent>
    </PageContainer>
  );
};

export default VotingRequests;

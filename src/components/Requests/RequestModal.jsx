import React, { useState } from 'react';
import styled from '@emotion/styled';
import { X, ArrowLeft } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import historyImg from '../../assets/history.png';

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const ModalContainer = styled.div`
  display: flex;
  width: 700px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
`;

const Sidebar = styled.div`
  width: 60px;
  background: #5b7cfa;
`;

const Content = styled.div`
  flex: 1;
  padding: 2rem;
  position: relative;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  color: #1e40af;
  margin-bottom: 0.5rem;
  text-align: left;
`;

const SubText = styled.p`
  font-size: 0.95rem;
  color: #6b7280;
  text-align: left;
  margin-bottom: 2rem;
`;

const HistoryPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const HistoryImage = styled.img`
  width: 200px;
  margin-top: 2rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #1e40af;
  cursor: pointer;
  margin-bottom: 1rem;
  font-size: 1rem;

  &:hover {
    color: #172554;
  }
`;
const Form = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr; // or however you want to lay it out
  gap: 1rem;
`;
const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.25rem;
  display: block;
  text-align: left;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  min-height: 80px;
`;

const Notice = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff7ed;
  color: #92400e;
  border: 1px solid #fcd34d;
  padding: 0.75rem;
  border-radius: 6px;
  margin: 1rem 0;
  font-size: 0.9rem;
  text-align: left;
`;

const HistoryLink = styled.button`
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  margin-top: 1rem;
  font-size: 0.95rem;

  &:hover {
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  background-color: #1e40af;
  color: #fff;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1.5rem;
  font-size: 1rem;

  &:hover {
    background-color: #172554;
  }
`;


const RequestModal = ({ open, onClose }) => {
  const [showHistory, setShowHistory] = useState(false);

  if (!open) return null;

  return (
    <Overlay>
      <ModalContainer>
        <Sidebar />
        <Content>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>

          {!showHistory ? (
            <>
              <Title>Requests Form</Title>
              <Form>
                <div>
                  <Label>Item Name</Label>
                  <Input type="text" placeholder="Enter item name" />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </Form>
              <div style={{ marginBottom: '1.5rem' }}>
                <Label>Department</Label>
                <Select>
                  <option>Select</option>
                  <option>IT Department</option>
                  <option>Library</option>
                  <option>Admin Office</option>
                </Select>
              </div>
              <div>
                <Label>Reasons for request</Label>
                <TextArea placeholder="Provide details for why this item is needed" />
              </div>
              <Notice>
                <AlertTriangle size={20} color="#f59e0b" />
                Notice: Submitted item requests are subject to administrative review. Approved requests will be displayed on the voting board for community feedback.
              </Notice>
              <HistoryLink onClick={() => setShowHistory(true)}>
                View Request History
              </HistoryLink>
              <SubmitButton>Submit Request</SubmitButton>
            </>
          ) : (
            <>
               <BackButton onClick={() => setShowHistory(false)}>
                <ArrowLeft size={20} /> Back to Request Form
              </BackButton>
              <Title>Request History</Title>
              <SubText>Your requests history will appear here...</SubText>
              <HistoryPlaceholder>
                <HistoryImage src={historyImg} alt="History Placeholder" />
              </HistoryPlaceholder>
            </>
          )}
        </Content>
      </ModalContainer>
    </Overlay>
  );
};

export default RequestModal;
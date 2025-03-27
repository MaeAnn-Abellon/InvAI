import React from 'react';
import styled from '@emotion/styled';
import { X } from 'lucide-react';
import historyImage from '../../assets/history.png';

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
  width: 600px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
`;

const Sidebar = styled.div`
  width: 60px;
  background: #364fc7;
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
  font-size: 1.6rem;
  margin-bottom: 0.5rem;
  color: #1e3a8a;
  text-align: left;
`;

const SubText = styled.p`
  color: #6b7280;
  text-align: left;
  margin-bottom: 3rem;
`;

const HistoryImage = styled.img`
  width: 150px;
  height: auto;
  margin: 0 auto;
`;

const RequestHistoryModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <Overlay>
      <ModalContainer>
        <Sidebar />
        <Content>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
          <Title>Request History</Title>
          <SubText>Your requests history will appear here…</SubText>
          <HistoryImage src={historyImage} alt="Request History" />
        </Content>
      </ModalContainer>
    </Overlay>
  );
};

export default RequestHistoryModal;

import React from 'react';
import { useAuth } from '@/context/useAuth';
import InventoryManagement from './InventoryManagement';
import ReadOnlyInventory from './ReadOnlyInventory';

const InventoryRoute = () => {
  const { role } = useAuth();
  if (role === 'manager') return <InventoryManagement />;
  if (role === 'teacher' || role === 'staff') return <ReadOnlyInventory />;
  return <ReadOnlyInventory />;
};

export default InventoryRoute;
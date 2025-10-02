import { useContext } from 'react';
import AuthCtx from './_authContext';

export function useAuth() {
  return useContext(AuthCtx);
}

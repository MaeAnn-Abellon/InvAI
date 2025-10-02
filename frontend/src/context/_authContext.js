import { createContext } from 'react';

// Separate context file to keep provider component file HMR-friendly
const AuthCtx = createContext(null);
export default AuthCtx;

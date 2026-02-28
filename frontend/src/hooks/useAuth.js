import { useContext } from 'react';
import { AuthContext } from '../context/ContextDef';

export const useAuth = () => useContext(AuthContext);

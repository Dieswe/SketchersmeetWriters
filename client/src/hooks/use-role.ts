import { create } from 'zustand';
import { UserRole } from '@/lib/types';

interface RoleState {
  role: UserRole | null;
  setRole: (role: UserRole) => void;
}

export const useRoleStore = create<RoleState>((set) => ({
  role: null,
  setRole: (role) => set({ role }),
}));

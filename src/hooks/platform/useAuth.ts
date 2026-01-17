import { useState, useEffect, useCallback } from 'react';
import {
  getUsers,
  saveUsers,
  getCurrentUser,
  setCurrentUser,
  initializeData,
  generateId,
} from '../../utils/platform/storage';
import type { User } from '../../utils/platform/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeData();
    const savedUser = getCurrentUser();
    setUser(savedUser);
    setLoading(false);
  }, []);

  const login = useCallback((username: string, password: string): boolean => {
    const users = getUsers();
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      setCurrentUser(foundUser);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setCurrentUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';
  const isPartner = user?.role === 'partner';

  return {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isPartner,
    isAuthenticated: !!user,
  };
}

export function useUsers() {
  const [users, setUsersState] = useState<User[]>([]);

  useEffect(() => {
    setUsersState(getUsers());
  }, []);

  const refresh = useCallback(() => {
    setUsersState(getUsers());
  }, []);

  const addUser = useCallback((userData: Omit<User, 'id'>): User | null => {
    const users = getUsers();
    if (users.some(u => u.username === userData.username)) {
      return null; // Username exists
    }
    const newUser: User = {
      id: Date.now(),
      ...userData,
    };
    users.push(newUser);
    saveUsers(users);
    setUsersState(users);
    return newUser;
  }, []);

  const updateUser = useCallback((id: number, updates: Partial<User>): boolean => {
    const users = getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return false;
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
    setUsersState(users);
    return true;
  }, []);

  const deleteUser = useCallback((id: number): boolean => {
    const users = getUsers();
    const user = users.find(u => u.id === id);
    if (!user || user.username === 'admin') return false;
    const filtered = users.filter(u => u.id !== id);
    saveUsers(filtered);
    setUsersState(filtered);
    return true;
  }, []);

  return {
    users,
    refresh,
    addUser,
    updateUser,
    deleteUser,
    getPartners: () => users.filter(u => u.role === 'partner'),
  };
}

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

export interface User {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'partner';
  contract?: string;
}

const STORAGE_KEY = 'mindmush_users';
const SESSION_KEY = 'mindmush_session';

function createAuthStore() {
  // Load initial users from localStorage
  const storedUsers = browser ? localStorage.getItem(STORAGE_KEY) : null;
  const defaultUsers: User[] = [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', contract: '' }
  ];

  const initialUsers: User[] = storedUsers ? JSON.parse(storedUsers) : defaultUsers;

  // Initialize localStorage if empty
  if (browser && !storedUsers) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
  }

  const users = writable<User[]>(initialUsers);
  const currentUser = writable<User | null>(null);

  // Persist users to localStorage
  users.subscribe(value => {
    if (browser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    }
  });

  // Check for existing session
  if (browser) {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session) {
      currentUser.set(JSON.parse(session));
    }
  }

  return {
    users,
    currentUser,
    isAdmin: derived(currentUser, $user => $user?.role === 'admin'),
    isLoggedIn: derived(currentUser, $user => $user !== null),

    login: (username: string, password: string): boolean => {
      const allUsers = get(users);
      const user = allUsers.find(u => u.username === username && u.password === password);

      if (user) {
        currentUser.set(user);
        if (browser) {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
        }
        return true;
      }
      return false;
    },

    logout: () => {
      currentUser.set(null);
      if (browser) {
        sessionStorage.removeItem(SESSION_KEY);
      }
    },

    addUser: (user: Omit<User, 'id'>) => {
      const newUser: User = {
        ...user,
        id: Date.now()
      };
      users.update(u => [...u, newUser]);
      return newUser;
    },

    updateUser: (id: number, updates: Partial<User>) => {
      users.update(allUsers =>
        allUsers.map(u => u.id === id ? { ...u, ...updates } : u)
      );
    },

    deleteUser: (id: number) => {
      users.update(allUsers => allUsers.filter(u => u.id !== id));
    },

    getUser: (id: number): User | undefined => {
      return get(users).find(u => u.id === id);
    }
  };
}

export const auth = createAuthStore();

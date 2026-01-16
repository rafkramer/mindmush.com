import { w as writable, d as derived, g as get } from "./index.js";
function createAuthStore() {
  const defaultUsers = [
    { id: 1, username: "admin", password: "admin123", role: "admin", contract: "" }
  ];
  const initialUsers = defaultUsers;
  const users = writable(initialUsers);
  const currentUser = writable(null);
  users.subscribe((value) => {
  });
  return {
    users,
    currentUser,
    isAdmin: derived(currentUser, ($user) => $user?.role === "admin"),
    isLoggedIn: derived(currentUser, ($user) => $user !== null),
    login: (username, password) => {
      const allUsers = get(users);
      const user = allUsers.find((u) => u.username === username && u.password === password);
      if (user) {
        currentUser.set(user);
        return true;
      }
      return false;
    },
    logout: () => {
      currentUser.set(null);
    },
    addUser: (user) => {
      const newUser = {
        ...user,
        id: Date.now()
      };
      users.update((u) => [...u, newUser]);
      return newUser;
    },
    updateUser: (id, updates) => {
      users.update(
        (allUsers) => allUsers.map((u) => u.id === id ? { ...u, ...updates } : u)
      );
    },
    deleteUser: (id) => {
      users.update((allUsers) => allUsers.filter((u) => u.id !== id));
    },
    getUser: (id) => {
      return get(users).find((u) => u.id === id);
    }
  };
}
const auth = createAuthStore();
export {
  auth as a
};

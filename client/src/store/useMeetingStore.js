import { create } from "zustand";

const useMeetingStore = create((set) => ({
  user: JSON.parse(
  localStorage.getItem("user")
) || null,
  token: localStorage.getItem("token"),

  setUser: (user) =>{
     localStorage.setItem(
    "user",
    JSON.stringify(user)
  );
    set({ user });},

  setToken: (token) => {
    localStorage.setItem(
      "token",
      token
    );

    set({
      token,
    });
  },

  logout: () => {
    localStorage.removeItem(
      "token"
    );
     localStorage.removeItem(
    "user"
  );
    set({
      user: null,
      token: null,
    });
  },
}));

export default useMeetingStore;
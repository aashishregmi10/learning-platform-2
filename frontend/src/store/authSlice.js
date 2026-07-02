import { createSlice } from "@reduxjs/toolkit";

const stored = localStorage.getItem("userInfo");
const initialUser = stored ? JSON.parse(stored) : null;

export const authSlice = createSlice({
  name: "auth",
  initialState: { user: initialUser },
  reducers: {
    setUser: (state, { payload }) => {
      state.user = payload;
      localStorage.setItem("userInfo", JSON.stringify(payload));
    },
    removeUser: (state) => {
      state.user = null;
      localStorage.removeItem("userInfo");
    },
  },
});

export const { setUser, removeUser } = authSlice.actions;

export const selectLoggedInUser = (state) => state?.auth?.user ?? null;

export default authSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  uid: "",
  displayName: "",
  email: "",
  accessToken: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.uid = action.payload.uid;
      state.displayName = action.payload.displayName;
      state.email = action.payload.email;
      state.accessToken = action.payload.accessToken;
    },
    resetUser: () => initialState,
  },
});

export const { setUser, resetUser } = userSlice.actions;

export default userSlice.reducer;

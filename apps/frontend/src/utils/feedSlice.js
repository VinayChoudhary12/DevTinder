import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
  name: "feed",
  initialState: null,
  reducers: {
    addFeed: (state, action) => {
      return action.payload;
    },
    removeUserFromFeed: (state, action) => {
      const newFeed = state.filter((user) => user._id !== action.payload);
      return newFeed;
    },
    addUserToFeed: (state, action) => {
      if (state && state.length > 0) {
        return [action.payload, ...state];
      }
      return [action.payload];
    },
    removeFeed: () => {
      return null;
    },
  },
});

export const { addFeed, removeUserFromFeed, addUserToFeed, removeFeed } = feedSlice.actions;
export default feedSlice.reducer;

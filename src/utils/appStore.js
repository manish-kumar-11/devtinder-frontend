import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import feedReducer from "./feedSlice"
import connectionsReducers from './connectionsSlice'

const appStore = configureStore({
  reducer: {
    user: userReducer,
    feed:feedReducer,
    connections: connectionsReducers
  },
});

export default appStore;
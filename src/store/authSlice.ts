import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StorageService } from "../utils/storage";

interface AuthState {
  token: string | null;
  username: string | null;
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  userData: any | null;
}

const initialState: AuthState = {
  token: null,
  username: null,
  isSuperAdmin: false,
  isAuthenticated: false,
  userData: null,
};

const SUPERADMIN_USERNAMES = ["emilys", "superadmin", "admin"];

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; username: string; userData?: any }>
    ) => {
      state.token = action.payload.token;
      state.username = action.payload.username;
      state.userData = action.payload.userData || null;
      state.isAuthenticated = true;
      state.isSuperAdmin = SUPERADMIN_USERNAMES.includes(
        action.payload.username.toLowerCase()
      );

      StorageService.saveToken(action.payload.token);
      StorageService.saveUsername(action.payload.username);
      if (action.payload.userData) {
        StorageService.saveUserData(action.payload.userData);
      }
    },
    logout: (state) => {
      state.token = null;
      state.username = null;
      state.isSuperAdmin = false;
      state.isAuthenticated = false;
      state.userData = null;
      StorageService.clearAuth();
    },
    clearSession: (state) => {
      state.token = null;
      state.username = null;
      state.isSuperAdmin = false;
      state.isAuthenticated = false;
      state.userData = null;
    },
    restoreSession: (
      state,
      action: PayloadAction<{ token: string; username: string; userData?: any }>
    ) => {
      state.token = action.payload.token;
      state.username = action.payload.username;
      state.userData = action.payload.userData || null;
      state.isAuthenticated = true;
      state.isSuperAdmin = SUPERADMIN_USERNAMES.includes(
        action.payload.username.toLowerCase()
      );
    },
  },
});

export const { setCredentials, logout, restoreSession, clearSession } = authSlice.actions;
export default authSlice.reducer;

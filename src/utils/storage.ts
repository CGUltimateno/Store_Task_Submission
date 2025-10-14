import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

const KEYS = {
  TOKEN: 'auth_token',
  USERNAME: 'auth_username',
  PASSWORD: 'auth_password',
  USER_DATA: 'user_data',
  THEME_MODE: 'ui_theme_mode',
};

export const StorageService = {
  saveToken: (token: string | null | undefined) => {
    if (token) {
      storage.set(KEYS.TOKEN, token);
    } else {
      storage.delete(KEYS.TOKEN);
    }
  },

  getToken: (): string | undefined => {
    const token = storage.getString(KEYS.TOKEN);
    return token;
  },

  removeToken: () => {
    storage.delete(KEYS.TOKEN);
  },

  saveUsername: (username: string) => {
    storage.set(KEYS.USERNAME, username);
  },

  getUsername: (): string | undefined => {
    const username = storage.getString(KEYS.USERNAME);
    return username;
  },

  removeUsername: () => {
    storage.delete(KEYS.USERNAME);
  },

  savePassword: (password: string) => {
    storage.set(KEYS.PASSWORD, password);
  },

  getPassword: (): string | undefined => {
    const password = storage.getString(KEYS.PASSWORD);
    return password;
  },

  removePassword: () => {
    storage.delete(KEYS.PASSWORD);
  },

  saveUserData: (userData: any) => {
    storage.set(KEYS.USER_DATA, JSON.stringify(userData));
  },

  getUserData: (): any | undefined => {
    const data = storage.getString(KEYS.USER_DATA);
    return data ? JSON.parse(data) : undefined;
  },

  removeUserData: () => {
    storage.delete(KEYS.USER_DATA);
  },

  clearAuth: () => {
    storage.delete(KEYS.TOKEN);
    storage.delete(KEYS.USERNAME);
    storage.delete(KEYS.PASSWORD);
    storage.delete(KEYS.USER_DATA);
  },

  hasSession: (): boolean => {
    const hasToken = !!storage.getString(KEYS.TOKEN);
    return hasToken;
  },

  saveThemeMode: (mode: 'light' | 'dark') => {
    storage.set(KEYS.THEME_MODE, mode);
  },

  getThemeMode: (): 'light' | 'dark' | undefined => {
    const mode = storage.getString(KEYS.THEME_MODE) as 'light' | 'dark' | undefined;
    return mode ?? undefined;
  },

  clearThemeMode: () => {
    storage.delete(KEYS.THEME_MODE);
  },
};

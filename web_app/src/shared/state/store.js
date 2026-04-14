import { appConfig } from "../../config/appConfig.js";

function readJson(key, fallback) {
  const value = localStorage.getItem(key);

  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn(`Unable to parse local storage key "${key}".`, error);
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  getSession() {
    return readJson(appConfig.storageKeys.session, null);
  },

  getCurrentUser() {
    return this.getSession()?.user ?? null;
  },

  isAuthenticated() {
    return Boolean(this.getSession()?.token);
  },

  setSession(session) {
    writeJson(appConfig.storageKeys.session, session);
  },

  clearSession() {
    localStorage.removeItem(appConfig.storageKeys.session);
  },

  setFlash(flash) {
    writeJson(appConfig.storageKeys.flash, flash);
  },

  consumeFlash() {
    const flash = readJson(appConfig.storageKeys.flash, null);
    localStorage.removeItem(appConfig.storageKeys.flash);
    return flash;
  }
};

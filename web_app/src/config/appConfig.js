export const appConfig = {
  appName: "Patient Management System",
  appSubtitle: "Hospital Management & Patient Care Platform",
  apiBaseUrl: "http://localhost:8000/api",
  // When the UI is loaded from a remote host (for example Vercel) without a
  // backend deployed at localhost, use the mock API so the frontend still works.
  useMockApi:
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1",
  storageKeys: {
    session: "pms-session-v3",
    flash: "pms-flash-v3",
    mockDatabase: "pms-mock-db-v3"
  }
};

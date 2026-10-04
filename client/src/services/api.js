const isLocal =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const defaultApiUrl = isLocal
  ? "http://localhost:5000/api"
  : "https://intelmeet-03a1.onrender.com/api";

const API_BASE = import.meta.env.VITE_API_URL || defaultApiUrl;
const API_URL = API_BASE.replace(/\/+$/, "");

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }
  return data;
};

export const loginUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Invalid Email or Password");
  }
  return data;
};

export const generateSummary = async (messages) => {
  const response = await fetch(`${API_URL}/ai/summary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to generate summary");
  }
  return data;
};

export const getMeetings = async () => {
  const token = localStorage.getItem("token");

  if (!token) return [];

  const response = await fetch(`${API_URL}/meetings/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => []);
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    throw new Error(data.message || "Failed to load meetings");
  }

  return Array.isArray(data) ? data : [];
};

export const createMeeting = async (title) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/meetings/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to create meeting");
  }
  return data;
};

export const deleteMeeting = async (id, token) => {
  const currentToken = token || localStorage.getItem("token");

  const response = await fetch(`${API_URL}/meetings/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${currentToken}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete meeting");
  }
  return data;
};
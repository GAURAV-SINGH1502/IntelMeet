//import axios from "axios";
const API_URL = "http://localhost:5000/api";

export const registerUser = async (userData) => {
  const response = await fetch(
    `${API_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );

  return response.json();
};

export const loginUser = async (userData) => {
  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );

  return response.json();
};

export const getMeetings = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    "http://localhost:5000/api/meetings/all",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};  

export const createMeeting = async (title) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    "http://localhost:5000/api/meetings/create",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
      }),
    }
  );

  return response.json();
};
export const deleteMeeting = async (
  id,
  token
) => {

  const response =
    await fetch(
      `${API_URL}/meetings/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

  return response.json();

};
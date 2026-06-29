//import axios from "axios";
//const API_URL = "http://localhost:5000/api";
const API_URL =
  "https://intelmeet-03a1.onrender.com/api";
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
console.log("Status:", response.status);

  const text = await response.text();

  console.log("Response:", text);

  if (!response.ok) {
    throw new Error(text);
  }
  return await response.json();
};
export const generateSummary =
  async (messages) => {

    const response =
      await fetch(
        `${API_URL}/ai/summary`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            messages,
          }),
        }
      );

    return response.json();
  };
export const getMeetings = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    "https://intelmeet-03a1.onrender.com/api/meetings/all",
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
    "https://intelmeet-03a1.onrender.com/api/meetings/create",
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
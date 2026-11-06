import axios from "axios";

export const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_BASE_URL ||
  "https://chat-flow-e7zr.onrender.com";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;

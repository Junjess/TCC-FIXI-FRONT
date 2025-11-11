import axios from "axios";

const apiBase =
  (typeof window !== "undefined" && (window as any).__API_BASE) ||
  localStorage.getItem("API_BASE") ||
  process.env.REACT_APP_API_BASE_URL;

console.log("[API_BASE]", apiBase); 

export const api = axios.create({
  baseURL: apiBase,
});
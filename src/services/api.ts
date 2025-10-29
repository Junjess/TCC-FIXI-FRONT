import axios from "axios";

const apiBase =
  (typeof window !== "undefined" && (window as any).__API_BASE) ||
  localStorage.getItem("API_BASE") ||
  process.env.REACT_APP_API_BASE_URL;

export const api = axios.create({
  baseURL: apiBase,
  // withCredentials: true, // se usar cookie de sessão
});
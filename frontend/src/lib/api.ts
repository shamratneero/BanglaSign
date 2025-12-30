import axios from "axios";

export const api = axios.create({
  baseURL: "",              // IMPORTANT: same-origin via gateway
  withCredentials: true,    // IMPORTANT: cookies
});


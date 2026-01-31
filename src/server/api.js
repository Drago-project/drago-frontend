import axios from "axios";

const api = axios.create({
  baseURL: "https://drago.runasp.net",
});

export default api;

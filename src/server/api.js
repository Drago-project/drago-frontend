import axios from "axios";

const api = axios.create({
  baseURL: "https://drago-back.runasp.net",
});

export default api;

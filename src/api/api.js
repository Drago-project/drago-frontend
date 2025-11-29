import axios from "axios";

const api = axios.create({
  baseURL: "http://drago.runasp.net",
});

export default api;

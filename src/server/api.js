import axios from "axios";

const api = axios.create({
  baseURL: "http://drago-webapp.runasp.net",
});

export default api;

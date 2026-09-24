// Backend API URL Configuration
// 1. Checks VITE_API_URL if set
// 2. Uses http://localhost:5001 when running on localhost / 127.0.0.1
// 3. Defaults to live Render backend https://findfound.onrender.com
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, "").replace(/\/api\/?$/, "");
  }

  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return "http://localhost:5001";
  }

  return "https://findfound.onrender.com";
};

const API_URL = getApiUrl();

export default API_URL;
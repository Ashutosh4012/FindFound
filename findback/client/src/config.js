// Backend API URL Configuration
// 1. Checks VITE_API_URL if set
// 2. Uses http://localhost:5001 when running on localhost / 127.0.0.1
// 3. Defaults to live Render backend https://findfound.onrender.com
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, "").replace(/\/api\/?$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
      host.startsWith("172.20.");

    if (isLocal) {
      return `http://${host === "localhost" || host === "127.0.0.1" ? "localhost" : host}:5001`;
    }
  }

  return "https://findfound.onrender.com";
};

const API_URL = getApiUrl();

export default API_URL;
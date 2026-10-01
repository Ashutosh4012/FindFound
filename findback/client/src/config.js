// Backend API URL Configuration
// In development, return "" so Vite proxies /api requests to localhost:5001 directly with zero CORS issues
// In production, use VITE_API_URL or fall back to https://findfound.onrender.com
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.trim().replace(/\/+$/, "").replace(/\/api\/?$/, "");
  }

  // When developing with Vite (npm run dev), use the Vite proxy
  if (import.meta.env.DEV) {
    return "";
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
      return "";
    }
  }

  return "https://findfound.onrender.com";
};

const API_URL = getApiUrl();

export default API_URL;
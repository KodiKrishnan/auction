import axios from 'axios';


const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
});


// ← Automatically attach token to every request

axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



// Global 401 Catcher
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("401 UNAUTHORIZED INTERCEPTED", {
        failedUrl: error.config.url,
        fullError: error.response.data
      });

      const requestUrl = error.config.url || "";

      // 2. Ignore 401s from login/otp endpoints so AuthPage can handle them
      if (requestUrl.includes('/auth/google') || requestUrl.includes('/api/otp')) {
        return Promise.reject(error);
      }

      // 3. Dynamic Routing based on Role
      const userRole = sessionStorage.getItem("role");
      let targetLoginUrl = '/';

      if (userRole === 'OWNER') {
        targetLoginUrl = '/owner/register';
      } else if (userRole === 'TRAVELLER') {
        targetLoginUrl = '/traveller/register';
      } else {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/owner')) targetLoginUrl = '/owner/register';
        if (currentPath.includes('/traveller')) targetLoginUrl = '/traveller/register';
      }

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("role");

      const responseData = error.response.data;
      const backendMessage = (typeof responseData === 'string'
        ? responseData
        : responseData?.message || "").toLowerCase();

      if (backendMessage.includes("expired") || backendMessage.includes("timeout")) {
        alert("Your session has expired due to inactivity. Please log in again.");
      } else {
        alert("You have been logged out. Please sign in again.");
      }

      // 7. Execute Redirect
      window.location.href = targetLoginUrl;

      // This stops the error from reaching your UI components so no red error toasts appear!
      return new Promise(() => { });
    }

    if (error.response) {
      // The server responded with an error (400, 404, 500)
      return Promise.reject(error);
    } else if (error.request) {
      return Promise.reject({ message: "Network error. Please check your connection." });  
    } else {
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;


// } else if (error.request) {
//   return Promise.reject(new Error("Network error. Please check your connection."));
// }

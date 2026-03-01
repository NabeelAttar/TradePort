import axios from "axios";
import { runRedirectToLogin } from "./redirect";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
    withCredentials: true,
})

let isRefreshing = false; //global lock
let refreshSubscribers: (() => void)[] = []; //an array for storing queue of pending requests waiting for new token

// handle logout and prevent infiinite loops - Prevents redirect loop if already on /login
const handleLogout = () => {
    const publicPaths = ["/login", "/signup", "/forgot-password"]
    const currentPath = window.location.pathname

    if(!publicPaths.includes(currentPath)){
        runRedirectToLogin()
    }

}

// handle adding a new access token to queued requests
// Each callback represents: Retry my original API call once the token is refreshed
const subscribeTokenRefresh = (callback: () => void) => {
    refreshSubscribers.push(callback);
}

// execute queued requests aftr refresh
const onRefreshSuccess = () => {
    refreshSubscribers.forEach((callback) => callback());
    refreshSubscribers = [];
}

// handle api requests
axiosInstance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

// handle expired token and refresh logic
axiosInstance.interceptors.response.use(
    (response) => response, 
    // agar ye api request run karne me error aata hai to niche ka function run hoga
    async (error) => {
        const originalRequest = error.config; //jisme error aaya uska config catch karlo

        const is401 = error?.response?.status === 401
        const isRetry = originalRequest?._retry
        const isAuthRequired = originalRequest?.requireAuth === true

        // prevent infinite retry loops
        if(is401 && !isRetry && isAuthRequired){
            if(isRefreshing){
                return new Promise((resolve) => {
                    subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)))
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_SERVER_URI}/api/refresh-token`, 
                    {},
                    {withCredentials: true}
                )
                isRefreshing = false; // says - i have refreshed once now you can refresh another time 
                onRefreshSuccess(); //rerun all failed calls

                return axiosInstance(originalRequest);
            } catch (error) {
                isRefreshing = false;
                refreshSubscribers = [];
                handleLogout();
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
)

export default axiosInstance; 
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
    withCredentials: true,
})

let isRefreshing = false; //global lock
let refreshSubscribers: (() => void)[] = []; //an array for storing queue of pending requests waiting for new token

// handle logout and prevent infiinite loops - Prevents redirect loop if already on /login
const handleLogout = () => {
    if(window.location.pathname !== "/login"){
        window.location.href = "/login";
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

        // prevent infinite retry loops
        if(error.response?.status === 401 && !originalRequest._retry){
            // 401 for handling only unauthorized requsts, and infinite loops ko aoivd karne originalRequest._retry ye false hona chahiye
            if(isRefreshing){
                // if is Rrefreshing is true, mtlb ab token refresh ho rha h, to array me callback push karne wala function call kiya
                // aur fir promise resolve kiya
                return new Promise((resolve) => {
                    subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
                })
            }
            originalRequest._retry = true;  //to prevent infinite calls
            isRefreshing = true; //lock refresh process
            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_SERVER_URI}/api/refresh-token-user`, 
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
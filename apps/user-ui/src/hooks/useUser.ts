import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { useAuthStore } from "../app/stores/useAuthStore";
import { isProtected } from "../utils/protected";

// fetch user data from api
const fetchUser = async (isLoggedIn: boolean) => {
    const config = isLoggedIn ? isProtected : {}
    const response = await axiosInstance.get("/api/logged-in-user", config); //here instead of axios we have used axiosInstance cuz we 
    // have already configured that and added server uri as baseUrl there
    return response.data.user;
}

const useUser = () => {
    const { setLoggedIn, isLoggedIn } = useAuthStore()

    const {data: user, isPending, isError} = useQuery({
        queryKey: ["user"],
        queryFn: () => fetchUser(isLoggedIn),
        staleTime: 300 * 1000, //cache time - that is cache this userdata for 5 minutes after the time period delete it
        retry: false,
        // @ts-ignore
        onSuccess: () => {
            setLoggedIn(true)
        },
        onError: () => {
            setLoggedIn(false)
        }
    })
    return {user: user as any, isLoading: isPending, isError};
}

export default useUser;
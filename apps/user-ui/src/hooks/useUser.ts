import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";

// fetch user data from api
const fetchUser = async () => {
    const response = await axiosInstance.get("/api/logged-in-user"); //here instead of axios we have used axiosInstance cuz we 
    // have already configured that and added server uri as baseUrl there
    return response.data.user;
}

const useUser = () => {
    const {data: user, isLoading, isError, refetch} = useQuery({
        queryKey: ["user"],
        queryFn: fetchUser,
        staleTime: 300 * 1000, //cache time - that is cache this userdata for 5 minutes after the time period delete it
        retry: 1 //retry only on failure 
    })
    return {user, isLoading};
}

export default useUser;
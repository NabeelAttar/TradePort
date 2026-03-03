import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// fetch user data from api
const fetchAdmin = async () => {
    const response = await axiosInstance.get("/api/logged-in-admin"); //here instead of axios we have used axiosInstance cuz we 
    // have already configured that and added server uri as baseUrl there
    return response.data.user;
}

const useAdmin = () => {
    const {data: admin, isLoading, isError, refetch} = useQuery({
        queryKey: ["admin"],
        queryFn: fetchAdmin,
        staleTime: 300 * 1000, //cache time - that is cache this userdata for 5 minutes after the time period delete it
        retry: 1 //retry only on failure 
    })

    const history = useRouter()
    
    useEffect(() => {
        if(!isLoading && !admin){
            history.push("/")
        }
    }, [admin, isLoading])

    return {admin, isLoading, isError, refetch};
}

export default useAdmin;
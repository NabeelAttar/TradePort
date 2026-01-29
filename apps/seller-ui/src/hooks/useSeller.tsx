import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";

// fetch user data from api
const fetchSeller = async () => {
    const response = await axiosInstance.get("/api/logged-in-seller"); //here instead of axios we have used axiosInstance cuz we 
    // have already configured that and added server uri as baseUrl there
    return response.data.seller;
}

const useSeller = () => {
    const {data: seller, isLoading, isError, refetch} = useQuery({
        queryKey: ["seller"],
        queryFn: fetchSeller,
        staleTime: 300 * 1000, //cache time - that is cache this userdata for 5 minutes after the time period delete it
        retry: 1 //retry only on failure 
    })
    return {seller, isLoading};
}

export default useSeller;
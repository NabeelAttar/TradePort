'use client'
import { useEffect, useState } from "react";

const LOCATION_STORAGE_KEY = "user_location";
const LOCATION_EXPIRY_DAYS = 20;

const useLocationTracking = () => {
    const [location, setLocation] = useState<{ country: string; city: string } | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const storedData = localStorage.getItem(LOCATION_STORAGE_KEY);

        if (storedData) {
            const parsedData = JSON.parse(storedData);
            const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
            const isExpired = Date.now() - parsedData.timestamp > expiryTime;

            if (!isExpired) {
                setLocation(parsedData);
                return;
            }
        }

        // Fetch only if no valid stored location
        fetch("http://ip-api.com/json/")
            .then((res) => res.json())
            .then((data) => {
                const newLocation = {
                    country: data?.country,
                    city: data?.city,
                    timestamp: Date.now(),
                };

                localStorage.setItem(
                    LOCATION_STORAGE_KEY,
                    JSON.stringify(newLocation)
                );

                setLocation(newLocation);
            })
            .catch((error) =>
                console.log("Failed to get location", error)
            );
    }, []);

    return location;
};

export default useLocationTracking;

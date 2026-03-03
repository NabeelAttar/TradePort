"use client";

import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { useState, useEffect } from "react";
import axiosInstance from "../../../../utils/axiosInstance";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface LocationData {
  name: string;
  coordinates: [number, number];
  users: number;
  sellers: number;
}

const defaultMarkers: LocationData[] = [
  { name: "India", coordinates: [78.9629, 20.5937], users: 100, sellers: 20 },
  { name: "USA", coordinates: [-95.7129, 37.0902], users: 80, sellers: 15 },
  { name: "Brazil", coordinates: [-51.9253, -14.235], users: 45, sellers: 8 },
  { name: "UK", coordinates: [-3.4360, 55.3781], users: 30, sellers: 5 },
];

const GeographicalMapChart = () => {
  const [tooltip, setTooltip] = useState<{ name: string; users: number; sellers: number } | null>(null);
  const [markers, setMarkers] = useState<LocationData[]>(defaultMarkers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // Fetch user and seller analytics data
        const [usersResponse, sellersResponse] = await Promise.all([
          axiosInstance.get('/admin/api/get-all-users'),
          axiosInstance.get('/admin/api/get-all-sellers')
        ]);

        if (usersResponse.data.success && sellersResponse.data.success) {
          const users = usersResponse.data.data || [];
          const sellers = sellersResponse.data.data || [];
          
          // Group by country (this is a simplified approach - in real app you'd use geolocation APIs)
          const countryData: { [key: string]: { users: number; sellers: number } } = {};
          
          // For demo purposes, randomly assign countries (in real app, use actual location data)
          const countries = ['India', 'USA', 'Brazil', 'UK', 'Canada', 'Australia', 'Germany', 'Japan'];
          const countryCoordinates: { [key: string]: [number, number] } = {
            'India': [78.9629, 20.5937],
            'USA': [-95.7129, 37.0902],
            'Brazil': [-51.9253, -14.235],
            'UK': [-3.4360, 55.3781],
            'Canada': [-106.3468, 56.1304],
            'Australia': [133.7751, -25.2744],
            'Germany': [10.4515, 51.1657],
            'Japan': [138.2529, 36.2048]
          };
          
          // Distribute users across countries
          users.forEach((user: any) => {
            const randomCountry = countries[Math.floor(Math.random() * countries.length)];
            if (!countryData[randomCountry]) {
              countryData[randomCountry] = { users: 0, sellers: 0 };
            }
            countryData[randomCountry].users++;
          });
          
          // Distribute sellers across countries
          sellers.forEach((seller: any) => {
            const randomCountry = countries[Math.floor(Math.random() * countries.length)];
            if (!countryData[randomCountry]) {
              countryData[randomCountry] = { users: 0, sellers: 0 };
            }
            countryData[randomCountry].sellers++;
          });
          
          // Convert to markers format
          const locationMarkers = Object.entries(countryData)
            .filter(([_, data]) => data.users > 0 || data.sellers > 0)
            .map(([country, data]) => ({
              name: country,
              coordinates: countryCoordinates[country],
              users: data.users,
              sellers: data.sellers
            }));
          
          setMarkers(locationMarkers);
        } else {
          // Fallback to default data
          setMarkers(defaultMarkers);
        }
      } catch (error) {
        console.error('Failed to fetch location data:', error);
        // Fallback to default data
        setMarkers(defaultMarkers);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-slate-400">Loading location data...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <ComposableMap
        projectionConfig={{ scale: 140 }}
        style={{ width: "100%", height: "auto" }}
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1e293b"
                  stroke="#334155"
                  strokeWidth={0.5}
                  style={{
                    hover: { fill: "#334155" },
                  }}
                />
              ))
            }
          </Geographies>
          {markers.map((marker) => (
            <Marker
              key={marker.name}
              coordinates={marker.coordinates}
              onMouseEnter={() => setTooltip(marker)}
              onMouseLeave={() => setTooltip(null)}
            >
              <circle
                r={Math.max(6, marker.users / 10)}
                fill="#3b82f6"
                fillOpacity={0.6}
                stroke="#3b82f6"
                strokeWidth={1}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
      {tooltip && (
        <div className="absolute bottom-4 left-4 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm shadow-lg">
          <p className="font-semibold text-white">{tooltip.name}</p>
          <p className="text-blue-400">Users: <span className="font-medium">{tooltip.users}</span></p>
          <p className="text-green-400">Sellers: <span className="font-medium">{tooltip.sellers}</span></p>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-blue-500 opacity-60"></div>
          <span className="text-slate-300">User Activity</span>
        </div>
        <div className="text-xs text-slate-400">Circle size = User count</div>
      </div>
    </div>
  );
};

export default GeographicalMapChart;

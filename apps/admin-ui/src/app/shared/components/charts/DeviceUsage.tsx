"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useEffect, useState } from "react";
import axiosInstance from "../../../../utils/axiosInstance";

interface DeviceData {
  name: string;
  value: number;
  color: string;
}

const fallbackData: DeviceData[] = [
  { name: "Desktop", value: 45, color: "#3b82f6" },
  { name: "Mobile", value: 35, color: "#22c55e" },
  { name: "Tablet", value: 20, color: "#eab308" },
];

const DeviceUsageChart = () => {
  const [data, setData] = useState<DeviceData[]>(fallbackData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        const response = await axiosInstance.get("/admin/api/device-usage");

        if (
          response.data?.success &&
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          setData(response.data.data);
        } else {
          setData(fallbackData);
        }
      } catch (error) {
        console.error("Failed to fetch device usage data:", error);
        setData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceData();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Device Usage</h2>
      <p className="text-sm text-slate-400 mb-4">
        How users access your platform
      </p>

      {loading ? (
        <div className="flex items-center justify-center h-[250px]">
          <div className="text-slate-400">Loading device data...</div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) =>
                  `${Number(value) || 0}%`
                }
              />

              <Legend
                formatter={(value) => (
                  <span className="text-slate-300 text-sm">{value}</span>
                )}
                wrapperStyle={{ paddingTop: "20px" }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="text-slate-400 font-medium">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DeviceUsageChart;
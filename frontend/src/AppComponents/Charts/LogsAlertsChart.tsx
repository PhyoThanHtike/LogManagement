import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}
interface DataItem {
  date: string;
  logs: number;
  alerts: number;
}

interface RawData {
  data: DataItem[];
  tenant: string;
}

const LogsAlertsTrendChart: React.FC<{ rawData: RawData }> = ({ rawData }) => {
  const [chartType, setChartType] = useState("bar");
  const data = rawData.data;

  const totalLogs = data.reduce((sum, item) => sum + item.logs, 0);
  const totalAlerts = data.reduce((sum, item) => sum + item.alerts, 0);
  const avgLogs = (totalLogs / data.length).toFixed(2);
  const avgAlerts = (totalAlerts / data.length).toFixed(2);

  const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
  }) => {
    if (active && payload && payload.length) {
      const date = new Date(label || "");
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
          <p className="font-bold text-gray-800 dark:text-gray-100 mb-3 text-sm">
            {formattedDate}
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Logs
                </span>
              </div>
              <span className="font-bold text-blue-600">{payload[0]?.value || 0}</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Alerts
                </span>
              </div>
              <span className="font-bold text-red-600">{payload[1]?.value || 0}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const formatXAxis = (tickItem: any) => {
    const date = new Date(tickItem);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const gridColor = "#e5e7eb";
//   const darkGridColor = "#374151";

  const renderChart = () => {
    const commonProps = {
      data: data,
      margin: { top: 10, right: 10, left: -20, bottom: 50 },
    };

    const axisTick = {
      fill: "#6b7280",
      fontSize: 11,
    };

    return chartType === "bar" ? (
      <BarChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} className="dark:stroke-gray-700" vertical={false} />
        <XAxis
          dataKey="date"
          angle={-45}
          textAnchor="end"
          height={70}
          tick={axisTick}
          tickFormatter={formatXAxis}
          stroke="#d1d5db"
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="logs" fill="#3b82f6" radius={[6, 6, 0, 0]} />
        <Bar dataKey="alerts" fill="#ef4444" radius={[6, 6, 0, 0]} />
      </BarChart>
    ) : chartType === "stacked" ? (
      <BarChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} className="dark:stroke-gray-700" vertical={false} />
        <XAxis
          dataKey="date"
          angle={-45}
          textAnchor="end"
          height={70}
          tick={axisTick}
          tickFormatter={formatXAxis}
          stroke="#d1d5db"
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="logs" stackId="a" fill="#3b82f6" />
        <Bar dataKey="alerts" stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} />
      </BarChart>
    ) : (
      <ComposedChart {...commonProps}>
        <defs>
          <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} className="dark:stroke-gray-700" vertical={false} />
        <XAxis
          dataKey="date"
          angle={-45}
          textAnchor="end"
          height={70}
          tick={axisTick}
          tickFormatter={formatXAxis}
          stroke="#d1d5db"
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="logs" stroke="#3b82f6" strokeWidth={3} fill="url(#colorLogs)" />
        <Area type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={3} fill="url(#colorAlerts)" />
      </ComposedChart>
    );
  };

  return (
    <div className="dark:bg-neutral-950 dark:border-gray-800 pt-6">
      <div className="max-w-full mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { color: "blue", icon: Activity, label: "Logs", value: totalLogs, avg: avgLogs },
            { color: "red", icon: AlertTriangle, label: "Alerts", value: totalAlerts, avg: avgAlerts },
            { color: "purple", icon: TrendingUp, label: "Period", value: data.length, avg: "Days tracked" },
            {
              color: "green",
              icon: BarChart3,
              label: "Rate",
              value: `${((totalAlerts / data.length) * 100).toFixed(1)}%`,
              avg: "Alert frequency",
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-md border-l-4 border-${stat.color}-500 hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/40`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {stat.label}
                  </span>
                </div>
                <p className={`text-4xl font-bold text-${stat.color}-600 mb-1`}>{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.label === "Period" ? stat.avg : `Avg: ${stat.avg}/day`}
                </p>
              </div>
            );
          })}
        </div>

        {/* Chart Card */}
        <Card className="">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                  Security Monitoring Dashboard
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  60-day trend analysis • {rawData.tenant}
                </p>
              </div>
              <div className="flex gap-2">
                {[ "bar", "stacked", "area"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      chartType === type
                        ? "bg-green-700 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {type === "bar"
                      ? "Bar Chart"
                      : type === "stacked"
                      ? "Stacked"
                      : "Area Chart"}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={450}>
              {renderChart()}
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex justify-center gap-8 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Logs Activity
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Security Alerts
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LogsAlertsTrendChart;

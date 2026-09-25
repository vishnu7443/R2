import { useEffect, useState } from "react";
import {
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  Truck,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import API from "../api/axios";
import StatCard from "../components/StatCard";
import RecentSales from "../components/RecentSales";
import { getLowStock } from "../api/inventoryApi";

// Custom chart tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-white font-bold text-base">
          ₹ {Number(payload[0].value).toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const [summary, setSummary] = useState({});
  const [chartData, setChartData] = useState([]);
  const [sales, setSales] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [summaryRes, chartRes, salesRes, stockRes] = await Promise.all([
        API.get("/dashboard/summary"),
        API.get("/dashboard/sales-chart"),
        API.get("/dashboard/recent-sales"),
        getLowStock(),
      ]);

      if (summaryRes.data.success) setSummary(summaryRes.data.data);

      if (chartRes.data.success) {
        setChartData(
          chartRes.data.data.map((item) => ({
            date: item.month,
            revenue: Number(item.sales),
          }))
        );
      }

      if (salesRes.data.success) {
        setSales(
          salesRes.data.data.map((sale) => ({
            invoiceNumber: sale.invoiceNumber,
            customerName: sale.customer?.name || "Unknown",
            amount: Number(sale.totalAmount),
            date: new Date(sale.createdAt || sale.saleDate).toLocaleDateString("en-IN"),
          }))
        );
      }

      setLowStock(stockRes.data || []);
    } catch (err) {
      console.error("Dashboard Error:", err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Good day 👋 — Business Overview
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Real-time insights into your inventory and transactions
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Products"
          value={summary.totalProducts || 0}
          icon={Package}
          gradient="bg-gradient-to-br from-blue-600 to-blue-800"
          trendLabel="SKUs in catalog"
        />
        <StatCard
          title="Total Customers"
          value={summary.totalCustomers || 0}
          icon={Users}
          gradient="bg-gradient-to-br from-violet-600 to-purple-800"
          trendLabel="Registered accounts"
        />
        <StatCard
          title="Total Revenue"
          value={`₹ ${Number(summary.totalSales || 0).toLocaleString("en-IN")}`}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-700"
          trendLabel="Lifetime sales"
        />
        <StatCard
          title="Net Profit"
          value={`₹ ${Number(summary.profit || 0).toLocaleString("en-IN")}`}
          icon={ArrowUpRight}
          gradient="bg-gradient-to-br from-orange-500 to-rose-600"
          trendLabel="After purchase costs"
        />
      </div>

      {/* Chart + Low Stock alerts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Revenue Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly sales performance</p>
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">
              ↑ Live Data
            </span>
          </div>

          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-300 text-sm">
              No chart data available yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                  dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#3b82f6" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle size={16} className="text-amber-500" />
            <h3 className="text-base font-bold text-slate-800">Low Stock Alerts</h3>
            {lowStock.length > 0 && (
              <span className="ml-auto text-xs font-bold bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full border border-amber-100">
                {lowStock.length}
              </span>
            )}
          </div>

          {lowStock.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-300 gap-2">
              <Package size={28} className="text-slate-200" />
              <p className="text-sm">All stock levels are healthy</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {lowStock.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-100/60"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{product.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{product.sku}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    product.stock === 0
                      ? "bg-red-100 text-red-600"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <RecentSales sales={sales} />
      </div>
    </div>
  );
}

export default Dashboard;
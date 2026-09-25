import { useEffect, useState } from "react";
import { Download, Printer, Filter, AlertTriangle, RefreshCw, BarChart2 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { getSales } from "../api/saleApi";
import { getPurchases } from "../api/purchaseApi";
import { getProducts } from "../api/productApi";
import { getInventoryHistory, adjustStock } from "../api/inventoryApi";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

function Reports() {
  const [activeTab, setActiveTab] = useState("sales");
  const [loading, setLoading] = useState(true);

  // Raw data from APIs
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);

  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Adjustment state
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustRemarks, setAdjustRemarks] = useState("");

  // Load all reports data
  const loadReportsData = async () => {
    try {
      setLoading(true);
      const [salesRes, purchasesRes, productsRes, historyRes] = await Promise.all([
        getSales(),
        getPurchases(),
        getProducts(),
        getInventoryHistory(),
      ]);

      setSales(salesRes.data || []);
      setPurchases(purchasesRes.data || []);
      setProducts(productsRes.data || []);
      setHistory(historyRes.data || []);
    } catch (error) {
      console.error("Error loading reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, []);

  // Filter logic helper
  const dateFilter = (itemDate) => {
    if (!itemDate) return true;
    const date = new Date(itemDate);
    date.setHours(0, 0, 0, 0);

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (date < start) return false;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (date > end) return false;
    }

    return true;
  };

  // Filtered sales
  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && dateFilter(sale.createdAt);
  });

  // Filtered purchases
  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && dateFilter(purchase.purchaseDate || purchase.createdAt);
  });

  // Filtered inventory
  const filteredInventory = products.filter((product) => {
    return (
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filtered history
  const filteredHistory = history.filter((tx) => {
    const matchesSearch =
      tx.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.remarks?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && dateFilter(tx.createdAt);
  });

  // Reset filters
  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
  };

  // Stock valuation sum
  const totalInventoryValuation = filteredInventory.reduce(
    (sum, prod) => sum + Number(prod.stock || 0) * Number(prod.price || 0),
    0
  );

  // Total sales revenue sum
  const totalSalesRevenue = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.totalAmount || 0),
    0
  );

  // Total purchases spent sum
  const totalPurchasesCost = filteredPurchases.reduce(
    (sum, purchase) => sum + Number(purchase.totalAmount || 0),
    0
  );

  // Stock adjust handler
  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    try {
      await adjustStock({
        productId: adjustingProduct.id,
        quantity: Number(adjustQty),
        remarks: adjustRemarks || "Report screen adjustment",
      });
      alert("Stock adjusted successfully!");
      setAdjustingProduct(null);
      loadReportsData();
    } catch (error) {
      console.error(error);
      alert("Failed to adjust stock");
    }
  };

  // Excel / CSV Export
  const exportToCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `${activeTab}_report.csv`;

    if (activeTab === "sales") {
      headers = ["Invoice", "Customer", "Items Count", "Total Amount (INR)", "Status", "Date"];
      rows = filteredSales.map((s) => [
        s.invoiceNumber,
        s.customer?.name || "N/A",
        s.items?.length || 0,
        s.totalAmount,
        s.status,
        new Date(s.createdAt).toLocaleDateString("en-IN"),
      ]);
    } else if (activeTab === "purchases") {
      headers = ["Invoice", "Supplier", "Items Count", "Total Amount (INR)", "Date"];
      rows = filteredPurchases.map((p) => [
        p.invoiceNumber,
        p.supplier?.name || "N/A",
        p.items?.length || 0,
        p.totalAmount,
        new Date(p.purchaseDate || p.createdAt).toLocaleDateString("en-IN"),
      ]);
    } else if (activeTab === "inventory") {
      headers = ["SKU", "Product Name", "Category", "Supplier", "Stock Level", "Price (INR)", "Valuation (INR)"];
      rows = filteredInventory.map((p) => [
        p.sku,
        p.name,
        p.category?.name || "N/A",
        p.supplier?.name || "N/A",
        p.stock,
        p.price,
        p.stock * p.price,
      ]);
    } else if (activeTab === "history") {
      headers = ["Date", "Product", "Action Type", "Quantity Changed", "Remarks"];
      rows = filteredHistory.map((h) => [
        new Date(h.createdAt).toLocaleString("en-IN"),
        h.product?.name || "Deleted Product",
        h.type,
        h.quantity,
        h.remarks || "—",
      ]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Recharts Sales Chart Data preparation (grouped by Month-Year)
  const getMonthlySalesData = () => {
    const monthlyMap = {};
    sales.forEach((s) => {
      const d = new Date(s.createdAt);
      const key = `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear().toString().substr(-2)}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + Number(s.totalAmount);
    });
    return Object.keys(monthlyMap).map((k) => ({ name: k, Sales: monthlyMap[k] }));
  };

  // Recharts Category Pie Chart Data
  const getCategoryDistribution = () => {
    const catMap = {};
    products.forEach((p) => {
      const name = p.category?.name || "Uncategorized";
      catMap[name] = (catMap[name] || 0) + Number(p.stock || 0);
    });
    return Object.keys(catMap).map((name) => ({ name, value: catMap[name] }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart2 className="text-blue-600" />
            Analytics & Reports
          </h1>
          <p className="text-gray-500 text-sm">Monitor business transactions, inventory valuation, and stock audits.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadReportsData}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
          >
            <Download size={15} />
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold transition"
          >
            <Printer size={15} />
            Print Report
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Filtered Revenue</span>
          <h3 className="text-2xl font-black text-blue-900 mt-1">₹ {totalSalesRevenue.toLocaleString("en-IN")}</h3>
          <p className="text-xs text-blue-600 mt-2">{filteredSales.length} total sales matching filters</p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Filtered Expenses</span>
          <h3 className="text-2xl font-black text-orange-900 mt-1">₹ {totalPurchasesCost.toLocaleString("en-IN")}</h3>
          <p className="text-xs text-orange-600 mt-2">{filteredPurchases.length} purchases recorded</p>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Inventory Value</span>
          <h3 className="text-2xl font-black text-emerald-900 mt-1">₹ {totalInventoryValuation.toLocaleString("en-IN")}</h3>
          <p className="text-xs text-emerald-600 mt-2">{products.filter((p) => p.stock <= 10).length} items are low stock</p>
        </div>
      </div>

      {/* Date & Search Filters */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-4 items-center justify-between print:hidden">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">From</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded-lg p-2 pl-3 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        <button
          onClick={resetFilters}
          className="text-xs font-semibold text-gray-500 hover:text-gray-800 underline"
        >
          Clear Filters
        </button>
      </div>

      {/* Report Module Tabs */}
      <div className="border-b border-gray-200 flex gap-4 print:hidden">
        {[
          { id: "sales", label: "Sales Report" },
          { id: "purchases", label: "Purchase Report" },
          { id: "inventory", label: "Inventory Valuation" },
          { id: "history", label: "Stock Movement History" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchQuery("");
            }}
            className={`pb-3 px-2 font-semibold text-sm transition-all border-b-2 ${
              activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Visual Analytics Block */}
      {activeTab === "sales" && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
          {/* Sales chart */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-700 mb-4">Sales Analytics (Revenue Trend)</h4>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={getMonthlySalesData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Sales" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie distribution chart */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-700 mb-4">Stock Distribution by Category</h4>
            <div className="flex flex-col md:flex-row items-center justify-around">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={getCategoryDistribution()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getCategoryDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-4 md:mt-0 text-xs">
                {getCategoryDistribution().map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="font-medium text-gray-600">{entry.name} ({entry.value} items)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tables Grid */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-gray-500">Compiling report data...</p>
        ) : (
          <>
            {/* Sales Tab */}
            {activeTab === "sales" && (
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Items Count</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Total Amount</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center p-8 text-gray-400">No matching sales records found</td>
                    </tr>
                  ) : (
                    filteredSales.map((s) => (
                      <tr key={s.id} className="border-b hover:bg-gray-50 transition">
                        <td className="p-4 font-mono font-semibold text-blue-600">{s.invoiceNumber}</td>
                        <td className="p-4 text-gray-700">{s.customer?.name || "N/A"}</td>
                        <td className="p-4 text-gray-600">{s.items?.length || 0} items</td>
                        <td className="p-4 font-bold text-gray-800">₹ {Number(s.totalAmount).toLocaleString("en-IN")}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            s.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>{s.status}</span>
                        </td>
                        <td className="p-4 text-gray-500 text-sm">{new Date(s.createdAt).toLocaleDateString("en-IN")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* Purchases Tab */}
            {activeTab === "purchases" && (
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Items Count</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Total Cost</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center p-8 text-gray-400">No matching purchase records found</td>
                    </tr>
                  ) : (
                    filteredPurchases.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                        <td className="p-4 font-mono font-semibold text-orange-600">{p.invoiceNumber}</td>
                        <td className="p-4 text-gray-700">{p.supplier?.name || "N/A"}</td>
                        <td className="p-4 text-gray-600">{p.items?.length || 0} items</td>
                        <td className="p-4 font-bold text-gray-800">₹ {Number(p.totalAmount).toLocaleString("en-IN")}</td>
                        <td className="p-4 text-gray-500 text-sm">
                          {new Date(p.purchaseDate || p.createdAt).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* Inventory Tab */}
            {activeTab === "inventory" && (
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">SKU</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Stock Level</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Unit Price</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Valuation</th>
                    <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center p-8 text-gray-400">No matching inventory records found</td>
                    </tr>
                  ) : (
                    filteredInventory.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                        <td className="p-4 font-mono text-gray-500">{p.sku}</td>
                        <td className="p-4 font-semibold text-gray-800">{p.name}</td>
                        <td className="p-4 text-gray-600">{p.category?.name || "N/A"}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit ${
                            p.stock === 0
                              ? "bg-red-100 text-red-600"
                              : p.stock <= 10
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {p.stock <= 10 && <AlertTriangle size={12} />}
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">₹ {p.price}</td>
                        <td className="p-4 font-bold text-gray-800">
                          ₹ {(Number(p.stock) * Number(p.price)).toLocaleString("en-IN")}
                        </td>
                        <td className="p-4 text-center print:hidden">
                          <button
                            onClick={() => {
                              setAdjustingProduct(p);
                              setAdjustQty(p.stock);
                              setAdjustRemarks("");
                            }}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-medium transition"
                          >
                            Quick Adjust
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Change Type</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center p-8 text-gray-400">No stock movements recorded</td>
                    </tr>
                  ) : (
                    filteredHistory.map((h) => (
                      <tr key={h.id} className="border-b hover:bg-gray-50 transition">
                        <td className="p-4 text-xs text-gray-500">{new Date(h.createdAt).toLocaleString("en-IN")}</td>
                        <td className="p-4 font-semibold text-gray-800">{h.product?.name || "Deleted Product"}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            h.type === "STOCK_IN"
                              ? "bg-green-100 text-green-700"
                              : h.type === "STOCK_OUT"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>{h.type}</span>
                        </td>
                        <td className="p-4 font-bold text-gray-700">{h.quantity} units</td>
                        <td className="p-4 text-sm text-gray-500">{h.remarks || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* Quick Adjust Dialog/Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Stock Adjustment</h3>
              <p className="text-sm text-gray-500 mt-1">Adjust current count for {adjustingProduct.name}</p>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">New Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Remarks / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Broken packaging, stocktake count discrepancy"
                  value={adjustRemarks}
                  onChange={(e) => setAdjustRemarks(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;

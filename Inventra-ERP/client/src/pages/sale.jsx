import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Eye } from "lucide-react";

import { getSales, deleteSale } from "../api/saleApi";

function Sales() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "EMPLOYEE";
  const isAdmin = role === "ADMIN" || role === "MANAGER";

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ==============================
  // FETCH SALES
  // ==============================
  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await getSales();
      setSales(response.data || []);
    } catch (error) {
      console.error("Sales fetch error:", error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // ==============================
  // DELETE
  // ==============================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sale? Stock will be restored.")) return;
    try {
      await deleteSale(id);
      fetchSales();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  // ==============================
  // SEARCH FILTER
  // ==============================
  const filtered = sales.filter((sale) =>
    sale.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
    sale.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ==============================
  // STATUS BADGE
  // ==============================
  const statusBadge = (status) => {
    const map = {
      COMPLETED: "bg-green-100 text-green-700",
      PENDING:   "bg-yellow-100 text-yellow-700",
      CANCELLED: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales</h1>
        {isAdmin && (
          <button
            onClick={() => navigate("/sales/add")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={18} />
            New Sale
          </button>
        )}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by invoice or customer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg p-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      {/* Table */}
      {loading ? (
        <p className="text-gray-500">Loading sales...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-xl font-semibold">No sales found</p>
          <p className="text-sm mt-1">Click "New Sale" to record your first sale.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">#</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Invoice</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Customer</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Items</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Total</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((sale, index) => (
                <tr key={sale.id} className="border-b hover:bg-gray-50 transition">

                  <td className="p-4 text-gray-500 text-sm">{index + 1}</td>

                  <td className="p-4 font-mono font-semibold text-blue-700">
                    {sale.invoiceNumber}
                  </td>

                  <td className="p-4 text-gray-700">
                    {sale.customer?.name || "—"}
                  </td>

                  <td className="p-4 text-gray-600">
                    {sale.items?.length || 0} item(s)
                  </td>

                  <td className="p-4 font-semibold text-gray-800">
                    ₹ {Number(sale.totalAmount).toLocaleString("en-IN")}
                  </td>

                  <td className="p-4">
                    {statusBadge(sale.status)}
                  </td>

                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(sale.createdAt).toLocaleDateString("en-IN")}
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => navigate(`/sales/${sale.id}`)}
                        className="text-blue-500 hover:text-blue-700 transition"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="text-red-500 hover:text-red-700 transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Footer */}
      {!loading && filtered.length > 0 && (
        <div className="mt-4 flex justify-end">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-3 text-right">
            <p className="text-sm text-gray-500">Total Revenue ({filtered.length} sales)</p>
            <p className="text-xl font-bold text-blue-700">
              ₹ {filtered
                .reduce((sum, s) => sum + Number(s.totalAmount), 0)
                .toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

export default Sales;
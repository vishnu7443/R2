import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";

import {
  getPurchases,
  deletePurchase,
} from "../api/purchaseApi";

function Purchase() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "EMPLOYEE";
  const isAdmin = role === "ADMIN" || role === "MANAGER";

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ==============================
  // FETCH
  // ==============================
  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await getPurchases();
      setPurchases(response.data || []);
    } catch (error) {
      console.error("Purchase fetch error:", error);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  // ==============================
  // DELETE
  // ==============================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this purchase? Stock will be reversed.")) return;
    try {
      await deletePurchase(id);
      fetchPurchases();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  // ==============================
  // SEARCH FILTER
  // ==============================
  const filtered = purchases.filter((p) =>
    p.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
    p.supplier?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchases</h1>
        {isAdmin && (
          <button
            onClick={() => navigate("/purchases/add")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={18} />
            Add Purchase
          </button>
        )}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by invoice or supplier..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg p-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      {/* Table */}
      {loading ? (
        <p className="text-gray-500">Loading purchases...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-xl font-semibold">No purchases found</p>
          <p className="text-sm mt-1">Click "Add Purchase" to record your first purchase.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">#</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Invoice</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Supplier</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Items</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Total</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Date</th>
                {isAdmin && <th className="p-4 text-center text-sm font-semibold text-gray-600">Actions</th>}
              </tr>
            </thead>

            <tbody>
              {filtered.map((purchase, index) => (
                <tr key={purchase.id} className="border-b hover:bg-gray-50 transition">

                  <td className="p-4 text-gray-500 text-sm">{index + 1}</td>

                  <td className="p-4 font-mono font-semibold text-blue-700">
                    {purchase.invoiceNumber}
                  </td>

                  <td className="p-4 text-gray-700">
                    {purchase.supplier?.name || "—"}
                  </td>

                  <td className="p-4 text-gray-600">
                    {purchase.items?.length || 0} item(s)
                  </td>

                  <td className="p-4 font-semibold text-gray-800">
                    ₹ {Number(purchase.totalAmount).toLocaleString("en-IN")}
                  </td>

                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(purchase.purchaseDate || purchase.createdAt).toLocaleDateString("en-IN")}
                  </td>

                  {isAdmin && (
                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleDelete(purchase.id)}
                          className="text-red-500 hover:text-red-700 transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Footer */}
      {!loading && filtered.length > 0 && (
        <div className="mt-4 flex justify-end">
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-6 py-3 text-right">
            <p className="text-sm text-gray-500">Total Spent ({filtered.length} purchases)</p>
            <p className="text-xl font-bold text-orange-600">
              ₹ {filtered
                .reduce((sum, p) => sum + Number(p.totalAmount), 0)
                .toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

export default Purchase;
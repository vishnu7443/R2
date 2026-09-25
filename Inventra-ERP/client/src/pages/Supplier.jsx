import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";

import {
  getSuppliers,
  deleteSupplier,
} from "../api/supplierApi";

function Supplier() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "EMPLOYEE";
  const isAdmin = role === "ADMIN" || role === "MANAGER";

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);

      const response = await getSuppliers();

      setSuppliers(response.data || []);
    } catch (error) {
      console.error("Supplier Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;

    try {
      await deleteSupplier(id);
      fetchSuppliers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Suppliers ({suppliers.length})
        </h1>

        {isAdmin && (
          <button
            onClick={() => navigate("/suppliers/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={18} />
            Add Supplier
          </button>
        )}
      </div>

      {loading ? (
        <h2>Loading...</h2>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Email</th>
                {isAdmin && <th className="p-3 text-left">Actions</th>}
              </tr>
            </thead>

            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-5">
                    No Suppliers Found
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b">
                    <td className="p-3">{supplier.id}</td>
                    <td className="p-3">{supplier.name}</td>
                    <td className="p-3">
                      {supplier.companyName || "-"}
                    </td>
                    <td className="p-3">
                      {supplier.phone || "-"}
                    </td>
                    <td className="p-3">
                      {supplier.email || "-"}
                    </td>

                    {isAdmin && (
                      <td className="p-3 flex gap-3">
                        <button
                          className="text-blue-600"
                          onClick={() => navigate(`/suppliers/edit/${supplier.id}`)}
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          className="text-red-600"
                          onClick={() => handleDelete(supplier.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Supplier;
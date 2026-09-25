import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

import {
  getCustomers,
  deleteCustomer,
} from "../api/customerApi";

const Customers = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "EMPLOYEE";
  const isAdmin = role === "ADMIN" || role === "MANAGER";

  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const res = await getCustomers();

     const data = res.data || [];

      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter((customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredCustomers(filtered);
  }, [search, customers]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this customer?"
    );

    if (!confirmDelete) return;

    try {
      await deleteCustomer(id);

      fetchCustomers();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  if (loading)
    return (
      <div className="p-6 text-xl">
        Loading Customers...
      </div>
    );

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Customers
        </h1>

        {isAdmin && (
          <button
            onClick={() => navigate("/customers/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Customer
          </button>
        )}
      </div>

      <div className="relative mb-5">

        <Search
          className="absolute left-3 top-3 text-gray-500"
          size={18}
        />

        <input
          type="text"
          placeholder="Search customer..."
          className="w-full border rounded-lg pl-10 pr-4 py-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">

        <table className="min-w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Address</th>
              {isAdmin && <th className="p-3 text-center">Actions</th>}

            </tr>

          </thead>

          <tbody>

            {filteredCustomers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-6"
                >
                  No Customers Found
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-t"
                >
                  <td className="p-3">
                    {customer.name}
                  </td>

                  <td className="p-3">
                    {customer.email}
                  </td>

                  <td className="p-3">
                    {customer.phone}
                  </td>

                  <td className="p-3">
                    {customer.address}
                  </td>

                  {isAdmin && (
                    <td className="p-3">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => navigate(`/customers/edit/${customer.id}`)}
                          className="text-blue-600"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Customers;
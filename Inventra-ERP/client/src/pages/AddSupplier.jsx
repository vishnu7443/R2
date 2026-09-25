import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSupplier } from "../api/supplierApi";

function AddSupplier() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Supplier name is required");
      return;
    }

    try {
      const response = await createSupplier(formData);

      console.log("SUPPLIER CREATED:", response);

      alert("Supplier added successfully");

      navigate("/suppliers");
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to create supplier"
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">
        Add Supplier
      </h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="name"
          placeholder="Supplier Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-4"
          required
        />

        <input
          type="text"
          name="companyName"
          placeholder="Company Name"
          value={formData.companyName}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-4"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-4"
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-4"
        />

        <textarea
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-6"
          rows="4"
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded w-full"
        >
          Save Supplier
        </button>

      </form>
    </div>
  );
}

export default AddSupplier;
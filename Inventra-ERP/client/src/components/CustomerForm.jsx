import { useState } from "react";

const CustomerForm = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.address
    ) {
      alert("Please fill all fields");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow rounded-xl p-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div>
          <label className="block mb-2 font-medium">
            Customer Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            placeholder="Enter customer name"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            placeholder="Enter email"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Phone
          </label>

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Address
          </label>

          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            placeholder="Enter address"
          />
        </div>

      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
      >
        {loading ? "Saving..." : "Save Customer"}
      </button>
    </form>
  );
};

export default CustomerForm;
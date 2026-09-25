import { useState } from "react";
import { useNavigate } from "react-router-dom";

import CustomerForm from "../components/CustomerForm";
import { createCustomer } from "../api/customerApi";

const AddCustomer = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    try {
      setLoading(true);

      await createCustomer(data);

      alert("Customer Added Successfully");

      navigate("/customers");
    } catch (error) {
      console.error(error);
      alert("Failed to add customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Add Customer
      </h1>

      <CustomerForm
        initialData={{}}
        onSubmit={handleSubmit}
        loading={loading}
      />

    </div>
  );
};

export default AddCustomer;
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getCustomerById,
  updateCustomer,
} from "../api/customerApi";


const EditCustomer = () => {

  const { id } = useParams();
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    name:"",
    email:"",
    phone:"",
    address:"",
  });


  const [loading,setLoading] = useState(true);



  useEffect(()=>{

    fetchCustomer();

  },[]);



  const fetchCustomer = async()=>{

    try{

      const res = await getCustomerById(id);

      setFormData(res.data);


    }catch(error){

      console.error(error);

      alert("Failed to load customer");

    }
    finally{

      setLoading(false);

    }

  };



  const handleChange=(e)=>{

    setFormData({

      ...formData,

      [e.target.name]:e.target.value

    });

  };



  const handleSubmit=async(e)=>{

    e.preventDefault();


    try{

      await updateCustomer(id,formData);

      alert("Customer updated successfully");

      navigate("/customers");


    }catch(error){

      console.error(error);

      alert("Update failed");

    }

  };



  if(loading)
  return <div className="p-6">
    Loading...
  </div>



  return (

    <div className="p-6">


      <h1 className="text-3xl font-bold mb-6">
        Edit Customer
      </h1>



      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-xl p-6 space-y-4 max-w-xl"
      >


        <input
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          placeholder="Customer Name"
          className="w-full border p-3 rounded"
        />


        <input
          name="email"
          value={formData.email || ""}
          onChange={handleChange}
          placeholder="Email"
          className="w-full border p-3 rounded"
        />


        <input
          name="phone"
          value={formData.phone || ""}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full border p-3 rounded"
        />


        <textarea
          name="address"
          value={formData.address || ""}
          onChange={handleChange}
          placeholder="Address"
          className="w-full border p-3 rounded"
        />


        <button
          className="bg-blue-600 text-white px-5 py-2 rounded"
        >
          Update Customer
        </button>


      </form>


    </div>

  );

};


export default EditCustomer;
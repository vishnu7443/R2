import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";



import {
  getSupplierById,
  updateSupplier,
} from "../api/supplierApi";


function EditSupplier() {

  const navigate = useNavigate();

  const { id } = useParams();


  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
  });


  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);



  // Get supplier details

  const fetchSupplier = async () => {

    try {


      setLoading(true);


      const response = await getSupplierById(id);

      console.log("SUPPLIER DETAILS:", response);

      const supplier = response.data;

      if (!supplier) {
        throw new Error("Supplier not found");
      }

      setFormData({
        name: supplier.name || "",
        companyName: supplier.companyName || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
      });



    } catch(error) {


      console.error(
        "Fetch Supplier Error:",
        error
      );


      alert(
        "Failed to load supplier"
      );


    } finally {


      setLoading(false);


    }

  };





  useEffect(()=>{

    fetchSupplier();

  },[id]);





  const handleChange = (e)=>{


    setFormData({

      ...formData,

      [e.target.name]: e.target.value,

    });


  };





  const handleSubmit = async(e)=>{


    e.preventDefault();


    try{


      setSaving(true);



      await updateSupplier(
        id,
        formData
      );



      alert(
        "Supplier Updated Successfully"
      );


      navigate("/suppliers");



    }catch(error){


      console.error(
        "Update Error:",
        error
      );


      alert(
        "Update failed"
      );


    }finally{


      setSaving(false);


    }


  };







  if(loading){

    return (

      <div className="p-6 text-xl">

        Loading Supplier...

      </div>

    );

  }







  return (

    <div className="p-6">


      <h1 className="text-3xl font-bold mb-6">

        Edit Supplier

      </h1>



      <div className="
      bg-white
      p-6
      rounded-xl
      shadow
      max-width-xl
      ">


        <form onSubmit={handleSubmit}>


          <input

            className="
            w-full
            border
            p-2
            rounded
            mb-4
            "

            name="name"

            value={formData.name}

            onChange={handleChange}

            placeholder="Supplier Name"

            required

          />



          <input

            className="
            w-full
            border
            p-2
            rounded
            mb-4
            "

            name="companyName"

            value={formData.companyName}

            onChange={handleChange}

            placeholder="Company Name"

          />



          <input

            className="
            w-full
            border
            p-2
            rounded
            mb-4
            "

            name="email"

            value={formData.email}

            onChange={handleChange}

            placeholder="Email"

          />



          <input

            className="
            w-full
            border
            p-2
            rounded
            mb-4
            "

            name="phone"

            value={formData.phone}

            onChange={handleChange}

            placeholder="Phone"

          />



          <textarea

            className="
            w-full
            border
            p-2
            rounded
            mb-4
            "

            name="address"

            value={formData.address}

            onChange={handleChange}

            placeholder="Address"

          />




          <button

            type="submit"

            disabled={saving}

            className="
            bg-green-600
            text-white
            px-5
            py-2
            rounded-lg
            "

          >

            {
              saving
              ?
              "Updating..."
              :
              "Update Supplier"
            }


          </button>



        </form>


      </div>


    </div>

  );

}


export default EditSupplier;
import { useEffect, useState } from "react";

import {
  createProduct,
  updateProduct
} from "../../api/productApi";


const ProductForm = ({
  product,
  categories,
  suppliers,
  onSuccess,
  onClose
}) => {


  const [formData,setFormData] = useState({

    name:"",
    sku:"",
    price:"",
    stock:"",
    categoryId:"",
    supplierId:""

  });


  const [loading,setLoading] = useState(false);



  // Load existing product for edit

  useEffect(()=>{

    if(product){

      setFormData({

        name: product.name || "",

        sku: product.sku || "",

        price: product.price || "",

        stock: product.stock || "",

        categoryId:
          product.categoryId || "",

        supplierId:
          product.supplierId || ""

      });

    }

  },[product]);



  // Input handler

  const handleChange=(e)=>{


    setFormData({

      ...formData,

      [e.target.name]:e.target.value

    });


  };



  // Submit

  const handleSubmit=async(e)=>{


    e.preventDefault();


    try{


      setLoading(true);



      if(product){

        await updateProduct(
          product.id,
          formData
        );

      }

      else{


        await createProduct(
          formData
        );


      }



      onSuccess();



      onClose();



    }

    catch(error){

      console.log(error);

      alert(
        "Something went wrong"
      );

    }

    finally{

      setLoading(false);

    }


  };



  return (


    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >



      <input

        name="name"

        value={formData.name}

        onChange={handleChange}

        placeholder="Product Name"

        className="
        w-full
        border
        rounded
        p-2
        "

        required

      />



      <input

        name="sku"

        value={formData.sku}

        onChange={handleChange}

        placeholder="SKU"

        className="
        w-full
        border
        rounded
        p-2
        "

        required

      />



      <select

        name="categoryId"

        value={formData.categoryId}

        onChange={handleChange}

        className="
        w-full
        border
        rounded
        p-2
        "

        required

      >

        <option value="">
          Select Category
        </option>


        {
          categories?.map((cat)=>(

            <option
              key={cat.id}
              value={cat.id}
            >

              {cat.name}

            </option>

          ))
        }


      </select>



      <select

        name="supplierId"

        value={formData.supplierId}

        onChange={handleChange}

        className="
        w-full
        border
        rounded
        p-2
        "

        required

      >

        <option value="">
          Select Supplier
        </option>


        {
          suppliers?.map((sup)=>(

            <option

              key={sup.id}

              value={sup.id}

            >

              {sup.name}

            </option>


          ))
        }


      </select>




      <input

        type="number"

        name="price"

        value={formData.price}

        onChange={handleChange}

        placeholder="Price"

        className="
        w-full
        border
        rounded
        p-2
        "

        required

      />




      <input

        type="number"

        name="stock"

        value={formData.stock}

        onChange={handleChange}

        placeholder="Stock Quantity"

        className="
        w-full
        border
        rounded
        p-2
        "

        required

      />





      <button

        type="submit"

        disabled={loading}

        className="
        w-full
        bg-blue-600
        text-white
        py-2
        rounded
        hover:bg-blue-700
        "

      >

        {
          loading
          ?
          "Saving..."
          :
          product
          ?
          "Update Product"
          :
          "Add Product"
        }


      </button>



    </form>


  );

};


export default ProductForm;
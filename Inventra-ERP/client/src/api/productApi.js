import API from "./axios";


// ======================================
// GET ALL PRODUCTS
// ======================================

export const getProducts = async () => {
  try {
    const response = await API.get("/products");

    return response.data;

  } catch (error) {

    console.error(
      "Get Products Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};



// ======================================
// CREATE PRODUCT
// ======================================

export const createProduct = async (productData) => {

  try {

    const response = await API.post(
      "/products",
      productData
    );

    return response.data;


  } catch (error) {

    console.error(
      "Create Product Error:",
      error.response?.data || error.message
    );

    throw error;
  }

};



// ======================================
// UPDATE PRODUCT
// ======================================

export const updateProduct = async (
  id,
  productData
) => {

  try {

    const response = await API.put(
      `/products/${id}`,
      productData
    );

    return response.data;


  } catch (error) {

    console.error(
      "Update Product Error:",
      error.response?.data || error.message
    );

    throw error;
  }

};



// ======================================
// DELETE PRODUCT
// ======================================

export const deleteProduct = async (id) => {

  try {

    const response = await API.delete(
      `/products/${id}`
    );

    return response.data;


  } catch (error) {

    console.error(
      "Delete Product Error:",
      error.response?.data || error.message
    );

    throw error;
  }

};
import API from "./axios";

// ================================
// GET ALL CUSTOMERS
// ================================
export const getCustomers = async () => {
  try {
    const response = await API.get("/customers");
    return response.data;
  } catch (error) {
    console.error(
      "Get Customers Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};


// ================================
// GET CUSTOMER BY ID
// ================================
export const getCustomerById = async (id) => {
  try {
    const response = await API.get(`/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Get Customer Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};


// ================================
// CREATE CUSTOMER
// ================================
export const createCustomer = async (customerData) => {
  try {
    const response = await API.post(
      "/customers",
      customerData
    );

    return response.data;

  } catch (error) {
    console.error(
      "Create Customer Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};


// ================================
// UPDATE CUSTOMER
// ================================
export const updateCustomer = async (
  id,
  customerData
) => {
  try {
    const response = await API.put(
      `/customers/${id}`,
      customerData
    );

    return response.data;

  } catch (error) {
    console.error(
      "Update Customer Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};


// ================================
// DELETE CUSTOMER
// ================================
export const deleteCustomer = async (id) => {
  try {
    const response = await API.delete(
      `/customers/${id}`
    );

    return response.data;

  } catch (error) {
    console.error(
      "Delete Customer Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
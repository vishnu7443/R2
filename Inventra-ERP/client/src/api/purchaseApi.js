import API from "./axios";


// GET ALL PURCHASES
export const getPurchases = async () => {

  const response = await API.get("/purchases");

  return response.data;

};


// GET PURCHASE BY ID
export const getPurchaseById = async (id) => {

  const response = await API.get(`/purchases/${id}`);

  return response.data;

};


// CREATE PURCHASE
export const createPurchase = async (data) => {

  const response = await API.post(
    "/purchases",
    data
  );

  return response.data;

};


// UPDATE PURCHASE
export const updatePurchase = async (id,data)=>{

  const response = await API.put(
    `/purchases/${id}`,
    data
  );

  return response.data;

};


// DELETE PURCHASE
export const deletePurchase = async(id)=>{

  const response = await API.delete(
    `/purchases/${id}`
  );

  return response.data;

};
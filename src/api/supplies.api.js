import axios from "axios";

const SuppliesApi = axios.create({
  baseURL: "https://yourburger.onrender.com/yourburger/api/v1/Supplies/",
});

export const getSupplie = (supplieId) => SuppliesApi.get(`/${supplieId}/`);

export const getSupplies = () => SuppliesApi.get("/");

export const createSupplie= (supplie) => SuppliesApi.post("/", supplie);

export const deleteSupplie = (supplieId) => SuppliesApi.delete(`/${supplieId}/`);

export const editSupplie = (supplieId, updatedSupplie) =>
SuppliesApi.patch(`/${supplieId}/`, updatedSupplie);

export const updateSupplieStatus = (supplieId, status) => {
  return SuppliesApi.patch(`/${supplieId}/`, { status });
};

export const getSupplieName = async(roleId) => {
  try {
      const response = await getSupplie(roleId);
      const role = response.data;
      return role.name;
  } catch (error) {
      console.error("Error fetching role:", error);
      return null;
  }
};

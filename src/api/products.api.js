import axios from "axios";

const productsApi = axios.create({
  baseURL: "https://yourburger.onrender.com/yourburger/api/v1/products/",
});

export const getProduct = (productId) => productsApi.get(`/${productId}/`);

export const getProducts = () => productsApi.get("/");

export const createProduct = (product) => productsApi.post("/", product);

export const deleteProduct = (productId) => productsApi.delete(`/${productId}/`);

export const editProduct = (productId, updatedProduct) =>
  productsApi.patch(`/${productId}/`, updatedProduct);

export const updateProductStatus = (productId, status) => {
  return productsApi.patch(`/${productId}/`, { status });
};

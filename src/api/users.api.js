import axios from "axios";

const usersApi = axios.create({
  baseURL: "https://yourburger.onrender.com/yourburger/api/v1/users/",
});

export const getUser = (userId) => usersApi.get(`/${userId}/`);

export const getUsers = () => usersApi.get("/");

export const createUser = (user) => usersApi.post("/", user);

export const deleteUser = (userId) => usersApi.delete(`/${userId}/`);

export const editUser = (userId, updatedUser) =>
  usersApi.patch(`/${userId}/`, updatedUser);

export const updateUserStatus = (userId, status) => {
  return usersApi.patch(`/${userId}/`, { status });
};

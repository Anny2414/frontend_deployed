import axios from "axios";

const rolesApi = axios.create({
    baseURL: "https://yourburger.onrender.com/yourburger/api/v1/roles/",
});

export const getRole = (roleId) => rolesApi.get(`/${roleId}/`);

export const getRoles = () => rolesApi.get("/");

export const createRole = (role) => rolesApi.post("/", role);

export const deleteRole = (roleId) => rolesApi.delete(`/${roleId}/`);

export const editRole = (roleId, updatedRole) =>
    rolesApi.patch(`/${roleId}/`, updatedRole);

export const updateRoleStatus = (roleId, status) => {
    return rolesApi.patch(`/${roleId}/`, { status });
};

export const getRoleName = async(roleId) => {
    try {
        const response = await getRole(roleId);
        const role = response.data;
        return role.name;
    } catch (error) {
        console.error("Error fetching role:", error);
        return null;
    }
};
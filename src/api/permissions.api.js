import axios from "axios";

const permissionApi = axios.create({
    baseURL: "https://yourburger.onrender.com/yourburger/api/v1/detallepermiso/",
});

export const savePermissions = (roleId, permission) =>
    permissionApi.post("/", {
        roleId,
        permission,
    });

export const getPermissions = (roleId) =>
    permissionApi.get().then((response) => {
        const permissions = response.data.filter((item) => item.roleId === roleId);
        return permissions.map((item) => item.permission);
    });

export const checkPermission = async(roleId, module) => {
    const permissions = await getPermissions(roleId);
    const modules = permissions.map((permission) => permission.split(":")[0]);
    return modules.includes(module);
};

export const deletePermissionsByRole = (roleId) => {
    permissionApi.delete(`/delete/${roleId}/`);
};
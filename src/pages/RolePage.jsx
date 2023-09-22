import { React, useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Table } from "../components/Table/Table.jsx";

import { Button } from "../components/Form/Button.jsx";
import { Input } from "../components/Form/Input.jsx";

import { Modal } from "../components/Modal.jsx";

import { Notification } from "../components/Notification.jsx";

// CONEXION CON LA API DE ROLES
import {
  savePermissions,
  checkPermission,
  deletePermissionsByRole,
} from "../api/permissions.api";

import {
  getRoles,
  createRole,
  deleteRole,
  getRole,
  editRole,
  updateRoleStatus,
} from "../api/roles.api";

export function RolePage() {
  const [roles, setRoles] = useState([]);

  // Variable para buscar roles
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // CONFIGURACION MODAL
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState();

  const [notification, setNotification] = useState(null);

  const openModal = (
    title,
    fields,
    dataSelect,
    nameSelect,
    buttonSubmit,
    submit
  ) => {
    setModalConfig({
      title,
      fields,
      dataSelect,
      nameSelect,
      buttonSubmit,
      submit,
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const reloadDataTable = async () => {
    setRoles([]);
    const res = await getRoles();
    setRoles(res.data);
  };

  const fieldsNew = [
    {
      title: "Nombre",
      type: "text",
      name: "name",
      icon: "user",
      col: "full",
      disabled: false,
      required: true,
    },
    { title: "Usuarios", type: "checkbox", col: "4", required: "false" },
    { title: "Clientes", type: "checkbox", col: "4", required: "false" },
    { title: "Productos", type: "checkbox", col: "4", required: "false" },
    { title: "Pedidos", type: "checkbox", col: "4", required: "false" },
    { title: "Roles", type: "checkbox", col: "4", required: "false" },
    { title: "Ventas", type: "checkbox", col: "4", required: "false" },
  ];

  useEffect(() => {
    async function fetchData() {
      const res = await getRoles();
      setRoles(res.data);
    }

    fetchData();
  }, []);

  const handleCreateRole = async (data) => {
    const selectedModules = Object.entries(data)
      .filter(([module, value]) => value && module !== "name")
      .map(([module]) => module);

    if (selectedModules.length === 0) {
      setNotification({
        msg: "Seleccione por lo menos un permiso antes de crear el rol!",
        color: "error",
        buttons: false,
        timeout: 3000,
      });
      return;
    }

    try {
      const res = await createRole({ name: data.name });
      const roleId = res.data.id; // Obtener el ID del rol creado

      for (const module of selectedModules) {
        try {
          await savePermissions(roleId, module);
        } catch (error) {
          console.error(
            `Error al crear permiso para el modulo ${module} y el rol ${roleId}: `,
            error
          );
        }
      }

      setNotification({
        msg: "Rol creado exitosamente!",
        color: "success",
        buttons: false,
        timeout: 3000,
      });
    } catch (error) {
      const errorMessages = {
        '{"name":["role with this name already exists."]}': "Ya existe este rol!",
        '{"name":["Ensure this field has no more than 50 characters."]}': "El nombre del rol sobrepasa los 50 caracteres!",
      };

      const errorMessage = errorMessages[error.response.request.responseText];

      if (errorMessage) {
        return setNotification({
          msg: errorMessage,
          color: "primary",
          buttons: false,
          timeout: 3000,
        });
      }
    }

    reloadDataTable();
    closeModal();
  };

  const handleEditClick = async (roleId) => {
    const res = await getRole(roleId);
    const role = res.data;

    const fieldsEdit = [
      {
        title: "Nombre",
        type: "text",
        name: "name",
        icon: "user",
        col: "full",
        required: "true",
        value: role.name,
      },
      {
        title: "Usuarios",
        type: "checkbox",
        name: "role",
        col: "4",
        checked: await checkPermission(role.id, "Usuarios"),
      },
      {
        title: "Clientes",
        type: "checkbox",
        name: "role",
        col: "4",
        checked: await checkPermission(role.id, "Clientes"),
      },
      {
        title: "Productos",
        type: "checkbox",
        name: "role",
        col: "4",
        checked: await checkPermission(role.id, "Productos"),
      },
      {
        title: "Pedidos",
        type: "checkbox",
        name: "role",
        col: "4",
        checked: await checkPermission(role.id, "Pedidos"),
      },
      {
        title: "Roles",
        type: "checkbox",
        name: "role",
        col: "4",
        checked: await checkPermission(role.id, "Roles"),
      },
      {
        title: "Ventas",
        type: "checkbox",
        name: "role",
        col: "4",
        checked: await checkPermission(role.id, "Ventas"),
      },
    ];

    const handleEditRole = async (data) => {
      const { name } = data;

      const selectedModules = Object.entries(data)
        .filter(([module, value]) => value && module !== "name")
        .map(([module]) => module);

      if (selectedModules.length === 0) {
        setNotification({
          msg: "Seleccione por lo menos un permiso antes de editar el rol!",
          color: "error",
          buttons: false,
          timeout: 3000,
        });
        return;
      }

      try {
        await editRole(roleId, { name: name });

        setNotification({
          msg: "Rol editado exitosamente!",
          color: "success",
          buttons: false,
          timeout: 3000,
        });
      } catch (error) {
        const errorMessages = {
          '{"name":["role with this name already exists."]}': "Ya existe este rol!",
          '{"name":["Ensure this field has no more than 50 characters."]}': "El nombre del rol sobrepasa los 50 caracteres!",
        };

        const errorMessage = errorMessages[error.response.request.responseText];

        if (errorMessage) {
          return setNotification({
            msg: errorMessage,
            color: "primary",
            buttons: false,
            timeout: 3000,
          });
        }
      }

      try {
        deletePermissionsByRole(roleId);
      } catch (error) {
        console.error("Error al eliminar los permisos del rol:", error);
      }

      for (const module of selectedModules) {
        try {
          await savePermissions(roleId, module);
        } catch (error) {
          console.error(
            `Error al crear permiso para el modulo ${module} y el rol ${roleId}: `,
            error
          );
        }
      }

      reloadDataTable();
      closeModal();
    };

    openModal("Editar rol", fieldsEdit, null, null, true, handleEditRole);
  };

  const handleStatusChange = async (roleId, status) => {
    setNotification({
      msg: "¿Seguro deseas cambiar el estado?",
      color: "warning",
      buttons: true,
      timeout: 0,
      onConfirm: async () => {
        try {
          await updateRoleStatus(roleId, !status);
          setNotification({
            msg: "Estado cambiado exitosamente!",
            color: "info",
            buttons: false,
            timeout: 3000,
          });
          reloadDataTable();
        } catch (error) {
          console.error("Error al cambiar el estado:", error);
        }
      },
    });
  };

  const handleDeleteClick = async (roleId) => {
    setNotification({
      msg: "¿Seguro deseas eliminar este rol?",
      color: "warning",
      buttons: true,
      timeout: 0,
      onConfirm: async () => {
        try {
          await deleteRole(roleId);
          await deletePermissionsByRole(roleId);
          setNotification({
            msg: "Rol eliminado exitosamente!",
            color: "info",
            buttons: false,
            timeout: 3000,
          });
          reloadDataTable();
        } catch (error) {
          console.error("Error al eliminar el rol:", error);
          if (error.response.status == 500) {
            setNotification({
              msg: "Este rol tiene usuarios asociados!",
              color: "primary",
              buttons: false,
              timeout: 3000,
            });
          }
        }
      },
    });
  };

  return (
    <div>
      <Navbar />
      <div className="container is-fluid mt-5">
        <div className="notifications float">
          {notification && (
            <Notification
              msg={notification.msg}
              color={notification.color}
              buttons={notification.buttons}
              timeout={notification.timeout}
              onClose={() => setNotification(null)}
              onConfirm={notification.onConfirm}
            />
          )}
        </div>
        <div className="columns is-centered">
          <div className="column is-10">
            <Input
              holder="Buscar"
              icon="magnifying-glass"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="column is-fullwidth">
            <Button
              text={
                <span className="icon">
                  <i class="fa-solid fa-user"></i>
                  <i class="fa-solid fa-plus"></i>
                </span>
              } color="success"
              col="fullwidth"
              action={() =>
                openModal(
                  "Nuevo rol",
                  fieldsNew,
                  null,
                  null,
                  true,
                  handleCreateRole
                )
              }
            />
          </div>
        </div>
        {filteredRoles.length > 0 ? (
          <Table
            headers={["#", "name", "permissions"]}
            columns={["#", "Nombre", "Permisos"]}
            data={filteredRoles} // Use the filtered roles data in the table
            edit
            status
            delete
            onStatusClick={handleStatusChange}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        ) : (
          <div className="notification has-text-centered mt-4">
            No se encontraron registros.
          </div>
        )}
      </div>
      {isOpen && (
        <Modal
          title={modalConfig.title}
          fields={modalConfig.fields}
          dataSelect={modalConfig.dataSelect}
          nameSelect={modalConfig.nameSelect}
          buttonSubmit={modalConfig.buttonSubmit}
          onClose={closeModal}
          submit={modalConfig.submit}
        />
      )}
    </div>
  );
}

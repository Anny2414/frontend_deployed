// GENERACION DE PDF
import jsPDF from "jspdf";
import "jspdf-autotable";

import Logo from "../assets/img/Logo.png"; // Imagen que sera usada en el PDF

import { useEffect, useState } from "react";
import { useRef } from "react";

import { Navbar } from "../components/Navbar.jsx";
import { Table } from "../components/Table/Table.jsx";

import { Button } from "../components/Form/Button.jsx";
import { Input } from "../components/Form/Input.jsx";

import { Modal } from "../components/Modal.jsx";

import { Notification } from "../components/Notification.jsx";

// CONEXION CON LA API DE USERS Y ROLES
import {
  getUsers,
  createUser,
  deleteUser,
  getUser,
  editUser,
  updateUserStatus,
} from "../api/users.api";

import { getRoles, getRoleName } from "../api/roles.api";

export function UsersPage() {
  // ARREGLO DE USUARIOS Y ROLES
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  // Variable para buscar usuarios
  const [searchQuery, setSearchQuery] = useState("");

  const [editingUserRole, setEditingUserRole] = useState("Administrador");

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generatePDF = async () => {
    const doc = new jsPDF();

    doc.addFont("helvetica", "normal");
    const fontSize = 10;

    const headers = [
      "#",
      "Rol",
      "Usuario",
      "Email",
      "Teléfono",
      "Dirección",
      "Creado en",
    ];
    const tableData = await Promise.all(
      users.map(async (user, index) => [
        index + 1,
        await getRoleName(user.role),
        user.username,
        user.email,
        user.phone,
        user.address,
        user.date,
      ])
    );

    doc.setFont("helvetica");
    doc.setFontSize(fontSize);
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: 40,
      styles: {
        textColor: [100, 100, 100],
        lineColor: [100, 100, 100],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [207, 41, 36],
        textColor: [255, 255, 255],
      },
      bodyStyles: {
        fillColor: [245, 245, 245],
      },
    });

    const imgData = Logo;
    doc.addImage(imgData, "PNG", 10, 10, 30, 30);

    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`REPORTE DE USUARIOS`, 50, 25);

    const today = new Date();
    const dateStr = today.toLocaleDateString();

    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${dateStr}`, 50, 30);

    doc.save("reporte_usuarios.pdf");
  };

  // CONFIGURACION MODAL
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState();

  const [notification, setNotification] = useState(null);

  const reloadDataTable = async () => {
    setUsers([]);
    const res = await getUsers();
    // Obtiene una matriz de promesas que resuelven los nombres de los roles
    const rolePromises = res.data.map((user) => getRoleName(user.role));

    // Espera a que todas las promesas se resuelvan
    const roleNames = await Promise.all(rolePromises);

    // Combina los datos de usuario con los nombres de roles resueltos
    const usersWithRoles = res.data.map((user, index) => ({
      ...user,
      roleName: roleNames[index],
    }));

    setUsers(usersWithRoles);
  };

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

  // Objeto para los campos de la ventana modal
  const fieldsNew = [
    {
      title: "Usuario",
      type: "text",
      name: "username",
      icon: "user",
      col: "half",
    },
    {
      title: "Email",
      type: "text",
      name: "email",
      icon: "envelope",
      col: "half",
    },
    {
      title: "Contraseña",
      type: "password",
      name: "password",
      icon: "key",
      col: "half",
      value: "yourburger123",
      readonly: "true",
    },
    {
      title: "Rol",
      type: "select",
      name: "role",
      icon: "lock-open",
      col: "half",
      nameSelect: "name",
      keySelect: "id",
    },
    {
      title: "Documento",
      type: "number",
      name: "document",
      icon: "id-card",
      col: "half",
    },
    {
      title: "Nombre",
      type: "text",
      name: "name",
      icon: "signature",
      col: "half",
    },
    {
      title: "Apellido",
      type: "text",
      name: "lastname",
      icon: "signature",
      col: "half",
    },
    {
      title: "Teléfono",
      type: "number",
      name: "phone",
      icon: "phone",
      col: "half",
    },
    {
      title: "Dirección",
      type: "text",
      name: "address",
      icon: "location-dot",
      col: "full",
    },
  ];

  // Conexion a API y obtiene datos de Users y Roles
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getUsers();
        const resRoles = await getRoles();

        // Obtiene una matriz de promesas que resuelven los nombres de los roles
        const rolePromises = res.data.map((user) => getRoleName(user.role));

        // Espera a que todas las promesas se resuelvan
        const roleNames = await Promise.all(rolePromises);

        // Combina los datos de usuario con los nombres de roles resueltos
        const usersWithRoles = res.data.map((user, index) => ({
          ...user,
          roleName: roleNames[index],
        }));

        setUsers(usersWithRoles);
        setRoles(resRoles.data);
      } catch (error) {
        // Manejar errores de manera apropiada
        console.error("Error al obtener datos:", error);
      }
    }

    fetchData();
  }, []);

  const handleCreateUser = async (data) => {
    try {
      await createUser(data);

      setNotification({
        msg: "Usuario creado exitosamente!",
        color: "success",
        buttons: false,
        timeout: 3000,
      });

      reloadDataTable();
      closeModal();
    } catch (error) {
      console.log(error.response);

      const errorMessages = {
        username_exists: "Ya existe este usuario!",
        username_length: "El usuario sobrepasa los 50 caracteres!",
        name: "El nombre sobrepasa los 50 caracteres!",
        lastname: "El apellido sobrepasa los 50 caracteres!",
        document: "El documento sobrepasa los 10 caracteres!",
        phone: "El teléfono sobrepasa los 10 caracteres!",
        email: "El correo ingresado es inválido",
      };

      if (
        error.response &&
        error.response.data &&
        error.response.data.username
      ) {
        const usernameErrors = error.response.data.username;

        for (const errorMessage of usernameErrors) {
          if (errorMessage.includes("already exists")) {
            setNotification({
              msg: errorMessages.username_exists,
              color: "primary",
              buttons: false,
              timeout: 3000,
            });
          } else if (errorMessage.includes("no more than 50 characters")) {
            setNotification({
              msg: errorMessages.username_length,
              color: "primary",
              buttons: false,
              timeout: 3000,
            });
          }
        }
      } else {
        setNotification({
          msg: "Hubo un error en la creación del usuario.",
          color: "primary",
          buttons: false,
          timeout: 3000,
        });
      }
    }
  };

  const handleEditClick = async (userId) => {
    const res = await getUser(userId);
    const user = res.data;

    const role = await getRoleName(user.role);

    setEditingUserRole(role);

    const fieldsEdit = [
      {
        title: "Usuario",
        type: "text",
        name: "username",
        icon: "user",
        col: "half",
        required: "true",
        value: user.username,
      },
      {
        title: "Email",
        type: "text",
        name: "email",
        icon: "envelope",
        col: "half",
        required: "true",
        value: user.email,
      },
      {
        title: "Rol",
        type: "select",
        name: "role",
        col: "half",
        icon: "lock-open",
        nameSelect: "name",
        keySelect: "id",
        value: user.role,
      },
      {
        title: "Documento",
        type: "number",
        name: "document",
        icon: "id-card",
        col: "half",
        value: user.document,
      },
      {
        title: "Nombre",
        type: "text",
        name: "name",
        icon: "signature",
        col: "half",
        value: user.name,
      },
      {
        title: "Apellido",
        type: "text",
        name: "lastname",
        icon: "signature",
        col: "half",
        value: user.lastname,
      },
      {
        title: "Teléfono",
        type: "number",
        name: "phone",
        icon: "phone",
        col: "half",
        value: user.phone,
      },
      {
        title: "Dirección",
        type: "text",
        name: "address",
        icon: "location-dot",
        col: "half",
        value: user.address,
      },
    ];

    const handleEditUser = async (data) => {
      try {
        await editUser(userId, data);

        setNotification({
          msg: "Usuario editado exitosamente!",
          color: "success",
          buttons: false,
          timeout: 3000,
        });

        reloadDataTable();
        closeModal();
      } catch (error) {
        console.log(error.response);

        const errorMessages = {
          username: "Ya existe este usuario!",
          name: "El nombre sobrepasa los 50 caracteres!",
          lastname: "El apellido sobrepasa los 50 caracteres!",
          document: "El documento sobrepasa los 10 caracteres!",
          phone: "El teléfono sobrepasa los 10 caracteres!",
          email: "El correo ingresado es inválido",
        };

        if (error.response && error.response.data) {
          const errorData = error.response.data;

          for (const key in errorData) {
            const errorMessage = errorMessages[key];
            if (errorMessage) {
              setNotification({
                msg: errorMessage,
                color: "primary",
                buttons: false,
                timeout: 3000,
              });
              break;
            }
          }
        } else {
          setNotification({
            msg: "Hubo un error en la creación del usuario.",
            color: "primary",
            buttons: false,
            timeout: 3000,
          });
        }
      }
    };

    openModal(
      "Editar usuario",
      fieldsEdit,
      roles,
      "name",
      true,
      handleEditUser
    );
  };

  const handleStatusChange = async (userId, status) => {
    setNotification({
      msg: "¿Seguro deseas cambiar el estado?",
      color: "warning",
      buttons: true,
      timeout: 0,
      onConfirm: async () => {
        try {
          await updateUserStatus(userId, !status);
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

  const handleDeleteClick = (userId) => {
    setNotification({
      msg: "¿Seguro deseas eliminar este usuario?",
      color: "warning",
      buttons: true,
      timeout: 0,
      onConfirm: async () => {
        try {
          await deleteUser(userId);
          setNotification({
            msg: "Usuario eliminado exitosamente!",
            color: "info",
            buttons: false,
            timeout: 3000,
          });
          reloadDataTable();
        } catch (error) {
          console.error("Error al eliminar el usuario:", error);
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
          <div className="column is-9">
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
                  <i className="fa-solid fa-user"></i>
                  <i className="fa-solid fa-plus"></i>
                </span>
              }
              color="success"
              col="fullwidth"
              action={() =>
                openModal(
                  "Nuevo usuario",
                  fieldsNew,
                  roles,
                  "name",
                  true,
                  handleCreateUser
                )
              }
            />
          </div>
          <div className="column is-fullwidth">
            <Button
              text={
                <span className="icon">
                  <i className="fa-solid fa-file-pdf"></i>
                </span>
              }
              color="primary"
              col="fullwidth"
              action={generatePDF}
            />
          </div>
        </div>
        {filteredUsers.length > 0 ? (
          <Table
            headers={[
              "#",
              "roleName",
              "username",
              "email",
              "phone",
              "address",
              "date",
            ]}
            columns={[
              "#",
              "Rol",
              "Usuario",
              "Correo",
              "Teléfono",
              "Dirección",
              "Creado en",
            ]}
            data={filteredUsers}
            status
            edit
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
          editingUserRole={editingUserRole}
        />
      )}
    </div>
  );
}

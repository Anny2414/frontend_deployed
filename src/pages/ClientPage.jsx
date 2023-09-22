import jsPDF from "jspdf";
import "jspdf-autotable";
import Logo from "../assets/img/Logo.png";
import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar.jsx";
import { Table } from "../components/Table/Table.jsx";

import { Button } from "../components/Form/Button.jsx";
import { Input } from "../components/Form/Input.jsx";
import { Notification } from "../components/Notification.jsx";
import { Modal } from "../components/Modal.jsx";

// CONEXION CON LA API DE USERS Y ROLES
import {
  getUsers,
  createUser,
  deleteUser,
  getUser,
  editUser,
  updateUserStatus,
} from "../api/clients.api.js";
import { getRoles } from "../api/roles.api";

export function ClientPage() {
  // ARREGLO DE USUARIOS Y ROLES
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const generatePDF = () => {
    const doc = new jsPDF();

    doc.addFont("helvetica", "normal");
    const fontSize = 10;

    const headers = [
      "#",
      "Nombre",
      "Usuario",
      "Email",
      "Teléfono",
      "Dirección",
    ];
    const tableData = users.map((user, index) => [
      index + 1,
      user.name,
      user.username,
      user.email,
      user.phone,
      user.address,
    ]);

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
    doc.text(`Reporte de Clientes`, 50, 25);

    const today = new Date();
    const dateStr = today.toLocaleDateString();

    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${dateStr}`, 50, 30);

    doc.save("reporte_Clientes.pdf");
  };

  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState();
  const [notification, setNotification] = useState(null);
  const reloadDataTable = async () => {
    setUsers([]);
    const res = await getUsers();
    setUsers(res.data);
  };

  const openModal = (title, fields, dataSelect, buttonSubmit, submit) => {
    setModalConfig({ title, fields, dataSelect, buttonSubmit, submit });
    setIsOpen(true);
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
            msg: "Estado cambiado Exitosamente  ",
            color: "info",
            buttons: false,
            timeout: 3000,
          });
          reloadDataTable();
        } catch (error) {
          console.error(error);
        }
      },
    });
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
      required: "true",
    },
    {
      title: "Email",
      type: "text",
      name: "email",
      icon: "envelope",
      col: "half",
      required: "true",
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
      title: "Nombre",
      type: "text",
      name: "name",
      icon: "signature",
      col: "half",
      required: "true",
    },
    {
      title: "Apellido",
      type: "text",
      name: "lastname",
      icon: "signature",
      col: "half",
      required: "true",
    },
    {
      title: "Documento",
      type: "number",
      name: "document",
      icon: "id-card",
      col: "half",
      required: "true",
    },
    {
      title: "Dirección",
      type: "text",
      name: "address",
      icon: "location-dot",
      col: "half",
      required: "true",
    },
    {
      title: "Telefono",
      type: "number",
      name: "phone",
      icon: "phone",
      required: "true",
      col: "half",
    },
  ];

  // Conexion a API y obtiene datos de Users y Roles
  useEffect(() => {
    async function fetchData() {
      const res = await getUsers();
      const resRoles = await getRoles();
      setUsers(res.data);
      setRoles(resRoles.data);
    }

    fetchData();
  }, []);

  const handleCreateUser = async (data) => {
    const {
      username,
      email,
      password,
      name,
      lastname,
      address,
      document,
      phone,
    } = data;
    const res = await getRoles();
    const rol = res.data.filter((rol) => rol.name == "Cliente");
    try {
      const userOne = {
        username,
        email,
        password,
        role: rol[0].id,
        name,
        lastname,
        address,
        document,
        phone,
      };
      await createUser(userOne);
      reloadDataTable();
      closeModal();

      setNotification({
        msg: "Cliente creado exitosamente!",
        color: "success",
        buttons: false,
        timeout: 3000,
      });
    } catch (error) {
      const errorMessages = {
        name: "El nombre sobrepasa los 50 caracteres!",
        lastname: "El apellido sobrepasa los 50 caracteres!",
        document: "El documento sobrepasa los 10 caracteres!",
        phone: "El teléfono sobrepasa los 10 caracteres!"
      };
    
      let errorMessage = "Hubo un error en la creación del usuario.";
    
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        console.log("errorData:", errorData);
        if (errorData.username) {
          if (errorData.username[0].includes("already exists")) {
            errorMessage = "Ya existe este usuario!";
          } else if (errorData.username[0].includes("no more than 50 characters")) {
            errorMessage = "El usuario sobrepasa los 50 caracteres!";
          }
        }else if (errorData.email){
          if (errorData.email[0].includes("already exists")) {
            errorMessage = "Ya existe este Correo!";
          } else if (errorData.email[0].includes(" valid email address.")) {
            errorMessage = "El correo ingresado es inválido";
          }
        }
    
        for (const key in errorData) {
          const ErrorMessage = errorMessages[key];
    
          if (ErrorMessage) {
            errorMessage = ErrorMessage;
            break;
          }
        }
        
        setNotification({
          msg: errorMessage,
          color: "primary",
          buttons: false,
          timeout: 3000,
        });
      } else {
        console.log(errorData);
        setNotification({
          msg: errorMessage,
          color: "primary",
          buttons: false,
          timeout: 3000,
        });
      }
    }
  };

  const handleEditClick = async (userId) => {
    const res = await getUser(userId);
    console.log(res);
    const user = res.data;

    const fieldsEdit = [
      {
        title: "Nombre",
        type: "text",
        name: "name",
        icon: "signature",
        col: "half",
        required: "true",
        value: user.name,
      },
      {
        title: "Apellido",
        type: "text",
        name: "lastname",
        icon: "signature",
        col: "half",
        required: "true",
        value: user.lastname,
      },
      {
        title: "Documento",
        type: "number",
        name: "document",
        icon: "id-card",
        col: "half",
        required: "true",
        value: user.document,
      },
      {
        title: "Dirección",
        type: "text",
        name: "address",
        icon: "location-dot",
        col: "half",
        required: "true",
        value: user.address,
      },
      {
        title: "Telefono",
        type: "number",
        name: "phone",
        icon: "phone",
        required: "true",
        value: user.phone,
        col: "half",
      },{
        title: "Correo",
        type: "text",
        name: "email",
        icon: "phone",
        required: "true",
        value: user.email,
        col: "half",
      }
      
    ];

    const handleEditUser = async (data) => {
      try {
        await editUser(userId, data);
        reloadDataTable();
        closeModal();
        setNotification({
          msg: "Cliente Editado exitosamente!",
          color: "success",
          buttons: false,
          timeout: 3000,
        });
      } catch (error) {
        const errorMessages = {
          name: "El nombre sobrepasa los 50 caracteres!",
          lastname: "El apellido sobrepasa los 50 caracteres!",
          document: "El documento sobrepasa los 10 caracteres!",
          phone: "El teléfono sobrepasa los 10 caracteres!"
        };
      
        let errorMessage = "Hubo un error en la creación del usuario.";
      
        if (error.response && error.response.data) {
          const errorData = error.response.data;
          console.log("errorData:", errorData);
          if (errorData.username) {
            if (errorData.username[0].includes("already exists")) {
              errorMessage = "Ya existe este usuario!";
            } else if (errorData.username[0].includes("no more than 50 characters")) {
              errorMessage = "El usuario sobrepasa los 50 caracteres!";
            }
          }else if (errorData.email){
            if (errorData.email[0].includes("already exists")) {
              errorMessage = "Ya existe este Correo!";
            } else if (errorData.email[0].includes(" valid email address.")) {
              errorMessage = "El correo ingresado es inválido";
            }
          }
      
          for (const key in errorData) {
            const ErrorMessage = errorMessages[key];
      
            if (ErrorMessage) {
              errorMessage = ErrorMessage;
              break;
            }
          }
          
          setNotification({
            msg: errorMessage,
            color: "primary",
            buttons: false,
            timeout: 3000,
          });
        } else {
          console.log(errorData);
          setNotification({
            msg: errorMessage,
            color: "primary",
            buttons: false,
            timeout: 3000,
          });
        }
      }
    };

    openModal("Editar cliente", fieldsEdit, null, true, handleEditUser);
  };

  const handleDeleteClick = async (userId) => {
    setNotification({
      msg: "¿Seguro deseas eliminar el cliente?",
      color: "warning",
      buttons: true,
      timeout: 0,
      onConfirm: async () => {
        await deleteUser(userId);
        reloadDataTable();
        setNotification({
          msg: "¡Usuario eliminado exitosamente!",
          color: "info",
          buttons: false,
          timeout: 3000,
        });
      },
    });
  };

  return (
    <div>
      <Navbar />
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
      <div className="container is-fluid mt-5">
        <div className="columns is-centered">
          <div className="column is-9">
            <Input holder="Buscar " icon="magnifying-glass" />
          </div>
          <div className="column is-fullwidth">
            <Button
              text={
                <span className="icon">
                  <i class="fa-solid fa-user"></i>
                  <i class="fa-solid fa-plus"></i>
                </span>
              }
              color="success"
              col="fullwidth"
              action={() =>
                openModal(
                  "Nuevo Cliente",
                  fieldsNew,
                  roles,
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
                  <i class="fa-solid fa-file-pdf"></i>
                </span>
              }
              color="primary"
              action={generatePDF}
              col="fullwidth"
            />
          </div>
        </div>
        <Table
          headers={[
            "#",
            "document",
            "username",
            "name",
            "lastname",
            "email",
            "address",
            "phone",
          ]}
          columns={[
            "#",
            "Documento",
            "Usuario",
            "Nombre",
            "Apellido",
            "Correo",
            "Dirección",
            "Teléfono",
          ]}
          data={users}
          status
          edit
          delete
          onStatusClick={handleStatusChange}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />
      </div>

      {isOpen && (
        <Modal
          title={modalConfig.title}
          fields={modalConfig.fields}
          dataSelect={modalConfig.dataSelect}
          onClose={closeModal}
          buttonSubmit={modalConfig.buttonSubmit}
          submit={modalConfig.submit}
        />
      )}
    </div>
  );
}

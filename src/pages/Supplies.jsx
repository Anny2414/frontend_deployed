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
  getSupplies,
  createSupplie,
  deleteSupplie,
  getSupplie,
  editSupplie,
  updateSupplieStatus,
} from "../api/supplies.api.js";


export function SuppliesPage() {
  // ARREGLO DE USUARIOS Y ROLES
  const [Supplies, setSupplies] = useState([]);

  // Variable para buscar Supplies
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSupplie = Supplies.filter(
    (supplie) =>
    supplie.name.toLowerCase().includes(searchQuery.toLowerCase()) 
  );


//Generar PDF
const generatePDF = async() => {
  const doc = new jsPDF();

  doc.addFont("helvetica", "normal");
  const fontSize = 10;

  const headers = [
    "#",
    "Nombre",
    "Costo Adicional",
    "Stock",
  ];
  const tableData = await Promise.all(
    Supplies.map(async (suppli, index) => [
      index + 1,
      suppli.name,
      suppli.price,
      suppli.stock,

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
  doc.text(`REPORTE DE INGREDIENTES`, 50, 25);

  const today = new Date();
  const dateStr = today.toLocaleDateString();

  doc.setFontSize(fontSize);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha: ${dateStr}`, 50, 30);

  doc.save("reporte_ingredientes.pdf");
};

  

  
  // CONFIGURACION MODAL
  const [isOpen, setIsOpen] = useState(false);
  

  const [modalConfig, setModalConfig] = useState();
  const [notification, setNotification] = useState(null);
  


  const reloadDataTable = async () => {
    setSupplies([])
    const res = await getSupplies();
    setSupplies(res.data)
  }

  const openModal = (title, fields, dataSelect, nameSelect, buttonSubmit, submit) => {
    setModalConfig({ title, fields, dataSelect, nameSelect, buttonSubmit, submit });
    setIsOpen(true);

  };

  const closeModal = () => {
    setIsOpen(false);
  };

  // Objeto para los campos de la ventana modal
  const fieldsNew = [
    {
      title: "Nombre",
      type: "text",
      name: "name",
      icon: "burger",
      col: "half",
      required: "true",
    },
    {
      title: "Costo Adicional",
      type: "number",
      name: "price",
      icon: "dollar",
      col: "half",
      required: "true",
    },
    {
      title: "Stock",
      type: "number",
      name: "stock",
      icon: "dollar",
      col: "half",
      required: "true",
      value:0,


    },
  ];

  // Conexion a API y obtiene datos de Users y Roles
  useEffect(() => {
    async function fetchData() {
      const res = await getSupplies();
      setSupplies(res.data);
    }

    fetchData();
  }, []);

  const handleCreateSupplie = async (data) => {
    try {
      await createSupplie(data);
      reloadDataTable()
      closeModal()
      setNotification({
        msg: "Ingrediente creado exitosamente!",
        color: "success",
        buttons: false,
        timeout: 3000,
      });
    } catch (error) {
      console.error("Error al crear el Ingrediente:", error);
      const errorMessages = {
        '{"name":["supplies with this name already exists."]}': "Ya existe ese Ingrediente!",
        '{"name":["Ensure this field has no more than 50 characters."]}': "El ingrediente sobrepasa los 50 caracteres!",
        '{"price":["Ensure this field has no more than 15 characters."]}': "El precio sobrepasa los 15 caracteres!",
        '{"stock":["Ensure this field has no more than 10 characters."]}': "El stock sobrepasa los 10 caracteres!",


      };

      const errorMessage = errorMessages[error.response.request.responseText];
      if (errorMessage) {
        return setNotification({
          msg: errorMessage,
          color: "primary",
          buttons: false,
          timeout: 3000,
        });
      } else if (error.response.data.name == "supplies with this name already exists.") {
        return setNotification({
          msg: "Ya existe un ingrediente con ese Nombre",
          color: "primary",
          buttons: false,
          timeout: 3000,
        });
      } else if (error.response.data.name == "Ensure this field has no more than 50 characters.") {
        return setNotification({
          msg: "El nombre sobrepasa los 50 caracteres!",
          color: "primary",
          buttons: false,
          timeout: 3000,
        });
        
      }else if (error.response.data.price) {
        return setNotification({
          msg: "El precio sobrepasa los 15 digitos!",
          color: "primary",
          buttons: false,
          timeout: 3000,
        });
      }else if (error.response.data.stock) {
        return setNotification({
          msg: "El stock sobrepasa los 10 digitos!",
          color: "primary",
          buttons: false,
          timeout: 3000,
        });
      }
    }
    reloadDataTable();
    closeModal();
  };

  const handleEditClick = async (supplieId) => {
    const res = await getSupplie(supplieId);
    const supplie = res.data;

    const fieldsEdit = [
      {
        title: "Nombre",
        type: "text",
        name: "name",
        icon: "burger",
        col: "half",
        required: "true",
        value: supplie.name,
      },
      {
        title: "Costo Adicional",
        type: "number",
        name: "price",
        icon: "dollar",
        col: "half",
        required: "true",
        value: supplie.price,
      },
      {
        title: "Stock",
        type: "number",
        name: "stock",
        icon: "dollar",
        col: "half",
        required: "true",
        value:supplie.stock,
  
  
      },

    ];

    const handleEditSupplie = async (data) => {
      try {
        await editSupplie(supplieId, data);
        reloadDataTable()
        closeModal()
        setNotification({
          msg: "Ingrediente editado exitosamente!",
          color: "warning",
          buttons: false,
          timeout: 3000,
        });
      } catch (error) {
        const errorMessages = {
          '{"name":["supplies with this name already exists."]}': "Ya existe ese producto!",
          '{"name":["Ensure this field has no more than 50 characters."]}': "El nombre del ingrediente sobrepasa los 50 caracteres!",
          '{"price":["Ensure this field has no more than 15 characters."]}': "El precio del ingrediente sobrepasa los 15 digitos!",
          '{"stock":["Ensure this field has no more than 10 characters."]}': "El stock del ingrediente sobrepasa los 10 digitos!",


        };
        const errorMessage = errorMessages[error.response.request.responseText];
        if (errorMessage) {
          return setNotification({
            msg: errorMessage,
            color: "primary",
            buttons: false,
            timeout: 3000,
          });
        } else if (error.response.data.name == "supplies with this name already exists." ) {
          return setNotification({
            msg: "Ya existe un Ingrediente con ese nombre!",
            color: "primary",
            buttons: false,
            timeout: 3000,
          });
        } else if (error.response.data.name == "Ensure this field has no more than 50 characters.") {
          return setNotification({
            msg: "El nombre del ingrediente sobrepasa los 50 caracteres!",
            color: "primary",
            buttons: false,
            timeout: 3000,
          });
        } else if (error.response.data.price) {
          return setNotification({
            msg: "El precio  sobrepasa los 15 digitos!",
            color: "primary",
            buttons: false,
            timeout: 3000,
          });
        }else if (error.response.data.stock) {
          return setNotification({
            msg: "El stock  sobrepasa los 10 digitos!",
            color: "primary",
            buttons: false,
            timeout: 3000,
          });
        }


        console.error("Error al editar el Ingrediente:", error);
      }
    };

    openModal("Editar Ingrediente", fieldsEdit, Supplies, "status", true, handleEditSupplie);
  };

  const handleStatusChange = async (supplieId, status) => {
    setNotification({
      msg: "¿Seguro deseas cambiar el estado?",
      color: "warning",
      buttons: true,
      timeout: 0,
      onConfirm: async () => {
    try {
      await updateSupplieStatus(supplieId, !status);
      setNotification({
        msg: "Estado cambiado exitosamente!",
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

  const handleDeleteClick = async(supplieId) => {
    setNotification({
      msg: "¿Seguro deseas eliminar el ingrediente?",
      color: "warning",
      buttons: true,
      timeout: 0,
      onConfirm: async () => {
        try {
          await deleteSupplie(supplieId);
          setNotification({
            msg: "ingrediente eliminado exitosamente!",
            color: "info",
            buttons: false,
            timeout: 3000,
          });
          reloadDataTable();
        } catch (error) {
          console.error("Error al eliminar:", error);
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
                  <i class="fa-solid fa-burger"></i>
                  <i class="fa-solid fa-plus"></i>
                </span>
              }
              color="success"
              col="fullwidth"
              action={() =>
                openModal(
                  "Nuevo Ingrediente",
                  fieldsNew,
                  null,
                  null,
                  true,
                  handleCreateSupplie
                )
              }
            />
          </div>
          <div className="column is-fullwidth">
          <Button
              text={<span className="icon">
              <i class="fa-solid fa-file-pdf"></i>
            </span>}
              color="primary"
              col="fullwidth"
              action={generatePDF}
            />
          </div>
        </div>
        {filteredSupplie.length > 0 ? (

        <Table
          headers={["#", "name", "price","stock"]}
          columns={["#", "Nombre", "Costo Adicional","Stock"]}
          data={filteredSupplie}
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
        />
      )}
    </div>
  );
}
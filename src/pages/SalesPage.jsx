import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar.jsx";
import { Table } from "../components/Table/Table.jsx";
import "../assets/css/ResponsiveTable.css";
import { Button } from "../components/Form/Button.jsx";
import { Input } from "../components/Form/Input.jsx";

// CONEXION CON LA API DE USERS Y ROLES
import { getUser, getUsers } from "../api/users.api";
import { getUser as getclient, getclients } from "../api/clients.api.js";
import { createSale, deleteSale, editSale, getSale, getSales } from "../api/sales.api.js";
import { Modal } from "../components/Modal.jsx";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Logo from "../assets/img/Logo.png"; // Imagen que sera usada en el PDF
import { Notification } from "../components/Notification.jsx";
import { getDetails } from "../api/detail.api.js";


export function SalesPage() {
  const [users, setUsers] = useState([]);
  const [client , setClient] = useState([])
  const [sales, setSales] = useState([]);
  const [details, setDetails] = useState([])

  //

  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = sales.filter((sale) => {
    const searchString = searchQuery.toLowerCase();
    // const userMatches = sale.user.toLowerCase().includes(searchString);
    const statusMatches = sale.status.toLowerCase().includes(searchString);
    const createAtMatches = sale.create_at.toLowerCase().includes(searchString);
    const updateAtMatches = sale.update_at.toLowerCase().includes(searchString);

    return  statusMatches || createAtMatches || updateAtMatches;
  });


  const generatePDF = () => {
    const doc = new jsPDF();

    doc.addFont("helvetica", "normal");
    const fontSize = 10;

    const headers = [
      "#",
      "Usuario",
      "creado en",
      "Actualizdo en",
      "Total",
      "Estado",
    ];
    const tableData = sales.map((sale, index) => [
      index + 1,
      sale.user,
      sale.create_at,
      sale.update_at,
      sale.total,
      sale.status,
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
    doc.text(`REPORTE DE VENTAS`, 50, 25);

    const today = new Date();
    const dateStr = today.toLocaleDateString();

    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${dateStr}`, 50, 30);

    doc.save("reporte_ventas.pdf");
  };

  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState();
  const [notification, setNotification] = useState(null);



  const reloadDataTable = async () => {
    setSales([])
    const res = await getSales();
    setSales(res.data)
  }

  const openModal = (title, fields, dataSelect, nameSelect, buttonSubmit, submit) => {
    setModalConfig({ title, fields, dataSelect, nameSelect, buttonSubmit, submit });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };



  // Objeto para los campos de la ventana modal
  // const fieldsNew = [
  //   {
  //     title: "Total",
  //     type: "text",
  //     name: "total",
  //     icon: "dollar",
  //     required: "true",
  //   },
  //   {
  //     title: "Usuario",
  //     type: "select",
  //     name: "user",
  //     icon: "user",
  //     col: "half",
  //     keySelect: "username",
  //     data: users,
  //   },
  //   {
  //     title: "Estado",
  //     type: "text",
  //     name: "status",
  //     icon: "user",
  //     col: "half",
  //     value : "Por pagar",
  //     readonly : true
  //   },
  // ];

  // Conexion a API y obtiene datos de Users y Roles
  useEffect(() => {
    async function fetchData() {
      const resUser = await getUsers();
      const resClient = await getclients();
      const res = await getSales();
      const resDetail = await getDetails()
      setDetails(resDetail.data)
      setClient(resClient.data)
      setSales(res.data);
      setUsers(resUser.data);
    }

    fetchData();
  }, []);

  const handleCreateSales = async (data) => {
    try {
      await createSale(data);
      reloadDataTable()
      closeModal()
    } catch (error) {
      console.error("Error al crear la venta:", error);
    }
  };

  
  const onContentClick = async (SalesId) => {
    const sale = sales.find((order) => order.id == SalesId)
    let dato 
    const  user = users.filter((user) => user.id == sale.user)
    const  clien = client.filter((user) => user.id == sale.user)
    if (user.length > 0) {
      dato =user[0].address
    }else{
      dato = clien[0].address
    }
    const res =details.filter((detail) => detail.order == SalesId) 

    console.log(res);
    const fieldsEdit = [
      {
        title: "Dirección",
        type: "text",
        name: "name",
        icon: "",
        col: "full",
        required: "true",
        value: dato || "No especificado ",
        readonly: true,
      },
      {
        type : "list",
        columns: ["Producto", "Cantidad" , "Precio"],
        headers: ["product","amount", "price"],
        data : res,

      },

    ];

    openModal("Detalle pedido" , fieldsEdit , false , false,false,false)
  }

  const handleEditClick = async (SalesId) => {
    const res = await getSale(SalesId);
    const sales = res.data;
    const customOptions = [
      { "id": 1, "status": "Por pagar" },
      { "id": 2, "status": "Pago" },
      { "id": 3, "status": "Cancelado" },
    ];
    const fieldsEdit = [
      {
        title: "Estado",
        type: "select",
        name: "status",
        col: "full",
        icon: "lock-open",
        keySelect: "status",
        nameSelect: "status",
        value: sales.status,
        customOptions: customOptions
      },

    ];

    const handleEditUser = async (data) => {
      try {
        await editSale(SalesId, data);
        window.location.reload();
      } catch (error) {
        console.error("Error al editar la venta:", error);
      }
    };

    openModal("Editar venta", fieldsEdit, customOptions, 'status', true, handleEditUser);
  };


  const handleDeleteClick = async (userId) => {
    setNotification({
      msg: "¿Seguro deseas cancelar esta venta?",
      color: "warning",
      buttons: true,
      timeout: 0,
      onConfirm: async () => {
        try {
          const data = await getSale(userId)
          data.status = "Cancelado"
          await editSale(userId, data);
          reloadDataTable()
          setNotification({
            msg: "venta cancelada exitosamente!",
            color: "info",
            buttons: false,
            timeout: 3000,
          });
        } catch (error) {
          console.error("Error al editar el pedido: ", error);
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
            <Link to="/sale" className="button is-success is-fullwidth">
              <span className="icon">
                <i class="fa-solid fa-file-invoice"></i>
                <i class="fa-solid fa-plus"></i>
              </span></Link>
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
        {filteredUsers.length > 0 ? (
          <Table
            headers={["#", "user", "create_at", "update_at", "total", "status"]}
            columns={[
              "ID",
              "Usuario",
              "Creado en",
              "Actualizado en",
              "Total",
              "Estado de venta",
            ]}
            edit
            delete
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onDetail = {onContentClick}
            detail = {true}
            data={filteredUsers}
          />) : (
          <div className="notification has-text-centered mt-4">
            No se encontraron registros.
          </div>
        )}
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
    </div>
  );
}

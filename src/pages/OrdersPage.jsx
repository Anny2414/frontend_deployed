import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar.jsx";
import { Table } from "../components/Table/Table.jsx";
import Logo from "../assets/img/Logo.png"; // Imagen que sera usada en el PDF
import { Button } from "../components/Form/Button.jsx";
import { Input } from "../components/Form/Input.jsx";
import { Link, Navigate } from "react-router-dom";
import { getRoleName } from "../api/roles.api.js"
// CONEXION CON LA API DE USERS Y ROLES
import { getUser, getUsers } from "../api/users.api";
import { editOrder, getOrder, getOrders } from "../api/order.api";
import { Modal } from "../components/Modal.jsx";
import { getclients } from "../api/clients.api.js";
import { Notification } from "../components/Notification.jsx";
import jsPDF from "jspdf";
import CryptoJS from "crypto-js";
import { getProducts } from "../api/products.api.js";
import { getSale } from "../api/sales.api.js";
import { getDetails } from "../api/detail.api.js";

export function OrdersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [order, setOrder] = useState([]);
  const [username, setUsername] = useState('');
  const [clientes, setClientes] = useState([])
  const [rol, setRol] = useState()
  const [notification, setNotification] = useState(null);
  const [products, setProducts] = useState([])
  const [details, setDetails] = useState([])
  const [id , setId] = useState()


  //
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState();
  // const rol = "Cliente"; 

  const reloadDataTable = async () => {
    setOrder([])
    const res = await getOrders();
    setOrder(res.data)
  }
  const openModal = (title, fields, dataSelect, nameSelect, buttonSubmit, submit) => {
    setModalConfig({ title, fields, dataSelect, nameSelect, buttonSubmit, submit });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  // Conexion a API y obtiene datos de Users y Roles

  useEffect(() => {
    async function fetchData() {
      try {
        const resUser = await getUsers();
        const resclient = await getclients();
        const resOrder = await getOrders()
        const res = await getProducts();
        const resDetail = await getDetails()
        setDetails(resDetail.data)
        setProducts(res.data)
        setUsers(resUser.data);
        setClientes(resclient.data);
        setOrder(resOrder.data)
        setIsLoading(false); // Los datos han cargado, establece isLoading a false
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        setIsLoading(false); // Si ocurre un error, también establece isLoading a false
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function roles(id) {
      const role = await getRoleName(id)
      setRol(role)
    }
    // Verifica si los datos han cargado antes de utilizar la variable username
    if (!isLoading) {
      const encryptionKey = 'Yourburger';
      const encryptedUserData = localStorage.getItem('Token');
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedUserData, encryptionKey);
      const decryptedUserDataJSON = decryptedBytes.toString(CryptoJS.enc.Utf8);
      const userData = JSON.parse(decryptedUserDataJSON);
      const name = userData.name;
      const id2 = userData.token.user_id
      setId(id2)
      const user = users.find((user) => user.id === id2);
      const cliente = clientes.find((client) => client.id === id2);
      if (id2) {
        if (user) {
          setUsername(user.username);
          roles(user.role)
        } else if (cliente) {
          setUsername(cliente.username);
          roles(cliente.role)

        }

      } else {
        window.location.replace("/")
      }
    }
  }, [users, clientes, isLoading]);

  const generatePDF = async () => {
    const doc = new jsPDF();

    doc.addFont("helvetica", "normal");
    const fontSize = 10;

    const headers = [
      "#",
      "Usuario",
      "Creado en",
      "Actualizado en",
      "Total",
      "Estado de venta",
      "Detalle",
    ];
    const tableData = await Promise.all(
      order.map(async (user, index) => [
        index + 1,
        user.user,
        user.create_at,
        user.update_at,
        user.total,
        user.status,
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

    doc.save("reporte_pedidos.pdf");
  };


  const onContentClick = async (SalesId) => {
    const sale = order.find((order) => order.id == SalesId)
    let dato 
    const  user = users.filter((user) => user.id == sale.user)
    const  clien = clientes.filter((user) => user.id == sale.user)
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
    const res = await getOrder(SalesId);
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
        await editOrder(SalesId, data);
        reloadDataTable()
        closeModal()
      } catch (error) {
        console.error("Error al editar el pedido:", error);
      }
    };

    openModal("Editar venta", fieldsEdit, customOptions, 'status', true, handleEditUser);
  };

  const handleDeleteClick = async (userId) => {
    setNotification({
      msg: "¿Seguro deseas cancelar este Pedido?",
      color: "warning",
      buttons: true,
      timeout: 0,
      onConfirm: async () => {
        try {

          const data = await getOrder(userId)
          data.status = "Cancelado"
          await editOrder(userId, data);
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
            <Input holder="Buscar" icon="magnifying-glass" />
          </div>
          <div className="column is-fullwidth">
            {rol === "Administrador" ? (<Link to="/sale" className="button is-success is-fullwidth">
              <span className="icon">
              <i class="fa-solid fa-file-invoice"></i>
                <i class="fa-solid fa-plus"></i>
              </span>
            </Link>) : (<Link to="/order" className="button is-success is-fullwidth">
              <span className="icon">
                <i class="fa-solid fa-file-invoice"></i>
                <i class="fa-solid fa-plus"></i>
              </span> </Link>)}
          </div>
          {rol === "Administrador" && (
            <div className="column is-fullwidth">
              <Button
                text={<span className="icon">
                  <i class="fa-solid fa-file-pdf"></i>
                </span>}
                 color="primary"
                col="fullwidth"
                action={generatePDF}
              />            </div>
          )}
        </div>

        {rol === "Administrador" ? (
          // Mostrar datos para el rol de Administrador
          <Table
            headers={["id", "user", "create_at", "update_at", "total", "status"]}
            columns={[
              "ID",
              "Usuario",
              "Creado en",
              "Actualizado en",
              "Total",
              "Estado de venta",
            ]}
            edit={true}
            delete={true}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onContentClick={onContentClick}
            onDetail = {onContentClick}
            detail = {true}
            data={order}
          />
        ) : (
          // Mostrar datos para otros roles
          <Table
            headers={["#", "create_at", "update_at", "total", "status"]}
            columns={["#", "Creado en", "Actualizado en", "Total", "Estado de venta"]}
            edit={false}
            delete={true}
            onDeleteClick={handleDeleteClick}
            data={order.filter((item) => item.user === id)}
          />
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
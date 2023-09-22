// GENERACION DE PDF
import jsPDF from "jspdf";
import "jspdf-autotable";
import CryptoJS from "crypto-js";


import Logo from "../assets/img/Logo.png"; // Imagen que sera usada en el PDF

import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar.jsx";
import { ViewP } from "../components/ViewP.jsx";
import { Button } from "../components/Form/Button.jsx";
import { Input } from "../components/Form/Input.jsx";
import { Modal } from "../components/Modal.jsx";
import { Table } from "../components/Table/Table.jsx";
import { Notification } from "../components/Notification.jsx";


import { useRef } from "react";

import Cookies from "js-cookie";

// CONEXION CON LA API DE USERS Y ROLES
import {
  getProducts,
  createProduct,
  deleteProduct,
  getProduct,
  editProduct,
  updateProductStatus,
} from "../api/products.api.js";
import { getSupplies, getSupplie, getSupplieName } from "../api/supplies.api.js";
import { createContent, deleteContent, editContent, getContents } from "../api/content.api.js";
import { getUser } from "../api/users.api";
import { getUser as getclient } from "../api/clients.api";
// import {createContent} from "../api/"

export function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [contents, setContents] = useState([]);
  const [order, setOrder] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [ingredientes1, setIngredientes1] = useState([]);
  const [adicion, setadicion] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const User = useRef([]);
  const selectedOptionRef = useRef();
  const selectedOptionRef2 = useRef();
  const ingrediente = useRef();

  const encryptionKey = 'Yourburger';
  const encryptedUserData = localStorage.getItem('Token');
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedUserData, encryptionKey);
  const decryptedUserDataJSON = decryptedBytes.toString(CryptoJS.enc.Utf8);
  const userData = JSON.parse(decryptedUserDataJSON);


  //Generar PDF
  const generatePDF = async () => {
    const doc = new jsPDF();

    doc.addFont("helvetica", "normal");
    const fontSize = 10;

    const headers = [
      "#",
      "Nombre",
      "Precio",
      "Descripción",
    ];
    const tableData = await Promise.all(
      products.map(async (product, index) => [
        index + 1,
        product.name,
        product.price,
        product.description,

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
    doc.text(`REPORTE DE PRODUCTOS`, 50, 25);

    const today = new Date();
    const dateStr = today.toLocaleDateString();

    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${dateStr}`, 50, 30);

    doc.save("reporte_productos.pdf");
  };

  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState();
  const [notification, setNotification] = useState(null);


  // Variable para buscar productos


  useEffect(() => {

    const currentIngredients = ingredientes;
    const storedDetail = Cookies.get("orderDetail");
    if (storedDetail) {
      setOrder(JSON.parse(storedDetail));
    }
  }, [ingredientes]);
  useEffect(() => {
    const id = userData.token.user_id;
    const api = async () => {

      try {
        const resUser = await getUser(id);
        User.current = "Administrador"
      } catch (error) {
        User.current = "Cliente"
      }


    };
    api()
  }, []);


  const reloadDataTable = async () => {
    setProducts([]);

    setContents([]);
    setIngredientes([]);
    setIngredientes1([]);
    const res = await getContents();
    // Obtiene una matriz de promesas que resuelven los nombres de los roles
    const rolePromises = res.data.map((user) => getSupplieName(user.supplies));

    // Espera a que todas las promesas se resuelvan
    const roleNames = await Promise.all(rolePromises);

    // Combina los datos de usuario con los nombres de roles resueltos
    const usersWithRoles = res.data.map((user, index) => ({
      ...user,
      name: roleNames[index],
    }));
    setContents(usersWithRoles);
    const resProduct = await getProducts();
    setProducts(resProduct.data)
  };

  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm]);
  const handleOptionChange = (event) => {
    const option = supplies.find(
      (supplie) => supplie.name === event.target.value,
    );
    selectedOptionRef.current = option;
  };
  const handleOptionChangeaditions = (event) => {
    const option = supplies.find(
      (supplie) => supplie.name === event.target.value,
    );
    selectedOptionRef2.current = option;
  };
  const handleOptionChange1 = (event) => {
    const option = supplies.filter(
      (supplie) => supplie.id === parseInt(event.target.value),
    );
    selectedOptionRef.current = option[0];
  };
  //tal vez editar
  const anadirIngrediente = () => {
    if (selectedOptionRef.current != undefined) {
      ingredientes.push(selectedOptionRef.current);
      setIngredientes([...ingredientes]); // Actualiza el estado de ingredientes
    } else {
      console.log("error al añadir");
    }
  };
  const anadiradicion = () => {
    if (selectedOptionRef2.current != undefined) {
      adicion.push(selectedOptionRef2.current);
      setadicion([...ingredientes]); // Actualiza el estado de ingredientes
    } else {
      console.log("error al añadir adicion");
    }
  };

  const DeleteSuppplie = async (idSupplie) => {
    try {
      
        const ingredienteIndex = ingredientes.findIndex((ingrediente) => ingrediente.id === idSupplie);

        if (ingredienteIndex !== -1) {
          // Elimina el elemento del array ingredientes
          ingredientes.splice(ingredienteIndex, 1);
          // Actualiza el estado para reflejar el cambio
          setIngredientes([...ingredientes]);

        }else{
          console.log("error al eliminar");
        }
      
      
      setNotification({
        msg: "Ingrediente eliminado exitosamente!",
        color: "info",
        buttons: false,
        timeout: 3000,
      });
    } catch (error) {
      console.log(error);
      setNotification({
        msg: "Error al eliminar ingrediente!",
        color: "primary",
        buttons: false,
        timeout: 3000,
      });
    }
  };
  const DeleteAditions = async (idSupplie) => {
    try {
      
        const ingredienteIndex = adicion.findIndex((ingrediente) => ingrediente.id === idSupplie);

        if (ingredienteIndex !== -1) {
          // Elimina el elemento del array ingredientes
          adicion.splice(ingredienteIndex, 1);
          // Actualiza el estado para reflejar el cambio
          setadicion([...adicion]);
          
          setNotification({
            msg: "Adición eliminada exitosamente!",
            color: "info",
            buttons: false,
            timeout: 3000,
        
        });
        }else{
          setNotification({
            msg: "Error al eliminar adición!",
            color: "primary",
            buttons: false,
            timeout: 3000,
          });
        }
        
    } catch (error) {
      console.log(error);
      setNotification({
        msg: "Error al eliminar adición!",
        color: "primary",
        buttons: false,
        timeout: 3000,
      });
    }
  };



  const openModal = (
    title,
    fields,
    dataSelect,
    nameSelect,
    buttonSubmit,
    submit
  ) => {
    if (nameSelect === "supplies") {
      dataSelect = supplies.map((supplie) => ({
        value: supplie.id,
        label: supplie.name,
      }));
    }

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
    reloadDataTable()
  };

  const fieldsNew = [
    {
      title: "Producto",
      type: "text",
      name: "name",
      icon: "burger",
      col: "half",
      required: "true",
    },
    {
      title: "Precio",
      type: "number",
      name: "price",
      icon: "dollar",
      col: "half",
      required: "true",
    },
    {
      title: "Imagen",
      type: "file",
      name: "image",
      icon: "dollar",
      col: "half",
      require: true,
      multiple: false,
    },
    {
      title: "Descripción",
      type: "text",
      name: "description",
      icon: "comment",
      col: "half",
      required: "false",
    },
    {
      title: "Ingredientes",
      hasButton: true,
      textButton: "+",
      type: "select",
      name: "supplies",
      icon: "list",
      required: "false",
      col: "full",
      handleOptionChange: handleOptionChange,
      actionButton: anadirIngrediente,
    },
    {
      type: "list",
      columns: ['Nombre'],
      headers: ['name'],
      data: ingredientes,
      delete: true,
      onDeleteClick: DeleteSuppplie
    },
  ];

  // Conexion a API y obtiene datos de Productos y contenido
  useEffect(() => {
    async function fetchData() {
      const resP = await getProducts();
      const res = await getContents();
      // Obtiene una matriz de promesas que resuelven los nombres de los roles
      const rolePromises = res.data.map((user) => getSupplieName(user.supplies));

      // Espera a que todas las promesas se resuelvan
      const roleNames = await Promise.all(rolePromises);

      // Combina los datos de usuario con los nombres de roles resueltos
      const usersWithRoles = res.data.map((user, index) => ({
        ...user,
        name: roleNames[index],
      }));
      setContents(usersWithRoles);
      setProducts(resP.data);
    }

    async function fetchSupplies() {
      const res = await getSupplies();
      const ingre =  res.data
      setSupplies(ingre);
      ingrediente.current = ingre.filter((content) => !removeAccents(content.name.toLowerCase()).includes("adicion"));

    }

    fetchSupplies();
    fetchData();
  }, []);



  const handleCreateProduct = async (data) => {
    try {
      // anadirIngrediente(data);
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("price", data.price);
      formData.append("description", data.description);
      formData.append("status", true);

      // Agrega cada archivo individualmente
      for (let i = 0; i < data.image.length; i++) {
        formData.append("image", data.image[i]);
      }

      const produc = await createProduct(formData);

      for (let index = 0; index < ingredientes.length; index++) {
        const ingrediente = ingredientes[index];
        const formData1 = new FormData();
        formData1.append("product", produc.data.id);
        formData1.append("supplies", ingrediente.id);
        formData1.append("count", 1);

        await createContent(formData1);
      }

      reloadDataTable();
      setIngredientes([]);
      closeModal();
      setNotification({
        msg: "Producto creado exitosamente!",
        color: "success",
        buttons: false,
        timeout: 3000,
      });
    } catch (error) {
      console.error("Error al crear el Producto:", error);
      const errorMessages = {
        '{"name":["products with this name already exists."]}': "Ya existe ese Producto!",
        '{"name":["Ensure this field has no more than 50 characters."]}': "El producto sobrepasa los 50 caracteres!",
        '{"price":["Ensure this field has no more than 15 characters."]}': "El precio sobrepasa los 15 digitos!",

      };
      const errorMessage = errorMessages[error.response.request.responseText];
      if (errorMessage) {
        return setNotification({
          msg: errorMessage,
          color: "primary",
          buttons: false,
          timeout: 3000,
        });
      } else if (error.response.data.name == "products with this name already exists.") {
        return setNotification({
          msg: "Ya existe un Producto con ese Nombre",
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
      } else if (error.response.data.price) {
        return setNotification({
          msg: "El precio sobrepasa los 15 digitos!",
          color: "primary",
          buttons: false,
          timeout: 3000,
        });
      }
    }
    //si algo quitar esto
    reloadDataTable();
    closeModal();
  };

  const handleAddSupplies = () => {
    if (selectedOptionRef.current != undefined) {
      const res = selectedOptionRef.current
      const ingediente = {
        count: 1,
        products: "",
        supplies: res.id,
        name: res.name
      }
      ingredientes1.push(ingediente);
      setIngredientes1([...ingredientes1])
      console.log(ingredientes1);
    } else {
      console.log("error al añadir");
    }
  };
  const Combined = (content) => {
    const ingre = ingredientes1
    setIngredientes1([])
    content.map((object) => {
      ingre.push(object)
    })
    setIngredientes1([...ingre])
  }
  const handleEditClick = async (productId) => {
    const res = await getProduct(productId);
    const product = res.data;
    const content = contents.filter((content) => content.product == productId)
    Combined(content)


    const DeleteSuppplies = async (idSupplie) => {
      try {
        const contentIndex = content.filter((content) => content.supplies === idSupplie);

        if (contentIndex.length > 0) {
          await deleteContent(contentIndex[0].id);
          const ingredienteIndex = ingredientes1.findIndex((ingrediente) => ingrediente.supplies === idSupplie);
            ingredientes1.splice(ingredienteIndex, 1);
            setIngredientes1([...ingredientes1]);
        } else {
          const ingredienteIndex = ingredientes1.findIndex((ingrediente) => ingrediente.supplies === idSupplie);

          if (ingredienteIndex !== -1) {
            // Elimina el elemento del array ingredientes1
            ingredientes1.splice(ingredienteIndex, 1);
            // Actualiza el estado para reflejar el cambio
            setIngredientes1([...ingredientes1]);
          }
        }
        
        setNotification({
          msg: "Ingrediente eliminado exitosamente!",
          color: "info",
          buttons: false,
          timeout: 3000,
        });
      } catch (error) {
        console.log(error);
        setNotification({
          msg: "Error al eliminar ingrediente!",
          color: "primary",
          buttons: false,
          timeout: 3000,
        });
      }
    };



    const fieldsEdit = [
      {
        title: "Producto",
        type: "text",
        name: "name",
        icon: "burger",
        col: "half",
        required: "true",
        value: product.name,
      },
      {
        title: "Precio",
        type: "number",
        name: "price",
        icon: "dollar",
        col: "half",
        required: "true",
        value: product.price,
      },
      {
        title: "Imagen",
        type: "file",
        name: "image",
        icon: "image",
        col: "half",
        //value:product.image,   // Valor actual de la imagen del producto
        multiple: false,
      },
      {
        title: "Descripción",
        type: "text",
        name: "description",
        icon: "comment",
        col: "half",
        required: "false",
        value: product.description,
      },
      {
        type: "list",
        columns: ['Nombre'],
        headers: ['name'],
        data: ingredientes1,
        nameSelect: "name",
        keySelect: "supplies", // Utiliza el estado actualizado aquí
        delete: true,
        onDeleteClick: DeleteSuppplies, // Usa la función modificada
      },
      {
        title: "Ingredientes",
        hasButton: true,
        textButton: "+",
        type: "select",
        name: "supplies",
        icon: "list",
        required: "false",
        col: "full",
        customOptions: [{ "name": "no seleccionado", id: 0 }, ...supplies],
        nameSelect: "name",
        keySelect: "id",
        handleOptionChange: handleOptionChange1,
        actionButton: handleAddSupplies,
      },
    ];

    const handleEditProduct = async (data) => {
      console.log(data);
      const { id, name, price, image, description } = data;
      const product = await (await getProduct(productId)).data;
      const contentss = contents.filter(
        (content) => content.product === product.name
        //revisar
      );

      try {
        if (ingredientes1.length > 0) {
          for (let i = 0; i < ingredientes1.length; i++) {
            const element = ingredientes1[i];
            const suppli = {
              product: product.id,
              supplies: element.supplies,
              count: element.count
            }
            console.log(suppli);
            const contentIndex = content.filter((content) => content.supplies === suppli.supplies);
            if (contentIndex.length === 0) {
              await createContent(suppli)
              // await deleteContent(contentIndex[0].id)
            }
          }
        }
        const updateData = new FormData();
        updateData.append("name", data.name);
        updateData.append("price", data.price);
        // Agrega cada archivo individualmente
        for (let i = 0; i < data.image.length; i++) {
          updateData.append("image", data.image[i]);
        }

        updateData.append("description", data.description);

        const res = await editProduct(productId, updateData);
        const updatedProduct = res.data;

        if (contentss.length > 0) {
          for (let i = 0; i < contentss.length; i++) {
            const content = contents[i];
            const updateContent = new FormData();
            updateContent.append("product", id);
            updateContent.append("supplies", content.supplies);
            updateContent.append("count", content.count);

            await editContent(content.id, updateContent);
          }
        }

        closeModal();
        reloadDataTable();
        setNotification({
          msg: "Producto editado exitosamente!",
          color: "warning",
          buttons: false,
          timeout: 3000,
        });


        // Actualizar la lista de productos sin recargar la página
        setProducts((prevProducts) => {
          const updatedProducts = prevProducts.map((product) => {
            if (product.id === productId) {
              // Actualizar los datos del producto editado
              return {
                ...product,
                name: name,
                price: price,
                image: updatedProduct.image, // Actualizar el campo "image" con la URL de la nueva imagen
                description: description,
                // Actualizar otros campos si es necesario
              };
            }
            return product;
          });
          return updatedProducts;
        });
      } catch (error) {
        const errorMessages = {
          '{"name":["products with this name already exists."]}': "Ya existe ese producto!",
          '{"name":["Ensure this field has no more than 50 characters."]}': "El nombre del producto sobrepasa los 50 caracteres!",
          '{"price":["Ensure this field has no more than 15 characters."]}': "El precio del producto sobrepasa los 15 digitos!",

        };
        const errorMessage = errorMessages[error.response.request.responseText];
        if (errorMessage) {
          return setNotification({
            msg: errorMessage,
            color: "primary",
            buttons: false,
            timeout: 3000,
          });
        } else if (error.response.data.name == "products with this name already exists.") {
          return setNotification({
            msg: "Ya existe un producto con ese nombre!",
            color: "primary",
            buttons: false,
            timeout: 3000,
          });
        } else if (error.response.data.name == "Ensure this field has no more than 50 characters.") {
          return setNotification({
            msg: "El nombre del producto sobrepasa los 50 caracteres!",
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
        }

        console.error("Error al editar el Producto:", error);
      }
    };

    openModal(
      "Editar producto",
      fieldsEdit,
      products,
      "name",
      true,
      handleEditProduct
    );
  };
  function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  
  const handleAddclick = async (product) => {
    const suppliesProduct = await contents.filter(
      (content) => content.product == product.id
      //revisar
    );

    const adiciones = supplies.filter((content) => removeAccents(content.name.toLowerCase()).includes("adicion"));
    //revisar
    const fieldsAdd = [
      {
        title: "Producto",
        type: "text",
        name: "name",
        icon: "burger",
        col: "half",
        required: "true",
        value: product.name,
        readonly: true,
      },
      {
        title: "Precio",
        type: "number",
        name: "price",
        icon: "dollar",
        col: "half",
        required: "true",
        value: product.price,
        readonly: true,
      },
      {
        title: "Imagen",
        type: "image",
        name: "image",
        icon: "dollar",
        col: "full",
        image: product.image,
      },
      {
        title: "Descripción",
        type: "text",
        name: "description",
        icon: "comment",
        col: "full",
        required: "true",
        value: product.description,
        readonly: true,
      },
      {
        title: "Ingredientes",
        hasButton: true,
        textButton: "+",
        type: "select",
        name: "supplies",
        icon: "list",
        required: "false",
        col: "full",
        customOptions: [
          { id: 0, name: "No seleccionado" },
          ...suppliesProduct,
        ],
        nameSelect: "name",

        handleOptionChange: handleOptionChange,
        actionButton: anadirIngrediente,
      },
      {
        type: "list",
        columns: ['Nombre'],
        headers: ['name'],
        data: ingredientes,
        delete: true,
        onDeleteClick: DeleteSuppplie
      },
      {
        title: "Adiciones",
        hasButton: true,
        textButton: "+",
        type: "select",
        name: "supplies",
        icon: "list",
        required: "false",
        col: "full",
        customOptions: [
          { id: 0, name: "No seleccionado" },
          ...adiciones,
        ],
        nameSelect: "name",

        handleOptionChange: handleOptionChangeaditions,
        actionButton: anadiradicion,
      },
      {
        type: "list",
        columns: ['Nombre', 'Precio'],
        headers: ['name', 'price'],
        data: adicion,
        delete: true,
        onDeleteClick: DeleteAditions
      },
    ];

    const handleAdd = (data) => {
      const { name, price, description } = data;
      const idP = products.filter((product) => product.name === name);
    
      try {
        let existingOrderArray = [];
        const existingOrder = Cookies.get("orderDetail");
        if (existingOrder) {
          existingOrderArray = JSON.parse(existingOrder);
          // Verificar si un producto con los mismos ingredientes y adiciones ya existe
          const isProductInCart = existingOrderArray.some((item) => {
            return (
              item.id === idP[0].id &&
              item.aditions === adicion &&
              JSON.stringify(item.supplies) === JSON.stringify(ingredientes)
            );
          });
          if (isProductInCart) {
            setNotification({
              msg: "El producto con los mismos ingredientes y adiciones ya existe en el carrito.",
              color: "primary", // Cambiar el color a "primary"
              buttons: false,
              timeout: 3000,
            });
            return; // No agrega el producto nuevamente y sale de la función
          }
        }
    
        const newIndex = existingOrderArray ? existingOrderArray.length : 0;
    
        const data2 = {
          id: idP[0].id, // Usar un índice único para diferenciar los productos
          indexer: newIndex, // Agregar el campo indexer
          name,
          price,
          description,
          image: idP[0].image,
          supplies: [],
          aditions : [],
          amount: 1,
        };
        if (ingredientes.length > 0) {
          data2.supplies = ingredientes;
        } else {
          data2.supplies = suppliesProduct
        }
        if (adicion.length > 0) {
          data2.aditions = adicion;
        } else {
          data2.aditions = []
        }
        setOrder((prevOrder) => {
          Cookies.remove("orderDetail");
          const newOrder = [...prevOrder, data2];
          Cookies.set("orderDetail", JSON.stringify(newOrder));
          return newOrder;
        });
    
        closeModal();
        setNotification({
          msg: "El Producto fue añadido al Carrito!",
          color: "warning",
          buttons: false,
          timeout: 3000,
        });
      } catch (error) {
        console.log("Error al añadir al carrito: " + error);
      }
    };
    
    
    openModal(
      "Añadir al Carrito",
      fieldsAdd,
      false,
      "name",
      true,
      handleAdd
    );
  };

  const handleViewDetailsClicks = async (productId) => {
    const res = await getProduct(productId);
    const product = res.data;
    const content = contents.filter((content) => content.product == product.id)
    console.log(content);


    const fieldsview = [
      {
        title: "Producto",
        type: "text",
        name: "name",
        icon: "burger",
        col: "half",
        required: "true",
        value: product.name,
        readonly: true,
      },
      {
        title: "Precio",
        type: "number",
        name: "price",
        icon: "dollar",
        col: "half",
        required: "true",
        value: product.price,
        readonly: true,
      },
      {
        title: "Imagen",
        type: "image",
        name: "image",
        icon: "dollar",
        col: "full",
        image: product.image,
      },
      {
        title: "Descripción",
        type: "text",
        name: "description",
        icon: "comment",
        col: "full",
        required: "true",
        value: product.description,
        readonly: true,
      },
      {
        type: "list",
        columns: ['Nombre'],
        headers: ['name'],
        data: content,
      },
    ];

    openModal("Ver producto", fieldsview, products, "status", false);
  };

  const handleStatusChange = async (productId, status) => {
    try {
      await updateProductStatus(productId, !status);
      setNotification({
        msg: "Estado cambiado exitosamente!",
        color: "info",
        buttons: false,
        timeout: 3000,
      });

    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteClick = async (productId) => {
    setNotification({
      msg: "¿Seguro deseas eliminar el Producto?",
      color: "warning",
      buttons: true,
      timeout: 0,
      onConfirm: async () => {
        try {
          await deleteProduct(productId);
          setNotification({
            msg: "Producto eliminado exitosamente!",
            color: "info",
            buttons: false,
            timeout: 3000,
          });
          reloadDataTable();

        } catch {
          console.error("Error al eliminar:");
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
          <div className="column  is-fullwidth">
          <Input
            holder="Buscar"
            icon="magnifying-glass"
            onChange={(e) => setSearchTerm(e.target.value)} // Actualiza el término de búsqueda
          />          </div>
          {User.current == "Administrador" && <div className="column is-1">
            {/* <Table
              headers =  {[ "Nombre" , "Precio"]}
              key =  {[ "name" , "price"]}
              data = {[]}
            /> */}
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
                  "Nuevo producto",
                  fieldsNew,
                  [
                    {
                      id: 0,
                      name: "No seleccionado",
                      price: 0,
                      stock: 0,
                      status: true,
                    },
                    ...ingrediente.current,
                  ],
                  "name",
                  //revisar
                  true,
                  handleCreateProduct
                )
              }
            />
          </div>
          }
          {User.current == "Administrador" && <div className="column is-1">
            <Button
              text={<span className="icon">
                <i class="fa-solid fa-file-pdf"></i>
              </span>}
              color="primary"
              col="fullwidth"
              action={generatePDF}
            />

          </div>}
        </div>
        <ViewP
          onStatusClick={handleStatusChange}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          onViewDetails={handleViewDetailsClicks}
          onAdd={handleAddclick}
          data={filteredProducts}
          Administrador={User.current}
          generatePDF={generatePDF}
        />
      </div>

      {isOpen && (
        <Modal
          title={modalConfig.title}
          fields={modalConfig.fields}
          dataSelect={modalConfig.dataSelect}
          nameSelect={modalConfig.nameSelect}
          onClose={closeModal}
          buttonSubmit={modalConfig.buttonSubmit}
          submit={modalConfig.submit}
        />
      )}
    </div>
  );
}
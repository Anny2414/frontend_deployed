import { useEffect, useState, useRef } from "react";
import "../assets/css/OrderPage.css";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar.jsx";
import { Button } from "../components/Form/Button";
import Cookies from "js-cookie";
import { Detalle } from "../components/Detalle";
import { Info } from "../components/Info";
import { ModalSale } from "../components/modal.sale";
import { getContent, getContents } from "../api/content.api";
import { getSupplieName, getSupplies } from "../api/supplies.api";
import { getUsers } from "../api/users.api";
import { getclients } from "../api/clients.api";
import {
  createOrder,
  deleteOrder,
  editOrder,
  getOrder,
  getOrders,
} from "../api/order.api";
import { createDetail } from "../api/detail.api";
import { createContentO } from "../api/contentdetail.api";
import { Notification } from "../components/Notification";
import { Modal } from "../components/Modal";

export function OrderPage() {
  const [products, setProducts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState();
  const [ingredientes, setIngredientes] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [contents, setContents] = useState([]);
  const [total, setTotal] = useState(0);
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const selectedOptionRef = useRef();
  const selectedOptionRef2 = useRef();
  const ingredienteedit = useRef();
  const adicionRef = useRef([]);
  function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const resUser = await getUsers();
        const resclient = await getclients();
        setUsers(resUser.data);
        setClientes(resclient.data);
        setIsLoading(false); // Los datos han cargado, establece isLoading a false
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        setIsLoading(false); // Si ocurre un error, también establece isLoading a false
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    // Verifica si los datos han cargado antes de utilizar la variable username
    if (!isLoading) {
      const name = localStorage.getItem("username");
      const user = users.find((user) => user.username === name);
      const cliente = clientes.find((client) => client.username === name);
      if (name) {
        if (user) {
          setUsername(user.id);
        } else if (cliente) {
          setUsername(cliente.id);
        }
      } else {
        window.location.replace("/");
      }
    }
  }, [users, clientes, isLoading]);

  useEffect(() => {
    const calculateTotal = () => {
      let sum = 0;
      products.forEach((product) => {
        const totalProduct = parseInt(product.price) * parseInt(product.amount);
        let totaladitions = 0;
  
        // Suma el precio de las adiciones en el campo "aditions" si contienen la palabra "adicion"
        if (product.aditions && product.aditions.length > 0) {
          product.aditions.forEach((adition) => {
            // Comprueba si el nombre de la adición contiene la palabra "adicion" (sin importar mayúsculas/acentos)
            if (removeAccents(adition.name.toLowerCase()).includes("adicion")) {
              totaladitions += parseInt(adition.price);
            }
          });
        }
  
        sum += totalProduct + totaladitions || 0;
      });
      setTotal(sum);
    };
  
    calculateTotal();
  }, [products]);

  // const ingredientes = useRef([]);
  const a = [];
  const num = (number) => {
    a.push(number);
  };
  const delet = () => {
    a.length = 0;
  };
  useEffect(() => {
    const currentIngredients = ingredientes;
    const fech = async () => {
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
      const supplie = await getSupplies();
      setSupplies(supplie.data);
      setContents(usersWithRoles);
    };
    fech();
  }, [ingredientes]);

  useEffect(() => {
    const getStoredDetail = () => {
      const storedDetail = Cookies.get("orderDetail");
      if (storedDetail) {
        setProducts(JSON.parse(storedDetail));
      }
    };
    getStoredDetail();
  }, []);

  const handleOptionChange = (event) => {
    const option = supplies.find(
      (supplie) => supplie.id === parseInt(event.target.value)
    );
    selectedOptionRef.current = option;
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
  };

  const reloadDataTable = async () => {
    setProducts([]);
    const storedDetail = Cookies.get("orderDetail");
    if (storedDetail) {
      setProducts(JSON.parse(storedDetail));
    }
  };
  const submitButton = async (data) => {
    try {
      if (products.length > 0) {
        const user = username;
        const orderData = { user: user, total: total, status: "Por Pagar" };
        const respOrder = await createOrder(orderData);

        const formDataDetails = [];

        for (let i = 0; i < products.length; i++) {
          const product = products[i];

          const order = {
            order: respOrder.data.id,
            product: product.name,
            amount: product.amount,
            price: product.price,
            supplies: product.supplies,
          };
          const resDetail = await createDetail(order);

          for (let index = 0; index < order.supplies.length; index++) {
            const supplies = order.supplies[index];
            const suplie = {
              supplies: supplies.supplies,
              detail: resDetail.data.id,
            };

            await createContentO(suplie);
          }
        }
        setNotification({
          msg: "Pedido creado exitosamente!",
          color: "success",
          buttons: false,
          timeout: 3000,
        });
        Cookies.remove("orderDetail");
        setProducts([]);
        setIngredientes([]);
      } else {
        setNotification({
          msg: "No tienes productos añadidos!",
          color: "primary",
          buttons: false,
          timeout: 3000,
        });
      }
    } catch (error) {
      console.error("Error al crear el pedido:", error);
    }
  };

  const handleAmountChange = (productId, event) => {
    const updatedProducts = products.map((product) => {
      if (product.indexer === productId) {
        return { ...product, amount: parseInt(event.target.value) };
      }
      return product;
    });

    Cookies.set("orderDetail", JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    reloadDataTable();
  };

  const EditP = async (product) => {


    const clickDelete = (ingredientId) => {
      setNotification({
        msg: "¿Seguro deseas eliminar el ingrediente?",
        color: "warning",
        buttons: true,
        timeout: 0,
        onConfirm: async () => {
          try {
            const storedDetail = Cookies.get("orderDetail");
            if (storedDetail) {
              const orderDetail = JSON.parse(storedDetail);
              const updatedProducts = orderDetail.map((prod) => {
                if (prod.id === product.id) {
                  // Filtrar los ingredientes y eliminar el que coincida con ingredientId
                  prod.supplies = prod.supplies.filter(
                    (supplie) => supplie.supplies !== ingredientId
                  );
                }
                return prod;
              });
              const ingredie = ingredienteedit.current
              const i = ingredie.findIndex(
                (supplie) => supplie.supplies === ingredientId
              );
              ingredienteedit.current.splice(i, 1)

              Cookies.set("orderDetail", JSON.stringify(updatedProducts));
              reloadDataTable();
              const produ = updatedProducts.find((prod) => prod.id == product.id)

              // Actualiza la lista de ingredientes usando la función

              setNotification({
                msg: "Ingrediente eliminado exitosamente!",
                color: "success",
                buttons: false,
                timeout: 3000,
              });
            }
          } catch (error) {
            console.error("Error al eliminar:", error);
          }
        },
      });
    };


    const handleOptionChangeaditions = (event) => {
      const option = supplies.find(
        (supplie) => supplie.name === event.target.value,
      );
      console.log(option);
      selectedOptionRef2.current = option;
    };
    const anadiradicion = () => {
      setIngredientes([]);
      if (selectedOptionRef2.current != undefined) {
        ingredientes.push(selectedOptionRef2.current);
        const storedDetail = Cookies.get("orderDetail");
        if (storedDetail) {
          const orderDetail = JSON.parse(storedDetail);
          const updatedOrderDetail = orderDetail.map((producto) => {
            if (producto.id === producto.id) {
              // Verificar si el ingrediente ya existe en product.supplies
              const ingredien = producto.aditions.some(
                (supplie) => supplie.name === selectedOptionRef2.current.name
              );
              if (!ingredien) {
                const { name, price, id, status, stock } = selectedOptionRef2.current
                const dat = {
                  name,
                  price,
                  supplies: id,
                  status,
                  stock
                }
                producto.aditions.push(selectedOptionRef2.current);
                // Actualizar el estado de products
                adicionRef.current = producto.aditions
                console.log(adicionRef);
                console.log(producto.aditions);
                setProducts([...orderDetail]);
                product.aditions.push(selectedOptionRef2.current);
              }
            }
            return product;
          });
          Cookies.set("orderDetail", JSON.stringify(updatedOrderDetail));
          reloadDataTable();
        }
      } else {
        setNotification({
          msg: "No has selecionado un ingrediente",
          color: "primary",
          buttons: false,
          timeout: 3000,
        });
      }
    };

    const clickDeleteAdition = (ingredientId) => {
          try {
            const storedDetail = Cookies.get("orderDetail");
            if (storedDetail) {
              const orderDetail = JSON.parse(storedDetail);
              const updatedProducts = orderDetail.map((prod) => {
                if (prod.id === product.id) {
                  // Filtrar los ingredientes y eliminar el que coincida con ingredientId
                  prod.aditions = prod.supplies.filter(
                    (supplie) => supplie.supplies !== ingredientId
                  );
                }
                return prod;
              });
              const ingredie = adicionRef.current
              const i = ingredie.findIndex(
                (supplie) => supplie.supplies === ingredientId
              );
              adicionRef.current.splice(i, 1)

              Cookies.set("orderDetail", JSON.stringify(updatedProducts));
              reloadDataTable();

              // Actualiza la lista de ingredientes usando la función

              setNotification({
                msg: "Ingrediente eliminado exitosamente!",
                color: "success",
                buttons: false,
                timeout: 3000,
              });
            }
          } catch (error) {
            console.error("Error al eliminar:", error);
          }

    }

    const anadirIngrediente = () => {
      setIngredientes([]);
      if (selectedOptionRef.current != undefined) {
        ingredientes.push(selectedOptionRef.current);
        setIngredientes([...ingredientes]); // Actualiza el estado de ingredientes
        const storedDetail = Cookies.get("orderDetail");
        if (storedDetail) {
          const orderDetail = JSON.parse(storedDetail);
          const updatedOrderDetail = orderDetail.map((producto) => {
            if (producto.id === producto.id) {
              // Verificar si el ingrediente ya existe en product.supplies
              const ingredien = producto.supplies.some(
                (supplie) => supplie.name === selectedOptionRef.current.name
              );
              if (!ingredien) {
                const { name, price, id, status, stock } = selectedOptionRef.current
                producto.supplies.push(selectedOptionRef.current);
                // Actualizar el estado de products
                ingredienteedit.current = producto.supplies
                setProducts([...orderDetail]);
                product.supplies.push(selectedOptionRef.current);
              }
            }
            return product;
          });
          Cookies.set("orderDetail", JSON.stringify(updatedOrderDetail));
          reloadDataTable();
        }
      } else {
        setNotification({
          msg: "No has selecionado un ingrediente",
          color: "primary",
          buttons: false,
          timeout: 3000,
        });
      }
    };

    setIngredientes([]);
    ingredienteedit.current = (products.find((prod) => prod.id == product.id)).supplies
    adicionRef.current = (products.find((prod) => prod.id == product.id)).aditions
    console.log(ingredienteedit.current);
    console.log(adicionRef.current);
    const content = contents.filter(
      (content) => content.product == product.id
    );
    console.log(products);
    const adiciones = supplies.filter((content) => removeAccents(content.name.toLowerCase()).includes("adicion"));

    const FieldsEdit = [
      {
        title: "Ingredientes",
        hasButton: true,
        textButton: "+",
        type: "select",
        name: "supplies",
        icon: "list",
        required: "false",
        col: "full",
        customOptions: [{ name: "no seleccionado" }, ...content],
        nameSelect: "name",
        keySelect: "supplies",
        handleOptionChange: handleOptionChange,
        actionButton: anadirIngrediente,
      },
      {
        type: "list",
        columns: ["Nombre"],
        headers: ["name"],
        data: ingredienteedit.current,
        delete: true,
        onDeleteClick: clickDelete,
      },
      {
        title: "Adiciónes",
        hasButton: true,
        textButton: "+",
        type: "select",
        name: "supplies",
        icon: "list",
        required: "false",
        col: "full",
        customOptions: [{ name: "no seleccionado" }, ...adiciones],
        nameSelect: "name",
        keySelect: "supplies",
        handleOptionChange: handleOptionChangeaditions,
        actionButton: anadiradicion,
      },
      {
        type: "list",
        columns: ["Nombre", "Precio"],
        headers: ["name", "price"],
        data: adicionRef.current ? adicionRef.current : [],
        delete: true,
        onDeleteClick: clickDeleteAdition,
      },
    ];

    const submitEditar = (data) => {
      closeModal();
    };

    openModal(
      "Editar ingredientes",
      FieldsEdit,
      content,
      "name",
      true,
      submitEditar
    );
  };

  const removeProduct = (productIndexer) => {
    setNotification({
      msg: "¿Seguro deseas elminar el producto?",
      color: "warning",
      buttons: true,
      timeout: 0,
      onConfirm: async () => {
        try {
          const updatedProducts = products.filter(
            (product) => product.indexer != productIndexer
          );
          Cookies.set("orderDetail", JSON.stringify(updatedProducts));
          reloadDataTable();
          setNotification({
            msg: "Producto eliminado exitosamente!",
            color: "success",
            buttons: false,
            timeout: 3000,
          });
        } catch (error) {
          console.error("Error al eliminar el producto:", error);
        }
      },
    });
  };
  return (
    <div>
      <Navbar />
      <div className="container is-fluid mt-5 has-text-centered">
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
        <div className="columns ">
          <div className="column is-two-thirds">
            <div className="is-flex">
              <div className="is-justify-content-flex-start mr-auto">
                <h1 className="h1">Carrito</h1>
              </div>
              <div className="is-justify-content-flex-end ml-auto  mt-3">
                <Link to="/orders" className="button is-warning">
                  Tus pedidos
                </Link>
              </div>
            </div>
            <div className="hr"></div>
            <Detalle
              products={products}
              deleteP={removeProduct}
              handleAmountChange={handleAmountChange}
              EditP={EditP}
            />
          </div>
          <div className="column is-one-third">
            {/* <Info
                        products={products}
                        submitButton={submitButton}
                        reload={reloadDataTable}
                    /> */}

            <div className="card card-info">
              <div className="card-header px-2">
                <h1 className="h1">Detalle</h1>
              </div>
              <div className="card-content p-6">
                {products.map((product) => (
                  <div>
                    <div className="my-3" key={product.id}>
                      <div className="is-flex ">
                        <div className="producto">
                          <p>{product.name}</p>
                        </div>
                        <div className="valor">
                          <p>{product.price}</p>
                        </div>
                      </div>
                    </div>
                    <div className="hr"></div>
                  </div>
                ))}
                {/* <div className="mb-3">
            <div className="is-flex ">
              <div className="producto">
                <p>IVA</p>
              </div>
              <div className="valor">
                <p></p>
              </div>
            </div>
          </div>
          <div className="mb-3">
            <div className="is-flex ">
              <div className="producto">
                <p>Envio</p>
              </div>
              <div className="valor">
                <p></p>
              </div>
            </div>
          </div>
          <div className="mb-3">
            <div className="is-flex ">
              <div className="producto">
                <p>subtotal</p>
              </div>
              <div className="valor">
                <p></p>
              </div>
            </div>
          </div> */}
              </div>
              <div className="card-footer ">
                <div className="mb-3 p-6 ">
                  <div className="is-flex">
                    <div className="producto">
                      <h2>Total</h2>
                    </div>
                    <div className="valor">
                      <h2>{total}</h2>
                    </div>
                  </div>
                  <div className="hr"></div>
                </div>
                <div className="is-flex is-full">
                  <div className="m-auto pb-5">
                    <Button
                      text="Cancelar"
                      color="primary"
                      action={() => {
                        Cookies.remove("orderDetail");
                        reloadDataTable();
                      }}
                    />
                    <Button
                      text="Comprar"
                      color="success ml-3"
                      action={submitButton}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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

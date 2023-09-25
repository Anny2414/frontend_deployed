import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/img/only-text.png";
import { getclients } from "../api/clients.api";
import { Notification } from "./Notification";
import { getUsers } from "../api/users.api";
import { getPermissions } from "../api/permissions.api";
import CryptoJS from "crypto-js";
import Cookies from "js-cookie";

export function Navbar() {
  const [notification, setNotification] = useState(null);
  const [username, setUsername] = useState("");
  const [rol, setRol] = useState();
  const [permisos, setPermisos] = useState();
  const [bandera1, setBandera1] = useState(false)
  const encryptionKey = 'Yourburger';
  const encryptedUserData = localStorage.getItem('Token');
  if (!encryptedUserData) {
    window.location.replace("/login")

  }
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedUserData, encryptionKey);
  const decryptedUserDataJSON = decryptedBytes.toString(CryptoJS.enc.Utf8);
  const userData = JSON.parse(decryptedUserDataJSON);
useEffect(() => {
  const id = userData.token.user_id;
  const api = async () => {
    try {
      const resUser = await getUsers();
      const user = resUser.data.filter((user) => user.id === id);

      if (user.length > 0) {
        setUsername(user[0].username);
        setRol(user[0].role);
        const resPermiso = await getPermissions(user[0].role);
        setPermisos(resPermiso);
        localStorage.setItem('username', user[0].username);
      } else {
        const resClient = await getclients();
        const client = resClient.data.filter((client) => client.id === id);

        if (client.length > 0) {
          setUsername(client[0].username);
          setRol(client[0].role);
          const resPermiso = await getPermissions(client[0].role);
          setPermisos(resPermiso);
          setBandera1(true)
          localStorage.setItem('username', client[0].username);
        } else {
          window.location.replace("/login");
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  api();
}, []);
  useEffect(() => {
    const base = {
      Usuarios: "/users",
      Clientes: "/clients",
      Productos: "/products",
      Ingredientes: "/supplies",
      Pedidos: "/order",
      Roles: "/roles",
      Ventas: "/sales",
    }
    const pathname = window.location.pathname
    var bandera = true
    if (permisos) {
        console.log(pathname);
        permisos.forEach(element => {
          if (base[element] == pathname || pathname == "/" || pathname == "/home" || pathname == "/profile" || pathname == "/orders" || pathname == "/sale") {
            bandera = false
          }
        })
        console.log(bandera);
        if (bandera) {
          window.location.replace("/login")
        }
      }
  }, [permisos, bandera1])

  function cerrarSesion() {
    localStorage.removeItem("Token");
    localStorage.removeItem("name");
    localStorage.removeItem("username");
    Cookies.remove("orderDetail");
    location.replace("/");
  }
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-item">
          <Link to="/home">
            <img src={Logo} width="110" />
          </Link>
        </div>
        <a
          role="button"
          className="navbar-burger"
          aria-label="menu"
          aria-expanded="false"
          data-target="navbarBasicExample"
          onClick={toggleMenu}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div className={`navbar-menu ${isMenuOpen ? "is-active" : ""}`}>
        <div className="navbar-start">
          {permisos &&
            permisos.map((obj) => {
              
              if (obj === "Usuarios") {

                return (
                  <Link to="/users" className="navbar-item" key="Usuarios">
                    Usuarios
                  </Link>
                );
              } else if (obj === "Clientes") {
                return (
                  <Link to="/clients" className="navbar-item" key="Clientes">
                    Clientes
                  </Link>
                );
              } else if (obj === "Productos") {
                return (
                  <Link to="/products" className="navbar-item" key="Productos">
                    Productos
                  </Link>
                );
              } else if (obj === "Ingredientes") {
                return (
                  <Link
                    to="/supplies"
                    className="navbar-item"
                    key="Ingredientes"
                  >
                    Ingredientes
                  </Link>
                );
              } else if (obj === "Pedidos") {
                return (
                  <Link to="/order" className="navbar-item" key="Pedido">
                    Pedidos
                  </Link>
                );
              } else if (obj === "Roles") {
                return (
                  <Link to="/roles" className="navbar-item" key="Roles">
                    Roles
                  </Link>
                );
              } else if (obj === "Ventas") {
                return (
                  <Link to="/sales" className="navbar-item" key="Ventas">
                    Ventas
                  </Link>
                );
              }
              return null; // Return null for cases where obj does not match any condition
            })}
        </div>

        <div className="navbar-end">
          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link">{username}</a>

            <div className="navbar-dropdown">
              <Link to="/profile" className="navbar-item">
                Perfil
              </Link>
              <Link to="#" className="navbar-item" onClick={cerrarSesion}>
                Cerrar sesión
                {notification && (
                  <div className="o">
                    <div className="has-background-warning p-6 m-6">
                      <Notification
                        msg={notification.msg}
                        color={notification.color}
                        buttons={notification.buttons}
                        timeout={notification.timeout}
                        onClose={notification.onClose} 
                        onConfirm={notification.onConfirm}
                      />
                    </div>
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

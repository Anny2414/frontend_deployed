import React, { useState, useEffect } from "react";
import { Carga } from "../components/Carga";
import CryptoJS from "crypto-js";
import user from "../assets/img/user.png";
import { Notification } from "../components/Notification";
import {
  getUser as getClientUser,
  editUser as editClientUser,
} from "../api/clients.api";
import { Navbar } from "../components/Navbar";
import { Input } from "../components/Form/Input";
import { Button } from "../components/Form/Button";
import { getUser, editUser } from "../api/users.api";
import "../assets/css/accesos.css";

export function Profile() {
  const [showPassword, setShowPassword] = useState(false);
  const [mostrarCarga, setMostrarCarga] = useState(false);
  const [mensajeCarga, setMensajeCarga] = useState("");
  const [camposHabilitados, setCamposHabilitados] = useState(false);
  const [mostrarCambiarClave, setMostrarCambiarClave] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosProvenientesDeClientsAPI, setDatosProvenientesDeClientsAPI] =
    useState(false);
  const [botonCambiarClaveTexto, setBotonCambiarClaveTexto] =
    useState("Cambiar Clave");

  const mostrarPantallaDeCarga = (mensaje) => {
    setMostrarCarga(true);
    setMensajeCarga(mensaje);
    setTimeout(() => {
      setMostrarCarga(false);
      setMensajeCarga("");
    }, 1500);
  };

  const encryptionKey = "Yourburger";
  const encryptedUserData = localStorage.getItem("Token");
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedUserData, encryptionKey);
  const decryptedUserDataJSON = decryptedBytes.toString(CryptoJS.enc.Utf8);
  const userData = JSON.parse(decryptedUserDataJSON);
  const userId = userData.token.user_id;

  const [profileData, setProfileData] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notification, setNotification] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userApiResponse = await getUser(userId);
        console.log(userApiResponse);
        setProfileData({
          name: userApiResponse.data.name,
          lastname: userApiResponse.data.lastname,
          email: userApiResponse.data.email,
          phone: userApiResponse.data.phone,
          address: userApiResponse.data.address,
          document: userApiResponse.data.document,
          password: userApiResponse.data.password,
        });
        return;
      } catch (error) {}

      try {
        const clientUserResponse = await getClientUser(userId);
        const clientUserData = clientUserResponse.data;
        setProfileData({
          name: clientUserData.name,
          lastname: clientUserData.lastname,
          email: clientUserData.email,
          phone: clientUserData.phone,
          address: clientUserData.address,
          document: clientUserData.document,
          password: clientUserData.password,
        });
        setDatosProvenientesDeClientsAPI(true);
      } catch (error) {
        console.error(
          "Error al obtener datos del perfil desde clients api:",
          error
        );
      }
    };

    fetchData();
  }, [userId]);

  const habilitarCampos = () => {
    setCamposHabilitados(true);
    setModoEdicion(true);
  };
  const validateAdress = (value) => {
    if (!value.match(/^[a-zA-Z0-9#\- ]+$/)) {
      return {
        isValid: false,
        errorMessage: "Caracteres no válidos",
      };
    }
    return { isValid: true, errorMessage: "" };
  };
  const validateName = (value) => {
    if (!value.match(/^[A-Za-zÁ-ú\s]+$/)) {
      return {
        isValid: false,
        errorMessage: "Solo debe contener letras y espacios.",
      };
    }
    return { isValid: true, errorMessage: "" };
  };
  const validatenumber = (value) => {
    if (!value.match(/^[0-9]+$/)) {
      return {
        isValid: false,
        errorMessage: "Solo numeros",
      };
    }
    return { isValid: true, errorMessage: "" };
  };
  const validateEmail = (value) => {
    if (!value.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)) {
      return {
        isValid: false,
        errorMessage: "Formato inválido.",
      };
    }
    return { isValid: true, errorMessage: "" };
  };
  const [nameValidation, setNameValidation] = useState({
    isValid: true,
    errorMessage: "",
  });
  const [lastnameValidation, setlastnameValidation] = useState({
    isValid: true,
    errorMessage: "",
  });
  const [numberValidation, setnumberValidation] = useState({
    isValid: true,
    errorMessage: "",
  });
  const [emailValidation, setEmailValidation] = useState({
    isValid: true,
    errorMessage: "",
  });
  const [AddressValidation, setAddressValidation] = useState({
    isValid: true,
    errorMessage: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      const validation = validateName(value);
      setNameValidation(validation);
    } else if (name == "lastname") {
      const validation = validateName(value);
      setlastnameValidation(validation);
    } else if (name === "email") {
      const validation = validateEmail(value);
      setEmailValidation(validation);
    } else if (name === "phone") {
      const validation = validatenumber(value);
      setnumberValidation(validation);
    } else if (name === "address") {
      const validation = validateAdress(value);
      setAddressValidation(validation);
    }
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const cambiarClave = async () => {
    if (newPassword === '' || confirmPassword === '') {
      setNotification({
        msg: "Campos Vacíos",
        color: "primary",
        buttons: false,
        timeout: 3000,
      });
      return;
    }
    setNotification({
      msg: "¿Seguro deseas cambiar la contraseña?",
      color: "warning",
      buttons: true,
      timeout: 0,
      onConfirm: async () => {
        try {
          setNotification(null);
          mostrarPantallaDeCarga("Realizando Cambios...");
          if (
            newPassword === confirmPassword
          ) {
            if (datosProvenientesDeClientsAPI) {
              await editClientUser(userId, { password: newPassword });
            } else {
              await editUser(userId, { password: newPassword });
            }
            setNotification({
              msg: "Cambios realizados",
              color: "success",
              buttons: false,
              timeout: 1500,
            });
            setCamposHabilitados(false);
            setMostrarCambiarClave(false);

            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            setNotification({
              msg: "Las nuevas contraseñas no coinciden",
              color: "primary",
              buttons: false,
              timeout: 3000,
            });
          }
        } catch (error) {
          console.error("Error al cambiar la contraseña:", error);
        }
      },
    });
  };

  const guardarCambios = async () => {
    // Verificar las validaciones antes de intentar guardar los cambios
    if (
      !nameValidation.isValid ||
      !lastnameValidation.isValid ||
      !numberValidation.isValid ||
      !emailValidation.isValid ||
      !AddressValidation.isValid
    ) {
      setNotification({
        msg: "Por favor, corrige los errores en el formulario.",
        color: "primary",
        buttons: false,
        timeout: 3000,
      });
      return;
    }

    setNotification({
      msg: "¿cambiar Los datos del perfil?",
      color: "warning",
      buttons: true,
      timeout: 0,
      onConfirm: async () => {
        try {
          setNotification(null);
          mostrarPantallaDeCarga("Guardando cambios...");

          if (datosProvenientesDeClientsAPI) {
            await editClientUser(userId, profileData);
          } else {
            await editUser(userId, profileData);
          }
          setNotification({
            msg: "Cambios realizados",
            color: "success",
            buttons: false,
            timeout: 2000,
          });
          setCamposHabilitados(false);
          setModoEdicion(false); // Cambiar a modo visualización después de guardar los cambios
        } catch (error) {
          console.error("Error al guardar los cambios:", error);
        }
      },
    });
  };
  const handleButtonClick = () => {
    if (mostrarCambiarClave) {
      // Si los campos de cambiar clave están visibles, cambiar la contraseña
      cambiarClave();
    } else if (modoEdicion) {
      // Si estamos en modo edición, guardar los cambios generales
      guardarCambios();
    } else {
      habilitarCampos();
    }
  };

  const handleCambiarClaveClick = () => {
    if (mostrarCambiarClave) {
      // Si se muestra la pantalla de cambiar clave, cambia el texto del botón a "Perfil"
      setBotonCambiarClaveTexto("Cambiar Clave");
    } else {
      // Si no se muestra la pantalla de cambiar clave, cambia el texto del botón a "Cambiar Clave"
      setBotonCambiarClaveTexto("Perfil");
    }
    setMostrarCambiarClave(!mostrarCambiarClave);
    setModoEdicion(false); // Cambiar a modo visualización cuando se muestra la pantalla de cambiar clave

    // Si se muestra la pantalla de cambiar clave, deshabilita los campos; de lo contrario, habilítalos.
    setCamposHabilitados(!mostrarCambiarClave);
  };
  return (
    <div className="main-container3 ">
      <Navbar />

      <div className="hero-body z">
        {mostrarCarga ? (
          <Carga Texto={mensajeCarga} />
        ) : (
          <div className="columns">
            <div className="column is-two-fifths m-2 y">
              <div className="foto p-2">
                <img className="imagensita" src={user} alt="Logo" width="60%" />
                <div className="mb-3 mt-2">
                  <p>{localStorage.getItem("username")}</p>
                </div>
              </div>
              <div className="m-5 ">
                <div className=" border has-text-centered">
                  <b>Identificación</b>
                  <p>{profileData.document}</p>
                </div>
              </div>
              <div className="is-flex is-justify-content-center m-3">
                {!mostrarCarga && (
                  <div className="m-2">
                    {mostrarCambiarClave ? (
                      <Button
                        text="Guardar"
                        color="primary"
                        action={cambiarClave}
                      />
                    ) : (
                      <Button
                        text={modoEdicion ? "Guardar" : "Editar"}
                        color="primary"
                        action={handleButtonClick}
                      />
                    )}
                  </div>
                )}
                {!mostrarCarga && (
                  <div className="m-2">
                    <Button
                      text={botonCambiarClaveTexto}
                      color="primary"
                      action={handleCambiarClaveClick}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="column is-half m-1 y">
              <div className=" has-text-centered">
                {!notification && (
                  <div
                    className="m-3 mb-3"
                    style={{ borderBottom: "0.05px solid #abaaaa5b" }}
                  >
                    <h2
                      style={{
                        fontWeight: "bold",
                        fontSize: "18px",
                      }}
                    >
                      Actualiza
                    </h2>

                    <small>La Información de tu Perfil </small>
                  </div>
                )}
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
              {!mostrarCambiarClave ? (
                <div className="column m-4">
                  <div className="mt-3 ml-3">
                    <Input
                      value={profileData.name}
                      icon="user"
                      type="text"
                      name="name"
                      disabled={!camposHabilitados}
                      error={!nameValidation.isValid}
                      onChange={handleInputChange}
                    />
                    {!nameValidation.isValid && (
                      <p
                        className="error-message"
                        style={{ color: "red", fontSize: 12 }}
                      >
                        {nameValidation.errorMessage}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 ml-3">
                    <Input
                      value={profileData.lastname}
                      icon="user"
                      type="text"
                      name="lastname"
                      error={!lastnameValidation.isValid}
                      disabled={!camposHabilitados}
                      onChange={handleInputChange}
                    />
                    {!lastnameValidation.isValid && (
                      <p
                        className="error-message"
                        style={{ color: "red", fontSize: 11 }}
                      >
                        {lastnameValidation.errorMessage}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 ml-3">
                    <Input
                      value={profileData.phone}
                      icon="phone"
                      type="text"
                      name="phone"
                      error={!numberValidation.isValid}
                      disabled={!camposHabilitados}
                      onChange={handleInputChange}
                    />
                    {!numberValidation.isValid && (
                      <p
                        className="error-message"
                        style={{ color: "red", fontSize: 11 }}
                      >
                        {numberValidation.errorMessage}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 ml-3">
                    <Input
                      value={profileData.address}
                      icon="location-dot"
                      type="text"
                      name="address"
                      error={!AddressValidation.isValid}
                      disabled={!camposHabilitados}
                      onChange={handleInputChange}
                    />
                    {!AddressValidation.isValid && (
                      <p
                        className="error-message"
                        style={{ color: "red", fontSize: 11 }}
                      >
                        {AddressValidation.errorMessage}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 ml-3">
                    <Input
                      value={profileData.email}
                      icon="envelope"
                      type="text"
                      name="email"
                      error={!emailValidation.isValid}
                      disabled={!camposHabilitados}
                      onChange={handleInputChange}
                    />
                    {!emailValidation.isValid && (
                      <p
                        className="error-message"
                        style={{ color: "red", fontSize: 11 }}
                      >
                        {emailValidation.errorMessage}
                      </p>
                    )}
                  </div>
                </div>
              ) : null}

        

              {mostrarCambiarClave && (
                <div className="column is-full mt-6">
                  <div className="mb-5 mt-5">
                    <Input
                      placeholder="Nueva Clave"
                      holder="Nueva Contraseña "
                      icon="lock"
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={newPassword}
                      error={false}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                    <div className="mb-4">
                      <Input
                        placeholder="Confirmar Contraseña"
                        holder="Confirmar Contraseña "
                        icon="lock"
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={confirmPassword}
                        error={false}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <a className="contra" style={{ fontSize: '13px' }} href="#"onClick={() => setShowPassword(!showPassword)}>Mostrar Contraseñas</a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

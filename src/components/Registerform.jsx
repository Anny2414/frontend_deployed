import React, { useState, useEffect } from "react";
import { set, useForm } from "react-hook-form";
import "../assets/css/accesos.css";
import axios from "axios";
import { Notification } from "./Notification";
const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Estado para almacenar los valores de los campos del formulario
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [document, setDocument] = useState("");
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [roles, setRoles] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/yourburger/api/v1/roles/"
      );
      setRoles(response.data);
    } catch (error) {
      console.error(error);
    }
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
  const validateLastName = (value) => {
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
  };const validatephone = (value) => {
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
  const [phoneValidation, setphoneValidation] = useState({
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
  const handleRegister = async (e) => {
    if (password.length < 5 || password.length > 20) {
      setNotification({
        msg: "5-20 caracteres, min 1 mayúscula",
        color: "primary",
        buttons: false,
        timeout: 2800,
      });
      return; // Salir de la función sin enviar la petición
    }
    if (password !== confirmPassword) {

      setNotification({
        msg: "Las contraseñas no coinciden",
        color: "primary",
        buttons: false,
        timeout: 1000,
      });
      return; // Salir de la función sin enviar la petición
    }
    // Objeto con los datos del registro
    const userData = {
      username,
      email,
      password,
      document,
      name,
      lastname,
      address,
      phone,
      role: "Cliente", // Asignar el valor por defecto del rol
    };
    try {
      // Enviar los datos del registro al servidor
      const response = await axios.post(
        "http://127.0.0.1:8000/yourburger/register/",
        userData
      );
      console.log(response.data);
      setNotification({
        msg: "¡Usuario Creado exitosamente!",
        color: "primary",
        buttons: false,
      });
      setUsername("");
      setEmail("");
      setPassword("");
      setconfirmPassword("");
      setDocument("");
      setName("");
      setLastname("");
      setAddress("");
      setPhone(""); // Manejar la respuesta del servidor según sea necesario
      setTimeout(() => {
        window.location.href = "/";
      }, 2000); // Reemplaza "/login" con la URL correcta de tu vista de inicio de sesión
    } catch(error) {
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
  return (
    <section className="hero is-fullheight">
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
      <form className="form-registro" onSubmit={handleSubmit(handleRegister)}>
        <div className="hero-body has-text-centered">
          <div className="container">
            <div className="columns is-centered">
              <div className="column is-half has-background-white columna">
                <div className="card">
                  <header className="card-header">
                    <p className="pt-5" style={{ fontSize: "30px" }}>
                      Registro
                    </p>
                  </header>
                  <div className="p-3">
                    {Object.keys(errors).length > 0 && (
                      <div className="notification is-primary has-text-centered ">
                        Rellene todos los campos
                      </div>
                    )}
                  </div>
                  <div className="card-content">
                    <div className="is-row">
                      <div className="is columns m-2 p-2">
                        <div className=" is half">
                          <div className="p-2">
                            <input
                              className={`input ${ errors.document||!numberValidation.isValid? "is-primary" : ""
                              }`}
                              type="text"
                              name="document"
                              {...register("document", {
                                required: "Este campo es obligatorio",
                              })}
                              placeholder="Identificación"
                              value={document}
                              onChange={(e) => {
                                setDocument(e.target.value);
                                const validation = validatenumber(
                                  e.target.value
                                );
                                setnumberValidation(validation);
                              }}
                            />
                            {numberValidation.isValid ? null : (
                              <p className="help is-danger">
                                {numberValidation.errorMessage}
                              </p>
                            )}
                          </div>
                          <div className="p-2">
                            <input
                              className={`input ${
                                errors.name ||!nameValidation.isValid ? "is-primary" : ""
                              }`}
                              type="text"
                              {...register("name", {
                                required: "Este campo es obligatorio",
                              })}
                              name="name"
                              placeholder=" Primer nombre"
                              value={name}
                              onChange={(e) => {
                                setName(e.target.value);
                                const validation = validateName(
                                  e.target.value
                                );
                                setNameValidation(validation);
                              }}
                            />{nameValidation.isValid? null : (
                              <p className="help is-danger">
                                {nameValidation.errorMessage}
                              </p>
                            )}
                          </div>
                          <div className="p-2">
                            <input
                              className={`input ${
                                errors.email ||!emailValidation.isValid? "is-primary" : ""
                              }`}
                              type="text"
                              {...register("email", {
                                required: "Este campo es obligatorio",
                              })}
                              name="email"
                              placeholder="Correo"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                const validation = validateEmail(
                                  e.target.value
                                );
                                setEmailValidation(validation);
                              }}
                              
                            />
                            {emailValidation.isValid ? null : (
                              <p className="help is-danger">
                                {emailValidation.errorMessage}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className=" is half">
                          <div className="p-2">
                            <input
                              className={`input ${
                                errors.username ? "is-primary" : ""
                              }`}
                              type="text"
                              {...register("username", {
                                required: "Este campo es obligatorio",
                              })}
                              name="username"
                              placeholder="Usuario"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                            />
                            {errors.username ? (
                              <p className="help is-danger">
                                {errors.username.message}
                              </p>
                            ):null}
                          </div>
                          
                          <div className="p-2">
                            <input
                              className={`input ${
                                !lastnameValidation.isValid ? "is-primary" : ""
                              }`}
                              type="text"
                              {...register("lastname", {
                                required: "Este campo es obligatorio",
                              })}
                              name="lastname"
                              placeholder="Apellidos"
                              value={lastname}
                              onChange={(e) => {
                                setLastname(e.target.value);
                                const validation = validateLastName(
                                  e.target.value
                                );
                                setlastnameValidation(validation);
                              }}
                            />
                            {lastnameValidation.isValid ? null : (
                              <p className="help is-danger">
                                {lastnameValidation.errorMessage}
                              </p>
                            )}
                          </div>
                          <div className="p-2">
                            <input
                              className={`input ${
                                !phoneValidation.isValid ? "is-primary" : ""
                              }`}
                              type="text"
                              {...register("phone", {
                                required: "Este campo es obligatorio",
                              })}
                              name="phone"
                              placeholder="Telefono"
                              value={phone}
                              onChange={(e) => {
                                setPhone(e.target.value);
                                const validation = validatephone(
                                  e.target.value
                                );
                                setphoneValidation(validation);
                              }}
                            />
                            {phoneValidation.isValid ? null : (
                              <p className="help is-danger">
                                {phoneValidation.errorMessage}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="is-row mb-2 ml-2 mr-2 pl-2 pr-2">
                        <div className="is-full m-2 mr-3">
                          <input
                            className={`input ${
                              errors.address ? "is-primary" : ""
                            }`}
                            type="text"
                            {...register("address", {
                              required: "Este campo es obligatorio",
                            })}
                            name="address"
                            placeholder="Dirección"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                          />
                        </div>
                        <div className=" is columns p-2">
                          <div className="is column">
                            <div className="is-full">
                              <input
                                className={`input ${
                                  errors.password ? "is-primary" : ""
                                }`}
                                type="password"
                                {...register("password", {
                                  required: "Este campo es obligatorio",
                                })}
                                name="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="is column mr-1">
                            <div className="is-full ">
                              <input
                                className={`input ${
                                  errors.confirmPassword ? "is-primary" : ""
                                }`}
                                type="password"
                                {...register("confirmPassword", {
                                  required: "Este campo es obligatorio",
                                })}
                                name="confirmPassword"
                                placeholder="confirmar contraseña"
                                value={confirmPassword}
                                onChange={(e) =>
                                  setconfirmPassword(e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="button is-primary" type="submit">
                    Enviar
                  </button>
                  <br />
                  <br />
                  <a href="/" style={{ color: "black" }}>
                    ¿Ya tienes una cuenta?
                  </a>
                  <br />
                  <br />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export default RegisterForm;

import React, { useState } from "react";
import { Reset } from "../api/resetpassword.api";
import { Input } from "../components/Form/Input";
import { Carga } from "../components/Carga";
import "../assets/css/accesos.css";
import { Notification } from "../components/Notification";

export function ResetPassword() {
  const [response, setResponse] = useState(null);
  const [notification, setNotification] = useState(null);
  const [mostrarCarga, setMostrarCarga] = useState(false);
  const [mensajeCarga, setMensajeCarga] = useState("");

  const mostrarPantallaDeCarga = (mensaje) => {
    setMostrarCarga(true);
    setMensajeCarga(mensaje);
  };

  const ocultarPantallaDeCarga = () => {
    setMostrarCarga(false);
    setMensajeCarga("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      mostrarPantallaDeCarga("Cargando...");
      const response = await Reset(email);
      setResponse(response);
      if (response.status === 200) {
        setNotification({
          msg: "¡Contraseña Enviada!",
          color: "success",
          buttons: false,
          timeout: 2000,
          
        });

        setTimeout(() => {
            location.replace("/")
        }, 2000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      ocultarPantallaDeCarga(); // Oculta la pantalla de carga después de recibir una respuesta o un error
    }
  };

  const [email, setEmail] = useState("");

  return (
    <div className="main-container2">
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
      {mostrarCarga && (
        <div className="carga-overlay">
          <Carga Texto={mensajeCarga} />
        </div>
      )}
      <form className="" onSubmit={handleSubmit}>
        <div className="hero-body has-text-centered">
          <div className="container">
            <div className="columns is-centered">
              <div className="column is-half has-background-white columna">
                <div className="card">
                  <header className="card-header">
                    <p className="pt-5" style={{ fontSize: "30px" }}>
                      Recuperación
                    </p>
                  </header>
                  <div className="card-content">
                    <div>
                      <p className="m-2">
                        Recibirá su nueva clave en el correo con el que se ha
                        registrado.
                      </p>
            
                    </div>
                    <div className="mt-4 mb-5 ml-2 mr-2 pl-2 pr-2">
                      <Input
                        icon="user"
                        type="email"
                        name="email"
                        value={email}
                        holder="Ingrese su correo electrónico"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="card-footer">
                    <button className="button is-primary" type="submit">
                      Enviar Correo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

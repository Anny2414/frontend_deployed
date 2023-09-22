import React from "react";
import gifCarga from "../assets/img/carga.gif"; // Reemplaza con la ruta correcta a tu GIF

export function Carga({Texto}) {
  return (
    <div className="pantalla-carga">
      <div className="centrar-contenido">
        <img src={gifCarga} alt="Cargando..." style={{ width: '30%', height: '30%' }} />
        <p>{Texto}</p>
      </div>
    </div>
  );
  
}


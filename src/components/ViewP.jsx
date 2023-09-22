import React, { useState, useEffect } from "react";
import "../assets/css/ViewProducts.css";
import { Button } from "../components/Form/Button";
import { Link } from "react-router-dom";
import Logo from "../assets/img/burger.jpg";
import { SwitchP } from "../components/Form/SwitchP";

export function ViewP(props) {
  const { data, onEditClick, onDeleteClick, onViewDetails, onStatusClick, onAdd, Administrador } = props;

  // Usar un estado para almacenar los estados de los productos
  const [productStatus, setProductStatus] = useState(data.map(product => product.status));

  useEffect(() => {
    // Actualizar los estados de los productos cuando cambie 'data'
    setProductStatus(data.map(product => product.status));
  }, [data]);

  const handleSwitchChange = (productId, status) => {
    onStatusClick(productId, status);
    const updatedStatus = productStatus.map((s, index) =>
      index === productId ? !status : s
    );
    setProductStatus(updatedStatus);
  };

  return (
    <div className="product-grid">
      {data.map((product, index) => (
        <div className="card card-pedido p-5" key={product.id}>
          {Administrador === "Administrador" && (
            <div className="is-flex is-justify-content-center">
              <div className="mx-2">
                <Button
                  colorHTML="#FFC436"
                  type="button "
                  text={
                    <span className="icon has-text-white">
                      <i className="fa-solid fa-pencil"></i>
                    </span>
                  }
                  action={() => onEditClick(product.id)}
                />
              </div>
              <div>
                <Button
                  color="primary"
                  type="button"
                  text={
                    <span className="icon">
                      <i className="fa-solid fa-trash"></i>
                    </span>
                  }
                  action={() => onDeleteClick(product.id)}
                />
              </div>
              <div></div>
              {/* Mover el componente SwitchP aquí */}
              <SwitchP
                change={() => handleSwitchChange(index, productStatus[index])}
                checked={productStatus[index]}
              />
            </div>
          )}
          <br />
          <br />
          {/* <Link to="/"> */}
          <img
            className="image-product"
            src={product.image != null ? product.image : Logo}
            width="150"
            alt="Product"
          />
          {/* </Link> */}
          <b>
            <p>{product.name}</p>
          </b>
          <span>${product.price}</span>

          <div className="is-flex is-justify-content-center">
            <div className="is-justify-content-flex-start mt-3 mr-2">
              <Button
                color="warning"
                type="button"
                text={
                  <span className="icon">
                    Ver más
                  </span>
                }
                action={() => onViewDetails(product.id)}
              />
            </div>
            <div className="is-justify-content-flex-end ml-auto mt-3">
              <Button
                text={
                  <span>
                    {/* Agregar */}
                    <i className="fa-solid fa-cart-plus"></i>
                  </span>
                }
                color="success"
                action={() => onAdd(product)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

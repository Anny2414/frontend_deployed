import { useEffect, useState } from "react";
import React from "react";
import Logo from "../assets/img/burger.jpg";
import { Button } from "./Form/Button";
import { Input } from "./Form/Input";

export function ListProducts(props) {
  const { products, add } = props;
  const [count, setCount] = useState(0);
  const [quantities, setQuantities] = useState(Array(products.length).fill(1)); 

  useEffect(() => {
    const counts = 0;
    setCount(counts);
  }, []);

  const indexered = () => {
    setCount((prevCount) => prevCount + 1);
  };

  const handleQuantityChange = (event, index) => {
    const newQuantities = [...quantities];
    newQuantities[index] = parseInt(event.target.value);
    setQuantities(newQuantities);
  };
  



  return (
    <div className="list-products">
      <table className="table is-fullwidth header-list">
        <thead>
          {Array.isArray(products) ? (
            <tr>
              <th className="thProduct">Imagen</th>
              <th className="thProduct">Producto</th>
              <th className="thProduct">Precio</th>
              <th>Cantidad</th>
              <th>Añadir</th>
            </tr>
          ) : null}
        </thead>
        <tbody>
          {products.length > 0 ? (

            products.map((product, index) => (
              <tr key={index}>
                <td>
                  <img
                    src={product.image != null ? product.image : Logo}
                    width={50}
                    height={50}
                    alt="Image"
                  />
                </td>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={quantities[index] || 1}
                    onChange={(event) => handleQuantityChange(event, index)}
                    min={1}
                  />
                </td>
                <td>
                  <Button
                    text={
                      <span className="icon">
                        <i className="fa-sharp fa-solid fa-plus"></i>
                      </span>
                    }
                    color="success"
                    action={() => {
                      indexered();
                      add({
                        ...product,
                        indexer: count + index + 1,
                        amount: quantities[index] || 1,
                        contentOrder: [{ "name": "Tomate", "price": 2000 }],
                      });
                    }}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>No hay productos disponibles</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Button } from "./Form/Button";
import Cookies from "js-cookie";


export function Info(props) {
    const { products, reload, submitButton } = props;
    const [total, setTotal] = useState(0);
  
    useEffect(() => {
      const calculateTotal = () => {
        let sum = 0;
        products.forEach((product) => {
            const tota = parseInt(product.price) * parseInt(product.amount)
          sum += tota || 0 ;
        });
        setTotal(sum);
      };
  
      calculateTotal();
    }, [products]);
  
    return (
      <div className="card card-info">
        <div className="card-header px-2">
          <h1>Detalle</h1>
          <div className="hr"></div>
        </div>
        <div className="card-content p-6">
          {products.map((product) => (
            <div className="mb-3" key={product.id}>
              <div className="is-flex ">
                <div className="producto">
                  <p>{product.name}</p>
                </div>
                <div className="valor">
                  <p>{product.price}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="mb-3">
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
          </div>
        </div>
        <div className="card-footer ">
          <div className="mb-3 p-6">
            <div className="is-flex">
              <div className="producto">
                <h2>Total</h2>
              </div>
              <div className="valor">
                <h2>{total}</h2>
              </div>
            </div>
          </div>
          <div className="is-flex is-full">
            <div className="m-auto pb-5">
              <Button
                text="Cancelar"
                color="primary"
                action={() => {
                  Cookies.remove("orderDetail");
                  reload()
                }}
              />
              <Button
              text= "Comprar"
              color= "success ml-3"
              action = {submitButton}
              />
             
            </div>
          </div>
        </div>
      </div>
    );
  }
  
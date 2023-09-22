import React from "react";
import Logo from "../assets/img/burger.jpg";
import { Link } from "react-router-dom";
import { Button } from "./Form/Button";
import Cookies from "js-cookie";
import { Input } from "./Form/Input";
import { ModalSale } from "./modal.sale";
export function Detalle(props) {
    const { products, deleteP, EditP, handleAmountChange } = props;
    return (
        <div className="product-grid">
            {products.map((product) => (
                <div className="card-pedido p-5" key={product.id}>

                    <div className="mt-5">
                        <img
                            className="image-product"
                            src={product.image != null ? product.image : Logo}
                            width="150"
                            alt="Product"
                        />
                        <b>
                            <p>{product.name}</p>
                        </b>
                        <span>{product.price}$</span>
                        <input
                            className="input"
                            type="number"
                            defaultValue={product.amount}
                            onChange={(event) => handleAmountChange(product.indexer, event)}
                            min={1}
                        />
                    </div>
                    <div className="is-flex mt-5">
                        <Button
                            color="warning ml-auto mr-1"
                            text={
                                <span className="icon has-text-white">
                                  <i className="fa-solid fa-pencil"></i>
                                </span>
                              }
                            action={() => EditP(product)}
                        />
                        <Button
                            color="primary mr-auto ml-1"
                            text={<span className="icon">
                                <i className="fa-solid fa-trash"></i>
                            </span>}
                            action={() => deleteP(product.indexer)}
                        />
                    </div>
                </div>
            ))}
            <div className="card añadir card-pedido p-5">
                <Link to={"/products"} className="mas m-auto ">
                    <i className="fa-light fa-plus plus mas has-text-grey"></i>
                </Link>
            </div>
        </div>
    );
}

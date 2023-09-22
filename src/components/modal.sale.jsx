import React, { useState } from "react";

import { useForm } from "react-hook-form";

import { Table } from "./Table/Table";
import { Input } from "./Form/Input";
import { Button } from "./Form/Button";
import { Select } from "./Form/Select";
import { Switch } from "./Form/Switch";

export const ModalSale = (props) => {
    const { title, fields, onClose, buttonSubmit, dataSelect, nameSelect, submit } = props
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    return (
        <div>
            <div className="modal is-active">
                <form onSubmit={handleSubmit(submit)} encType="multipart/form-data">
                    <div className="modal-background"></div>
                    <div className="modal-card">
                        <header className="modal-card-head">
                            <p className="modal-card-title">{title}</p>
                            <button
                                className="delete"
                                aria-label="close"
                                name="new"
                                type="button"
                                onClick={onClose}
                            ></button>
                        </header>
                        <section className="modal-card-body">
                            <div className="container">
                                <div className="columns is-multiline">
                                    {fields.map((field, index) => (
                                        <div className={`column is-${field.col}`} key={index}>
                                            <div className="field is-vertical">
                                                <div className="field-label" style={{ marginRight: 0 }}>
                                                    <label className="label has-text-centered">
                                                        {field.title}
                                                    </label>
                                                </div>
                                                <div className="field-body">
                                                    <div className="field">
                                                        <div className="control has-icons-left">
                                                            {field.type === 'list' ? (
                                                                <div>
                                                                    {/* <Table
                                                                        columns={field.columns}
                                                                        headers={field.headers}
                                                                        data={field.data}
                                                                        delete={field.delete}
                                                                        onDeleteClick = {field.onDeleteClick}
                                                                    /> */}
                                                                    <table className="table is-fullwidth">
                                                                        <thead>
                                                                            <tr>
                                                                                {field.columns.map((column, index) => (
                                                                                    <th key={column}>{column}</th>
                                                                                ))}
                                                                                <th key={"delete"}></th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {field.data.map((ingrediente) => {
                                                                                return (
                                                                                    <tr key={ingrediente.id}>
                                                                                        <td>{ingrediente.name}</td>
                                                                                        <td>{ingrediente.price}</td>
                                                                                        <td>
                                                                                            {/* <Button
                                                                                                text={<span className="icon">
                                                                                                    <i className="fa-solid fa-trash"></i>
                                                                                                </span>}
                                                                                                color="primary"
                                                                                                action={() => field.onDeleteClick(ingrediente.id)} // Llamar a la función onDeleteClick con el ID del ingrediente
                                                                                            /> */}
                                                                                            <button
                                                                                                type="button"
                                                                                                className={`button is-primary`}
                                                                                                onClick={() => field.onDeleteClick(ingrediente.supplies || ingrediente.id)}
                                                                                            >
                                                                                                <span className="icon">
                                                                                                    <i className="fa-solid fa-trash"></i> </span>

                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>
                                                                                );
                                                                            })}
                                                                        </tbody>

                                                                    </table>
                                                                </div>
                                                            ) : (

                                                                <div>
                                                                    {/* {console.log(field)} */}
                                                                    <div>
                                                                        <Select
                                                                            action={{ ...register(field.name) }}
                                                                            fields={dataSelect}
                                                                            name={nameSelect}
                                                                            defaultValue={field.value}
                                                                            customOptions={field.customOptions}
                                                                            nameSelect={field.nameSelect}
                                                                            hasButton={field.hasButton}
                                                                            keySelect={field.keySelect}
                                                                            textButton={field.textButton}
                                                                            icon={field.icon}
                                                                            actionButton={field.actionButton}
                                                                            handleOptionChange={field.handleOptionChange}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <span className="icon is-small is-left">
                                                                <i className={`fas fa-${field.icon}`}></i>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <footer className="modal-card-foot">
                            <Button
                                text="Cancelar"
                                color="primary"
                                action={onClose}
                                type="button"
                            />
                            {buttonSubmit && <Button text="Confirmar" color="success" type="submit" />}
                        </footer>
                        <div className="notifications">
                            {Object.keys(errors).length > 0 && (
                                <div className="notification has-text-centered is-primary mt-5">
                                    <b>Rellene todos los campos</b>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};



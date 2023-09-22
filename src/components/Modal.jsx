import React, { useState, useEffect } from "react";
import { useRef } from "react";

import { useForm } from "react-hook-form";
import Logo from "../assets/img/burger.jpg";
import { Input } from "./Form/Input";
import { Button } from "./Form/Button";
import { Select } from "./Form/Select";
import { DefaultCheckedSwitch } from "./Form/DefaultCheckedSwitch";

export function Modal(props) {
  const [ingredientes, setIngredientes] = useState([]);

  const [inputDisabledState, setInputDisabledState] = useState({});

  const selectedOptionRef = useRef(props.editingUserRole);
  const isAdminSelected = useRef();

  const updateInputDisabledState = (selectedOption) => {
    isAdminSelected.current = selectedOption === "Administrador";

    setInputDisabledState(() => ({
      document: isAdminSelected.current,
      name: isAdminSelected.current,
      lastname: isAdminSelected.current,
      phone: isAdminSelected.current,
      address: isAdminSelected.current,
    }));
  };

  useEffect(() => {
    setIngredientes([]); // Reset ingredientes when the modal is opened
    const isAdmin = selectedOptionRef.current === "Administrador";

    if (props.title === "Nuevo usuario") {
      selectedOptionRef.current = "Administrador";
    }

    setInputDisabledState({
      document: isAdmin,
      name: isAdmin,
      lastname: isAdmin,
      phone: isAdmin,
      address: isAdmin,
    });

    updateInputDisabledState(selectedOptionRef.current);
  }, [props.isOpen]);

  const handleOptionChange = (event) => {
    const selectedIndex = event.target.selectedIndex;
    const selectedOptionText = event.target.options[selectedIndex].text;
    selectedOptionRef.current = selectedOptionText;

    updateInputDisabledState(selectedOptionText);
  };

  const {
    title,
    fields,
    onClose,
    dataSelect,
    nameSelect,
    buttonSubmit,
    button,
    submit,
  } = props;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
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
                        <label
                          className="label has-text-centered"
                          htmlFor={field.name}
                        >
                          {field.title}
                        </label>
                      </div>
                      {field.type === "text" ||
                        field.type === "number" ||
                        field.type === "password" ? (
                        <Input
                          id={field.name}
                          type={field.type}
                          read_only={field.readonly}
                          name={field.name}
                          value={field.value}
                          icon={field.icon}
                          disabled={inputDisabledState[field.name]}
                          action={{
                            ...register(field.name, {
                              required: !inputDisabledState[field.name],
                            }),
                          }}
                          error={errors[field.name]}
                        />
                      ) : field.type === "checkbox" ? (
                        <div className="field is-grouped is-grouped-centered">
                          <div className="control">
                            <DefaultCheckedSwitch
                              checked={field.checked}
                              action={{ ...register(field.title) }}
                            />
                          </div>
                        </div>
                      ) : field.type === "file" ? (
                        <Input
                          type={field.type}
                          name={field.name}
                          value={field.value}
                          icon={field.icon}
                          action={{
                            ...register(field.name, {
                              required: field.required,
                            }),
                            onChange: (e) => {
                              // Actualiza el valor del campo de imagen
                              field.value = e.target.files[0];
                            },
                          }}
                          error={errors[field.name]}
                        />
                      ) : field.type === 'list' ? (
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
                                    {field.headers.map((header, index) => (
                                      <td>{ingrediente[header]}</td>
                                    ))}
                                    <td>
                                      {field.onDeleteClick &&
                                        // <Button
                                        //   text={<span className="icon">
                                        //     <i className="fa-solid fa-trash"></i>
                                        //   </span>}
                                        //   color="primary"
                                        //   action={() => field.onDeleteClick(ingrediente.supplies||ingrediente.id)}
                                        // />
                                        <button
                                        type="button"
                                          className={`button is-primary`}
                                          onClick={() => field.onDeleteClick(ingrediente.supplies||ingrediente.id)}
                                        >
                                          <span className="icon">
                                            <i className="fa-solid fa-trash"></i> </span>

                                        </button>
                                      }
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>

                          </table>
                        </div>
                      ) : field.type === "file" ? (
                        <Input
                          type={field.type}
                          name={field.name}
                          value={field.value}
                          icon={field.icon}
                          action={{
                            ...register(field.name, {
                              required: field.required,
                            }),
                            onChange: (e) => {
                              // Actualiza el valor del campo de imagen
                              field.value = e.target.files[0];
                            },
                          }}
                          error={errors[field.name]}
                        />
                      ) : field.type === "image" ? (
                        <div className="is-flex is-justify-content-center">
                          <img
                            src={field.image != null ? field.image : Logo}
                            alt={field.name}
                            width={200}
                            className="mx-auto"
                          />
                        </div>
                      ) : (
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
                            handleOptionChange={
                              field.hasButton
                                ? field.handleOptionChange
                                : handleOptionChange
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <footer className="modal-card-foot">
            {buttonSubmit && (
              <Button text="Confirmar" color="success" type="submit" />
            )}
            <Button
              text="Cancelar"
              color="primary"
              action={onClose}
              type="button"
            />
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
  );
} 
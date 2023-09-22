import React, { useState, useEffect } from "react";

export const Input = (props) => {
  const {
    holder,
    icon,
    type,
    value,
    onChange,
    read_only,
    name,
    action,
    error,
    style,
    disabled,
  } = props;

  const styls = style || "";

  const handleKeyDown = (e) => {
    if (type === "number" && (e.key === "e" || e.key === "E")) {
      e.preventDefault();
    }
  };

  return (
    <div className="field-body">
      <div className="field">
        <div className="control has-icons-left">
          <input
            id={name}
            className={`input ${error ? "is-error" : ""} ${styls}`}
            type={type}
            placeholder={holder}
            defaultValue={value}
            disabled={disabled}
            onChange={onChange}
            onKeyDown={handleKeyDown} // Agregar este manejador de eventos
            name={name}
            readOnly={!!read_only}
            {...action}
          />
          <span className="icon is-small is-left">
            <i className={`fa-solid fa-${icon}`}></i>
          </span>
        </div>
      </div>
    </div>
  );
};

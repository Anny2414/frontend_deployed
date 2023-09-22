import React from "react";

export function Button(props) {
  const { text, color, col, action, type, disabled, colorHTML } = props;

  const buttonStyle = {
    backgroundColor: colorHTML, // Usar colorHTML como color de fondo si está definido
    borderColor: colorHTML,     // Usar colorHTML como color de borde si está definido
  };

  return (
    <button
      className={`button is-${color} is-${col}`}
      onClick={action}
      type={type}
      disabled={disabled}
      style={colorHTML ? buttonStyle : {}}
    >
      {text}
    </button>
  );
}

import React from "react";

export const Switch = (props) => {
  const { change, checked, click, action, disabled } = props;

  return (
    <label className={`switch ${disabled ? "disabled" : ""}`}>
      <input
        type="checkbox"
        onChange={change}
        checked={checked}
        onClick={click}
        disabled={disabled}
        {...action}
      />
      <span className="slider round"></span>
    </label>
  );
};

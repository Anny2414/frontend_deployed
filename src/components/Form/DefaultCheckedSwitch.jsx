import React from "react";

export const DefaultCheckedSwitch = ({
  change,
  checked,
  click,
  action,
  disabled,
}) => {
  return (
    <label className={`switch ${disabled ? "disabled" : ""}`}>
      <input
        type="checkbox"
        onChange={change}
        defaultChecked={checked}
        onClick={click}
        disabled={disabled}
        {...action}
      />
      <span className="slider round"></span>
    </label>
  );
};

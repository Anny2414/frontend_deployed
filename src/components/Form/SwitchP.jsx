import React from "react";

export const SwitchP = (props) => {
  const { change, checked, click, action } = props;

  return (
    <label className="switch-custom ">
      <input
        type="checkbox"
        onChange={change}
        defaultChecked={checked}
        onClick={click}
        {...action}

      />
      <span className="slider round"></span>
    </label>
  );
};

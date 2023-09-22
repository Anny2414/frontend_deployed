import React from "react";
import { Button } from "./Button";

export const Select = (props) => {
  const {
    fields,
    action,
    icon,
    name,
    defaultValue,
    customOptions,
    keySelect,
    hasButton,
    textButton,
    actionButton,
    handleOptionChange,
  } = props;

  if (hasButton) {
    return (
      <div className="field has-addons">
        <div className="control has-icons-left is-expanded">
          <span className="icon is-small is-left">
            <i className={`fa-solid fa-${icon}`}></i>
          </span>
          <div className="select is-fullwidth">
            <select onChange={handleOptionChange}>
              {(customOptions || fields).map((option, index) => (
                <option value={option[keySelect]} key={index}>
                  {option[name]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="control">
          <Button
            text={textButton}
            color="success"
            type="button"
            action={actionButton}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="field-body">
      <div className="field">
        <div className="control has-icons-left">
          <span className="icon is-small is-left">
            <i className={`fa-solid fa-${icon}`}></i>
          </span>
          <div className="select" style={{ minWidth: "100%" }}>
            <select
              {...action}
              onChange={handleOptionChange}
              style={{ minWidth: "100%" }}
              defaultValue={defaultValue}
            >
              {(customOptions || fields).map((option, index) => (
                <option value={option[keySelect]} key={index}>
                  {option[name]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

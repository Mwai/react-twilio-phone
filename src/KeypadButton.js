import React from "react";
import "./KeypadButton.css";

const KeypadButton = ({ children, handleClick, color = "", disabled }) => {
  return (
    <button disabled={disabled} className={`keypad-button ${color}`} onClick={handleClick}>
      {children}
    </button>
  );
};

export default KeypadButton;

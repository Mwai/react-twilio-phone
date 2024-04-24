import React,  { useState, useEffect } from "react";
import "./Dialler.css";
import KeypadButton from "./KeypadButton";

const Dialler = ({ number, setNumber, selectedCallerId, setSelectedCallerId }) => {
  const [callerIdArray, setCallerIdArray] = useState([]);

  useEffect(() => {
    // Fetch available caller IDs when component mounts
    fetchCallerIds();
  }, []);

  const fetchCallerIds = async () => {
    try {
      const response = await fetch("/.netlify/functions/api/caller-ids"); // Assuming your Express server is running on the same host
      const data = await response.json();
      setCallerIdArray(data.callerIDs);
    } catch (error) {
      console.error("Error fetching caller IDs:", error);
    }
  };

  const handleCallerIDChange = (event) => {
    setSelectedCallerId(event.target.value);
    setCurrentCallerId(event.target.value); // Call function to set the current caller ID
  };

  const setCurrentCallerId = async (callerID) => {
    try {
      const response = await fetch("/.netlify/functions/api/set-current-caller-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ callerID }),
      });
      const data = await response.json();
      console.log(data.message); // Log success message
    } catch (error) {
      console.error("Error setting current caller ID:", error);
    }
  };

  const handleNumberChange = event => {
    setNumber(event.target.value);
  };

  const handleBackSpace = () => {
    setNumber(number.substring(0, number.length - 1));
  };

  const handleNumberPressed = newNumber => {
    return () => {
      setNumber(`${number}${newNumber}`);
    };
  };

  return (
    <>
      {!selectedCallerId && (
        <div>
          <select
            className="custom-select"
            id="callerIds"
            value={selectedCallerId}
            onChange={handleCallerIDChange}
          >
            <option>Select Caller ID</option>
            {callerIdArray.map((phoneNumber, index) => (
              <option key={index} value={phoneNumber}>
                {phoneNumber}
              </option>
            ))}
          </select>
        </div>
      )}
      {selectedCallerId && (
        <>
          <p>Caller ID: {selectedCallerId}</p>
          <div className="input-container">
            <span className="icon">+254</span>
            <input
              type="tel"
              value={number}
              onChange={handleNumberChange}
              className="input"
              placeholder="712345678"
            />
          </div>
        </>
      )}
      {/* <ol className="keypad">
        <li>
          <KeypadButton handleClick={handleNumberPressed("1")}>1</KeypadButton>
        </li>
        <li>
          <KeypadButton handleClick={handleNumberPressed("2")}>2</KeypadButton>
        </li>
        <li>
          <KeypadButton handleClick={handleNumberPressed("3")}>3</KeypadButton>
        </li>
        <li>
          <KeypadButton handleClick={handleNumberPressed("4")}>4</KeypadButton>
        </li>
        <li>
          <KeypadButton handleClick={handleNumberPressed("5")}>5</KeypadButton>
        </li>
        <li>
          <KeypadButton handleClick={handleNumberPressed("6")}>6</KeypadButton>
        </li>
        <li>
          <KeypadButton handleClick={handleNumberPressed("7")}>7</KeypadButton>
        </li>
        <li>
          <KeypadButton handleClick={handleNumberPressed("8")}>8</KeypadButton>
        </li>
        <li>
          <KeypadButton handleClick={handleNumberPressed("9")}>9</KeypadButton>
        </li>
        <li>
          <KeypadButton handleClick={handleNumberPressed("+")}>+</KeypadButton>
        </li>
        <li>
          <KeypadButton handleClick={handleNumberPressed("0")}>0</KeypadButton>
        </li>
        {number.length > 0 && (
          <li>
            <KeypadButton handleClick={handleBackSpace}>&lt;&lt;</KeypadButton>
          </li>
        )}
      </ol> */}
    </>
  );
};

export default Dialler;

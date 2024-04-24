import React from "react";

const Incoming = ({ connection, device }) => {
  const acceptConnection = () => {
    connection.accept();
  };
  const rejectConnection = () => {
    connection.reject();
  };
  return (
    <>
      <div className="call-options">
        <button className="keypad-button" onClick={acceptConnection}>Accept</button>
      </div>
      <button className="keypad-button red" onClick={rejectConnection}>Reject</button>
    </>
  );
};

export default Incoming;

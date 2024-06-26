import React, { useState, useEffect } from "react";
import { Device } from "twilio-client";
import Dialler from "./Dialler";
import KeypadButton from "./KeypadButton";
import Incoming from "./Incoming";
import OnCall from "./OnCall";
import "./Phone.css";
import states from "./states";
// import FakeState from "./FakeState";

const Phone = ({ token, selectedCallerId }) => {
  const [state, setState] = useState(states.CONNECTING);
  const [number, setNumber] = useState("");
  const [conn, setConn] = useState(null);
  const [device, setDevice] = useState(null);

  useEffect(() => {
    const device = new Device();

    device.setup(token, { debug: true });

    device.on("ready", () => {
      setDevice(device);
      setState(states.READY);
    });
    device.on("connect", connection => {
      console.log("Connect event");
      setConn(connection);
      setState(states.ON_CALL);
    });
    device.on("disconnect", () => {
      setState(states.READY);
      setConn(null);
    });
    device.on("incoming", connection => {
      setState(states.INCOMING);
      setConn(connection);
      connection.on("reject", () => {
        setState(states.READY);
        setConn(null);
      });
    });
    device.on("cancel", () => {
      setState(states.READY);
      setConn(null);
    });
    device.on("reject", () => {
      setState(states.READY);
      setConn(null);
    });

    return () => {
      device.destroy();
      setDevice(null);
      setState(states.OFFLINE);
    };
  }, [token]);

  useEffect(() => {
    isNumberValid()
  }, [number]);

  const handleCall = () => {
    setState(states.CONNECTING)
    const keNumber = `+254${number}`
    device.connect({ To: keNumber });
  };

  const handleHangup = () => {
    device.disconnectAll();
  };
  const isNumberValid = () => {
    // Regular expression to match Kenyan phone numbers
    const kenyanPhoneNumberRegex = /^(?:\+?254|0)(?:\d{9}|7(?:[0-6]\d{7}|7[7-9]\d{6}))$/;
    const keNumber = `+254${number}`
    // Test the input phone number against the regular expression
    return kenyanPhoneNumberRegex.test(keNumber);
  }

  let render;
  if (conn) {
    if (state === states.INCOMING) {
      render = <Incoming device={device} connection={conn}></Incoming>;
    } else if (state === states.ON_CALL) {
      render = <OnCall handleHangup={handleHangup} connection={conn}></OnCall>;
    }
  } else {
    render = (
      <>
        <Dialler number={number} 
        setNumber={setNumber} 
        selectedCallerId={selectedCallerId} 
        ></Dialler>
        {selectedCallerId && state === states.READY && (
          <div className="call">
            <KeypadButton handleClick={handleCall} disabled={!isNumberValid()} color="green">
              Call 
            </KeypadButton>
          </div>
        )}
      </>
    );
  }
  return (
    <>
      {/* <FakeState
        currentState={state}
        setState={setState}
        setConn={setConn}
      ></FakeState> */}
      {render}
      <p className="status">{state}</p>
    </>
  );
};

export default Phone;

import React, { useState, useEffect } from "react";
import "./App.css";
import Phone from "./Phone";

const App = () => {
  const [token, setToken] = useState(null);
  const [clicked, setClicked] = useState(false);
  const [callerIdArray, setCallerIdArray] = useState([]);
  const [selectedCallerId, setSelectedCallerId] = useState("");

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
    const callerID = event.target.value
    if (!clicked) {
      setClicked(true);
      const identity = `webDialer${callerID}`;
      fetch(`/.netlify/functions/api/voice/token?identity=${encodeURIComponent(identity)}`)
        .then(response => response.json())
        .then(({ token }) => setToken(token));
    }
    setSelectedCallerId(callerID);
    setCurrentCallerId(callerID); // Call function to set the current caller ID
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

  return (
    <div className="app">
      <header className="App-header">
        <h1>Web Dialer</h1>
      </header>

      <main>
        {!clicked && !selectedCallerId && (
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
        {token ? <Phone token={token} selectedCallerId={selectedCallerId}></Phone> : <p>...</p>}
      </main>

      <footer>
        <p>
        </p>
      </footer>
    </div>
  );
};

export default App;

import React, { useState } from "react";
import "./App.css";
import Phone from "./Phone";

const App = () => {
  const [token, setToken] = useState(null);
  const [clicked, setClicked] = useState(false);
  const identity = "WebTestPhone";

  const handleClick = () => {
    setClicked(true);
    fetch(`/voice/token?identity=${encodeURIComponent(identity)}`)
      .then(response => response.json())
      .then(({ token }) => setToken(token));
  };

  return (
    <div className="app">
      <header className="App-header">
        <h1>Web Dialer</h1>
      </header>

      <main>
        {!clicked && <button onClick={handleClick}>Connect to Phone</button>}

        {token ? <Phone token={token}></Phone> : <p>...</p>}
      </main>

      <footer>
        <p>
        </p>
      </footer>
    </div>
  );
};

export default App;

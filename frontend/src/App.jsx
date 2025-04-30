import React from "react";
import Register from "./components/Register";
import Transfer from "./components/Transfer";


function App() {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Crypto Phone Pay</h1>
      <Register/>
      <Transfer/>
    </div>
  );
}

export default App;
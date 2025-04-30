import React, { useState } from "react";
import axios from "axios";

function Register() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    try {
      const response = await axios.post("http://localhost:5000/register", { phoneNumber });
      setMessage(`Registered! Wallet: ${response.data.walletAddress}`);
    } catch (error) {
      setMessage(error.response?.data.error || "Error registering");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Phone Number (e.g., +1234567890)"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>
      <p>{message}</p>
    </div>
  );
}

export default Register;
import React, { useState, useEffect } from "react";
import axios from "axios";

function Transfer() {
  const [senderPhone, setSenderPhone] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [transactions, setTransactions] = useState([]);

  const handleTransfer = async () => {
    try {
      const response = await axios.post("http://localhost:5000/transfer", {
        senderPhone,
        recipientPhone,
        amount,
      });
      setMessage(`Transfer successful! Tx: ${response.data.txHash}`);
      fetchTransactions();
    } catch (error) {
      setMessage(error.response?.data.error || "Error transferring");
    }
  };

  const fetchTransactions = async () => {
    if (senderPhone) {
      const response = await axios.get(`http://localhost:5000/transactions/${senderPhone}`);
      setTransactions(response.data);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [senderPhone]);

  return (
    <div>
      <h2>Send Funds</h2>
      <input
        type="text"
        placeholder="Your Phone Number"
        value={senderPhone}
        onChange={(e) => setSenderPhone(e.target.value)}
      />
      <input
        type="text"
        placeholder="Recipient Phone Number"
        value={recipientPhone}
        onChange={(e) => setRecipientPhone(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount (SC)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleTransfer}>Send</button>
      <p>{message}</p>
      <h3>Transaction History</h3>
      <ul>
        {transactions.map((tx) => (
          <li key={tx.id}>
            {tx.sender_phone} → {tx.recipient_phone}: {tx.amount} SC (Tx: {tx.tx_hash})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Transfer;
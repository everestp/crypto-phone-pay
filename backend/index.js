const express = require("express");
const cors = require("cors");
const db = require("./db");
const { createWallet, sendTransaction } = require("./crypto");

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

// Register user
app.post("/register", async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ error: "Phone number required" });

  const existing = await new Promise((resolve) =>
    db.get("SELECT * FROM users WHERE phone_number = ?", [phoneNumber], (err, row) => resolve(row))
  );
  if (existing) return res.status(400).json({ error: "Phone number already registered" });

  const { address, encryptedPrivateKey } = createWallet();
  await new Promise((resolve) =>
    db.run(
      "INSERT INTO users (phone_number, wallet_address, encrypted_private_key) VALUES (?, ?, ?)",
      [phoneNumber, address, encryptedPrivateKey],
      resolve
    )
  );

  res.json({ message: "User registered", walletAddress: address });
});

// Send funds
app.post("/transfer", async (req, res) => {
  const { senderPhone, recipientPhone, amount } = req.body;
  if (!senderPhone || !recipientPhone || !amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const txHash = await sendTransaction(senderPhone, recipientPhone, amount, db);
    res.json({ message: "Transfer successful", txHash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction history
app.get("/transactions/:phoneNumber", async (req, res) => {
  const { phoneNumber } = req.params;
  const transactions = await new Promise((resolve) =>
    db.all(
      "SELECT * FROM transactions WHERE sender_phone = ? OR recipient_phone = ?",
      [phoneNumber, phoneNumber],
      (err, rows) => resolve(rows)
    )
  );
  res.json(transactions);
});

app.listen(port, () => console.log(`Backend running on port ${port}`));
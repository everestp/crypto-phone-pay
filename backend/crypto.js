const { ethers } = require("ethers");
require("dotenv").config();

// Encryption for private keys
const aesjs = require("aes-js");
const encryptionKey = aesjs.utils.utf8.toBytes(process.env.ENCRYPTION_KEY);

function encrypt(text) {
  const bytes = aesjs.utils.utf8.toBytes(text);
  const aesCtr = new aesjs.ModeOfOperation.ctr(encryptionKey);
  const encrypted = aesCtr.encrypt(bytes);
  return aesjs.utils.hex.fromBytes(encrypted);
}

function decrypt(hex) {
  const bytes = aesjs.utils.hex.toBytes(hex);
  const aesCtr = new aesjs.ModeOfOperation.ctr(encryptionKey);
  const decrypted = aesCtr.decrypt(bytes);
  return aesjs.utils.utf8.fromBytes(decrypted);
}

// Create wallet
function createWallet() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    encryptedPrivateKey: encrypt(wallet.privateKey),
  };
}

// Send StableCoin transaction
async function sendTransaction(senderPhone, recipientPhone, amount, db) {
  const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
  const sender = await new Promise((resolve) =>
    db.get("SELECT * FROM users WHERE phone_number = ?", [senderPhone], (err, row) => resolve(row))
  );
  const recipient = await new Promise((resolve) =>
    db.get("SELECT * FROM users WHERE phone_number = ?", [recipientPhone], (err, row) => resolve(row))
  );

  if (!sender || !recipient) throw new Error("User not found");

  const privateKey = decrypt(sender.encrypted_private_key);
  const wallet = new ethers.Wallet(privateKey, provider);

  // StableCoin ABI (minimal)
  const abi = [
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function balanceOf(address account) public view returns (uint256)",
  ];
  const contract = new ethers.Contract(process.env.STABLECOIN_ADDRESS, abi, wallet);

  // Check balance
  const balance = await contract.balanceOf(sender.wallet_address);
  const amountWei = ethers.utils.parseUnits(amount.toString(), 18);
  if (balance.lt(amountWei)) throw new Error("Insufficient balance");

  // Send transaction
  const tx = await contract.transfer(recipient.wallet_address, amountWei);
  await tx.wait();

  // Log transaction
  await new Promise((resolve) =>
    db.run(
      "INSERT INTO transactions (sender_phone, recipient_phone, amount, tx_hash) VALUES (?, ?, ?, ?)",
      [senderPhone, recipientPhone, amount, tx.hash],
      resolve
    )
  );

  return tx.hash;
}

module.exports = { createWallet, sendTransaction };
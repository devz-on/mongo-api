import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "test";
const collectionName = process.env.COLLECTION_NAME || "apikeys";

export default async function handler(req, res) {
  const { days } = req.query;

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!days || isNaN(days) || Number(days) <= 0) {
    return res.status(400).json({ error: "Invalid number of days" });
  }

  if (!uri) {
    return res.status(500).json({ error: "MONGODB_URI not configured" });
  }

  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection(collectionName);

    const key = cryptoKey();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + Number(days) * 24 * 60 * 60 * 1000);

    const doc = {
      key: key,
      duration: Number(days),
      expiryDate: expiresAt,
      createdAt: createdAt
    };

    await col.insertOne(doc);
    return res.json({ success: true, key, expires_at: expiresAt.toISOString() });
  } catch (err) {
    console.error("create error:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    if (client) await client.close();
  }
}

function cryptoKey() {
  // 40-char alphanumeric uppercase key
  return Array.from(cryptoRandomBytes(20)).map(b => ("0" + b.toString(16)).slice(-2)).join("").toUpperCase().slice(0, 20);
}

function cryptoRandomBytes(n) {
  // Node's crypto module is available via globalThis.crypto in newer Node.
  // Fallback to require('crypto') if not present.
  try {
    if (globalThis.crypto && globalThis.crypto.getRandomValues) {
      const arr = new Uint8Array(n);
      globalThis.crypto.getRandomValues(arr);
      return arr;
    }
  } catch {}
  // fallback:
  const crypto = awaitImportCrypto();
  return crypto.randomBytes(n);
}

function awaitImportCrypto() {
  // synchronous fallback to require
  try {
    // eslint-disable-next-line no-undef
    return require("crypto");
  } catch (e) {
    throw new Error("No crypto available");
  }
}

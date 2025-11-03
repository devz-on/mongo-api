import { MongoClient } from "mongodb";

const uri = "mongodb+srv://bhoot00:devilxevilx@bhoot00.jr6dw.mongodb.net/?retryWrites=true&w=majority&appName=bhoot00";
const client = new MongoClient(uri);
const dbName = "DevzAssistant";
const collectionName = "keys";

export default async function handler(req, res) {
  const { days } = req.query;

  if (!days || isNaN(days)) {
    return res.status(400).json({ error: "Invalid number of days" });
  }

  try {
    await client.connect();
    const db = client.db(dbName);
    const keys = db.collection(collectionName);

    const key = Math.random().toString(36).substring(2, 12).toUpperCase();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + days * 24 * 60 * 60 * 1000);

    await keys.insertOne({
      user_key: key,
      days_valid: Number(days),
      created_at: createdAt,
      expires_at: expiresAt,
    });

    res.json({ success: true, key, expires_at: expiresAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
}

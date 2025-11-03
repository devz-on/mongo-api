import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "DevzAssistant";
const collectionName = process.env.COLLECTION_NAME || "keys";

export default async function handler(req, res) {
  const { key } = req.query;

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!key) return res.status(400).json({ error: "Key is required" });
  if (!uri) return res.status(500).json({ error: "MONGODB_URI not configured" });

  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection(collectionName);

    const result = await col.deleteOne({ user_key: key });
    if (result.deletedCount > 0) {
      return res.json({ success: true, message: `Key ${key} deleted.` });
    } else {
      return res.json({ success: false, message: "Key not found." });
    }
  } catch (err) {
    console.error("delete error:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    if (client) await client.close();
  }
}

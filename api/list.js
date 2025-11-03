import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "DevzAssistant";
const collectionName = process.env.COLLECTION_NAME || "keys";

export default async function handler(req, res) {
  if (!uri) return res.status(500).json({ error: "MONGODB_URI not configured" });

  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection(collectionName);

    // optional: cleanup expired keys on each list request
    const now = new Date();
    await col.deleteMany({ expires_at: { $lte: now } });

    const docs = await col.find().sort({ created_at: -1 }).toArray();
    const keys = docs.map(d => ({
      user_key: d.user_key,
      days_valid: d.days_valid,
      created_at: d.created_at,
      expires_at: d.expires_at
    }));
    return res.json({ success: true, count: keys.length, keys });
  } catch (err) {
    console.error("list error:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    if (client) await client.close();
  }
}

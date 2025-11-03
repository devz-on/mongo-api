import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "test";
const collectionName = process.env.COLLECTION_NAME || "apikeys";

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
    await col.deleteMany({ expiryDate: { $lte: now } });

    const docs = await col.find().sort({ created_at: -1 }).toArray();
    const keys = docs.map(d => ({
      key: d.key,
      duration: d.duration,
      createdAt: d.createdAt,
      expiryDate: d.expiresDate
    }));
    return res.json({ success: true, count: keys.length, keys });
  } catch (err) {
    console.error("list error:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    if (client) await client.close();
  }
}

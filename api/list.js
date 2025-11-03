import { MongoClient } from "mongodb";

const uri = ;
const client = new MongoClient(uri);
const dbName = "DevzAssistant";
const collectionName = "keys";

export default async function handler(req, res) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const keys = db.collection(collectionName);

    const list = await keys.find().toArray();

    res.json({
      count: list.length,
      keys: list.map(k => ({
        user_key: k.user_key,
        expires_at: k.expires_at,
        days_valid: k.days_valid
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
}

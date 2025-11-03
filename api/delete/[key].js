import { MongoClient } from "mongodb";

const uri = ;
const client = new MongoClient(uri);
const dbName = "DevzAssistant";
const collectionName = "keys";

export default async function handler(req, res) {
  const { key } = req.query;

  if (!key) return res.status(400).json({ error: "Key required" });

  try {
    await client.connect();
    const db = client.db(dbName);
    const keys = db.collection(collectionName);

    const result = await keys.deleteOne({ user_key: key });

    if (result.deletedCount > 0)
      res.json({ success: true, message: `Key ${key} deleted.` });
    else
      res.json({ success: false, message: "Key not found." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
}

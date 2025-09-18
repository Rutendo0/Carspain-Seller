import { Client } from 'pg'

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

await client.connect()

export async function getAvatar(uid: string): Promise<string | null> {
  const res = await client.query('SELECT image_base64 FROM users_avatars WHERE uid = $1', [uid])
  return res.rows[0]?.image_base64 || null
}

export async function saveAvatar(uid: string, base64: string, mimeType: string): Promise<string> {
  const url = `data:${mimeType};base64,${base64}`
  await client.query('INSERT INTO users_avatars (uid, image_base64, uploaded_at) VALUES ($1, $2, NOW()) ON CONFLICT (uid) DO UPDATE SET image_base64 = $2, uploaded_at = NOW()', [uid, base64])
  return url
}

export async function initTable() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users_avatars (
      uid VARCHAR(128) PRIMARY KEY,
      image_base64 TEXT,
      uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `)
}

await initTable()
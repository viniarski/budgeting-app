import { Pool } from "pg"

declare global {
  var __pool: Pool | undefined
}

function getPool(): Pool {
  if (global.__pool) return global.__pool

  const connectionString = process.env.POSTGRES_URL
  if (!connectionString) {
    throw new Error("POSTGRES_URL is not set")
  }

  global.__pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  return global.__pool
}

export async function query<T = unknown>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const pool = getPool()
  const result = await pool.query(text, params)
  return result.rows as T[]
}

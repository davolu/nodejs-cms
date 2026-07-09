// Standalone schema setup: `DATABASE_URL=... npm run db:setup`
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Nothing to do.')
    process.exit(1)
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
  })
  const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8')
  await pool.query(schema)
  console.log('✅ Schema applied. Tables are ready.')
  await pool.end()
}
main().catch((e) => { console.error(e); process.exit(1) })

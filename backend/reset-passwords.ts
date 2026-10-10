import 'dotenv/config';
import pg from 'pg';
import * as argon2 from 'argon2';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const hash = await argon2.hash('password123');
  
  const users = ['ADMIN-001', 'TEACHER-001', 'PARENT-001', 'STUDENT-001'];
  
  for (const loginId of users) {
    const res = await pool.query('UPDATE "User" SET "password" = $1 WHERE "loginId" = $2', [hash, loginId]);
    console.log(`Updated ${loginId}: ${res.rowCount} rows affected.`);
  }
}

main().catch(console.error).finally(() => pool.end());

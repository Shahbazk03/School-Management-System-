import { Client } from 'pg';

const url2 = "postgresql://neondb_owner:npg_CLcjRufDV8k5@ep-billowing-cloud-b4fsztua.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function test() {
  const client2 = new Client({ connectionString: url2 });
  try {
    await client2.connect();
    console.log("Connected to Direct URL with .c-6!");
    await client2.end();
  } catch (e) {
    console.error("Failed:", e.message);
  }
}

test();


import { Client } from 'pg';

async function check() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres'
  });
  try {
    await client.connect();
    console.log('Connected successfully');
    await client.end();
  } catch (e) {
    console.error('Connection failed', e);
  }
}

check();

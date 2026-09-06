const path = require('path');
const { randomUUID } = require('crypto');

const backendNodeModules = path.join(__dirname, 'ecommerce-backend', 'node_modules');
const bcrypt = require(path.join(backendNodeModules, 'bcryptjs'));
const { Client } = require(path.join(backendNodeModules, 'pg'));

const EMAIL = 'admin.local@prime.test';
const PASSWORD = 'PrimeLocal!2026';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  let client;
  let lastError;

  for (let attempt = 1; attempt <= 30; attempt++) {
    client = new Client({
      host: '127.0.0.1',
      port: 55432,
      database: 'prime_local',
      user: 'prime',
      password: 'prime_local',
    });

    try {
      await client.connect();
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
      try { await client.end(); } catch {}
      if (attempt < 30) await sleep(1000);
    }
  }

  if (lastError) {
    throw new Error(`Local PostgreSQL is not ready: ${lastError.message}`);
  }

  try {
    await client.query(
      `INSERT INTO "User" ("id", "email", "password", "name", "role", "isBanned", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 'ADMIN', false, NOW(), NOW())
       ON CONFLICT ("email") DO UPDATE SET
         "password" = EXCLUDED."password",
         "name" = EXCLUDED."name",
         "role" = 'ADMIN',
         "isBanned" = false,
         "updatedAt" = NOW()`,
      [randomUUID(), EMAIL, passwordHash, 'Local Admin'],
    );

    console.log('Local admin is ready:');
    console.log(`  Email:    ${EMAIL}`);
    console.log(`  Password: ${PASSWORD}`);
    console.log('  Role:     ADMIN');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
});

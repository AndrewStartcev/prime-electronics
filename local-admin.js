const path = require('path');
const { randomUUID } = require('crypto');

const backendNodeModules = path.join(__dirname, 'ecommerce-backend', 'node_modules');
const bcrypt = require(path.join(backendNodeModules, 'bcryptjs'));
const { Client } = require(path.join(backendNodeModules, 'pg'));

const EMAIL = 'admin.local@prime.test';
const PASSWORD = 'PrimeLocal!2026';
const MAX_ATTEMPTS = 60;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function prepareAdmin(passwordHash) {
  const client = new Client({
    host: '127.0.0.1',
    port: 55432,
    database: 'prime_local',
    user: 'prime',
    password: 'prime_local',
  });

  try {
    await client.connect();
    await client.query('SELECT 1');
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
  } finally {
    try {
      await client.end();
    } catch {}
  }
}

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await prepareAdmin(passwordHash);
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        if (attempt === 1 || attempt % 5 === 0) {
          console.log(`Waiting for local PostgreSQL to become stable... (${attempt}/${MAX_ATTEMPTS})`);
        }
        await sleep(1000);
      }
    }
  }

  if (lastError) {
    throw new Error(`Local PostgreSQL is not ready: ${lastError.message}`);
  }

  console.log('Local admin is ready:');
  console.log(`  Email:    ${EMAIL}`);
  console.log(`  Password: ${PASSWORD}`);
  console.log('  Role:     ADMIN');
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
});

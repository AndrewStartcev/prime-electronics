# PRIME Electronics — local development on Windows

This local environment is isolated from production and does not change the existing application logic.

## Daily start

From the repository root run:

```bat
dev.cmd
```

On the first run the script automatically:

1. checks Docker Desktop and a compatible Node.js version;
2. finds `prime-production-*.sql.gz` in `dev-data`, the repository root, Downloads, or Desktop;
3. creates local-only environment files for backend, storefront, and admin;
4. starts PostgreSQL 18 and Redis in Docker;
5. imports the production dump into the local PostgreSQL volume on its first creation;
6. installs dependencies from the existing Yarn v1 lockfiles;
7. generates the Prisma client;
8. starts backend, storefront, and admin in separate terminal windows.

After startup:

- Storefront: http://localhost:3000
- Admin: http://localhost:3001
- Backend Swagger: http://localhost:6001/docs
- PostgreSQL: `127.0.0.1:55432`
- Redis: `127.0.0.1:56379`

## Safety

The generated local backend `.env` deliberately disables production write integrations:

- amoCRM URL/token are empty;
- Telegram token is empty;
- SMS uses an invalid local API id and test mode;
- Cloudinary credentials are empty.

Both Next.js applications get `NEXT_PUBLIC_API_URL=http://localhost:6001/api`, so their built-in production API fallback is not used during local development.

The launch script also forces these safe local values in the child processes. This prevents machine-level environment variables from accidentally overriding the local configuration with production credentials.

The SQL dump itself is never committed. It is copied to `dev-data/`, which is ignored by Git. The PostgreSQL Docker volume is persistent, so the dump is imported only on the first database creation.

## Important

The backend already contains scheduled jobs. They can change the **local database copy** while it is running (for example delayed cashback and cleanup of old soft-deleted records). Keep the original `.sql.gz` unchanged as the source snapshot.

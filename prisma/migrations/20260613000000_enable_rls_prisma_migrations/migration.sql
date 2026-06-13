-- Enable RLS on the Prisma migrations table so non-service roles cannot read it.
-- No permissive policies are added, so access defaults to deny for anon/authenticated roles.
ALTER TABLE _prisma_migrations ENABLE ROW LEVEL SECURITY;

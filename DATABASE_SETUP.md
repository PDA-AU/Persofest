# PERSOFEST'26 - Database Setup & Migration Guide

## Table of Contents
1. [Initial Database Setup](#initial-database-setup)
2. [Database Schema](#database-schema)
3. [Schema Migrations](#schema-migrations)
4. [Test User Credentials](#test-user-credentials)
5. [Backup & Restore](#backup--restore)
6. [Troubleshooting](#troubleshooting)

---

## Initial Database Setup

### Prerequisites
- PostgreSQL 12+ installed
- psql command-line tool
- Superuser access to PostgreSQL

### Step 1: Create Database and User

```bash
# Login as postgres user
sudo -u postgres psql

# Or on some systems
sudo su - postgres
psql
```

Execute the following SQL commands:

```sql
-- Create database
CREATE DATABASE persofest_db;

-- Create user with password
CREATE USER persofest WITH PASSWORD 'persofest123';

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE persofest_db TO persofest;

-- Connect to the database
\c persofest_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO persofest;

-- Grant default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO persofest;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO persofest;

-- Exit psql
\q
```

### Step 2: Verify Connection

Test the database connection:

```bash
# Test connection
psql -h localhost -U persofest -d persofest_db -c "SELECT version();"

# When prompted, enter password: persofest123
```

### Step 3: Update Backend Configuration

Edit `/app/backend/.env`:

```env
DATABASE_URL=postgresql://persofest:persofest123@localhost:5432/persofest_db
SECRET_KEY=your_super_secret_jwt_key_change_this_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
UPLOAD_DIR=/app/backend/uploads
```

**⚠️ IMPORTANT**: In production, change:
- `persofest123` to a strong password
- `SECRET_KEY` to a randomly generated secret

### Step 4: Initialize Tables

The application uses SQLAlchemy ORM and automatically creates tables on first run. To manually initialize:

```bash
cd /app/backend
source venv/bin/activate
python3 -c "from database import engine, Base; from models import *; Base.metadata.create_all(bind=engine)"
```

---

## Database Schema

### Current Schema (Version 2.0)

#### Table: `participants`

| Column Name      | Data Type       | Constraints                    | Description                           |
|------------------|-----------------|--------------------------------|---------------------------------------|
| id               | INTEGER         | PRIMARY KEY, AUTO INCREMENT    | Unique participant ID                 |
| name             | VARCHAR(255)    | NOT NULL                       | Full name                             |
| register_number  | VARCHAR(50)     | UNIQUE, NOT NULL, INDEXED      | Student registration number           |
| email            | VARCHAR(255)    | UNIQUE, NOT NULL, INDEXED      | Email address                         |
| phone_number     | VARCHAR(20)     | NOT NULL                       | Phone number                          |
| department       | ENUM            | NOT NULL                       | Department (see enum values below)    |
| year_of_study    | ENUM            | NOT NULL                       | Year of study (First/Second/Third)    |
| profile_picture  | VARCHAR(500)    | NULLABLE                       | URL/path to profile picture           |
| password_hash    | VARCHAR(255)    | NOT NULL                       | Hashed password                       |
| **referral_code**    | **VARCHAR(5)**      | **UNIQUE, NOT NULL, INDEXED**  | **User's unique referral code**       |
| **referred_by**      | **VARCHAR(5)**      | **NULLABLE, INDEXED**          | **Referrer's code (if used)**         |
| **referral_count**   | **INTEGER**         | **NOT NULL, DEFAULT 0**        | **Number of successful referrals**    |
| created_at       | TIMESTAMP       | DEFAULT NOW()                  | Account creation timestamp            |
| updated_at       | TIMESTAMP       | ON UPDATE NOW()                | Last update timestamp                 |

**Bold fields** are new additions in Version 2.0 (Referral System)

#### Department Enum Values
```python
"Artificial Intelligence and Data Science"
"Aerospace Engineering"
"Automobile Engineering"
"Computer Technology"
"Electronics and Communication Engineering"
"Electronics and Instrumentation Engineering"
"Production Technology"
"Robotics and Automation"
"Rubber and Plastics Technology"
"Information Technology"
```

#### Year of Study Enum Values
```python
"First Year"
"Second Year"
"Third Year"
```

### Database Indexes

For optimal performance, the following indexes are automatically created:

```sql
-- Primary key index
CREATE INDEX idx_participants_id ON participants(id);

-- Unique indexes
CREATE UNIQUE INDEX idx_participants_register_number ON participants(register_number);
CREATE UNIQUE INDEX idx_participants_email ON participants(email);
CREATE UNIQUE INDEX idx_participants_referral_code ON participants(referral_code);

-- Search indexes
CREATE INDEX idx_participants_referred_by ON participants(referred_by);
```

---

## Schema Migrations

### Version 1.0 → Version 2.0 (Referral System)

If you're upgrading from Version 1.0 (without referral system) to Version 2.0:

#### Migration Script

Create a file `migration_v1_to_v2.sql`:

```sql
-- Connect to database
\c persofest_db

-- Add new columns
ALTER TABLE participants 
ADD COLUMN referral_code VARCHAR(5),
ADD COLUMN referred_by VARCHAR(5),
ADD COLUMN referral_count INTEGER DEFAULT 0 NOT NULL;

-- Generate unique referral codes for existing users
-- This uses a custom function to ensure uniqueness

CREATE OR REPLACE FUNCTION generate_unique_code() 
RETURNS VARCHAR(5) AS $$
DECLARE
    code VARCHAR(5);
    exists BOOLEAN;
BEGIN
    LOOP
        -- Generate random 5-char code (uppercase letters and numbers)
        code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 5));
        
        -- Check if code exists
        SELECT EXISTS(SELECT 1 FROM participants WHERE referral_code = code) INTO exists;
        
        -- Exit loop if unique
        EXIT WHEN NOT exists;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Populate referral codes for existing users
UPDATE participants SET referral_code = generate_unique_code() WHERE referral_code IS NULL;

-- Drop the function (no longer needed)
DROP FUNCTION generate_unique_code();

-- Make referral_code NOT NULL after population
ALTER TABLE participants ALTER COLUMN referral_code SET NOT NULL;

-- Add unique constraint
ALTER TABLE participants ADD CONSTRAINT participants_referral_code_unique UNIQUE (referral_code);

-- Add indexes
CREATE INDEX idx_participants_referral_code ON participants(referral_code);
CREATE INDEX idx_participants_referred_by ON participants(referred_by);

-- Verify migration
SELECT COUNT(*) as total_users, 
       COUNT(DISTINCT referral_code) as unique_codes,
       COUNT(referred_by) as users_with_referrer
FROM participants;
```

#### Run Migration

```bash
# Backup first!
sudo -u postgres pg_dump persofest_db > backup_before_v2_migration.sql

# Run migration
sudo -u postgres psql persofest_db < migration_v1_to_v2.sql

# Verify
sudo -u postgres psql persofest_db -c "SELECT * FROM participants LIMIT 1;"
```

### Creating New Migrations

When modifying the schema in the future:

1. **Update the Model** (`/app/backend/models.py`)
2. **Create Migration SQL** file with naming: `migration_vX_to_vY.sql`
3. **Test on Development Database** first
4. **Backup Production Database**
5. **Apply Migration**
6. **Verify Data Integrity**

#### Migration Template

```sql
-- Migration: [Description]
-- From: Version X.Y
-- To: Version X.Z
-- Date: YYYY-MM-DD

\c persofest_db

BEGIN;

-- Your migration SQL here
-- Example:
-- ALTER TABLE participants ADD COLUMN new_field VARCHAR(100);

-- Verify changes
SELECT COUNT(*) FROM participants;

COMMIT;
```

---

## Test User Credentials

### Automatically Created Test Users

For testing purposes, 4 test users have been created:

#### User A (Top Referrer - 2 referrals)
```
Name: Test User A
Register Number: 2026TEST001
Email: testa@test.com
Phone: 1234567890
Department: Artificial Intelligence and Data Science
Year: First Year
Password: test123
Referral Code: [Generated - e.g., "ABC12"]
Referred By: None
Referral Count: 2
```

#### User B (Referred by User A)
```
Name: Test User B
Register Number: 2026TEST002
Email: testb@test.com
Phone: 1234567891
Department: Aerospace Engineering
Year: Second Year
Password: test123
Referral Code: [Generated - e.g., "XYZ89"]
Referred By: [User A's code]
Referral Count: 0
```

#### User C (Referred by User A)
```
Name: Test User C
Register Number: 2026TEST003
Email: testc@test.com
Phone: 1234567892
Department: Computer Technology
Year: Third Year
Password: test123
Referral Code: [Generated - e.g., "MNO45"]
Referred By: [User A's code]
Referral Count: 0
```

#### User D (Independent)
```
Name: Test User D
Register Number: 2026TEST004
Email: testd@test.com
Phone: 1234567893
Department: Electronics and Communication Engineering
Year: First Year
Password: test123
Referral Code: [Generated - e.g., "PQR67"]
Referred By: None
Referral Count: 0
```

### Login to Test Accounts

**Landing Page**: http://localhost:3000
**Login Page**: http://localhost:3000/login

Use any of the register numbers above (e.g., `2026TEST001`) with password `test123`.

### Check Test Data

```sql
-- View all test users
SELECT 
    name, 
    register_number, 
    email,
    referral_code,
    referred_by,
    referral_count
FROM participants
WHERE register_number LIKE '2026TEST%'
ORDER BY referral_count DESC;

-- View leaderboard
SELECT 
    name,
    register_number,
    referral_count
FROM participants
WHERE referral_count > 0
ORDER BY referral_count DESC
LIMIT 5;
```

### Creating Additional Test Users

```bash
# Using curl
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)

curl -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User E",
    "register_number": "2026TEST005",
    "email": "teste@test.com",
    "phone_number": "1234567894",
    "department": "Information Technology",
    "year_of_study": "Second Year",
    "password": "test123",
    "referral_code": "ABC12"
  }'
```

---

## Backup & Restore

### Creating Backups

#### Full Database Backup

```bash
# With timestamp
sudo -u postgres pg_dump persofest_db > persofest_backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
sudo -u postgres pg_dump persofest_db | gzip > persofest_backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

#### Schema-Only Backup

```bash
sudo -u postgres pg_dump --schema-only persofest_db > persofest_schema_$(date +%Y%m%d).sql
```

#### Data-Only Backup

```bash
sudo -u postgres pg_dump --data-only persofest_db > persofest_data_$(date +%Y%m%d).sql
```

#### Participants Table Only

```bash
sudo -u postgres pg_dump -t participants persofest_db > participants_backup_$(date +%Y%m%d).sql
```

### Restoring from Backup

#### Full Restore

```bash
# Drop and recreate database
sudo -u postgres dropdb persofest_db
sudo -u postgres createdb persofest_db

# Restore
sudo -u postgres psql persofest_db < persofest_backup_20261201_143000.sql

# From compressed
gunzip -c persofest_backup_20261201_143000.sql.gz | sudo -u postgres psql persofest_db
```

#### Restore Specific Table

```bash
sudo -u postgres psql persofest_db < participants_backup_20261201.sql
```

### Automated Backup Script

Create `/app/backup_db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/app/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/persofest_backup_$DATE.sql.gz"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Create backup
sudo -u postgres pg_dump persofest_db | gzip > $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "persofest_backup_*.sql.gz" -mtime +7 -delete

echo "Backup created: $BACKUP_FILE"
```

Add to crontab for daily backups:

```bash
# Edit crontab
crontab -e

# Add line for daily backup at 2 AM
0 2 * * * /app/backup_db.sh
```

---

## Troubleshooting

### Common Issues

#### 1. Connection Refused

**Symptom**: `Connection refused` or `could not connect to server`

**Solutions**:
```bash
# Check if PostgreSQL is running
ps aux | grep postgres

# Start PostgreSQL
sudo /usr/lib/postgresql/15/bin/pg_ctl -D /var/lib/postgresql/15/main start

# Or via supervisor (if configured)
sudo supervisorctl status postgresql
sudo supervisorctl start postgresql
```

#### 2. Authentication Failed

**Symptom**: `FATAL: password authentication failed`

**Solutions**:
```bash
# Reset user password
sudo -u postgres psql -c "ALTER USER persofest WITH PASSWORD 'persofest123';"

# Check pg_hba.conf
sudo cat /var/lib/postgresql/15/main/pg_hba.conf

# Ensure there's a line like:
# local   all   persofest   trust
# or
# local   all   persofest   md5
```

#### 3. Permission Denied

**Symptom**: `ERROR: permission denied for schema public`

**Solutions**:
```sql
-- Connect as postgres
sudo -u postgres psql persofest_db

-- Grant permissions
GRANT ALL ON SCHEMA public TO persofest;
GRANT ALL ON ALL TABLES IN SCHEMA public TO persofest;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO persofest;
```

#### 4. Duplicate Key Error

**Symptom**: `ERROR: duplicate key value violates unique constraint`

**Solutions**:
```sql
-- Check for duplicates
SELECT email, COUNT(*) 
FROM participants 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Delete duplicates (keep first)
DELETE FROM participants a USING (
    SELECT MIN(id) as id, email
    FROM participants 
    GROUP BY email HAVING COUNT(*) > 1
) b
WHERE a.email = b.email AND a.id <> b.id;
```

#### 5. Referral Code Collision

**Symptom**: User registration fails due to duplicate referral code (very rare)

**Solution**: The system automatically retries with a new code. If persistent:

```sql
-- Check for collision
SELECT referral_code, COUNT(*) 
FROM participants 
GROUP BY referral_code 
HAVING COUNT(*) > 1;

-- Manually update if needed
UPDATE participants 
SET referral_code = 'NEW5C' 
WHERE id = [affected_id];
```

### Checking Database Health

```sql
-- Connect to database
sudo -u postgres psql persofest_db

-- Check table size
SELECT 
    pg_size_pretty(pg_total_relation_size('participants')) as total_size,
    pg_size_pretty(pg_relation_size('participants')) as table_size,
    pg_size_pretty(pg_indexes_size('participants')) as indexes_size;

-- Check row count
SELECT COUNT(*) FROM participants;

-- Check referral statistics
SELECT 
    COUNT(*) as total_users,
    COUNT(DISTINCT referral_code) as unique_codes,
    COUNT(referred_by) as users_with_referrer,
    SUM(referral_count) as total_referrals,
    MAX(referral_count) as max_referrals,
    AVG(referral_count) as avg_referrals
FROM participants;

-- Check data integrity
SELECT 
    COUNT(*) FILTER (WHERE referral_code IS NULL) as missing_codes,
    COUNT(*) FILTER (WHERE LENGTH(referral_code) != 5) as invalid_length_codes,
    COUNT(*) FILTER (WHERE referral_count < 0) as negative_counts
FROM participants;
```

### Performance Optimization

```sql
-- Analyze table statistics
ANALYZE participants;

-- Reindex if needed
REINDEX TABLE participants;

-- Vacuum to reclaim space
VACUUM ANALYZE participants;

-- Check for missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public' AND tablename = 'participants';
```

---

## Production Checklist

Before going to production:

- [ ] Change database password to strong password
- [ ] Update `DATABASE_URL` in `.env` with production credentials
- [ ] Set up automated daily backups
- [ ] Configure PostgreSQL for production (postgresql.conf)
- [ ] Enable SSL/TLS for database connections
- [ ] Set up monitoring for database performance
- [ ] Document all schema changes
- [ ] Test backup/restore procedures
- [ ] Set up replica for high availability (optional)
- [ ] Configure connection pooling (e.g., PgBouncer)

---

## Support & Resources

- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **SQLAlchemy Documentation**: https://docs.sqlalchemy.org/
- **Application Logs**: `/var/log/supervisor/backend.err.log`
- **Database Logs**: `/var/lib/postgresql/15/main/log/`

For schema-related issues, refer to `/app/backend/models.py` for the current model definitions.

---

**Last Updated**: January 2026  
**Schema Version**: 2.0 (Referral System)

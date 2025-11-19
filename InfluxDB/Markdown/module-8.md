# InfluxDB: Administration, Security, and Backup
## Complete 60-Minute Course

---

## Course Overview

**Duration:** 60 minutes  
**Level:** Advanced  
**Prerequisites:** Strong understanding of InfluxDB operations, database concepts, and system administration

### Learning Objectives

By the end of this course, you will be able to:
- Manage users, organizations, and role-based access control (RBAC)
- Implement comprehensive authentication and authorization strategies
- Apply security best practices and hardening techniques
- Design and execute backup and restore procedures
- Migrate data between environments safely
- Use InfluxDB templates for consistent deployments
- Secure InfluxDB in production environments

---

## Module 1: User Management and Organizations (15 minutes)

### 1.1 InfluxDB Access Control Models

**InfluxDB 1.x vs 2.x:**

```
InfluxDB 1.x (Username/Password):
├── Users (database level)
├── Privileges (READ, WRITE, ALL)
├── Admin Users (cluster-wide)
└── Simple authentication

InfluxDB 2.x (Token-based):
├── Organizations
├── Users (org members)
├── Buckets (databases)
├── Tokens (API authentication)
└── Fine-grained permissions
```

### 1.2 InfluxDB 1.x User Management

**Enabling Authentication:**

```toml
# /etc/influxdb/influxdb.conf
[http]
  auth-enabled = true
  pprof-enabled = false
  
[admin]
  enabled = true
  bind-address = ":8083"
```

**Creating Admin User:**
```bash
# First time setup (before enabling auth)
influx

# Inside influx CLI
CREATE USER admin WITH PASSWORD 'strong_password' WITH ALL PRIVILEGES

# Verify
SHOW USERS

# Output:
# user   admin
# ----   -----
# admin  true
```

**Creating Regular Users:**
```influxql
-- Create user
CREATE USER "developer" WITH PASSWORD 'dev_password'

-- Grant database privileges
GRANT READ ON "mydb" TO "developer"
GRANT WRITE ON "mydb" TO "developer"
GRANT ALL ON "mydb" TO "developer"

-- Revoke privileges
REVOKE WRITE ON "mydb" FROM "developer"

-- Show user privileges
SHOW GRANTS FOR "developer"

-- Change password
SET PASSWORD FOR "developer" = 'new_password'

-- Delete user
DROP USER "developer"
```

**User Privilege Levels:**

| Privilege | Description | Actions Allowed |
|-----------|-------------|-----------------|
| READ | Read-only access | SELECT queries |
| WRITE | Write access | INSERT, DELETE |
| ALL | Full access | All operations on database |
| ALL PRIVILEGES | Admin | Cluster-wide operations |

**Example: Creating Role-Based Users:**
```influxql
-- Read-only user for monitoring
CREATE USER "monitor" WITH PASSWORD 'monitor_pass'
GRANT READ ON "telegraf" TO "monitor"
GRANT READ ON "_internal" TO "monitor"

-- Write-only user for data ingestion
CREATE USER "collector" WITH PASSWORD 'collector_pass'
GRANT WRITE ON "telegraf" TO "collector"

-- Application user with full access
CREATE USER "app_user" WITH PASSWORD 'app_pass'
GRANT ALL ON "application_db" TO "app_user"

-- DBA with admin privileges
CREATE USER "dba" WITH PASSWORD 'dba_pass' WITH ALL PRIVILEGES
```

### 1.3 InfluxDB 2.x Organizations and Users

**Understanding Organizations:**

An organization is the top-level container for all resources in InfluxDB 2.x:
- Multiple users
- Multiple buckets (databases)
- Tokens for API access
- Tasks and alerts

**Creating Organization:**
```bash
# Via CLI
influx org create -n production

# Via API
curl -X POST http://localhost:8086/api/v2/orgs \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "production",
    "description": "Production environment"
  }'
```

**Managing Organizations:**
```bash
# List organizations
influx org list

# Get organization details
influx org find --name production

# Update organization
influx org update \
  --id ORG_ID \
  --name new_name \
  --description "Updated description"

# Delete organization (careful!)
influx org delete --id ORG_ID
```

**User Management in InfluxDB 2.x:**

**Creating Users:**
```bash
# Create user
influx user create \
  -n john.doe \
  -o production \
  -p secure_password

# Via API
curl -X POST http://localhost:8086/api/v2/users \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "john.doe",
    "status": "active"
  }'
```

**Managing Users:**
```bash
# List all users
influx user list

# Find specific user
influx user find --name john.doe

# Update user password
influx user password \
  --name john.doe \
  --password new_password

# Deactivate user (don't delete)
influx user update \
  --id USER_ID \
  --status inactive

# Delete user
influx user delete --id USER_ID
```

**Adding Users to Organizations:**
```bash
# Add user as member
influx org members add \
  --org production \
  --member john.doe

# Add user as owner
influx org members add \
  --org production \
  --member jane.admin \
  --owner

# List organization members
influx org members list --org production

# Remove member
influx org members remove \
  --org production \
  --member john.doe
```

### 1.4 Token-Based Authentication (InfluxDB 2.x)

**Token Types:**

```
Token Hierarchy:
├── All-Access Token (Admin)
│   └── Full access to everything
├── Operator Token
│   └── Manage specific resources
├── Read/Write Token
│   └── Bucket-level access
└── Custom Token
    └── Fine-grained permissions
```

**Creating Tokens:**

**All-Access Token:**
```bash
influx auth create \
  --org production \
  --all-access \
  --description "Admin token for automation"
```

**Read/Write Token:**
```bash
# Read-only token
influx auth create \
  --org production \
  --read-bucket BUCKET_ID \
  --description "Read-only monitoring token"

# Write-only token
influx auth create \
  --org production \
  --write-bucket BUCKET_ID \
  --description "Data ingestion token"

# Read-Write token
influx auth create \
  --org production \
  --read-bucket BUCKET_ID \
  --write-bucket BUCKET_ID \
  --description "Application token"
```

**Custom Token with Specific Permissions:**
```bash
influx auth create \
  --org production \
  --read-buckets \
  --write-buckets \
  --read-tasks \
  --write-tasks \
  --description "Custom CI/CD token"
```

**Managing Tokens:**
```bash
# List all tokens
influx auth list

# Find specific token
influx auth find --user john.doe

# Update token description
influx auth update \
  --id TOKEN_ID \
  --description "Updated description"

# Deactivate token (don't delete)
influx auth inactive --id TOKEN_ID

# Delete token
influx auth delete --id TOKEN_ID
```

**Token Best Practices:**

1. **Principle of Least Privilege:**
```bash
# Bad: All-access token for application
influx auth create --org prod --all-access

# Good: Scoped token
influx auth create \
  --org prod \
  --read-bucket app_bucket \
  --write-bucket app_bucket
```

2. **Token Rotation:**
```bash
#!/bin/bash
# rotate-token.sh

# Create new token
NEW_TOKEN=$(influx auth create \
  --org production \
  --read-bucket BUCKET_ID \
  --write-bucket BUCKET_ID \
  --json | jq -r '.token')

# Update application configuration
echo "INFLUX_TOKEN=$NEW_TOKEN" > /app/config/.env

# Wait for deployment
sleep 300

# Delete old token
influx auth delete --id OLD_TOKEN_ID

echo "Token rotated successfully"
```

3. **Token Storage:**
```bash
# Store in environment variable (never hardcode)
export INFLUX_TOKEN="your_token_here"

# Or use secrets management
vault kv put secret/influxdb token="your_token_here"

# Retrieve from vault
export INFLUX_TOKEN=$(vault kv get -field=token secret/influxdb)
```

---

## Module 2: Authentication and Authorization (15 minutes)

### 2.1 Authentication Methods

**InfluxDB 1.x Authentication:**

**Basic HTTP Authentication:**
```bash
# Using curl with basic auth
curl -G http://localhost:8086/query \
  -u username:password \
  --data-urlencode "q=SHOW DATABASES"

# Using influx CLI
influx -username admin -password admin_pass

# Using client libraries (Python)
from influxdb import InfluxDBClient

client = InfluxDBClient(
    host='localhost',
    port=8086,
    username='admin',
    password='admin_pass',
    database='mydb'
)
```

**JWT Authentication:**
```toml
# influxdb.conf
[http]
  auth-enabled = true
  shared-secret = "your_shared_secret_key"
```

**Generating JWT Token:**
```python
import jwt
import time

payload = {
    'username': 'admin',
    'exp': int(time.time()) + 3600  # 1 hour expiry
}

token = jwt.encode(
    payload,
    'your_shared_secret_key',
    algorithm='HS256'
)

# Use in requests
headers = {'Authorization': f'Bearer {token}'}
```

**InfluxDB 2.x Authentication:**

**Token-Based Authentication:**
```bash
# HTTP API with token
curl -X GET http://localhost:8086/api/v2/buckets \
  -H "Authorization: Token YOUR_TOKEN"

# influx CLI with token
influx query \
  --token YOUR_TOKEN \
  --org production \
  'from(bucket: "mybucket") |> range(start: -1h)'

# Environment variable
export INFLUX_TOKEN="YOUR_TOKEN"
influx query 'from(bucket: "mybucket") |> range(start: -1h)'
```

**Using Client Libraries:**

**Python:**
```python
from influxdb_client import InfluxDBClient

client = InfluxDBClient(
    url="http://localhost:8086",
    token="YOUR_TOKEN",
    org="production"
)

query_api = client.query_api()
```

**Node.js:**
```javascript
const { InfluxDB } = require('@influxdata/influxdb-client');

const client = new InfluxDB({
  url: 'http://localhost:8086',
  token: 'YOUR_TOKEN'
});

const queryApi = client.getQueryApi('production');
```

### 2.2 Authorization Strategies

**Resource-Based Access Control:**

**InfluxDB 2.x Permissions:**

```
Permission Scope:
├── Organization Level
│   ├── Read/Write Organizations
│   ├── Read/Write Users
│   └── Read/Write Members
├── Bucket Level
│   ├── Read Buckets
│   ├── Write Buckets
│   └── Delete Buckets
├── Task Level
│   ├── Read Tasks
│   ├── Write Tasks
│   └── Execute Tasks
└── Other Resources
    ├── Dashboards
    ├── Telegrafs
    └── Checks/Notifications
```

**Creating Tokens with Specific Permissions:**

**Read-Only Dashboard User:**
```bash
influx auth create \
  --org production \
  --read-buckets \
  --read-dashboards \
  --read-telegrafs \
  --description "Dashboard viewer"
```

**Data Collector (Write Only):**
```bash
influx auth create \
  --org production \
  --write-bucket BUCKET_ID \
  --description "Telegraf collector"
```

**Automation Token (Tasks):**
```bash
influx auth create \
  --org production \
  --read-buckets \
  --write-buckets \
  --read-tasks \
  --write-tasks \
  --description "CI/CD automation"
```

### 2.3 External Authentication

**LDAP Integration (InfluxDB Enterprise):**

```toml
# influxdb.conf
[http]
  auth-enabled = true

[[ldap]]
  enabled = true
  host = "ldap.example.com"
  port = 389
  security = "starttls"
  bind-dn = "cn=admin,dc=example,dc=com"
  bind-password = "admin_password"
  search-base-dns = ["dc=example,dc=com"]
  search-filter = "(uid=%s)"
  username-attribute = "uid"
```

**OAuth 2.0 Integration (InfluxDB Cloud):**

```yaml
# OAuth configuration
oauth2:
  enabled: true
  providers:
    - name: "google"
      client_id: "YOUR_CLIENT_ID"
      client_secret: "YOUR_CLIENT_SECRET"
      auth_url: "https://accounts.google.com/o/oauth2/auth"
      token_url: "https://oauth2.googleapis.com/token"
      redirect_url: "https://influxdb.example.com/oauth/callback"
      scopes:
        - "openid"
        - "email"
        - "profile"
```

### 2.4 Security Best Practices

**1. Network Security:**

**Enable HTTPS:**
```toml
# influxdb.conf
[http]
  https-enabled = true
  https-certificate = "/etc/ssl/influxdb.pem"
  https-private-key = "/etc/ssl/influxdb-key.pem"
```

**Generate Self-Signed Certificate:**
```bash
openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout /etc/ssl/influxdb-key.pem \
  -out /etc/ssl/influxdb.pem \
  -days 365 \
  -subj "/CN=influxdb.example.com"
```

**2. Firewall Configuration:**
```bash
# Allow only specific IPs
sudo ufw allow from 192.168.1.0/24 to any port 8086
sudo ufw deny 8086

# Block admin interface from public
sudo ufw deny 8083
```

**3. Bind to Specific Interface:**
```toml
[http]
  bind-address = "127.0.0.1:8086"  # Localhost only
  # Or
  bind-address = "10.0.1.100:8086"  # Private IP
```

**4. Disable Unnecessary Features:**
```toml
[http]
  pprof-enabled = false        # Disable profiling
  debug-pprof-enabled = false  # Disable debug profiling

[admin]
  enabled = false  # Disable admin UI in production
```

**5. Rate Limiting:**
```toml
[http]
  max-connection-limit = 100
  max-concurrent-write-limit = 50
  max-concurrent-query-limit = 25
  max-enqueued-write-limit = 100
  max-enqueued-query-limit = 50
```

**6. Audit Logging:**
```bash
# Enable query logging
[http]
  log-enabled = true
  access-log-path = "/var/log/influxdb/access.log"
  
# Monitor logs
tail -f /var/log/influxdb/access.log
```

---

## Module 3: Backup and Restore Strategies (15 minutes)

### 3.1 Backup Methods Overview

**InfluxDB Backup Types:**

```
Backup Strategies:
├── Full Backup
│   ├── Complete database snapshot
│   └── Suitable for small databases
├── Incremental Backup
│   ├── Only changed data
│   └── Reduces backup time/size
├── Online Backup
│   ├── No downtime required
│   └── Uses InfluxDB backup tools
└── Cold Backup
    ├── Requires shutdown
    └── File system level copy
```

### 3.2 InfluxDB 1.x Backup and Restore

**Online Backup (Recommended):**

**Full Backup:**
```bash
# Backup entire instance
influxd backup -portable /backup/influxdb/$(date +%Y%m%d)

# Backup specific database
influxd backup -portable -database mydb /backup/mydb/$(date +%Y%m%d)

# Backup with retention policy
influxd backup -portable \
  -database mydb \
  -retention autogen \
  /backup/mydb_autogen/$(date +%Y%m%d)

# Backup since specific time
influxd backup -portable \
  -database mydb \
  -start 2024-01-01T00:00:00Z \
  /backup/mydb_incremental/$(date +%Y%m%d)
```

**Backup Output Structure:**
```
/backup/influxdb/20240115/
├── 20240115T120000Z.meta        # Metadata
├── 20240115T120000Z.s1.tar.gz   # Shard 1
├── 20240115T120000Z.s2.tar.gz   # Shard 2
└── 20240115T120000Z.manifest    # Manifest
```

**Automated Backup Script:**
```bash
#!/bin/bash
# influxdb-backup.sh

BACKUP_DIR="/backup/influxdb"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
influxd backup -portable "$BACKUP_DIR/$DATE"

if [ $? -eq 0 ]; then
    echo "Backup completed: $BACKUP_DIR/$DATE"
    
    # Compress backup
    tar -czf "$BACKUP_DIR/$DATE.tar.gz" -C "$BACKUP_DIR" "$DATE"
    rm -rf "$BACKUP_DIR/$DATE"
    
    # Delete old backups
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
    
    # Upload to S3 (optional)
    aws s3 cp "$BACKUP_DIR/$DATE.tar.gz" \
      s3://my-influxdb-backups/
else
    echo "Backup failed!" >&2
    exit 1
fi
```

**Cron Schedule:**
```cron
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/influxdb-backup.sh >> /var/log/influxdb-backup.log 2>&1

# Hourly incremental backup
0 * * * * /usr/local/bin/influxdb-incremental-backup.sh
```

**Restore Process:**

**Full Restore:**
```bash
# Stop InfluxDB
sudo systemctl stop influxdb

# Restore metadata
influxd restore -portable -metadir /var/lib/influxdb/meta \
  /backup/influxdb/20240115

# Restore data
influxd restore -portable -datadir /var/lib/influxdb/data \
  /backup/influxdb/20240115

# Start InfluxDB
sudo systemctl start influxdb

# Verify
influx -execute "SHOW DATABASES"
```

**Restore Specific Database:**
```bash
# Online restore (no shutdown required)
influxd restore -portable \
  -database mydb \
  -newdb mydb_restored \
  /backup/mydb/20240115

# Verify
influx -execute "SHOW DATABASES"
influx -database mydb_restored -execute "SHOW MEASUREMENTS"
```

**Point-in-Time Restore:**
```bash
# Restore data up to specific time
influxd restore -portable \
  -database mydb \
  -end 2024-01-15T12:00:00Z \
  /backup/mydb/20240115
```

### 3.3 InfluxDB 2.x Backup and Restore

**Backup Command:**

```bash
# Full backup
influx backup /backup/influxdb2/$(date +%Y%m%d) \
  --host http://localhost:8086 \
  --token YOUR_TOKEN

# Backup specific bucket
influx backup /backup/mybucket/$(date +%Y%m%d) \
  --host http://localhost:8086 \
  --token YOUR_TOKEN \
  --bucket mybucket

# Backup multiple buckets
influx backup /backup/$(date +%Y%m%d) \
  --host http://localhost:8086 \
  --token YOUR_TOKEN \
  --bucket bucket1 \
  --bucket bucket2
```

**Restore Command:**

```bash
# Full restore
influx restore /backup/influxdb2/20240115 \
  --host http://localhost:8086 \
  --token YOUR_TOKEN

# Restore to new organization
influx restore /backup/20240115 \
  --host http://localhost:8086 \
  --token YOUR_TOKEN \
  --new-org restored_org

# Restore specific bucket
influx restore /backup/20240115 \
  --host http://localhost:8086 \
  --token YOUR_TOKEN \
  --bucket mybucket \
  --new-bucket restored_bucket
```

### 3.4 Alternative Backup Methods

**File System Backup (Cold):**

```bash
# Stop InfluxDB
sudo systemctl stop influxdb

# Backup data directory
sudo tar -czf /backup/influxdb-fs-$(date +%Y%m%d).tar.gz \
  /var/lib/influxdb/

# Start InfluxDB
sudo systemctl start influxdb
```

**Snapshot Backup (Enterprise):**

```bash
# Create snapshot
influxd-ctl backup \
  -strategy=full \
  /backup/snapshot/$(date +%Y%m%d)

# Incremental snapshot
influxd-ctl backup \
  -strategy=incremental \
  -start 2024-01-14T00:00:00Z \
  /backup/snapshot_inc/$(date +%Y%m%d)
```

**Cloud Storage Integration:**

**AWS S3 Backup:**
```bash
#!/bin/bash
BACKUP_DIR="/tmp/influxdb-backup"
S3_BUCKET="s3://my-influxdb-backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
influxd backup -portable "$BACKUP_DIR/$DATE"

# Compress
tar -czf "$BACKUP_DIR/$DATE.tar.gz" -C "$BACKUP_DIR" "$DATE"

# Upload to S3
aws s3 cp "$BACKUP_DIR/$DATE.tar.gz" "$S3_BUCKET/"

# Cleanup
rm -rf "$BACKUP_DIR/$DATE" "$BACKUP_DIR/$DATE.tar.gz"
```

**Google Cloud Storage:**
```bash
# Upload to GCS
gsutil cp /backup/influxdb/20240115.tar.gz \
  gs://my-influxdb-backups/

# Download from GCS
gsutil cp gs://my-influxdb-backups/20240115.tar.gz \
  /restore/
```

### 3.5 Backup Verification and Testing

**Verification Script:**
```bash
#!/bin/bash
# verify-backup.sh

BACKUP_PATH=$1

echo "Verifying backup: $BACKUP_PATH"

# Check if backup exists
if [ ! -d "$BACKUP_PATH" ]; then
    echo "Error: Backup not found"
    exit 1
fi

# Check for required files
if [ ! -f "$BACKUP_PATH"/*.meta ]; then
    echo "Error: Metadata file missing"
    exit 1
fi

if [ ! -f "$BACKUP_PATH"/manifest ]; then
    echo "Error: Manifest file missing"
    exit 1
fi

# Check file sizes
TOTAL_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
echo "Backup size: $TOTAL_SIZE"

# Restore to test database
influxd restore -portable \
  -database test \
  -newdb backup_test \
  "$BACKUP_PATH"

# Query test database
COUNT=$(influx -database backup_test \
  -execute "SELECT COUNT(*) FROM /.*/" -format csv | wc -l)

echo "Measurements found: $COUNT"

# Cleanup
influx -execute "DROP DATABASE backup_test"

echo "Backup verification complete"
```

---

## Module 4: Data Migration and Templates (15 minutes)

### 4.1 Data Migration Strategies

**Migration Scenarios:**

```
Common Migration Paths:
├── Version Upgrade (1.x → 2.x)
├── Environment Migration (Dev → Prod)
├── Cloud Migration (On-prem → Cloud)
├── Consolidation (Multiple → Single)
└── Database Merge (DB1 + DB2 → DB3)
```

### 4.2 InfluxDB 1.x to 2.x Migration

**Using Official Migration Tool:**

**Installation:**
```bash
# Download influx CLI with migration support
wget https://dl.influxdata.com/influxdb/releases/influxdb2-client-2.7.0-linux-amd64.tar.gz
tar xvzf influxdb2-client-2.7.0-linux-amd64.tar.gz
sudo cp influx /usr/local/bin/
```

**Migration Process:**

**Step 1: Export Configuration:**
```bash
# Generate migration config
influx migrate export \
  --source-host http://localhost:8086 \
  --source-username admin \
  --source-password admin_pass \
  --config-file migration-config.yml
```

**Step 2: Review Configuration:**
```yaml
# migration-config.yml
version: 2
mappings:
  - database: mydb
    retention-policy: autogen
    bucket: mydb
  - database: telegraf
    retention-policy: autogen
    bucket: telegraf
    
options:
  batch-size: 10000
  start-time: 2024-01-01T00:00:00Z
  end-time: null  # null = all data
```

**Step 3: Execute Migration:**
```bash
influx migrate run \
  --source-host http://localhost:8086 \
  --source-username admin \
  --source-password admin_pass \
  --target-host http://localhost:8086 \
  --target-token YOUR_V2_TOKEN \
  --target-org production \
  --config-file migration-config.yml
```

**Monitoring Migration:**
```bash
# Check progress
influx migrate status \
  --config-file migration-config.yml

# Resume failed migration
influx migrate resume \
  --config-file migration-config.yml
```

### 4.3 Manual Data Export/Import

**Export Data (InfluxDB 1.x):**

**Using influx_inspect:**
```bash
# Export to line protocol
influx_inspect export \
  -datadir /var/lib/influxdb/data \
  -waldir /var/lib/influxdb/wal \
  -out /export/data.txt \
  -database mydb \
  -retention autogen \
  -start 2024-01-01T00:00:00Z \
  -end 2024-01-31T23:59:59Z
```

**Using Flux (InfluxDB 2.x):**
```flux
// Export to CSV
from(bucket: "mybucket")
  |> range(start: -30d)
  |> filter(fn: (r) => r["_measurement"] == "cpu")
  |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
  |> to(bucket: "export_bucket")
```

**Import Data:**

**Line Protocol Import:**
```bash
# Import to InfluxDB 1.x
influx -import \
  -path /export/data.txt \
  -database mydb \
  -precision ns

# Import to InfluxDB 2.x
influx write \
  --bucket mybucket \
  --file /export/data.txt \
  --format lp \
  --precision ns
```

**Batch Import with Rate Limiting:**
```bash
#!/bin/bash
# batch-import.sh

INPUT_FILE="/export/data.txt"
BUCKET="mybucket"
BATCH_SIZE=5000
DELAY=1  # seconds between batches

split -l $BATCH_SIZE "$INPUT_FILE" batch_

for file in batch_*; do
    echo "Importing $file..."
    influx write \
      --bucket $BUCKET \
      --file $file \
      --format lp
    
    sleep $DELAY
    rm $file
done

echo "Import complete"
```

### 4.4 Cross-Environment Migration

**Development to Production:**

**Method 1: Backup/Restore:**
```bash
# On Development
influxd backup -portable /tmp/dev-backup -database mydb

# Transfer to production
scp -r /tmp/dev-backup prod-server:/tmp/

# On Production
influxd restore -portable \
  -database mydb \
  -newdb mydb_from_dev \
  /tmp/dev-backup
```

**Method 2: Remote Replication:**
```bash
# Setup continuous replication (Enterprise feature)
influxd-ctl add-subscription \
  -database mydb \
  -retention autogen \
  -name prod-replication \
  -mode ANY \
  -destinations http://prod-server:8086
```

**Method 3: Data Pump:**
```python
# Python script for data migration
from influxdb import InfluxDBClient
from influxdb_client import InfluxDBClient as InfluxDBClientV2

# Source (InfluxDB 1.x)
source = InfluxDBClient(
    host='dev-server',
    port=8086,
    username='admin',
    password='admin',
    database='mydb'
)

# Destination (InfluxDB 2.x)
dest = InfluxDBClientV2(
    url='http://prod-server:8086',
    token='YOUR_TOKEN',
    org='production'
)

# Query and transfer
query = "SELECT * FROM cpu WHERE time > now() - 1d"
result = source.query(query)

write_api = dest.write_api()

for point in result.get_points():
    # Transform and write
    write_api.write(
        bucket='mybucket',
        record=point
    )

print("Migration complete")
```

### 4.5 InfluxDB Templates

**What are Templates?**

Templates are packages containing:
- Buckets
- Tasks
- Dashboards
- Checks
- Notification rules
- Variables
- Labels

**Creating Templates:**

**Export Current Configuration:**
```bash
# Export specific resources
influx export all \
  --org production \
  --file my-template.yml

# Export specific bucket and related resources
influx export \
  --org production \
  --bucket mybucket \
  --bucket-resources \
  --file bucket-template.yml
```

**Template Structure (YAML):**
```yaml
apiVersion: influxdata.com/v2alpha1
kind: Label
metadata:
  name: monitoring
spec:
  color: '#FF0000'
  description: Monitoring resources
---
apiVersion: influxdata.com/v2alpha1
kind: Bucket
metadata:
  name: system_metrics
spec:
  description: System monitoring metrics
  retentionRules:
    - type: expire
      everySeconds: 604800  # 7 days
---
apiVersion: influxdata.com/v2alpha1
kind: Task
metadata:
  name: downsampling_task
spec:
  every: 1h
  query: |
    from(bucket: "system_metrics")
      |> range(start: -1h)
      |> aggregateWindow(every: 5m, fn: mean)
      |> to(bucket: "downsampled_metrics")
---
apiVersion: influxdata.com/v2alpha1
kind: Dashboard
metadata:
  name: system_dashboard
spec:
  charts:
    - kind: XY
      name: CPU Usage
      queries:
        - query: |
            from(bucket: "system_metrics")
              |> range(start: v.timeRangeStart)
              |> filter(fn: (r) => r["_measurement"] == "cpu")
```

**Applying Templates:**

```bash
# Apply template to organization
influx apply \
  --org production \
  --file my-template.yml

# Apply with force (overwrite existing)
influx apply \
  --org production \
  --file my-template.yml \
  --force

# Validate template without applying
influx apply \
  --org production \
  --file my-template.yml \
  --validate
```

**Template Repository:**

**Create Template Package:**
```bash
# Create package directory
mkdir -p influxdb-templates/monitoring

# Copy template
cp my-template.yml influxdb-templates/monitoring/

# Create README
cat > influxdb-templates/monitoring/README.md <<EOF
# System Monitoring Template

## Overview
Complete system monitoring setup with:
- Pre-configured buckets
- Downsampling tasks
- System dashboard
- Alert checks

## Installation
\`\`\`bash
influx apply --org YOUR_ORG --file monitoring.yml
\`\`\`
EOF

# Version control
cd influxdb-templates
git init
git add .
git commit -m "Initial monitoring template"
```

**Using Community Templates:**
```bash
# Browse templates
# https://github.com/influxdata/community-templates

# Apply from URL
influx apply \
  --org production \
  --file https://raw.githubusercontent.com/influxdata/community-templates/master/linux_system/linux_system.yml
```

### 4.6 Deployment Automation

**Infrastructure as Code with Templates:**

**Terraform Example:**
```hcl
# main.tf
resource "influxdb_bucket" "system_metrics" {
  name        = "system_metrics"
  org         = "production"
  description = "System monitoring metrics"
  
  retention_rules {
    type            = "expire"
    every_seconds   = 604800  # 7 days
  }
}

resource "influxdb_task" "downsampling" {
  name        = "downsampling_task"
  org         = "production"
  flux        = file("tasks/downsampling.flux")
  every       = "1h"
}
```

**Ansible Playbook:**
```yaml
# deploy-influxdb.yml
---
- name: Deploy InfluxDB Configuration
  hosts: influxdb_servers
  tasks:
    - name: Copy template file
      copy:
        src: templates/monitoring.yml
        dest: /tmp/monitoring.yml
    
    - name: Apply template
      command: >
        influx apply
        --org production
        --token {{ influx_token }}
        --file /tmp/monitoring.yml
    
    - name: Verify deployment
      command: influx bucket list --org production
      register: buckets
    
    - debug:
        msg: "Deployed buckets: {{ buckets.stdout }}"
```

**CI/CD Pipeline (GitLab CI):**
```yaml
# .gitlab-ci.yml
stages:
  - validate
  - deploy

validate_template:
  stage: validate
  script:
    - influx apply --file template.yml --validate
  only:
    - merge_requests

deploy_to_staging:
  stage: deploy
  script:
    - influx apply --org staging --file template.yml --force
  only:
    - develop

deploy_to_production:
  stage: deploy
  script:
    - influx apply --org production --file template.yml --force
  only:
    - master
  when: manual
```

---

## Hands-On Lab Exercises

### Lab 1: User Management and RBAC (15 minutes)

**Objective:** Set up comprehensive user and access control

**Tasks:**
```bash
# 1. Create organization
influx org create -n lab_org

# 2. Create users with different roles
influx user create -n admin_user -p admin_pass -o lab_org
influx user create -n dev_user -p dev_pass -o lab_org
influx user create -n readonly_user -p read_pass -o lab_org

# 3. Create bucket
influx bucket create -n lab_bucket -o lab_org -r 7d

# 4. Create tokens with different permissions
# Admin token
influx auth create \
  --org lab_org \
  --all-access \
  --description "Admin token"

# Developer token (read/write)
influx auth create \
  --org lab_org \
  --read-bucket lab_bucket \
  --write-bucket lab_bucket \
  --description "Developer token"

# Read-only token
influx auth create \
  --org lab_org \
  --read-bucket lab_bucket \
  --description "Read-only token"

# 5. Test access levels
# Try writing with read-only token (should fail)
# Try reading with write-only token (should fail)

# 6. Document all tokens and permissions
```

### Lab 2: Backup and Restore (10 minutes)

**Objective:** Implement automated backup strategy

**Tasks:**
```bash
# 1. Create test data
influx write \
  --bucket lab_bucket \
  --org lab_org \
  "cpu,host=server01 usage=45.2"

# 2. Perform full backup
influx backup /tmp/lab_backup \
  --host http://localhost:8086 \
  --token YOUR_TOKEN

# 3. Delete bucket
influx bucket delete \
  --name lab_bucket \
  --org lab_org

# 4. Restore from backup
influx restore /tmp/lab_backup \
  --host http://localhost:8086 \
  --token YOUR_TOKEN \
  --new-org restored_lab

# 5. Verify data
influx query \
  --org restored_lab \
  'from(bucket: "lab_bucket") |> range(start: -1h)'

# 6. Create backup script with cron
```

### Lab 3: Data Migration (15 minutes)

**Objective:** Migrate data between environments

**Tasks:**
```bash
# 1. Export data from source
influx query \
  --org source_org \
  'from(bucket: "source_bucket") |> range(start: -7d)' \
  --raw > /tmp/export.lp

# 2. Transform data (if needed)
# Edit /tmp/export.lp

# 3. Import to destination
influx write \
  --bucket dest_bucket \
  --org dest_org \
  --file /tmp/export.lp

# 4. Verify migration
influx query \
  --org dest_org \
  'from(bucket: "dest_bucket") |> count()'

# 5. Document migration process
```

### Lab 4: Template Creation and Deployment (20 minutes)

**Objective:** Create and deploy infrastructure template

**Tasks:**
```bash
# 1. Set up initial configuration
influx bucket create -n template_test -o lab_org
influx task create \
  -n test_task \
  -o lab_org \
  --flux 'from(bucket: "template_test") |> range(start: -1h)'

# 2. Export as template
influx export all \
  --org lab_org \
  --filter=labelName=template_test \
  --file my-template.yml

# 3. Create new organization
influx org create -n template_deploy

# 4. Apply template
influx apply \
  --org template_deploy \
  --file my-template.yml

# 5. Verify deployment
influx bucket list --org template_deploy
influx task list --org template_deploy

# 6. Version control template
git init
git add my-template.yml
git commit -m "Initial template"
```

---

## Security Hardening Checklist

### Production Security Configuration

**Essential Security Measures:**

```yaml
Security Checklist:
Network:
  - [ ] Enable HTTPS/TLS
  - [ ] Configure firewall rules
  - [ ] Bind to private IP only
  - [ ] Disable admin UI in production
  
Authentication:
  - [ ] Enable authentication
  - [ ] Use strong passwords (min 16 chars)
  - [ ] Implement token rotation
  - [ ] Use least privilege principle
  - [ ] Enable audit logging
  
Authorization:
  - [ ] Configure RBAC
  - [ ] Regular access review
  - [ ] Limit token permissions
  - [ ] Use separate tokens per service
  
Monitoring:
  - [ ] Enable query logging
  - [ ] Monitor failed auth attempts
  - [ ] Set up security alerts
  - [ ] Track token usage
  
Backup:
  - [ ] Automated daily backups
  - [ ] Encrypted backup storage
  - [ ] Test restore procedures
  - [ ] Off-site backup copies
  
Updates:
  - [ ] Regular security patches
  - [ ] Version update policy
  - [ ] Change management process
```

---

## Best Practices Summary

### User Management
- ✅ Use principle of least privilege
- ✅ Implement role-based access control
- ✅ Regular access audits
- ✅ Disable unused accounts
- ✅ Use strong authentication

### Security
- ✅ Enable HTTPS in production
- ✅ Network segmentation
- ✅ Token rotation policy
- ✅ Audit logging enabled
- ✅ Regular security reviews

### Backup
- ✅ Automated daily backups
- ✅ Test restores regularly
- ✅ Off-site backup storage
- ✅ Encryption at rest
- ✅ Documented procedures

### Migration
- ✅ Plan and test thoroughly
- ✅ Use official tools
- ✅ Maintain data consistency
- ✅ Rollback strategy
- ✅ Validate after migration

### Templates
- ✅ Version control templates
- ✅ Document usage
- ✅ Test before production
- ✅ Modular design
- ✅ Consistent naming

---

## Key Takeaways

1. **User Management**: Implement proper RBAC with least privilege
2. **Authentication**: Use token-based auth with regular rotation
3. **Security**: Enable HTTPS, firewall, and audit logging
4. **Backup**: Automated, tested, and off-site backups
5. **Migration**: Plan carefully, test thoroughly, validate completely
6. **Templates**: Infrastructure as code for consistency

---

## Additional Resources

- InfluxDB Security: https://docs.influxdata.com/influxdb/v2.0/security/
- Backup Guide: https://docs.influxdata.com/influxdb/v2.0/backup-restore/
- Migration Tools: https://docs.influxdata.com/influxdb/v2.0/upgrade/
- Templates: https://github.com/influxdata/community-templates

---

*End of Course - Duration: 60 minutes*

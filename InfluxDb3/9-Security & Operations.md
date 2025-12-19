# 9️⃣ Security & Operations

---

## 9.1 Authentication Overview

### **Authentication Methods in InfluxDB 3:**

```
┌─────────────────────────────────────────────────────────┐
│           InfluxDB Authentication Methods               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. API Tokens (Primary Method)                         │
│     ├─ All-access tokens                                │
│     ├─ Read-only tokens                                 │
│     ├─ Write-only tokens                                │
│     └─ Custom permission tokens                         │
│                                                         │
│  2. Username/Password (Legacy/Initial Setup)            │
│     ├─ Used for initial setup                           │
│     └─ Generates tokens                                 │
│                                                         │
│  3. OAuth 2.0 (Enterprise/Cloud)                        │
│     ├─ Google, GitHub, Azure AD                         │
│     └─ SAML integration                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 9.2 Token Management

### **Token Types:**

**1. All-Access Token:**

bash

```bash
# Create all-access token (admin)
influx auth create \
  --org my-org \
  --all-access \
  --description "Admin token for full access"
```

**Permissions:**

```
✓ Read/Write all buckets
✓ Manage users
✓ Create/delete buckets
✓ Manage tokens
✓ Full system access
```

**Use case:** Admin operations, development

---

**2. Read Token:**

bash

```bash
# Create read-only token
influx auth create \
  --org my-org \
  --read-bucket-id BUCKET_ID \
  --description "Read-only token for monitoring dashboard"
```

**Permissions:**

```
✓ Read specified bucket
✗ Cannot write data
✗ Cannot modify bucket
```

**Use case:** Dashboards, reporting tools

---

**3. Write Token:**

bash

```bash
# Create write-only token
influx auth create \
  --org my-org \
  --write-bucket-id BUCKET_ID \
  --description "Write-only token for data ingestion"
```

**Permissions:**

```
✓ Write to specified bucket
✗ Cannot read data
✗ Cannot modify bucket
```

**Use case:** Data collectors, agents, IoT devices

---

**4. Custom Permissions Token:**

bash

```bash
# Create token with specific permissions
influx auth create \
  --org my-org \
  --read-bucket BUCKET1_ID \
  --write-bucket BUCKET2_ID \
  --description "Custom permissions for specific use case"
```

---

### **Token Management Script:**

python

```python
#!/usr/bin/env python3

import requests
import json
from datetime import datetime, timedelta

class TokenManager:
    def __init__(self, influx_url, admin_token, org):
        self.influx_url = influx_url
        self.admin_token = admin_token
        self.org = org
        self.headers = {
            "Authorization": f"Token {admin_token}",
            "Content-Type": "application/json"
        }
  
    def create_token(self, description, permissions, expires_in_days=None):
        """Create a new token with specific permissions"""
  
        # Prepare request
        payload = {
            "orgID": self.get_org_id(),
            "description": description,
            "permissions": permissions
        }
  
        # Add expiration if specified
        if expires_in_days:
            expiry = datetime.utcnow() + timedelta(days=expires_in_days)
            payload["expires"] = expiry.isoformat() + "Z"
  
        response = requests.post(
            f"{self.influx_url}/api/v2/authorizations",
            headers=self.headers,
            json=payload
        )
  
        if response.status_code == 201:
            token_data = response.json()
            print(f"✓ Token created: {description}")
            print(f"  Token: {token_data['token']}")
            print(f"  ID: {token_data['id']}")
            return token_data
        else:
            print(f"✗ Error creating token: {response.status_code}")
            print(response.text)
            return None
  
    def list_tokens(self):
        """List all tokens for the organization"""
  
        response = requests.get(
            f"{self.influx_url}/api/v2/authorizations",
            headers=self.headers,
            params={"org": self.org}
        )
  
        if response.status_code == 200:
            tokens = response.json().get("authorizations", [])
  
            print(f"\nTokens for organization '{self.org}':")
            print(f"{'ID':<20} {'Description':<40} {'Status':<10}")
            print("-" * 70)
  
            for token in tokens:
                token_id = token['id']
                description = token.get('description', 'N/A')
                status = token.get('status', 'active')
  
                print(f"{token_id:<20} {description:<40} {status:<10}")
  
            return tokens
        else:
            print(f"Error listing tokens: {response.status_code}")
            return []
  
    def revoke_token(self, token_id):
        """Revoke (delete) a token"""
  
        response = requests.delete(
            f"{self.influx_url}/api/v2/authorizations/{token_id}",
            headers=self.headers
        )
  
        if response.status_code == 204:
            print(f"✓ Token {token_id} revoked successfully")
            return True
        else:
            print(f"✗ Error revoking token: {response.status_code}")
            return False
  
    def get_org_id(self):
        """Get organization ID"""
        response = requests.get(
            f"{self.influx_url}/api/v2/orgs",
            headers=self.headers,
            params={"org": self.org}
        )
  
        if response.status_code == 200:
            orgs = response.json().get("orgs", [])
            if orgs:
                return orgs[0]['id']
        return None
  
    def get_bucket_id(self, bucket_name):
        """Get bucket ID by name"""
        response = requests.get(
            f"{self.influx_url}/api/v2/buckets",
            headers=self.headers,
            params={"org": self.org, "name": bucket_name}
        )
  
        if response.status_code == 200:
            buckets = response.json().get("buckets", [])
            if buckets:
                return buckets[0]['id']
        return None
  
    def create_read_only_token(self, bucket_name, description, expires_in_days=90):
        """Create read-only token for specific bucket"""
  
        bucket_id = self.get_bucket_id(bucket_name)
        if not bucket_id:
            print(f"✗ Bucket '{bucket_name}' not found")
            return None
  
        permissions = [
            {
                "action": "read",
                "resource": {
                    "type": "buckets",
                    "id": bucket_id,
                    "orgID": self.get_org_id()
                }
            }
        ]
  
        return self.create_token(description, permissions, expires_in_days)
  
    def create_write_only_token(self, bucket_name, description, expires_in_days=90):
        """Create write-only token for specific bucket"""
  
        bucket_id = self.get_bucket_id(bucket_name)
        if not bucket_id:
            print(f"✗ Bucket '{bucket_name}' not found")
            return None
  
        permissions = [
            {
                "action": "write",
                "resource": {
                    "type": "buckets",
                    "id": bucket_id,
                    "orgID": self.get_org_id()
                }
            }
        ]
  
        return self.create_token(description, permissions, expires_in_days)
  
    def create_read_write_token(self, bucket_name, description, expires_in_days=90):
        """Create read+write token for specific bucket"""
  
        bucket_id = self.get_bucket_id(bucket_name)
        if not bucket_id:
            print(f"✗ Bucket '{bucket_name}' not found")
            return None
  
        org_id = self.get_org_id()
  
        permissions = [
            {
                "action": "read",
                "resource": {
                    "type": "buckets",
                    "id": bucket_id,
                    "orgID": org_id
                }
            },
            {
                "action": "write",
                "resource": {
                    "type": "buckets",
                    "id": bucket_id,
                    "orgID": org_id
                }
            }
        ]
  
        return self.create_token(description, permissions, expires_in_days)

# Usage Examples
if __name__ == "__main__":
    manager = TokenManager(
        influx_url="http://localhost:8086",
        admin_token="YOUR_ADMIN_TOKEN",
        org="my-org"
    )
  
    # Create read-only token for dashboard
    token1 = manager.create_read_only_token(
        bucket_name="metrics",
        description="Dashboard read-only token",
        expires_in_days=90
    )
  
    # Create write-only token for data collector
    token2 = manager.create_write_only_token(
        bucket_name="metrics",
        description="IoT collector write token",
        expires_in_days=365
    )
  
    # List all tokens
    manager.list_tokens()
  
    # Revoke a token (when needed)
    # manager.revoke_token("TOKEN_ID_HERE")
```

---

### **Token Rotation Best Practices:**

python

```python
class TokenRotationManager:
    def __init__(self, token_manager):
        self.token_manager = token_manager
        self.rotation_log = []
  
    def rotate_token(self, old_token_id, bucket_name, description):
        """Rotate a token (create new, revoke old)"""
  
        print(f"\n{'='*60}")
        print(f"Rotating token: {description}")
        print('='*60)
  
        # Step 1: Create new token
        print("\n1. Creating new token...")
        new_token = self.token_manager.create_read_write_token(
            bucket_name=bucket_name,
            description=f"{description} (rotated {datetime.now().strftime('%Y-%m-%d')})",
            expires_in_days=90
        )
  
        if not new_token:
            print("✗ Failed to create new token. Aborting rotation.")
            return None
  
        new_token_value = new_token['token']
        new_token_id = new_token['id']
  
        print(f"\n⚠️  NEW TOKEN (save this immediately):")
        print(f"   {new_token_value}")
        print(f"\n⚠️  Update your applications with this new token before revoking the old one!")
  
        # Step 2: Wait for confirmation
        print("\n2. Please update all applications with the new token.")
        confirmation = input("   Type 'yes' to revoke the old token: ")
  
        if confirmation.lower() != 'yes':
            print("✗ Rotation cancelled. Old token still active.")
            return new_token
  
        # Step 3: Revoke old token
        print("\n3. Revoking old token...")
        if self.token_manager.revoke_token(old_token_id):
            print("✓ Token rotation completed successfully")
  
            # Log rotation
            self.rotation_log.append({
                'timestamp': datetime.now().isoformat(),
                'old_token_id': old_token_id,
                'new_token_id': new_token_id,
                'description': description
            })
  
            return new_token
        else:
            print("✗ Failed to revoke old token. Manual intervention required!")
            return None
  
    def get_rotation_log(self):
        """Get token rotation history"""
        return self.rotation_log

# Usage
rotation_manager = TokenRotationManager(token_manager)

# Rotate a token (recommended every 90 days)
rotation_manager.rotate_token(
    old_token_id="OLD_TOKEN_ID",
    bucket_name="metrics",
    description="Production data collector"
)
```

---

## 9.3 Authorization & Permissions

### **Permission Levels:**

```
┌─────────────────────────────────────────────────────────┐
│            InfluxDB Permission Model                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Organization Level:                                    │
│  ├─ Owner: Full control                                 │
│  ├─ Member: Limited access                              │
│  └─ Read-only: View only                                │
│                                                         │
│  Bucket Level:                                          │
│  ├─ Read: Query data                                    │
│  ├─ Write: Insert data                                  │
│  └─ Admin: Manage bucket settings                       │
│                                                         │
│  Token Scope:                                           │
│  ├─ Specific buckets                                    │
│  ├─ Time-limited (expiration)                           │
│  └─ Action-specific (read/write)                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### **Least Privilege Principle:**

python

```python
# ❌ BAD: All-access token for everything
admin_token = "use-everywhere"

# ✅ GOOD: Specific tokens for specific purposes
tokens = {
    'dashboard': create_read_only_token('metrics'),
    'collector': create_write_only_token('metrics'),
    'backup': create_read_only_token('all-buckets'),
    'admin': create_all_access_token()  # Only for admin tasks
}

# Use appropriate token for each service
dashboard.connect(tokens['dashboard'])
collector.connect(tokens['collector'])
```

---

## 9.4 Network Security

### **TLS/SSL Configuration:**

**Generate Self-Signed Certificate (Development):**

bash

```bash
#!/bin/bash
# generate_ssl_cert.sh

# Generate private key
openssl genrsa -out influxdb-selfsigned.key 2048

# Generate certificate signing request
openssl req -new -key influxdb-selfsigned.key \
  -out influxdb.csr \
  -subj "/C=IN/ST=Karnataka/L=Bengaluru/O=MyOrg/CN=localhost"

# Generate self-signed certificate (valid 365 days)
openssl x509 -req -days 365 \
  -in influxdb.csr \
  -signkey influxdb-selfsigned.key \
  -out influxdb-selfsigned.crt

# Set proper permissions
chmod 600 influxdb-selfsigned.key
chmod 644 influxdb-selfsigned.crt

echo "SSL certificate generated successfully!"
echo "Key: influxdb-selfsigned.key"
echo "Certificate: influxdb-selfsigned.crt"
```

---

**InfluxDB TLS Configuration:**

toml

```toml
# /etc/influxdb/influxdb.conf

[http]
  # Enable HTTPS
  https-enabled = true
  
  # Certificate path
  https-certificate = "/etc/ssl/influxdb-selfsigned.crt"
  
  # Private key path
  https-private-key = "/etc/ssl/influxdb-selfsigned.key"
  
  # Bind address
  bind-address = ":8086"
```

---

**Client Connection with TLS:**

python

```python
import requests

# ❌ Insecure (HTTP)
response = requests.post(
    "http://localhost:8086/api/v2/write",
    headers={"Authorization": f"Token {token}"},
    data=data
)

# ✅ Secure (HTTPS)
response = requests.post(
    "https://localhost:8086/api/v2/write",
    headers={"Authorization": f"Token {token}"},
    data=data,
    verify=True  # Verify SSL certificate
)

# For self-signed certificates (development only)
response = requests.post(
    "https://localhost:8086/api/v2/write",
    headers={"Authorization": f"Token {token}"},
    data=data,
    verify="/path/to/influxdb-selfsigned.crt"  # Path to cert
)
```

---

### **Firewall Configuration:**

bash

```bash
#!/bin/bash
# firewall_setup.sh

# Allow InfluxDB port (8086) from specific IPs only
ufw allow from 192.168.1.0/24 to any port 8086 proto tcp

# Or allow from specific IPs
ufw allow from 192.168.1.100 to any port 8086 proto tcp
ufw allow from 192.168.1.101 to any port 8086 proto tcp

# Block all other access
ufw deny 8086/tcp

# Enable firewall
ufw enable

# Check status
ufw status numbered
```

---

## 9.5 Backup Strategies

### **Strategy 1: Full Backup (CLI)**

bash

```bash
#!/bin/bash
# full_backup.sh

set -e  # Exit on error

# Configuration
BACKUP_DIR="/backup/influxdb"
DATE=$(date +%Y%m%d_%H%M%S)
ORG="my-org"
TOKEN="YOUR_ADMIN_TOKEN"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR/$DATE"

echo "Starting full backup: $DATE"

# Get list of all buckets
BUCKETS=$(influx bucket list --org "$ORG" --token "$TOKEN" --json | jq -r '.[].name')

# Backup each bucket
for BUCKET in $BUCKETS; do
    echo "Backing up bucket: $BUCKET"
  
    influx backup "$BACKUP_DIR/$DATE" \
        --org "$ORG" \
        --token "$TOKEN" \
        --bucket "$BUCKET"
done

# Compress backup
echo "Compressing backup..."
tar -czf "$BACKUP_DIR/influx_backup_$DATE.tar.gz" \
    -C "$BACKUP_DIR" "$DATE"

# Remove uncompressed backup
rm -rf "$BACKUP_DIR/$DATE"

# Calculate backup size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/influx_backup_$DATE.tar.gz" | cut -f1)
echo "Backup completed: influx_backup_$DATE.tar.gz ($BACKUP_SIZE)"

# Upload to S3 (optional)
if command -v aws &> /dev/null; then
    echo "Uploading to S3..."
    aws s3 cp "$BACKUP_DIR/influx_backup_$DATE.tar.gz" \
        "s3://my-backups/influxdb/" \
        --storage-class STANDARD_IA
    echo "Uploaded to S3"
fi

# Cleanup old backups (keep last 30 days)
echo "Cleaning up old backups..."
find "$BACKUP_DIR" -name "influx_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
echo "Cleanup completed"

# Send notification
echo "Backup completed successfully at $(date)" | \
    mail -s "InfluxDB Backup Success" admin@example.com

echo "Backup process finished successfully!"
```

---

### **Strategy 2: Incremental Backup**

bash

```bash
#!/bin/bash
# incremental_backup.sh

BACKUP_DIR="/backup/influxdb/incremental"
DATE=$(date +%Y%m%d_%H%M%S)
LAST_BACKUP_TIME_FILE="/var/lib/influxdb/last_backup_time"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Get last backup time
if [ -f "$LAST_BACKUP_TIME_FILE" ]; then
    LAST_BACKUP_TIME=$(cat "$LAST_BACKUP_TIME_FILE")
    echo "Last backup: $LAST_BACKUP_TIME"
else
    # First backup - use 24 hours ago
    LAST_BACKUP_TIME=$(date -u -d '24 hours ago' +"%Y-%m-%dT%H:%M:%SZ")
    echo "First backup - starting from: $LAST_BACKUP_TIME"
fi

# Backup only data since last backup
echo "Creating incremental backup..."
influx backup "$BACKUP_DIR/$DATE" \
    --org my-org \
    --token YOUR_TOKEN \
    --bucket my-bucket \
    --start "$LAST_BACKUP_TIME"

# Update last backup time
date -u +"%Y-%m-%dT%H:%M:%SZ" > "$LAST_BACKUP_TIME_FILE"

# Compress
tar -czf "$BACKUP_DIR/incremental_$DATE.tar.gz" \
    -C "$BACKUP_DIR" "$DATE"

rm -rf "$BACKUP_DIR/$DATE"

echo "Incremental backup completed: incremental_$DATE.tar.gz"
```

---

### **Strategy 3: Continuous Backup (Parquet Sync)**

python

```python
#!/usr/bin/env python3

import boto3
import os
import hashlib
import time
from datetime import datetime
from pathlib import Path

class ContinuousBackup:
    def __init__(self, data_dir, s3_bucket, s3_prefix="influxdb-backup"):
        self.data_dir = Path(data_dir)
        self.s3_bucket = s3_bucket
        self.s3_prefix = s3_prefix
        self.s3 = boto3.client('s3')
        self.synced_files = set()
  
    def get_file_hash(self, filepath):
        """Calculate MD5 hash of file"""
        hash_md5 = hashlib.md5()
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
  
    def file_exists_in_s3(self, s3_key):
        """Check if file exists in S3"""
        try:
            self.s3.head_object(Bucket=self.s3_bucket, Key=s3_key)
            return True
        except:
            return False
  
    def sync_file(self, local_path):
        """Sync single file to S3"""
  
        # Calculate relative path for S3 key
        relative_path = local_path.relative_to(self.data_dir)
        s3_key = f"{self.s3_prefix}/{relative_path}"
  
        # Check if already synced
        if str(local_path) in self.synced_files:
            return False
  
        # Check if exists in S3
        if self.file_exists_in_s3(s3_key):
            print(f"  Skip (exists): {relative_path}")
            self.synced_files.add(str(local_path))
            return False
  
        # Upload to S3
        try:
            file_size = local_path.stat().st_size
            print(f"  Uploading: {relative_path} ({file_size:,} bytes)")
  
            self.s3.upload_file(
                str(local_path),
                self.s3_bucket,
                s3_key,
                ExtraArgs={
                    'StorageClass': 'STANDARD_IA',  # Infrequent Access
                    'ServerSideEncryption': 'AES256'
                }
            )
  
            self.synced_files.add(str(local_path))
            print(f"  ✓ Uploaded: {relative_path}")
            return True
  
        except Exception as e:
            print(f"  ✗ Error uploading {relative_path}: {e}")
            return False
  
    def sync_directory(self):
        """Sync all Parquet files to S3"""
  
        print(f"\n[{datetime.now()}] Starting sync...")
  
        uploaded_count = 0
        skipped_count = 0
        error_count = 0
  
        # Find all Parquet files
        parquet_files = list(self.data_dir.rglob("*.parquet"))
  
        print(f"Found {len(parquet_files)} Parquet files")
  
        for parquet_file in parquet_files:
            result = self.sync_file(parquet_file)
            if result is True:
                uploaded_count += 1
            elif result is False:
                skipped_count += 1
            else:
                error_count += 1
  
        print(f"\nSync completed:")
        print(f"  Uploaded: {uploaded_count}")
        print(f"  Skipped:  {skipped_count}")
        print(f"  Errors:   {error_count}")
  
        return uploaded_count, skipped_count, error_count
  
    def run_continuous(self, interval_seconds=300):
        """Run continuous backup"""
  
        print(f"Starting continuous backup to S3://{self.s3_bucket}/{self.s3_prefix}")
        print(f"Sync interval: {interval_seconds} seconds")
        print(f"Data directory: {self.data_dir}\n")
  
        while True:
            try:
                self.sync_directory()
                print(f"\nNext sync in {interval_seconds} seconds...")
                time.sleep(interval_seconds)
  
            except KeyboardInterrupt:
                print("\n\nStopping continuous backup...")
                break
  
            except Exception as e:
                print(f"\n✗ Error: {e}")
                print("Retrying in 60 seconds...")
                time.sleep(60)

# Usage
if __name__ == "__main__":
    backup = ContinuousBackup(
        data_dir="/var/lib/influxdb/engine/data",
        s3_bucket="my-influxdb-backups",
        s3_prefix="production/continuous"
    )
  
    # Run every 5 minutes
    backup.run_continuous(interval_seconds=300)
```

---

### **Restore Process:**

bash

```bash
#!/bin/bash
# restore.sh

set -e

BACKUP_FILE="$1"
ORG="my-org"
TOKEN="YOUR_ADMIN_TOKEN"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore.sh <backup_file.tar.gz>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "========================================"
echo "InfluxDB Restore Process"
echo "========================================"
echo "Backup file: $BACKUP_FILE"
echo "Organization: $ORG"
echo ""
echo "⚠️  WARNING: This will restore data and may overwrite existing data!"
echo ""
read -p "Continue? (yes/no): " confirmation

if [ "$confirmation" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Extract backup
RESTORE_DIR="/tmp/influx_restore_$(date +%s)"
mkdir -p "$RESTORE_DIR"

echo ""
echo "Extracting backup..."
tar -xzf "$BACKUP_FILE" -C "$RESTORE_DIR"

# Find backup directory
BACKUP_DIR=$(find "$RESTORE_DIR" -maxdepth 1 -type d | tail -1)

echo "Backup directory: $BACKUP_DIR"

# Stop InfluxDB (optional, for full restore)
echo ""
read -p "Stop InfluxDB service? (yes/no): " stop_service
if [ "$stop_service" == "yes" ]; then
    echo "Stopping InfluxDB..."
    systemctl stop influxdb
    echo "InfluxDB stopped"
fi

# Restore
echo ""
echo "Starting restore..."
influx restore "$BACKUP_DIR" \
    --org "$ORG" \
    --token "$TOKEN"

# Start InfluxDB (if stopped)
if [ "$stop_service" == "yes" ]; then
    echo ""
    echo "Starting InfluxDB..."
    systemctl start influxdb
    echo "InfluxDB started"
  
    # Wait for InfluxDB to be ready
    echo "Waiting for InfluxDB to be ready..."
    sleep 10
fi

# Verify restore
echo ""
echo "Verifying restore..."
influx bucket list --org "$ORG" --token "$TOKEN"

# Cleanup
echo ""
echo "Cleaning up temporary files..."
rm -rf "$RESTORE_DIR"

echo ""
echo "========================================"
echo "Restore completed successfully!"
echo "========================================"
```

---

## 9.6 Monitoring InfluxDB Itself

### **Health Check Endpoint:**

python

```python
#!/usr/bin/env python3

import requests
import time
from datetime import datetime

class InfluxHealthMonitor:
    def __init__(self, influx_url, token=None):
        self.influx_url = influx_url
        self.token = token
        self.health_url = f"{influx_url}/health"
        self.ping_url = f"{influx_url}/ping"
  
    def check_health(self):
        """Check InfluxDB health endpoint"""
        try:
            response = requests.get(self.health_url, timeout=5)
  
            if response.status_code == 200:
                health_data = response.json()
                status = health_data.get('status', 'unknown')
                version = health_data.get('version', 'unknown')
  
                return {
                    'healthy': status == 'pass',
                    'status': status,
                    'version': version,
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return {
                    'healthy': False,
                    'status': 'error',
                    'error': f'HTTP {response.status_code}',
                    'timestamp': datetime.now().isoformat()
                }
  
        except requests.exceptions.RequestException as e:
            return {
                'healthy': False,
                'status': 'unreachable',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
  
    def check_ping(self):
        """Check ping endpoint (faster health check)"""
        try:
            start = time.time()
            response = requests.get(self.ping_url, timeout=5)
            latency = (time.time() - start) * 1000  # ms
  
            return {
                'reachable': response.status_code == 204,
                'latency_ms': round(latency, 2),
                'timestamp': datetime.now().isoformat()
            }
  
        except requests.exceptions.RequestException as e:
            return {
                'reachable': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
  
    def check_write_performance(self):
        """Test write performance"""
        if not self.token:
            return {'error': 'Token required for write test'}
  
        # Generate test data
        test_data = "health_check,test=true value=1"
  
        try:
            start = time.time()
            response = requests.post(
                f"{self.influx_url}/api/v2/write",
                params={'org': 'my-org', 'bucket': '_monitoring'},
                headers={'Authorization': f'Token {self.token}'},
                data=test_data,
                timeout=5
            )
            latency = (time.time() - start) * 1000
  
            return {
                'writable': response.status_code == 204,
                'write_latency_ms': round(latency, 2),
                'timestamp': datetime.now().isoformat()
            }
  
        except requests.exceptions.RequestException as e:
            return {
                'writable': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
  
    def check_query_performance(self):
        """Test query performance"""
        if not self.token:
            return {'error': 'Token required for query test'}
  
        query = "SELECT COUNT(*) FROM _monitoring WHERE time >= now() - INTERVAL '1 hour'"
  
        try:
            start = time.time()
            response = requests.post(
                f"{self.influx_url}/api/v2/query",
                params={'org': 'my-org'},
                headers={'Authorization': f'Token {self.token}'},
                json={'query': query, 'type': 'sql'},
                timeout=10
            )
            latency = (time.time() - start) * 1000
  
            return {
                'queryable': response.status_code == 200,
                'query_latency_ms': round(latency, 2),
                'timestamp': datetime.now().isoformat()
            }
  
        except requests.exceptions.RequestException as e:
            return {
                'queryable': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
  
    def comprehensive_check(self):
        """Run all health checks"""
        print(f"\n{'='*60}")
        print(f"InfluxDB Health Check - {datetime.now()}")
        print('='*60)
  
        # Health endpoint
        print("\n1. Health Endpoint:")
        health = self.check_health()
        print(f"   Status: {health.get('status', 'unknown')}")
        print(f"   Healthy: {health.get('healthy', False)}")
        if 'version' in health:
            print(f"   Version: {health['version']}")
        if 'error' in health:
            print(f"   Error: {health['error']}")
  
        # Ping
        print("\n2. Ping Check:")
        ping = self.check_ping()
        print(f"   Reachable: {ping.get('reachable', False)}")
        if 'latency_ms' in ping:
            print(f"   Latency: {ping['latency_ms']} ms")
        if 'error' in ping:
            print(f"   Error: {ping['error']}")
  
        # Write performance
        if self.token:
            print("\n3. Write Performance:")
            write = self.check_write_performance()
            print(f"   Writable: {write.get('writable', False)}")
            if 'write_latency_ms' in write:
                print(f"   Latency: {write['write_latency_ms']} ms")
            if 'error' in write:
                print(f"   Error: {write['error']}")
  
            print("\n4. Query Performance:")
            query = self.check_query_performance()
            print(f"   Queryable: {query.get('queryable', False)}")
            if 'query_latency_ms' in query:
                print(f"   Latency: {query['query_latency_ms']} ms")
            if 'error' in query:
                print(f"   Error: {query['error']}")
  
        print(f"\n{'='*60}\n")
  
    def monitor_continuous(self, interval=60):
        """Monitor continuously"""
        print(f"Starting continuous health monitoring (interval={interval}s)")
  
        while True:
            try:
                self.comprehensive_check()
                time.sleep(interval)
            except KeyboardInterrupt:
                print("\nStopping health monitor...")
                break

# Usage
if __name__ == "__main__":
    monitor = InfluxHealthMonitor(
        influx_url="http://localhost:8086",
        token="YOUR_TOKEN"  # Optional, for write/query tests
    )
  
    # Single check
    monitor.comprehensive_check()
  
    # Or continuous monitoring
    # monitor.monitor_continuous(interval=60)
```

---

## 9.7 Alerting & Incident Response

### **Alert Configuration:**

python

```python
#!/usr/bin/env python3

import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class AlertManager:
    def __init__(self, influx_monitor, smtp_config):
        self.monitor = influx_monitor
        self.smtp_config = smtp_config
        self.alert_history = []
  
    def send_email_alert(self, subject, message):
        """Send email alert"""
  
        msg = MIMEMultipart()
        msg['From'] = self.smtp_config['from']
        msg['To'] = ', '.join(self.smtp_config['to'])
        msg['Subject'] = f"[ALERT] {subject}"
  
        msg.attach(MIMEText(message, 'plain'))
  
        try:
            server = smtplib.SMTP(
                self.smtp_config['host'],
                self.smtp_config['port']
            )
            server.starttls()
            server.login(
                self.smtp_config['username'],
                self.smtp_config['password']
            )
  
            server.send_message(msg)
            server.quit()
  
            print(f"✓ Alert sent: {subject}")
            return True
  
        except Exception as e:
            print(f"✗ Failed to send alert: {e}")
            return False
  
    def check_and_alert(self):
        """Check health and send alerts if needed"""
  
        health = self.monitor.check_health()
        ping = self.monitor.check_ping()
  
        # Check if unhealthy
        if not health.get('healthy', False):
            subject = "InfluxDB Unhealthy"
            message = f"""
InfluxDB health check failed:

Status: {health.get('status', 'unknown')}
Error: {health.get('error', 'N/A')}
Timestamp: {health.get('timestamp')}

Please investigate immediately.
            """
            self.send_email_alert(subject, message)
            self.alert_history.append({
                'type': 'unhealthy',
                'timestamp': health['timestamp']
            })
  
        # Check latency
        if ping.get('reachable') and ping.get('latency_ms', 0) > 100:
            subject = "InfluxDB High Latency"
            message = f"""
InfluxDB ping latency is high:

Latency: {ping['latency_ms']} ms (threshold: 100 ms)
Timestamp: {ping['timestamp']}

Performance may be degraded.
            """
            self.send_email_alert(subject, message)

# Usage
smtp_config = {
    'host': 'smtp.gmail.com',
    'port': 587,
    'username': 'alerts@example.com',
    'password': 'your_password',
    'from': 'alerts@example.com',
    'to': ['admin@example.com', 'oncall@example.com']
}

alert_manager = AlertManager(monitor, smtp_config)

# Run periodic checks
import time
while True:
    alert_manager.check_and_alert()
    time.sleep(300)  # Check every 5 minutes
```

---

## 🎯 Key Takeaways (Module 9)

```
✓ Use specific tokens for specific purposes (least privilege)
✓ Rotate tokens every 90 days
✓ Enable TLS/SSL for production
✓ Implement firewall rules (allow specific IPs only)
✓ Backup daily (full + incremental)
✓ Test restore process regularly
✓ Monitor health continuously
✓ Set up alerting for failures
✓ Keep audit logs
✓ Document incident response procedures
```

---

## 📝 Practice Tasks

**Task 1: Token Management**

python

```python
# Create and test:
1. Read-only token for dashboard
2. Write-only token for collector
3. All-access admin token
4. Implement token rotation
```

**Task 2: Backup & Restore**

bash

```bash
# Implement:
1. Full backup script (automated)
2. Test restore process
3. Verify data integrity
4. Upload to S3
```

**Task 3: Monitoring Setup**

python

```python
# Build monitoring:
1. Health check every minute
2. Alert on failure
3. Track metrics (latency, availability)
4. Create dashboard
```

**Task 4: Security Audit**

```
# Review and implement:
1. TLS/SSL configuration
2. Firewall rules
3. Token expiration policies
4. Access logs analysis
```

---

## 🚀 Final Module Preview

**Module 10: Real-World Use Cases & Demo Projects**

* Complete IoT monitoring system
* Application metrics dashboard
* DevOps observability platform
* Financial time-series analysis
* Log aggregation system
* End-to-end implementations
* Best practices summary
* Interview preparation Q&A

**Ready for Module 10 (Final)?** Let me know! 💪 Ab real-world projects implement karenge!

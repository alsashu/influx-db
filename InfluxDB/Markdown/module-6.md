# InfluxDB: Performance Tuning and Scaling
## Complete 75-Minute Course

---

## Course Overview

**Duration:** 75 minutes  
**Level:** Advanced  
**Prerequisites:** Strong understanding of InfluxDB fundamentals, retention policies, and continuous queries

### Learning Objectives

By the end of this course, you will be able to:
- Optimize InfluxDB performance through indexing and compression techniques
- Design and implement clustering and sharding strategies for horizontal scaling
- Manage high write and query loads effectively
- Tune disk I/O, memory, and caching for optimal performance
- Monitor performance metrics and identify bottlenecks
- Apply proven tuning techniques and avoid common pitfalls

---

## Module 1: Indexing and Compression Techniques (15 minutes)

### 1.1 Understanding InfluxDB Storage Architecture

**Core Components:**
- **Time-Structured Merge Tree (TSM):** Primary storage engine
- **Write-Ahead Log (WAL):** Ensures durability before data is persisted
- **In-Memory Cache:** Stores recent writes for fast access
- **TSM Files:** Compressed, immutable files on disk
- **Index:** In-memory structure for fast tag lookups

**Data Flow:**
```
Write → WAL → In-Memory Cache → TSM File (with compression)
                     ↓
                  Index (Tags)
```

### 1.2 Tag vs Field Strategy

**Critical Decision:** Tags are indexed, fields are not!

**Best Practices:**

**Use Tags For:**
- Low cardinality data (< 100,000 unique values)
- Data you'll frequently filter on
- Metadata about measurements (server, region, device_id)
- Grouping dimensions

**Use Fields For:**
- High cardinality data
- Actual metric values
- Data that changes frequently
- Numeric measurements

**Example: Good Design**
```influxql
-- GOOD: Low cardinality tags, metrics as fields
INSERT cpu_usage,host=server01,region=us-east,env=prod value=45.2,user=12.3,system=8.1
```

**Example: Bad Design**
```influxql
-- BAD: High cardinality tag (timestamp-based user_id)
INSERT api_request,user_id=user_12345678,endpoint=/api/data response_time=125

-- BETTER: Use user_id as field or hash into buckets
INSERT api_request,user_bucket=bucket_123,endpoint=/api/data response_time=125,user_id="user_12345678"
```

### 1.3 Tag Cardinality Impact

**Understanding Cardinality:**
Cardinality = Number of unique tag value combinations

**Cardinality Calculation:**
```
Total Series = tag1_values × tag2_values × tag3_values × ... × measurements

Example:
- 1000 hosts × 10 regions × 5 environments × 20 measurements
= 1,000,000 series
```

**Cardinality Guidelines:**

| Cardinality Level | Series Count | Impact | Action |
|-------------------|--------------|--------|--------|
| Low | < 100K | Optimal | No action needed |
| Medium | 100K - 1M | Acceptable | Monitor closely |
| High | 1M - 10M | Performance degradation | Redesign schema |
| Very High | > 10M | Severe issues | Immediate redesign required |

**Checking Cardinality:**
```influxql
-- Show series cardinality
SHOW SERIES CARDINALITY

-- Show exact series count
SHOW SERIES

-- Show measurement cardinality
SHOW MEASUREMENT CARDINALITY

-- Show tag key cardinality
SHOW TAG KEY CARDINALITY

-- Show tag values for specific key
SHOW TAG VALUES CARDINALITY WITH KEY = "host"
```

### 1.4 Index Optimization

**TSI (Time Series Index) vs TSM:**

**In-Memory Index (Default for small datasets):**
- Fast lookups
- Limited by RAM
- Suitable for < 1M series

**TSI (Time Series Index - Recommended for production):**
- Disk-backed index
- Supports billions of series
- Better memory efficiency

**Enabling TSI:**
```toml
# influxdb.conf
[data]
  index-version = "tsi1"
```

**Index Cache Settings:**
```toml
[data]
  # Cache size for series metadata (default: 1GB)
  cache-max-memory-size = "1g"
  
  # Snapshot write cold duration (default: 10m)
  cache-snapshot-memory-size = "25m"
  
  # Maximum series per database (default: 1M)
  max-series-per-database = 1000000
  
  # Maximum values per tag
  max-values-per-tag = 100000
```

### 1.5 Compression Techniques

**InfluxDB Compression Algorithms:**

**1. Timestamp Compression (Delta-of-Delta encoding):**
```
Original: [1000, 1010, 1020, 1030, 1040]
Deltas:   [10, 10, 10, 10, 10]
Encoded:  Base(1000) + Delta(10) + Count(5)
Compression Ratio: ~10:1
```

**2. Integer Compression (Run-Length Encoding + Delta):**
```
Original: [100, 100, 100, 101, 101, 102]
Encoded:  (100, 3), (101, 2), (102, 1)
Compression Ratio: 5-20:1
```

**3. Float Compression (Gorilla algorithm):**
```
XOR-based compression for float64 values
Compression Ratio: 10-30:1 for typical metrics
```

**4. String Compression (Snappy):**
```
Dictionary-based compression
Compression Ratio: 2-5:1
```

**Compression Best Practices:**

1. **Write in Batches:**
```
Bad:  1 point every second = 86,400 writes/day
Good: 1000 points every 1000 seconds = 86.4 writes/day
Better compression and write efficiency
```

2. **Consistent Timestamp Intervals:**
```
Good: 1s, 10s, 60s regular intervals
Bad:  Irregular timestamps (0.8s, 1.3s, 0.9s, 1.1s)
Regular intervals compress better
```

3. **Order Writes by Time:**
```
Good: Points arrive in chronological order
Bad:  Out-of-order writes (require recompaction)
```

**Monitoring Compression:**
```bash
# Check disk usage vs logical data size
du -sh /var/lib/influxdb/data/mydb/

# Show shard disk sizes
influx -execute "SHOW SHARDS" | grep mydb

# Compression ratio calculation
Compression Ratio = Logical Size / Disk Size
Good ratio: 5:1 to 20:1
```

### 1.6 Schema Design for Performance

**Pattern 1: Time-Based Bucketing**
```influxql
-- Instead of high-cardinality user_id tag
INSERT metrics,user_bucket=bucket_042,service=api value=1

-- user_bucket = hash(user_id) % 1000
-- Reduces cardinality from millions to 1000
```

**Pattern 2: Hierarchical Tags**
```influxql
-- Good: Hierarchical organization
INSERT metrics,datacenter=us-east,rack=r1,server=s01 cpu=45

-- Bad: Flat structure
INSERT metrics,location=us-east-r1-s01 cpu=45
```

**Pattern 3: Measurement Strategy**
```influxql
-- Option A: Wide measurement (fewer measurements, more fields)
INSERT system,host=server01 cpu=45,mem=78,disk=82

-- Option B: Narrow measurement (more measurements, fewer fields)
INSERT cpu,host=server01 value=45
INSERT mem,host=server01 value=78
INSERT disk,host=server01 value=82

-- Wide is generally better for related metrics
```

### 1.7 Practical Examples

**Example 1: Optimizing IoT Device Schema**

**Before (High Cardinality):**
```influxql
-- Problem: device_id has 10M unique values
INSERT sensor_data,device_id=dev_00001234,type=temp value=22.5
-- Series count: 10,000,000 × 5 types = 50M series!
```

**After (Optimized):**
```influxql
-- Solution: Use device_bucket (1000 buckets)
INSERT sensor_data,device_bucket=bucket_234,type=temp value=22.5,device_id="dev_00001234"
-- Series count: 1,000 × 5 types = 5K series
-- Query by device_id: WHERE device_id = 'dev_00001234'
```

**Example 2: API Monitoring**

**Before:**
```influxql
-- Problem: endpoint URLs are high cardinality
INSERT api_metrics,endpoint=/api/users/12345/profile response_time=125
```

**After:**
```influxql
-- Solution: Parameterize endpoints
INSERT api_metrics,endpoint=/api/users/:id/profile response_time=125,user_id="12345"
-- Or use endpoint patterns
INSERT api_metrics,route=user_profile response_time=125,full_path="/api/users/12345/profile"
```

---

## Module 2: Clustering and Sharding (20 minutes)

### 2.1 InfluxDB Clustering Architecture

**InfluxDB Enterprise Clustering:**

```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
      ┌─────▼─────┐    ┌────▼────┐    ┌─────▼─────┐
      │  Data     │    │  Data   │    │  Data     │
      │  Node 1   │    │  Node 2 │    │  Node 3   │
      └───────────┘    └─────────┘    └───────────┘
            │                │                │
            └────────────────┴────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Meta Nodes    │
                    │   (Consensus)   │
                    └─────────────────┘
```

**Components:**

**Meta Nodes (Consensus Layer):**
- Store cluster metadata
- Manage cluster membership
- Coordinate data placement
- Recommend: 3 meta nodes for HA

**Data Nodes:**
- Store actual time-series data
- Serve queries
- Handle writes
- Scale horizontally

### 2.2 Sharding Strategy

**What is a Shard?**
A shard is a logical partition of data based on time and retention policy.

**Shard Structure:**
```
Database: metrics
├── Retention Policy: default (7d)
│   ├── Shard 1: 2024-11-01 to 2024-11-02
│   ├── Shard 2: 2024-11-02 to 2024-11-03
│   └── Shard 3: 2024-11-03 to 2024-11-04
└── Retention Policy: long_term (365d)
    ├── Shard 1: 2024-11-01 to 2024-11-08
    └── Shard 2: 2024-11-08 to 2024-11-15
```

**Shard Group Duration Guidelines:**

| Retention Period | Recommended Shard Duration |
|------------------|---------------------------|
| < 2 days | 1 hour |
| 2 days - 6 months | 1 day |
| 6 months - 2 years | 7 days |
| > 2 years | 30 days |

**Setting Shard Duration:**
```influxql
-- Create RP with specific shard duration
CREATE RETENTION POLICY "high_frequency"
ON "metrics"
DURATION 7d
REPLICATION 1
SHARD DURATION 1h

-- Modify existing RP
ALTER RETENTION POLICY "high_frequency"
ON "metrics"
SHARD DURATION 2h
```

### 2.3 Replication Factor

**Replication Configuration:**
```influxql
-- Replication factor 1 (no redundancy)
CREATE RETENTION POLICY "no_replication"
ON "metrics"
DURATION 30d
REPLICATION 1

-- Replication factor 2 (1 copy)
CREATE RETENTION POLICY "with_replication"
ON "metrics"
DURATION 30d
REPLICATION 2

-- Replication factor 3 (2 copies)
CREATE RETENTION POLICY "high_availability"
ON "metrics"
DURATION 30d
REPLICATION 3
```

**Replication Trade-offs:**

| Factor | Availability | Storage Cost | Write Latency |
|--------|-------------|--------------|---------------|
| 1 | Low | 1x | Lowest |
| 2 | Medium | 2x | Medium |
| 3 | High | 3x | Higher |

**Recommendations:**
- **Development:** Replication factor 1
- **Production (non-critical):** Replication factor 2
- **Production (mission-critical):** Replication factor 3

### 2.4 Data Distribution

**Consistent Hashing:**
InfluxDB uses consistent hashing to distribute data across nodes.

**Distribution Factors:**
1. **Database name**
2. **Retention policy**
3. **Shard group time range**
4. **Series key** (measurement + tags)

**Example Distribution:**
```
Series: cpu,host=server01,region=us-east
Hash: md5("cpu,host=server01,region=us-east")
Node: Hash % number_of_nodes

With 3 nodes:
- 33% of series → Node 1
- 33% of series → Node 2
- 34% of series → Node 3
```

### 2.5 Scaling Out Strategies

**Strategy 1: Horizontal Scaling (Add Nodes)**

**When to Scale:**
- CPU consistently > 80%
- Memory usage > 80%
- Disk I/O saturated
- Query latency increasing

**Steps to Add a Node:**
```bash
# 1. Install InfluxDB on new server
sudo apt-get install influxdb

# 2. Configure as data node
# Edit /etc/influxdb/influxdb.conf
[meta]
  dir = "/var/lib/influxdb/meta"

# 3. Join cluster
influxd-ctl add-data <new-node-hostname>:8088

# 4. Verify cluster status
influxd-ctl show
```

**Strategy 2: Vertical Scaling (Upgrade Hardware)**

**Component Priority:**
1. **RAM:** Most impactful (target: 32GB minimum)
2. **CPU:** Moderate impact (target: 8+ cores)
3. **Disk:** NVME SSD recommended

**Strategy 3: Database Separation**

```
Architecture:
├── Cluster 1: Real-time data (7 days)
│   ├── High write throughput
│   └── Fast queries
├── Cluster 2: Historical data (1 year)
│   ├── Lower write rate
│   └── Analytical queries
└── Cluster 3: Archive (5+ years)
    ├── Minimal writes
    └── Long-term storage
```

### 2.6 Query Routing and Load Balancing

**Load Balancer Configuration:**

**HAProxy Example:**
```haproxy
frontend influxdb_frontend
    bind *:8086
    mode tcp
    default_backend influxdb_backend

backend influxdb_backend
    mode tcp
    balance roundrobin
    option tcp-check
    server influx1 10.0.1.10:8086 check
    server influx2 10.0.1.11:8086 check
    server influx3 10.0.1.12:8086 check
```

**NGINX Example:**
```nginx
upstream influxdb {
    least_conn;
    server 10.0.1.10:8086 max_fails=3 fail_timeout=30s;
    server 10.0.1.11:8086 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:8086 max_fails=3 fail_timeout=30s;
}

server {
    listen 8086;
    location / {
        proxy_pass http://influxdb;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Load Balancing Algorithms:**
- **Round Robin:** Equal distribution
- **Least Connections:** Send to least busy node
- **IP Hash:** Sticky sessions based on client IP

### 2.7 Cluster Monitoring

**Key Metrics to Monitor:**

```bash
# Cluster health
influxd-ctl show

# Shard distribution
influxd-ctl show-shards

# Copy shard to another node (rebalancing)
influxd-ctl copy-shard <source>:8088 <dest>:8088 <shard-id>

# Remove shard from node
influxd-ctl remove-shard <node>:8088 <shard-id>
```

**Health Check Queries:**
```influxql
-- Check cluster members
SHOW SERVERS

-- Check shard groups
SHOW SHARD GROUPS

-- Check data nodes
SHOW DATA NODES
```

---

## Module 3: Managing Write and Query Load (20 minutes)

### 3.1 Write Performance Optimization

**Write Path Analysis:**
```
Client → Network → WAL → Cache → TSM Files
         ↓          ↓       ↓        ↓
      Batching   Durability Mem    Compression
```

**Key Write Metrics:**
- **Throughput:** Points per second
- **Latency:** Time to acknowledge write
- **Batch size:** Points per write request
- **WAL sync:** Disk write frequency

### 3.2 Batch Writing

**Optimal Batch Sizes:**

| Scenario | Points per Batch | Frequency |
|----------|-----------------|-----------|
| High throughput | 5,000 - 10,000 | Every 1-10s |
| Medium throughput | 1,000 - 5,000 | Every 10-60s |
| Low throughput | 100 - 1,000 | Every 60s+ |

**Example: Python Batch Writer**
```python
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

client = InfluxDBClient(url="http://localhost:8086", token="my-token", org="my-org")
write_api = client.write_api(write_options=SYNCHRONOUS)

# Batch write
points = []
for i in range(5000):
    point = Point("measurement") \
        .tag("host", "server01") \
        .field("value", i) \
        .time(datetime.utcnow())
    points.append(point)

# Write entire batch at once
write_api.write(bucket="my-bucket", record=points)
```

**Line Protocol Batch Example:**
```bash
# Create batch file
cat > batch_data.txt << EOF
cpu,host=server01,region=us-east value=45.2 1699891200000000000
cpu,host=server01,region=us-east value=46.1 1699891201000000000
cpu,host=server01,region=us-east value=44.8 1699891202000000000
EOF

# Write batch via curl
curl -XPOST 'http://localhost:8086/write?db=mydb' \
  --data-binary @batch_data.txt
```

### 3.3 Write Configuration Tuning

**Critical Settings in influxdb.conf:**

```toml
[data]
  # Cache settings
  cache-max-memory-size = "1g"           # Max cache before flush
  cache-snapshot-memory-size = "256m"     # Snapshot size
  cache-snapshot-write-cold-duration = "10m"  # Flush inactive shards
  
  # WAL settings
  wal-fsync-delay = "0s"                 # 0s = sync every write (safe)
                                         # 100ms = batch syncs (faster)
  
  # Compaction
  compact-full-write-cold-duration = "4h"  # When to compact cold shards
  max-concurrent-compactions = 0         # 0 = 50% of CPU cores
  
  # Series limits
  max-series-per-database = 1000000      # Prevent runaway cardinality
  max-values-per-tag = 100000           # Limit tag value cardinality

[http]
  # Connection settings
  max-connection-limit = 0               # 0 = unlimited
  max-row-limit = 10000                 # Query result limit
  
  # Write settings
  write-tracing = false                  # Enable for debugging
  max-body-size = 25000000              # 25MB max request size
```

**Performance vs Durability Trade-off:**

```toml
# Maximum Durability (Safest)
[data]
  wal-fsync-delay = "0s"
# Every write synced to disk immediately
# Slowest writes, no data loss

# Balanced
[data]
  wal-fsync-delay = "100ms"
# Syncs every 100ms
# Good balance, minimal risk

# Maximum Performance (Risky)
[data]
  wal-fsync-delay = "1s"
# Syncs every second
# Fastest writes, potential data loss on crash
```

### 3.4 Query Performance Optimization

**Query Execution Analysis:**

```influxql
-- Explain query plan
EXPLAIN SELECT MEAN("value") 
FROM "cpu" 
WHERE time > now() - 1h 
GROUP BY "host"

-- Analyze query
EXPLAIN ANALYZE SELECT MEAN("value") 
FROM "cpu" 
WHERE time > now() - 1h 
GROUP BY "host"
```

**Query Optimization Techniques:**

**1. Time Range Filtering:**
```influxql
-- BAD: No time filter (scans all data)
SELECT * FROM cpu WHERE host = 'server01'

-- GOOD: Limit time range
SELECT * FROM cpu 
WHERE host = 'server01' 
  AND time > now() - 1h

-- BETTER: Precise time range
SELECT * FROM cpu 
WHERE host = 'server01'
  AND time >= '2024-11-13T00:00:00Z' 
  AND time < '2024-11-13T01:00:00Z'
```

**2. Tag Filtering:**
```influxql
-- BAD: Filter on field (full scan)
SELECT * FROM cpu WHERE value > 80

-- GOOD: Filter on tag first
SELECT * FROM cpu 
WHERE host = 'server01' 
  AND time > now() - 1h 
  AND value > 80
```

**3. Limit Results:**
```influxql
-- BAD: Return all results
SELECT * FROM cpu WHERE time > now() - 7d

-- GOOD: Limit results
SELECT * FROM cpu 
WHERE time > now() - 7d 
LIMIT 1000

-- BETTER: Use slimit for series
SELECT * FROM cpu 
WHERE time > now() - 7d 
GROUP BY host 
SLIMIT 10
```

**4. Avoid Regex When Possible:**
```influxql
-- BAD: Regex scan
SELECT * FROM cpu WHERE host =~ /server.*/

-- GOOD: Exact match or IN clause
SELECT * FROM cpu WHERE host = 'server01'
SELECT * FROM cpu WHERE host IN ('server01', 'server02')
```

### 3.5 Query Load Management

**Connection Pooling:**

**Python Example:**
```python
from influxdb_client import InfluxDBClient

# Create client with connection pool
client = InfluxDBClient(
    url="http://localhost:8086",
    token="my-token",
    org="my-org",
    timeout=30000,        # 30s timeout
    enable_gzip=True,     # Compress responses
    pool_size=20          # Connection pool size
)
```

**Query Timeout Configuration:**
```toml
# influxdb.conf
[http]
  max-row-limit = 10000        # Max rows per query
  
[coordinator]
  query-timeout = "0s"          # 0 = no timeout
  max-concurrent-queries = 0    # 0 = unlimited
  max-select-point = 0         # 0 = unlimited points
  max-select-series = 0        # 0 = unlimited series
  max-select-buckets = 0       # 0 = unlimited buckets
```

**Rate Limiting:**

**NGINX Rate Limiting:**
```nginx
http {
    limit_req_zone $binary_remote_addr zone=influx_writes:10m rate=100r/s;
    limit_req_zone $binary_remote_addr zone=influx_queries:10m rate=10r/s;
    
    server {
        location /write {
            limit_req zone=influx_writes burst=200;
            proxy_pass http://influxdb;
        }
        
        location /query {
            limit_req zone=influx_queries burst=20;
            proxy_pass http://influxdb;
        }
    }
}
```

### 3.6 Query Patterns and Anti-Patterns

**Pattern 1: Downsampling for Long Ranges**
```influxql
-- BAD: Query raw data over long period
SELECT MEAN(value) FROM cpu 
WHERE time > now() - 90d 
GROUP BY time(1h)

-- GOOD: Query pre-aggregated data
SELECT MEAN(mean_value) FROM cpu_1h 
WHERE time > now() - 90d 
GROUP BY time(1d)
```

**Pattern 2: Materialized Views via CQs**
```influxql
-- Create CQ for common query
CREATE CONTINUOUS QUERY "cq_top_hosts_5m"
ON "metrics"
BEGIN
  SELECT TOP(value, host, 10) 
  INTO "top_hosts_5m"
  FROM "cpu"
  GROUP BY time(5m)
END

-- Query materialized view (fast)
SELECT * FROM top_hosts_5m WHERE time > now() - 1h
```

**Pattern 3: Selective Field Queries**
```influxql
-- BAD: Select all fields
SELECT * FROM system WHERE time > now() - 1h

-- GOOD: Select only needed fields
SELECT cpu, memory FROM system WHERE time > now() - 1h
```

---

## Module 4: Disk I/O, Caching, and Performance Monitoring (15 minutes)

### 4.1 Disk I/O Optimization

**Storage Layout:**

```
/var/lib/influxdb/
├── data/              # TSM files (main data)
│   ├── mydb/
│   │   ├── autogen/
│   │   │   ├── 1/    # Shard 1
│   │   │   └── 2/    # Shard 2
├── meta/              # Cluster metadata
├── wal/               # Write-Ahead Log
└── tsi/               # Time Series Index (if enabled)
```

**Disk Performance Tiers:**

| Storage Type | Read IOPS | Write IOPS | Use Case |
|--------------|-----------|------------|----------|
| NVME SSD | 100K+ | 50K+ | Hot data, WAL |
| SATA SSD | 10K+ | 5K+ | Warm data |
| HDD | 100-200 | 100-200 | Cold/archive data |

**Recommended Configuration:**

```
Optimal Setup:
├── NVME SSD (500GB): WAL + Cache + Hot data (7 days)
├── SATA SSD (2TB): Warm data (30-90 days)
└── HDD (10TB): Cold data (1+ year)
```

**Mount Options:**
```bash
# /etc/fstab - Optimize for InfluxDB
/dev/nvme0n1 /var/lib/influxdb/wal ext4 noatime,nodiratime,nobarrier 0 2
/dev/sda1 /var/lib/influxdb/data ext4 noatime,nodiratime 0 2
```

**File System Recommendations:**
- **Best:** EXT4 or XFS
- **Avoid:** NFS (high latency)
- **Options:** `noatime` (don't update access time)

### 4.2 Memory and Cache Tuning

**Memory Architecture:**

```
Total System Memory (32GB example)
├── OS + Services: 4GB
├── InfluxDB Process: 28GB
    ├── Cache: 8GB (data cache)
    ├── TSI: 4GB (index cache)
    ├── Query Engine: 8GB (processing)
    └── Buffers: 8GB (connections, etc.)
```

**Cache Configuration:**

```toml
[data]
  # Data cache settings
  cache-max-memory-size = "8g"          # Max cache size
  cache-snapshot-memory-size = "2g"      # Snapshot size
  cache-snapshot-write-cold-duration = "10m"
  
  # Index cache settings
  max-series-per-database = 1000000
  max-values-per-tag = 100000
  
  # Series in-memory cache
  series-id-set-cache-size = 100        # MB for series ID cache
```

**Memory Monitoring:**
```bash
# Check InfluxDB memory usage
ps aux | grep influxd

# System memory
free -h

# Detailed memory breakdown
cat /proc/$(pidof influxd)/status | grep -i vm
```

### 4.3 Operating System Tuning

**Kernel Parameters:**

```bash
# /etc/sysctl.conf

# Increase max open files
fs.file-max = 1000000

# Network tuning
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 134217728
net.ipv4.tcp_wmem = 4096 65536 134217728

# Virtual memory tuning
vm.swappiness = 1                  # Minimize swapping
vm.dirty_ratio = 15                # % of memory before forced write
vm.dirty_background_ratio = 5      # % before background write

# Apply settings
sudo sysctl -p
```

**File Descriptor Limits:**

```bash
# /etc/security/limits.conf
influxdb soft nofile 65536
influxdb hard nofile 65536

# Verify
ulimit -n
```

**Transparent Huge Pages:**

```bash
# Disable THP (recommended for databases)
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag

# Make permanent in /etc/rc.local
echo "echo never > /sys/kernel/mm/transparent_hugepage/enabled" >> /etc/rc.local
```

### 4.4 Performance Monitoring

**Built-in Statistics:**

```influxql
-- Show all stats
SHOW STATS

-- Show write stats
SHOW STATS FOR 'write'

-- Show query stats
SHOW STATS FOR 'queryExecutor'

-- Show shard stats
SHOW STATS FOR 'shard'

-- Show WAL stats
SHOW STATS FOR 'wal'

-- Show cache stats
SHOW STATS FOR 'cache'
```

**Key Metrics to Monitor:**

**1. Write Metrics:**
```influxql
SHOW STATS FOR 'write'

Key Fields:
- writeReq: Total write requests
- writeReqOK: Successful writes
- writeReqErr: Failed writes
- pointReq: Total points written
- pointReqBytes: Bytes written
```

**2. Query Metrics:**
```influxql
SHOW STATS FOR 'queryExecutor'

Key Fields:
- queriesExecuted: Total queries
- queriesFinished: Completed queries
- queryDurationNs: Query execution time
- recoveredPanics: Query panics
```

**3. Cache Metrics:**
```influxql
SHOW STATS FOR 'cache'

Key Fields:
- cacheSize: Current cache size
- memoryUsed: Memory consumption
- snapshotsActive: Active snapshots
- writeDropped: Dropped writes
```

**4. Shard Metrics:**
```influxql
SHOW STATS FOR 'shard'

Key Fields:
- diskBytes: Disk usage per shard
- fieldsCreated: New fields created
- seriesCreated: New series created
- writeBytes: Bytes written
```

### 4.5 External Monitoring Solutions

**Telegraf Configuration:**

```toml
# telegraf.conf

# Monitor InfluxDB instance
[[inputs.influxdb]]
  urls = ["http://localhost:8086/debug/vars"]
  timeout = "5s"

# System metrics
[[inputs.cpu]]
  percpu = true
  totalcpu = true

[[inputs.mem]]

[[inputs.disk]]
  mount_points = ["/var/lib/influxdb"]

[[inputs.diskio]]

[[inputs.net]]

# InfluxDB-specific metrics
[[inputs.influxdb_listener]]
  service_address = ":8186"
```

**Grafana Dashboard Metrics:**

```
Key Panels:
1. Write Rate (points/sec)
2. Query Rate (queries/sec)
3. Memory Usage (%)
4. Disk I/O (IOPS)
5. Cache Hit Rate (%)
6. Shard Count
7. Series Cardinality
8. Query Duration (p95, p99)
```

**Custom Monitoring Query:**
```influxql
-- Monitor query performance
SELECT MEAN("queryDurationNs") / 1000000 AS "avg_query_ms"
FROM "_internal"."monitor"."queryExecutor"
WHERE time > now() - 1h
GROUP BY time(1m)
```

### 4.6 Alerting Thresholds

**Critical Alerts:**

```yaml
alerts:
  - name: High Write Latency
    condition: write_latency > 100ms
    action: Investigate WAL/disk I/O
    
  - name: Cache Eviction Rate High
    condition: cache_evictions > 1000/min
    action: Increase cache size
    
  - name: High Cardinality
    condition: series_count > 1M
    action: Review schema design
    
  - name: Disk Usage High
    condition: disk_usage > 80%
    action: Add storage or reduce retention
    
  - name: Query Timeout Rate
    condition: query_timeouts > 10/min
    action: Optimize queries or increase resources
```

---

## Module 5: Common Pitfalls and Tuning Tips (5 minutes)

### 5.1 Top 10 Performance Pitfalls

**1. High Tag Cardinality**
```
Problem: Using unique IDs as tags
Impact: Exponential series growth, memory exhaustion
Solution: Use fields or hash into buckets
```

**2. Unbounded Queries**
```influxql
-- BAD
SELECT * FROM cpu

-- GOOD
SELECT * FROM cpu WHERE time > now() - 1h LIMIT 1000
```

**3. Too Many Measurements**
```
Problem: One measurement per metric type
Impact: Increased overhead, slower queries
Solution: Group related metrics in wide measurements
```

**4. Small Write Batches**
```
Problem: Writing 1 point per request
Impact: High overhead, poor compression
Solution: Batch 1000-10000 points per write
```

**5. Irregular Time Intervals**
```
Problem: Random timestamp spacing
Impact: Poor compression, larger disk usage
Solution: Use consistent intervals (1s, 10s, 60s)
```

**6. Not Using Retention Policies**
```
Problem: Keeping all data forever
Impact: Unbounded storage growth
Solution: Implement tiered retention strategy
```

**7. Complex Queries on Raw Data**
```
Problem: Computing aggregates on-the-fly
Impact: Slow queries, high CPU
Solution: Use continuous queries for pre-aggregation
```

**8. Insufficient Hardware**
```
Problem: Running on underpowered hardware
Impact: Slow performance across the board
Solution: Follow hardware recommendations (32GB+ RAM)
```

**9. No Monitoring**
```
Problem: Flying blind
Impact: Can't identify bottlenecks
Solution: Implement comprehensive monitoring
```

**10. Ignoring WAL**
```
Problem: WAL on slow disk
Impact: Write bottleneck
Solution: Put WAL on fast SSD
```

### 5.2 Quick Tuning Checklist

**Schema Design:**
- [ ] Tag cardinality < 100K per tag
- [ ] Total series < 1M (10M with TSI)
- [ ] Tags used for filtering only
- [ ] Fields used for actual metrics
- [ ] Measurements grouped logically

**Write Performance:**
- [ ] Batch size: 1000-10000 points
- [ ] Consistent time intervals
- [ ] WAL on fast disk (NVME SSD)
- [ ] `wal-fsync-delay` tuned for use case
- [ ] Write client connection pooling

**Query Performance:**
- [ ] Always include time range
- [ ] Filter on tags, not fields
- [ ] Use LIMIT on large result sets
- [ ] Leverage continuous queries
- [ ] Index (TSI) enabled for large datasets

**Infrastructure:**
- [ ] 32GB+ RAM recommended
- [ ] NVME SSD for WAL
- [ ] SATA SSD or better for data
- [ ] Dedicated InfluxDB server
- [ ] Proper kernel tuning applied

**Monitoring:**
- [ ] Telegraf configured
- [ ] Grafana dashboards created
- [ ] Alerts configured
- [ ] Regular SHOW STATS reviews
- [ ] Cardinality checks scheduled

### 5.3 Performance Tuning Process

**Step 1: Establish Baseline**
```bash
# Collect current metrics
influx -execute "SHOW STATS" > baseline_stats.txt
influx -execute "SHOW SERIES CARDINALITY" > baseline_cardinality.txt
df -h /var/lib/influxdb/ > baseline_disk.txt
```

**Step 2: Identify Bottleneck**
```
CPU bound? → Add cores or optimize queries
Memory bound? → Increase RAM or reduce cardinality
Disk I/O bound? → Upgrade to SSD or tune caching
Network bound? → Increase bandwidth or enable compression
```

**Step 3: Make Single Change**
- Change one parameter at a time
- Document the change
- Measure impact
- Roll back if negative

**Step 4: Validate Improvement**
```bash
# Compare metrics after change
influx -execute "SHOW STATS" > after_stats.txt
diff baseline_stats.txt after_stats.txt
```

**Step 5: Document and Repeat**

### 5.4 Advanced Tuning Tips

**Tip 1: Batch Size Sweet Spot**
```python
# Find optimal batch size through testing
batch_sizes = [100, 500, 1000, 5000, 10000]
for size in batch_sizes:
    start = time.time()
    write_batch(size)
    duration = time.time() - start
    throughput = size / duration
    print(f"Batch {size}: {throughput:.0f} points/sec")
```

**Tip 2: Parallel Writes**
```python
from concurrent.futures import ThreadPoolExecutor

def parallel_write():
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = []
        for batch in batches:
            future = executor.submit(write_batch, batch)
            futures.append(future)
        
        for future in futures:
            future.result()
```

**Tip 3: Compression Ratio Check**
```bash
# Calculate compression ratio
cd /var/lib/influxdb/data/mydb/autogen/
du -sb * | awk '{sum+=$1} END {print "Total bytes:", sum}'

# Compare to logical size
influx -execute "SELECT COUNT(*) FROM measurement" -database="mydb"
# Compression ratio = Total bytes / (point_count * avg_point_size)
```

**Tip 4: Index Cache Tuning**
```toml
# If queries are slow and you have memory
[data]
  series-id-set-cache-size = 1000  # Increase from 100 (MB)
```

**Tip 5: Compaction Tuning**
```toml
# For write-heavy workloads
[data]
  compact-full-write-cold-duration = "8h"  # Compact less frequently
  max-concurrent-compactions = 4           # More parallel compactions
```

---

## Hands-On Lab Exercises

### Lab 1: Schema Optimization (15 minutes)

**Objective:** Fix high-cardinality schema

**Scenario:** Current schema has performance issues
```influxql
-- Current (BAD) schema
INSERT api_call,user_id=user_12345,endpoint=/api/users/12345/profile response_time=125

-- Problem: user_id has 10M unique values, endpoint has 1M unique values
-- Series: 10M × 1M = 10 trillion series!
```

**Tasks:**
1. Calculate current cardinality
2. Redesign schema with bucketing
3. Implement solution
4. Verify improvement

**Solution:**
```influxql
-- Optimized schema
INSERT api_call,user_bucket=bucket_045,endpoint_pattern=/api/users/:id/profile response_time=125,user_id="user_12345",full_endpoint="/api/users/12345/profile"

-- New cardinality: 1000 buckets × 100 patterns = 100K series
-- Reduction: 10 trillion → 100K (100 million times smaller!)
```

### Lab 2: Write Performance Tuning (15 minutes)

**Objective:** Optimize write throughput

**Initial Setup:**
```python
# Baseline (slow)
for i in range(10000):
    client.write(bucket, org, Point("test").field("value", i))

# Measure: ~100 points/sec
```

**Tasks:**
1. Implement batching
2. Add connection pooling
3. Tune batch size
4. Measure improvement

**Solution:**
```python
# Optimized (fast)
points = []
for i in range(10000):
    points.append(Point("test").field("value", i))
    if len(points) >= 5000:
        client.write(bucket, org, points)
        points = []

# Measure: ~10,000 points/sec (100x improvement)
```

### Lab 3: Query Optimization (15 minutes)

**Objective:** Speed up slow query

**Initial Query (slow):**
```influxql
SELECT MEAN(value) FROM cpu 
WHERE time > now() - 30d 
GROUP BY time(1h), host
-- Execution time: 45 seconds
```

**Tasks:**
1. Analyze query plan
2. Create continuous query for pre-aggregation
3. Rewrite query to use CQ output
4. Measure improvement

**Solution:**
```influxql
-- Create CQ
CREATE CONTINUOUS QUERY "cq_cpu_1h"
ON "metrics"
BEGIN
  SELECT MEAN(value) AS mean_value
  INTO "cpu_1h"
  FROM "cpu"
  GROUP BY time(1h), host
END

-- Optimized query
SELECT MEAN(mean_value) FROM cpu_1h
WHERE time > now() - 30d
GROUP BY time(1d), host
-- Execution time: 0.5 seconds (90x improvement)
```

### Lab 4: Monitoring Setup (15 minutes)

**Objective:** Implement comprehensive monitoring

**Tasks:**
1. Configure Telegraf to monitor InfluxDB
2. Create Grafana dashboard
3. Set up alerts
4. Verify metrics collection

**Telegraf Configuration:**
```toml
[[inputs.influxdb]]
  urls = ["http://localhost:8086/debug/vars"]

[[outputs.influxdb_v2]]
  urls = ["http://localhost:8086"]
  token = "$INFLUX_TOKEN"
  organization = "my-org"
  bucket = "monitoring"
```

---

## Production Best Practices Summary

### Hardware Recommendations

**Minimum Production Setup:**
- CPU: 8 cores
- RAM: 32GB
- Disk: 500GB NVME SSD (WAL + data)
- Network: 1Gbps

**Recommended Production Setup:**
- CPU: 16 cores
- RAM: 64GB
- Disk: 1TB NVME SSD (WAL) + 4TB SATA SSD (data)
- Network: 10Gbps

**Enterprise Setup:**
- Multiple nodes in cluster
- Separate meta nodes (3 minimum)
- Dedicated data nodes (3+ for HA)
- Load balancer
- Monitoring infrastructure

### Configuration Templates

**High Write Throughput:**
```toml
[data]
  cache-max-memory-size = "16g"
  wal-fsync-delay = "100ms"
  max-concurrent-compactions = 4
  
[http]
  max-body-size = 50000000
```

**Balanced Workload:**
```toml
[data]
  cache-max-memory-size = "8g"
  wal-fsync-delay = "10ms"
  max-concurrent-compactions = 0
  
[coordinator]
  query-timeout = "30s"
  max-concurrent-queries = 10
```

**Query-Heavy Workload:**
```toml
[data]
  cache-max-memory-size = "4g"
  index-version = "tsi1"
  
[coordinator]
  query-timeout = "60s"
  max-concurrent-queries = 20
  max-select-point = 10000000
```

---

## Key Takeaways

### Critical Concepts

1. **Schema Design is Paramount**
   - Low tag cardinality (< 100K)
   - Tags for filtering, fields for metrics
   - Plan for scale from day one

2. **Batching is Essential**
   - Write in batches of 1000-10000 points
   - Reduces overhead by 100x
   - Improves compression

3. **Hardware Matters**
   - RAM is most important (32GB+)
   - NVME SSD for WAL
   - Don't underestimate I/O requirements

4. **Monitor Everything**
   - Can't optimize what you don't measure
   - Set up monitoring before going to production
   - Regular cardinality checks

5. **Cluster When Needed**
   - Horizontal scaling for throughput
   - Replication for availability
   - Plan data distribution strategy

### Performance Optimization Priorities

**Priority 1: Schema Design**
- Impact: 10-1000x
- Effort: Medium
- Do first!

**Priority 2: Write Optimization**
- Impact: 10-100x
- Effort: Low
- Quick wins

**Priority 3: Hardware Upgrade**
- Impact: 2-10x
- Effort: Medium
- RAM > SSD > CPU

**Priority 4: Query Optimization**
- Impact: 10-100x
- Effort: Medium
- Continuous queries help

**Priority 5: Clustering**
- Impact: 2-10x
- Effort: High
- When single node maxed

---

## Additional Resources

### Official Documentation
- Performance Guide: https://docs.influxdata.com/influxdb/v1.8/guides/hardware_sizing/
- Clustering: https://docs.influxdata.com/enterprise_influxdb/v1.8/
- Monitoring: https://docs.influxdata.com/influxdb/v1.8/administration/

### Tools
- InfluxDB Stress Tool (load testing)
- Telegraf (monitoring agent)
- Grafana (visualization)
- K6 (performance testing)

### Community
- InfluxDB Community Forum
- GitHub Issues
- Slack Community

---

## Course Summary

**You've mastered:**
- ✓ Indexing and compression optimization
- ✓ Clustering and sharding strategies
- ✓ Write and query load management
- ✓ Disk I/O and caching tuning
- ✓ Performance monitoring and alerting
- ✓ Common pitfalls and solutions

**Next Steps:**
1. Audit your current schema
2. Implement monitoring
3. Apply tuning recommendations
4. Benchmark improvements
5. Plan for scaling

---

*End of Course - Duration: 75 minutes*

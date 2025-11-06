# Introduction to InfluxDB

## 45-Minute Comprehensive Course

---

## Course Overview (1 min)

**Learning Objectives:**

- Understand what InfluxDB is and its role in time-series data management
- Learn the core architecture and components
- Distinguish between InfluxDB OSS and Cloud offerings
- Perform basic installation and configuration

**Duration:** 45 minutes  
**Level:** Beginner to Intermediate

---

## Part 1: What is InfluxDB? (8 mins)

### What is Time-Series Data?

Time-series data is a sequence of data points indexed in time order. Examples include:

- Server metrics (CPU, memory usage)
- IoT sensor readings (temperature, humidity)
- Stock prices and financial data
- Application performance metrics
- Network traffic statistics

### What is InfluxDB?

**InfluxDB** is an open-source time-series database (TSDB) designed specifically for handling time-stamped data with high write and query loads.

**Key Characteristics:**

- **Purpose-built** for time-series data
- **High performance** for write-heavy workloads
- **SQL-like query language** (InfluxQL and Flux)
- **Built-in HTTP API** for easy integration
- **Schemaless design** for flexibility

### Where InfluxDB Fits in the Ecosystem

**The TICK Stack:**

```
Telegraf → InfluxDB → Chronograf → Kapacitor
(Collect)   (Store)    (Visualize)  (Alert)
```

**Common Use Cases:**

1. **DevOps Monitoring** - Server metrics, container stats
2. **IoT Applications** - Sensor data collection and analysis
3. **Real-time Analytics** - Application performance monitoring (APM)
4. **Financial Services** - Trading data and market analytics
5. **Industrial Monitoring** - Manufacturing equipment telemetry

**InfluxDB vs Other Databases:**

- **vs Prometheus:** InfluxDB offers more flexible data model and longer retention
- **vs TimescaleDB:** InfluxDB is purpose-built vs PostgreSQL extension
- **vs OpenTSDB:** Better compression, easier setup, richer query language
- **vs Traditional SQL:** Optimized for time-based queries and aggregations

---

## Part 2: InfluxDB Architecture (12 mins)

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│           Client Applications           │
└─────────────────┬───────────────────────┘
                  │ HTTP API
┌─────────────────▼───────────────────────┐
│          InfluxDB Server                │
│  ┌─────────────────────────────────┐   │
│  │    Write Ahead Log (WAL)        │   │
│  └──────────┬──────────────────────┘   │
│             │                           │
│  ┌──────────▼──────────────────────┐   │
│  │      Cache (In-Memory)          │   │
│  └──────────┬──────────────────────┘   │
│             │ Compaction               │
│  ┌──────────▼──────────────────────┐   │
│  │   TSM Files (On-Disk Storage)   │   │
│  │   - Compressed                   │   │
│  │   - Immutable                    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 1. Write Ahead Log (WAL)

**Purpose:** Durability and crash recovery

**How it works:**

- All writes are first appended to the WAL
- Sequential writes for maximum performance
- Persists to disk before acknowledging write
- Replayed on startup to recover uncommitted data

**Key Points:**

- Located in `data/wal` directory
- Flushed periodically to TSM files
- Automatically cleaned up after flush

### 2. TSM Engine (Time-Structured Merge Tree)

**TSM = Time-Structured Merge Tree** (inspired by LSM trees)

**Core Concepts:**

- **Columnar storage format** optimized for time-series
- **Immutable TSM files** written to disk
- **Block-based compression** specific to data types
- **Index for fast lookups** by series key

**TSM File Structure:**

```
┌────────────────────────────────┐
│         Index Block            │  ← Series keys and offsets
├────────────────────────────────┤
│       Data Blocks              │  ← Compressed time-series data
│  - Timestamps (compressed)     │
│  - Values (type-specific)      │
└────────────────────────────────┘
```

**Compression Techniques:**

- **Timestamps:** Delta encoding + variable-byte encoding
- **Floats:** Gorilla compression (XOR-based)
- **Integers:** Simple8b encoding
- **Strings:** Snappy compression
- **Booleans:** Bit-packed

**Performance Benefits:**

- 10-100x compression ratios typical
- Fast sequential reads
- Efficient aggregations over time ranges

### 3. Shards

**What are Shards?**
Logical containers that store data for a specific time range.

**Shard Structure:**

```
Database
└── Retention Policy
    └── Shard Group (7 days)
        ├── Shard 1 (Node 1)
        ├── Shard 2 (Node 2)
        └── Shard 3 (Node 3)
```

**Key Characteristics:**

- Time-bounded (e.g., 7-day windows)
- Contains TSM files and WAL
- One shard group per retention policy
- Enables efficient data deletion (drop entire shard)

**Shard Duration Guidelines:**
| Retention Period | Recommended Shard Duration |
|-----------------|----------------------------|
| < 1 day | 6 hours |
| 1 day - 7 days | 1 day |
| 7 days - 3 months | 7 days |
| > 6 months | 30 days |

### 4. Retention Policies

**Definition:** Rules that automatically delete old data

**Structure:**

```sql
CREATE RETENTION POLICY "one_week"
  ON "mydb"
  DURATION 7d
  REPLICATION 1
  SHARD DURATION 1d
  DEFAULT
```

**Components:**

- **DURATION:** How long to keep data
- **REPLICATION:** Number of copies (clustering)
- **SHARD DURATION:** Size of time-based shards
- **DEFAULT:** Primary retention policy for writes

**Common Patterns:**

```
Raw Data (RP: 7d)  →  Downsampled (RP: 90d)  →  Aggregated (RP: 1y)
    1s intervals         1m intervals              1h intervals
```

### 5. Write Flow

```
1. Client sends write request
   ↓
2. Data written to WAL (durability)
   ↓
3. Data added to in-memory cache
   ↓
4. Acknowledge write to client
   ↓
5. Background: Cache → TSM files (compaction)
   ↓
6. Background: Delete old shards (retention)
```

**Write Performance:**

- Batching writes improves throughput
- Typical: 100K-1M points/second per node
- Scales horizontally in clustered setup

---

## Part 3: Core Components (10 mins)

### 1. Database

**Definition:** Logical container for time-series data

**Commands:**

```sql
-- Create database
CREATE DATABASE mydb

-- Show databases
SHOW DATABASES

-- Use database
USE mydb

-- Drop database
DROP DATABASE mydb
```

### 2. Measurement

**Definition:** Similar to a table in SQL; describes the data being stored

**Example:** `temperature`, `cpu_usage`, `http_requests`

**Characteristics:**

- Acts as a container for tags, fields, and timestamps
- Automatically created on first write
- Can contain millions of different series

### 3. Fields

**Definition:** Key-value pairs that store actual data (the measured values)

**Characteristics:**

- **Not indexed** (cannot query on field values efficiently)
- Can be different data types: float, integer, string, boolean
- At least one field is required per measurement

**Example:**

```
temperature,location=room1 value=22.5,humidity=45
            ^^^^^^^^^^^^^^ ^^^^^ ^^^^ ^^^^^^^^^^
            (tags)         (field key) (field value)
```

**Field Types:**

- `float64` - Most common for numeric data
- `int64` - Whole numbers
- `string` - Text data (limited use in time-series)
- `boolean` - True/false values

### 4. Tags

**Definition:** Indexed metadata key-value pairs

**Characteristics:**

- **Always indexed** - Fast queries
- **Optional** but highly recommended
- Stored as strings only
- Used for grouping and filtering

**Tag Best Practices:**

- Use tags for metadata: `host`, `region`, `sensor_id`
- Keep cardinality manageable (< 100K unique combinations)
- Don't use tags for high-cardinality data (user IDs, UUIDs)

**Good Tag Examples:**

```
cpu_usage,host=server01,region=us-east,datacenter=dc1 value=45.2
         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
         (indexed metadata)
```

**Bad Tag Examples:**

```
# DON'T: High cardinality
requests,user_id=uuid-12345-67890 count=1

# DO: Use fields for unique values
requests,endpoint=/api/users user_id="uuid-12345",count=1
```

### 5. Series

**Definition:** Unique combination of measurement + tag set

**Example:**

```
# Series 1
cpu_usage,host=server01,region=us-east value=45.2

# Series 2
cpu_usage,host=server02,region=us-east value=52.1

# Series 3
cpu_usage,host=server01,region=us-west value=38.7
```

**Series Cardinality:**

```
Series Cardinality = Measurement × Tags Combinations

Example:
- 10 measurements
- 100 hosts × 5 regions × 2 environments = 1,000 tag combinations
- Total series: 10 × 1,000 = 10,000 series
```

**Why Cardinality Matters:**

- Each series uses memory
- High cardinality impacts performance
- Recommendation: Keep under 1M series per database

### Data Model Example

**Line Protocol Format:**

```
<measurement>[,<tag_key>=<tag_value>[,<tag_key>=<tag_value>]] <field_key>=<field_value>[,<field_key>=<field_value>] [<timestamp>]
```

**Real Example:**

```
weather,location=us-midwest,season=summer temperature=82,humidity=71 1465839830100400200
^^^^^^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^^^^^
  |                  |                              |                        |
measurement         tags                         fields                  timestamp
```

**Breakdown:**

- **Measurement:** `weather`
- **Tags:** `location=us-midwest`, `season=summer`
- **Fields:** `temperature=82`, `humidity=71`
- **Timestamp:** `1465839830100400200` (nanosecond precision)

### Schema Design Best Practices

**DO:**

- Use tags for metadata you want to filter by
- Use fields for measured values
- Keep tag cardinality reasonable
- Use meaningful measurement names
- Include timestamps (or let InfluxDB assign)

**DON'T:**

- Use fields for metadata
- Use tags for high-cardinality data
- Create too many measurements (consolidate similar data)
- Use special characters without quoting

---

## Part 4: InfluxDB OSS vs InfluxDB Cloud (5 mins)

### InfluxDB OSS (Open Source)

**Features:**

- Self-hosted on your infrastructure
- Free and open source
- Single node architecture
- Full control over configuration
- InfluxQL and Flux query languages

**Versions:**

- **InfluxDB 1.x** - Mature, stable, InfluxQL primary
- **InfluxDB 2.x** - Modern UI, Flux primary, unified time-series platform

**Best For:**

- On-premise deployments
- Full data control requirements
- Custom integrations
- Learning and development

**Limitations:**

- Manual scaling and maintenance
- No built-in clustering (OSS version)
- Self-managed backups and monitoring

### InfluxDB Cloud

**Features:**

- Fully managed service
- Automatic scaling
- Built-in monitoring and alerting
- Multi-tenant architecture
- Global availability

**Pricing Tiers:**

- **Free Tier:** Limited writes/queries per day
- **Usage-Based:** Pay for what you use
- **Committed-Use:** Discounted rates for reserved capacity

**Best For:**

- Quick production deployment
- Scalable workloads
- Minimal ops overhead
- Global distribution

### InfluxDB Enterprise

**Features (Historical):**

- Clustering and high availability
- Commercial support
- Note: Being phased out in favor of Cloud

### Quick Comparison

| Feature            | OSS 1.x   | OSS 2.x   | Cloud    | Enterprise |
| ------------------ | --------- | --------- | -------- | ---------- |
| **Cost**           | Free      | Free      | Paid     | Paid       |
| **Hosting**        | Self      | Self      | Managed  | Self       |
| **Clustering**     | No        | No        | Yes      | Yes        |
| **UI**             | Basic     | Modern    | Modern   | Modern     |
| **Query Language** | InfluxQL  | Flux      | Both     | Both       |
| **Scaling**        | Manual    | Manual    | Auto     | Manual     |
| **Support**        | Community | Community | Included | Included   |

### Choosing the Right Version

**Choose OSS 1.x if:**

- You need a stable, production-proven system
- You prefer InfluxQL
- You have existing 1.x deployments

**Choose OSS 2.x if:**

- You want the latest features
- You prefer Flux query language
- You're starting a new project
- You want the unified time-series platform

**Choose Cloud if:**

- You want managed infrastructure
- You need automatic scaling
- You prefer operational simplicity
- You have variable workloads

---

## Part 5: Installation, Setup, and Basic Configuration (9 mins)

### Installation Methods

#### Option 1: Docker (Recommended for Learning)

**InfluxDB 2.x:**

```bash
# Pull the image
docker pull influxdb:2.7

# Run container
docker run -d -p 8086:8086 \
  -v influxdb2-data:/var/lib/influxdb2 \
  -v influxdb2-config:/etc/influxdb2 \
  --name influxdb \
  influxdb:2.7

# Access UI at http://localhost:8086
```

**InfluxDB 1.x:**

```bash
# Pull the image
docker pull influxdb:1.8

# Run container
docker run -d -p 8086:8086 \
  -v influxdb-data:/var/lib/influxdb \
  --name influxdb \
  influxdb:1.8
```

#### Option 2: Ubuntu/Debian

**InfluxDB 2.x:**

```bash
# Add repository
wget -q https://repos.influxdata.com/influxdata-archive_compat.key
echo '23a1c8836f0afc5ed24e0486339d7cc8f6790b83886c4c96995b88a061c5bb5d influxdata-archive_compat.key' | sha256sum -c && cat influxdata-archive_compat.key | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/influxdata-archive_compat.gpg > /dev/null

echo 'deb [signed-by=/etc/apt/trusted.gpg.d/influxdata-archive_compat.gpg] https://repos.influxdata.com/debian stable main' | sudo tee /etc/apt/sources.list.d/influxdata.list

# Install
sudo apt-get update
sudo apt-get install influxdb2

# Start service
sudo systemctl start influxdb
sudo systemctl enable influxdb
```

#### Option 3: macOS

```bash
# Using Homebrew
brew install influxdb

# Start service
brew services start influxdb
```

#### Option 4: Windows

```powershell
# Download from https://portal.influxdata.com/downloads/
# Extract and run influxd.exe
.\influxd.exe
```

### Initial Setup (InfluxDB 2.x)

**1. Access Web UI:**

```
http://localhost:8086
```

**2. Complete Setup Wizard:**

- Username: `admin`
- Password: (choose secure password)
- Organization Name: `myorg`
- Bucket Name: `mybucket`

**3. CLI Setup:**

```bash
# Using influx CLI
influx setup \
  --username admin \
  --password mypassword123 \
  --org myorg \
  --bucket mybucket \
  --force
```

### Basic Configuration

#### InfluxDB 2.x Configuration

**Config File Location:**

- Linux: `/etc/influxdb2/config.toml`
- Docker: `/etc/influxdb2/influx-configs`

**Key Configuration Parameters:**

```toml
# HTTP bind address
bind-address = ":8086"

# Storage engine path
engine-path = "/var/lib/influxdb2/engine"

# Bolt database path
bolt-path = "/var/lib/influxdb2/influxd.bolt"

# Logging level
log-level = "info"

# Query concurrency
query-concurrency = 10

# Query queue size
query-queue-size = 10
```

#### InfluxDB 1.x Configuration

**Config File:** `/etc/influxdb/influxdb.conf`

**Important Sections:**

```toml
[meta]
  dir = "/var/lib/influxdb/meta"

[data]
  dir = "/var/lib/influxdb/data"
  wal-dir = "/var/lib/influxdb/wal"

  # Shard configuration
  cache-max-memory-size = "1g"
  cache-snapshot-memory-size = "25m"

  # TSM Engine
  max-concurrent-compactions = 0

  # Query settings
  query-timeout = "0s"
  max-concurrent-queries = 0

[coordinator]
  write-timeout = "10s"
  max-concurrent-queries = 0

[retention]
  enabled = true
  check-interval = "30m"

[http]
  enabled = true
  bind-address = ":8086"
  auth-enabled = false
  log-enabled = true
```

### First Steps - Writing Data

**Using CLI:**

```bash
# Write single point
influx write \
  --bucket mybucket \
  --org myorg \
  --precision s \
  'temperature,location=room1 value=22.5'

# Write multiple points
influx write --bucket mybucket --org myorg --precision s '
temperature,location=room1 value=22.5
temperature,location=room2 value=21.8
temperature,location=room3 value=23.1
'
```

**Using HTTP API:**

```bash
# InfluxDB 2.x
curl -XPOST "http://localhost:8086/api/v2/write?org=myorg&bucket=mybucket" \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: text/plain; charset=utf-8" \
  --data-binary 'temperature,location=room1 value=22.5'

# InfluxDB 1.x
curl -XPOST "http://localhost:8086/write?db=mydb" \
  --data-binary 'temperature,location=room1 value=22.5'
```

**Using Python:**

```python
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

# InfluxDB 2.x
client = InfluxDBClient(url="http://localhost:8086", token="YOUR_TOKEN", org="myorg")
write_api = client.write_api(write_options=SYNCHRONOUS)

# Write point
point = Point("temperature").tag("location", "room1").field("value", 22.5)
write_api.write(bucket="mybucket", record=point)
```

### First Steps - Querying Data

**Using Flux (InfluxDB 2.x):**

```flux
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> filter(fn: (r) => r.location == "room1")
```

**Using InfluxQL (InfluxDB 1.x):**

```sql
SELECT * FROM temperature WHERE location='room1' AND time > now() - 1h
```

**Using CLI:**

```bash
# Flux query
influx query 'from(bucket:"mybucket") |> range(start: -1h)'

# InfluxQL query (v1.x)
influx -execute 'SELECT * FROM temperature' -database='mydb'
```

### Verification Steps

**1. Check Service Status:**

```bash
# Linux
sudo systemctl status influxdb

# Docker
docker ps | grep influxdb
docker logs influxdb
```

**2. Check Connectivity:**

```bash
curl http://localhost:8086/health
```

**3. Verify Installation:**

```bash
influx version
influxd version
```

### Common Issues and Troubleshooting

**Issue: Port 8086 already in use**

```bash
# Check what's using the port
sudo lsof -i :8086

# Kill the process or change InfluxDB port
```

**Issue: Permission denied**

```bash
# Fix ownership
sudo chown -R influxdb:influxdb /var/lib/influxdb2

# Fix permissions
sudo chmod 755 /var/lib/influxdb2
```

**Issue: Cannot connect to service**

```bash
# Check logs
sudo journalctl -u influxdb -f

# Docker logs
docker logs influxdb
```

---

## Recap and Key Takeaways (1 min)

### What We Covered

1. **InfluxDB Fundamentals**

   - Purpose-built time-series database
   - Part of the TICK stack ecosystem
   - Optimized for write-heavy workloads

2. **Architecture Deep Dive**

   - WAL for durability
   - TSM engine with compression
   - Shards for time-based organization
   - Retention policies for automated cleanup

3. **Core Components**

   - Database → Measurement → Series
   - Fields (actual data) vs Tags (indexed metadata)
   - Understanding series cardinality

4. **Deployment Options**

   - OSS: Self-hosted flexibility
   - Cloud: Managed convenience
   - Choose based on your needs

5. **Getting Started**
   - Multiple installation methods
   - Basic configuration
   - Writing and querying data

### Next Steps

1. **Practice:** Set up a local instance and experiment
2. **Learn Flux/InfluxQL:** Master the query languages
3. **Explore Integrations:** Telegraf, Grafana, Chronograf
4. **Design Schema:** Plan your measurements, tags, and fields
5. **Monitor Performance:** Understand cardinality and optimize

### Resources

- **Official Documentation:** https://docs.influxdata.com/
- **Community Forum:** https://community.influxdata.com/
- **GitHub:** https://github.com/influxdata/influxdb
- **University:** https://university.influxdata.com/
- **Awesome InfluxDB:** https://github.com/mark-rushakoff/awesome-influxdb

---

## Q&A Session

**Common Questions:**

**Q: When should I use InfluxDB over a traditional database?**
A: When you have time-stamped data with high write volume, need time-based queries, or want automatic data retention.

**Q: How do I handle high cardinality?**
A: Avoid using tags for unique identifiers, aggregate data, use fields for high-cardinality values, and consider downsampling.

**Q: What's the difference between InfluxQL and Flux?**
A: InfluxQL is SQL-like and simpler; Flux is more powerful with better composability and cross-data-source capabilities.

**Q: Can InfluxDB replace my SQL database?**
A: No, InfluxDB is optimized for time-series data. Use it alongside SQL databases for different data types.

**Q: How do I backup InfluxDB?**
A: Use `influx backup` command for online backups, or filesystem snapshots for offline backups.

---

**Course Complete! Thank you for attending.**

_For more advanced topics, consider:_

- Advanced query optimization
- Clustering and high availability
- Continuous queries and tasks
- Integration with monitoring tools
- Performance tuning and scaling

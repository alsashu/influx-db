# InfluxDB 3 Core: Complete Technical Presentation
## A Modern Time-Series Database Built on Open Standards

---

## Slide 1: Title Slide
**InfluxDB 3 Core: The Next Generation Time-Series Database**

- Presenter: Ashu
- Date: December 2024
- A technical deep-dive into InfluxDB 3 Core architecture and capabilities

---

## Slide 2: What is InfluxDB 3 Core?

**A ground-up rewrite of the time-series database**

- Open-source time-series database optimized for IoT, monitoring, and analytics
- Built on industry-standard Apache Arrow and Parquet formats
- SQL-first query language (PostgreSQL-compatible)
- Designed for high-cardinality data (millions of unique time series)
- Cloud-native architecture with separation of compute and storage

**Key Innovation:** Moving from proprietary formats to open standards while dramatically improving performance

---

## Slide 3: Why InfluxDB 3? The Problem It Solves

**Traditional Time-Series Database Challenges:**

- **Cardinality Limits**: InfluxDB 2.x struggled beyond 1M unique series
- **Proprietary Formats**: Locked into vendor-specific tooling
- **Complex Query Languages**: Flux/InfluxQL learning curve
- **Scalability Issues**: Difficulty handling IoT-scale deployments

**InfluxDB 3 Solutions:**

- Handles 100M+ unique series without degradation
- Standard SQL - leverage existing skills and tools
- Apache Arrow/Parquet - industry standard formats
- Built for cloud-scale from day one

---

## Slide 4: Core Architecture Overview

**Three-Layer Architecture:**

```
┌─────────────────────────────────────┐
│      API Layer (HTTP/gRPC)          │
│  - Write API (Line Protocol v3)     │
│  - Query API (SQL)                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Processing Engine               │
│  - Apache Arrow (in-memory)         │
│  - DataFusion (SQL engine)          │
│  - Write-Ahead Log (WAL)            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Storage Layer                   │
│  - Parquet files (columnar)         │
│  - Object storage ready             │
└─────────────────────────────────────┘
```

**Key Components:**
- **Apache Arrow**: Zero-copy in-memory columnar format
- **DataFusion**: Rust-based SQL query engine with vectorized execution
- **Parquet**: Compressed columnar storage (10-20x compression)

---

## Slide 5: What's New in v3? Key Differences from v2

| Aspect | InfluxDB 2.x | InfluxDB 3 Core |
|--------|--------------|-----------------|
| **Query Language** | Flux, InfluxQL | SQL (PostgreSQL) |
| **Storage** | TSM (proprietary) | Arrow + Parquet (open) |
| **Max Cardinality** | ~1M series | 100M+ series |
| **Write Protocol** | Line Protocol v2 | Line Protocol v3 |
| **Built-in UI** | Yes | No (API-first) |
| **Ecosystem** | Limited | Full Arrow ecosystem |

**Major Paradigm Shifts:**
- From NoSQL to SQL standard
- From proprietary to open formats
- From monolith to composable architecture
- From low to unlimited cardinality

---

## Slide 6: Data Model - The Foundation

**Hierarchical Structure:**

```
Database
  └── Table (measurement)
       ├── Tags (indexed metadata)
       │    └── Key-Value pairs (strings)
       ├── Fields (actual data values)
       │    └── Typed: int, float, string, bool
       └── Timestamp (nanosecond precision)
```

**Conceptual SQL Equivalent:**
```sql
CREATE TABLE sensor_data (
    -- Tags (automatically indexed)
    location    VARCHAR,
    device_id   VARCHAR,
    
    -- Fields (measurements)
    temperature DOUBLE,
    humidity    INTEGER,
    
    -- Timestamp (part of primary key)
    time        TIMESTAMP
)
```

**Mental Model:**
- Tags = Dimensions you filter/group by
- Fields = Metrics you measure
- Time = First-class citizen, always present

---

## Slide 7: Line Protocol v3 - Writing Data

**Syntax:**
```
measurement,tag1=value1,tag2=value2 field1=value1,field2=value2 timestamp
```

**Real Examples:**

```bash
# IoT sensor reading
temperature,location=bangalore,sensor_id=th01 celsius=28.5,fahrenheit=83.3 1702468800000000000

# System metrics
cpu,host=server01,region=asia usage=45.2,cores=8i 1702468800000000000

# Smart home
power,appliance=refrigerator,room=kitchen watts=150i,kwh_total=45.6 1702468800000000000
```

**Critical Rules:**
- Comma separates tags (NO SPACES)
- Space separates measurement/tags from fields
- Space separates fields from timestamp
- Integer suffix: `42i`, Float: `42.0`, String: `"value"`, Bool: `true`

---

## Slide 8: Data Type System

**Four Field Types:**

| Type | Syntax | Example | Use Case |
|------|--------|---------|----------|
| **Float** | value | `temp=28.5` | Default for numbers, measurements |
| **Integer** | valuei | `count=42i` | Counters, discrete values |
| **String** | "value" | `status="ok"` | States, labels, messages |
| **Boolean** | true/false | `active=true` | Binary states, flags |

**Type Consistency is Critical:**
```bash
# ✅ CORRECT
sensor,id=001 temp=28.5
sensor,id=001 temp=29.1

# ❌ WRONG - Type conflict!
sensor,id=001 temp=28.5
sensor,id=001 temp="offline"  # Error!
```

**Solution:** Use separate fields for different types
```bash
sensor,id=001 temp=28.5,status="online"
```

---

## Slide 9: Write Path Internals

**Step-by-Step Flow:**

```
1. Line Protocol → Parse & Validate
   ↓
2. Write-Ahead Log (WAL)
   • Durability guarantee
   • Crash recovery
   ↓
3. In-Memory Buffer (Arrow RecordBatch)
   • Columnar format
   • Fast query access
   ↓
4. Periodic Flush → Parquet Files
   • Compression (10-20x)
   • Immutable storage
```

**Performance Characteristics:**
- **Batched Writes**: 100-5000 points per request optimal
- **WAL Overhead**: ~5% performance cost for durability
- **Flush Triggers**: Time-based (5 min) or size-based (64 MB)
- **Throughput**: 100K+ points/sec single node

---

## Slide 10: Read Path & Query Execution

**Query Journey:**

```
SQL Query
  ↓
Parse → Logical Plan → Optimize → Physical Plan → Execute
```

**Optimization Techniques:**

1. **Predicate Pushdown**
   - Filters applied at storage level
   - Example: `WHERE location = 'bangalore'` → only reads bangalore data

2. **Column Pruning**
   - Only read required columns
   - Example: `SELECT time, temp` → skip all other columns

3. **Partition Elimination**
   - Skip entire Parquet files based on metadata
   - Example: `WHERE time > '2024-12-01'` → skip older files

4. **Vectorized Execution**
   - Process batches of rows, not individual rows
   - Leverages SIMD CPU instructions

**Result:** 10-100x faster than row-based databases

---

## Slide 11: SQL Querying - The Basics

**Standard SQL with Time-Series Extensions:**

```sql
-- Basic SELECT
SELECT * FROM weather 
WHERE location = 'bangalore' 
  AND time >= NOW() - INTERVAL '1 hour'
ORDER BY time DESC
LIMIT 100;

-- Aggregations
SELECT 
    location,
    AVG(temperature) as avg_temp,
    MAX(temperature) as max_temp,
    COUNT(*) as samples
FROM weather
GROUP BY location;

-- Time bucketing
SELECT 
    DATE_BIN(INTERVAL '5 minutes', time, TIMESTAMP '1970-01-01') as bucket,
    AVG(temperature) as avg_temp
FROM weather
WHERE time >= NOW() - INTERVAL '1 hour'
GROUP BY bucket
ORDER BY bucket DESC;
```

---

## Slide 12: Advanced SQL Features

**Window Functions:**
```sql
-- Moving average (5-point)
SELECT 
    time,
    temperature,
    AVG(temperature) OVER (
        ORDER BY time 
        ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
    ) as moving_avg
FROM weather;
```

**Joins:**
```sql
-- Correlate temperature and power usage
SELECT 
    t.time,
    t.temperature,
    p.watts
FROM temperature t
JOIN power p 
    ON DATE_TRUNC('minute', t.time) = DATE_TRUNC('minute', p.time)
WHERE t.location = 'living_room';
```

**CTEs (Common Table Expressions):**
```sql
WITH hourly_avg AS (
    SELECT 
        DATE_TRUNC('hour', time) as hour,
        AVG(temperature) as avg_temp
    FROM weather
    GROUP BY hour
)
SELECT * FROM hourly_avg 
WHERE avg_temp > 25;
```

---

## Slide 13: Apache Arrow - Why It Matters

**Columnar vs Row Format:**

```
Row Format (Traditional):
[ID=1, Temp=25.5, Location=BLR]
[ID=2, Temp=26.1, Location=BLR]
[ID=3, Temp=24.8, Location=MUM]

Arrow Columnar Format:
IDs:       [1,    2,    3   ]
Temps:     [25.5, 26.1, 24.8]
Locations: [BLR,  BLR,  MUM ]
```

**Benefits:**

1. **Query Performance**
   - Only read needed columns
   - `SELECT temperature` → skip ID and Location

2. **Compression**
   - Similar values compress better
   - 10-20x compression typical

3. **CPU Efficiency**
   - Better cache utilization
   - SIMD vectorized operations

4. **Zero-Copy**
   - Share data between processes without serialization
   - Send directly to analysis tools (Pandas, Polars, etc.)

---

## Slide 14: Parquet Storage Format

**Why Parquet?**

- **Industry Standard**: Hadoop, Spark, Snowflake all use it
- **Self-Describing**: Schema embedded in file
- **Optimized Reads**: Column statistics enable predicate pushdown
- **Flexible Compression**: SNAPPY, GZIP, ZSTD support

**File Structure:**
```
Parquet File (64 MB typical)
├── Row Group 1
│   ├── Column: time (compressed)
│   ├── Column: temperature (compressed)
│   └── Column: location (dictionary encoded)
├── Row Group 2...
└── Footer Metadata
    ├── Schema definition
    ├── Column min/max values
    └── Row group locations
```

**Performance Impact:**
- Min/max statistics → skip entire row groups
- Dictionary encoding → compress repeated values (locations, IDs)
- Encoding schemes → RLE, bit-packing for efficiency

---

## Slide 15: High Cardinality - The Game Changer

**The Cardinality Problem:**

```
IoT Deployment Example:
• 10,000 buildings
• 100 sensors per building
• 10 metrics per sensor
= 10,000,000 unique time series
```

**InfluxDB 2.x:** 
- Struggles beyond 1M series
- Memory exhaustion
- Query timeouts

**InfluxDB 3 Core:**
- Handles 100M+ series
- Constant memory usage
- Sub-second queries

**How?**
- No in-memory series index (Parquet handles it)
- Dictionary encoding for repeated values
- Columnar storage efficiency

---

## Slide 16: Performance Best Practices

**Write Optimization:**

✅ **DO:**
- Batch writes (100-5000 points)
- Include explicit timestamps
- Use consistent schemas
- Pre-sort by time when possible

❌ **DON'T:**
- Write one point per HTTP request
- Rely on server timestamps
- Change field types mid-stream
- Ignore write errors

**Query Optimization:**

✅ **DO:**
- Always include time ranges
- Use tag filters (indexed)
- Limit result sets
- Select only needed columns

❌ **DON'T:**
- `SELECT *` without filters
- Filter on field values extensively
- Omit ORDER BY time
- Skip LIMIT clauses in exploratory queries

---

## Slide 17: Schema Design Best Practices

**Tags vs Fields Decision Matrix:**

| Use Tags For | Use Fields For |
|--------------|----------------|
| Metadata you filter by | Actual measurements |
| Low-medium cardinality | High cardinality values |
| Dimensions (who, what, where) | Metrics (how much, how many) |
| String values | Numeric values |
| Example: location, device_type | Example: temperature, count |

**Good Schema:**
```bash
weather,location=bangalore,sensor_type=outdoor temperature=28.5,humidity=65,pressure=1013
```

**Bad Schema:**
```bash
# Too many tags (high cardinality)
weather,location=bangalore,request_id=uuid-12345... temp=28.5

# Fields as tags
weather,temperature=28.5,humidity=65 location="bangalore"
```

**Naming Conventions:**
- Use snake_case: `cpu_usage`, not `cpuUsage`
- Be descriptive: `temperature_celsius` vs `temp`
- Avoid special characters
- Keep consistent across measurements

---

## Slide 18: Common Mistakes & Solutions

**Mistake #1: Line Protocol Syntax Errors**
```bash
❌ weather, location=bangalore temp=28.5  # Space before comma
❌ weather,location = bangalore temp=28.5 # Space around =
❌ weather,location=bangalore,temp=28.5   # Field as tag
✅ weather,location=bangalore temp=28.5   # Correct!
```

**Mistake #2: Type Conflicts**
```bash
❌ sensor value=28.5
   sensor value="offline"  # Error!
✅ sensor value=28.5,status="online"  # Separate fields
```

**Mistake #3: Missing Time Ranges**
```sql
❌ SELECT * FROM events ORDER BY time DESC;
✅ SELECT * FROM events 
   WHERE time >= NOW() - INTERVAL '1 day'
   ORDER BY time DESC LIMIT 1000;
```

**Mistake #4: High Cardinality Tags (v2 mindset)**
```bash
❌ events,session_id=uuid-123... clicks=5
✅ events,user_type=premium clicks=5,session_id="uuid-123..."
```

---

## Slide 19: InfluxDB 3 Core vs Enterprise

| Feature | Core (OSS) | Enterprise |
|---------|------------|------------|
| **Deployment** | Single node | Clustered, multi-node |
| **Storage** | Local disk only | S3, GCS, Azure Blob |
| **Scalability** | Vertical | Horizontal |
| **High Availability** | ❌ | ✅ Multi-region replication |
| **Authentication** | Basic | Token, SSO, RBAC |
| **Management UI** | ❌ API only | ✅ Full web interface |
| **Retention Policies** | Manual | Automated |
| **Downsampling** | Custom SQL | Automated continuous queries |
| **Support** | Community | Commercial SLA |
| **Cost** | Free | Licensed |

**When to Use Core:**
- Development/testing
- Small-scale deployments
- Budget constraints
- Learning InfluxDB 3

**When to Use Enterprise:**
- Production at scale
- Multi-region deployments
- Need for HA/DR
- Compliance requirements

---

## Slide 20: Real-World Use Cases

**1. IoT & Sensor Networks**
- Smart cities: Traffic, environmental monitoring
- Industrial IoT: Factory sensors, predictive maintenance
- Smart buildings: HVAC, energy management

**2. Infrastructure Monitoring**
- Server metrics: CPU, memory, disk, network
- Container metrics: Docker, Kubernetes
- Application performance monitoring (APM)

**3. Financial Services**
- Trading systems: Market data, tick data
- Risk analytics: Real-time position monitoring
- Fraud detection: Transaction pattern analysis

**4. Automotive & Transportation**
- Connected vehicles: Telemetry, diagnostics
- Fleet management: GPS tracking, fuel consumption
- Autonomous vehicles: Sensor fusion data

**5. Energy & Utilities**
- Smart grid: Power consumption, generation
- Renewable energy: Solar/wind farm monitoring
- Oil & gas: Pipeline monitoring, drilling data

---

## Slide 21: Integration Ecosystem

**Data Collection:**
- Telegraf (official agent)
- Prometheus remote write
- Custom applications (HTTP API)
- IoT platforms (MQTT bridges)

**Visualization:**
- Grafana (native InfluxDB 3 support coming)
- Apache Superset
- Tableau (via Arrow JDBC)
- Custom dashboards (API)

**Data Processing:**
- Apache Spark (Parquet files)
- Python (Pandas, Polars via Arrow)
- Jupyter notebooks
- dbt (data transformation)

**Export & Archive:**
- S3/GCS for long-term storage
- Data lakes (Parquet native)
- Analytics platforms

---

## Slide 22: Migration from InfluxDB 2.x

**Migration Path:**

1. **Assessment Phase**
   - Audit existing queries (Flux → SQL translation)
   - Identify retention policies
   - Review dashboard dependencies

2. **Data Migration**
   - Export from v2 (CSV or Line Protocol)
   - Transform to v3 Line Protocol (if needed)
   - Bulk import to v3

3. **Application Updates**
   - Rewrite queries from Flux/InfluxQL to SQL
   - Update write logic (v3 Line Protocol)
   - Test thoroughly

4. **Parallel Running**
   - Run both systems temporarily
   - Validate data consistency
   - Switch over gradually

**Key Challenges:**
- No direct migration tool yet (coming)
- Query language completely different
- No built-in dashboards in Core

---

## Slide 23: Troubleshooting Guide

**Problem: Data Not Appearing**

```bash
# Check database exists
curl http://localhost:8086/api/v3/configure

# Verify write
curl -X POST "http://localhost:8086/api/v3/write?db=mydb" \
  --data-binary "test value=1"

# Query to confirm
curl -X POST "http://localhost:8086/api/v3/query?db=mydb" \
  -d '{"query": "SELECT * FROM test"}'
```

**Problem: Slow Queries**

```sql
-- Add time filter
WHERE time >= NOW() - INTERVAL '1 hour'

-- Limit results
LIMIT 1000

-- Select specific columns
SELECT time, temp (not SELECT *)
```

**Problem: High Memory Usage**

- Check WAL size: Flush more frequently
- Review in-memory buffer size
- Optimize query patterns (avoid SELECT *)

**Problem: Type Conflicts**

- Ensure consistent field types
- Use separate fields for different types
- Check existing schema: `SELECT * FROM measurement LIMIT 1`

---

## Slide 24: Monitoring InfluxDB 3 Itself

**Key Metrics to Track:**

```sql
-- Write throughput
SELECT 
    DATE_BIN(INTERVAL '1 minute', time, TIMESTAMP '1970-01-01') as minute,
    COUNT(*) as points_written
FROM _internal..writes
GROUP BY minute;

-- Query performance
SELECT 
    query_duration_ms,
    query_text
FROM _internal..queries
WHERE query_duration_ms > 1000
ORDER BY time DESC;

-- Storage usage
SELECT 
    table_name,
    SUM(file_size_bytes) as total_bytes
FROM _internal..storage
GROUP BY table_name;
```

**External Monitoring:**
- Use Telegraf to monitor InfluxDB
- Store metrics in separate InfluxDB instance
- Alert on:
  - Write failures
  - Query latency > SLA
  - Disk usage > 80%
  - WAL size growth

---

## Slide 25: Future Roadmap & Community

**Upcoming Features (2025):**
- Native Grafana plugin for InfluxDB 3
- Official migration tools from v2
- Enhanced retention policy management
- Improved documentation and examples

**Community Resources:**
- GitHub: https://github.com/influxdata/influxdb
- Documentation: https://docs.influxdata.com/influxdb/v3/
- Community Forums: https://community.influxdata.com/
- Discord: InfluxData community server

**Contributing:**
- Report issues on GitHub
- Submit PRs for features/fixes
- Share use cases and benchmarks
- Write blog posts and tutorials

**Why InfluxDB 3 Matters:**
- First production time-series DB built on Arrow/Parquet
- Proves open standards can compete with proprietary
- Sets new benchmark for cardinality handling
- Makes SQL the standard for time-series queries

---

## Slide 26: Hands-On Demo Setup

**Quick Start with Docker:**

```bash
# Pull and run
docker run -d --name influxdb3 \
  -p 8086:8086 \
  influxdata/influxdb:3.0-core

# Create database
curl -X POST "http://localhost:8086/api/v3/configure" \
  -H "Content-Type: application/json" \
  -d '{"database": "demo"}'

# Write sample data
curl -X POST "http://localhost:8086/api/v3/write?db=demo" \
  --data-binary "weather,location=bangalore temp=28.5"

# Query it
curl -X POST "http://localhost:8086/api/v3/query?db=demo" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM weather"}'
```

**Demo Environment Ready! ✅**

---

## Slide 27: Live Demo - IoT Smart Home

**Scenario:** Monitor a smart home with multiple sensors

**Step 1: Ingest Sensor Data**
```bash
curl -X POST "http://localhost:8086/api/v3/write?db=demo" \
  --data-binary "
temperature,room=living_room,sensor=th01 celsius=22.5,fahrenheit=72.5
temperature,room=bedroom,sensor=th02 celsius=20.1,fahrenheit=68.2
humidity,room=living_room,sensor=th01 percent=45.2
power,appliance=refrigerator watts=150i,kwh_daily=3.6
motion,room=hallway,sensor=m01 detected=true,battery=87i
"
```

**Step 2: Query Current Status**
```sql
SELECT room, celsius FROM temperature 
ORDER BY time DESC LIMIT 5;
```

**Step 3: Calculate Totals**
```sql
SELECT 
    SUM(watts) as total_watts,
    SUM(kwh_daily) as total_kwh
FROM power;
```

**Step 4: Check Device Health**
```sql
SELECT room, sensor, battery 
FROM motion 
WHERE battery < 90;
```

---

## Slide 28: Demo - Time-Series Analysis

**Scenario:** Analyze temperature trends

**Create Time-Series Data:**
```bash
# Generate hourly data for 24 hours
for i in {0..23}; do
  ts=$((1702468800000000000 + i * 3600000000000))
  temp=$(echo "25 + $i * 0.5 - ($i - 12)^2 * 0.1" | bc -l)
  echo "temp,location=office value=$temp $ts"
done | curl -X POST "http://localhost:8086/api/v3/write?db=demo" \
  --data-binary @-
```

**Query 1: Hourly Statistics**
```sql
SELECT 
    DATE_TRUNC('hour', time) as hour,
    AVG(value) as avg_temp,
    MIN(value) as min_temp,
    MAX(value) as max_temp
FROM temp
GROUP BY hour
ORDER BY hour;
```

**Query 2: Moving Average**
```sql
SELECT 
    time,
    value as actual_temp,
    AVG(value) OVER (
        ORDER BY time 
        ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING
    ) as smoothed_temp
FROM temp
ORDER BY time;
```

---

## Slide 29: Performance Demonstration

**Write Performance Test:**

```bash
# Write 10,000 points in batch
time (
  for i in {1..10000}; do
    echo "perf_test,sensor=sensor_$((i % 100)) value=$((RANDOM % 100))"
  done | curl -X POST "http://localhost:8086/api/v3/write?db=demo" \
    --data-binary @-
)
```

**Expected:** <1 second for 10K points

**Query Performance Test:**

```bash
# Aggregation on 10K points
time curl -s -X POST "http://localhost:8086/api/v3/query?db=demo" \
  -d '{"query": "SELECT sensor, AVG(value), COUNT(*) FROM perf_test GROUP BY sensor"}'
```

**Expected:** <100ms

**Demonstrates:**
- High write throughput
- Fast aggregation queries
- Efficient grouping on tags

---

## Slide 30: Key Takeaways

**What We Learned:**

1. **InfluxDB 3 is a Complete Rewrite**
   - Apache Arrow + Parquet foundation
   - SQL-first approach
   - Open standards over proprietary

2. **High Cardinality is Solved**
   - 100M+ unique series supported
   - No more cardinality limits
   - Efficient columnar storage

3. **SQL Makes It Accessible**
   - Leverage existing skills
   - Standard tooling ecosystem
   - No need to learn Flux

4. **Performance is Exceptional**
   - Vectorized query execution
   - Predicate pushdown
   - Column pruning
   - 10-100x faster than row-based DBs

5. **Core vs Enterprise Trade-offs**
   - Core: Free, single-node, API-only
   - Enterprise: Clustered, managed, UI

---

## Slide 31: When to Choose InfluxDB 3

**Choose InfluxDB 3 When:**

✅ High cardinality data (millions of unique series)
✅ Need SQL standard compliance
✅ Want open data formats (Arrow/Parquet)
✅ Time-series with analytical queries
✅ IoT/monitoring at scale
✅ Integration with modern data stack

**Consider Alternatives When:**

❌ Need built-in alerting/dashboards (use Grafana instead)
❌ Require Flux language (stay on v2 for now)
❌ Very simple time-series needs (SQLite with timestamp index)
❌ Need mature enterprise features today (wait for v3 Enterprise GA)

**InfluxDB 3 Sweet Spot:**
- IoT deployments with 10K+ devices
- Infrastructure monitoring at scale
- Financial tick data
- Scientific instrumentation
- Any high-cardinality time-series workload

---

## Slide 32: Getting Started Checklist

**Your Action Plan:**

- [ ] Set up Docker environment
- [ ] Create first database
- [ ] Practice Line Protocol syntax
- [ ] Write sample data (100+ points)
- [ ] Run basic SQL queries
- [ ] Test time-based aggregations
- [ ] Try window functions
- [ ] Review best practices
- [ ] Build a small prototype project
- [ ] Join InfluxData community

**Recommended First Project:**
Build a simple system monitor that:
1. Collects CPU/memory/disk metrics
2. Stores in InfluxDB 3
3. Queries for hourly averages
4. Detects anomalies (>2 std dev)

**Next Steps:**
- Read official documentation
- Experiment with your own data
- Share learnings with team
- Consider for production use case

---

## Slide 33: Resources & References

**Official Documentation:**
- Main Docs: https://docs.influxdata.com/influxdb/v3/
- API Reference: https://docs.influxdata.com/influxdb/v3/api/
- GitHub: https://github.com/influxdata/influxdb

**Learning Resources:**
- Apache Arrow: https://arrow.apache.org/
- DataFusion: https://github.com/apache/arrow-datafusion
- Parquet: https://parquet.apache.org/

**Tools & Integrations:**
- Telegraf: https://www.influxdata.com/time-series-platform/telegraf/
- Grafana: https://grafana.com/
- Python client: https://github.com/influxdata/influxdb-client-python

**Community:**
- Forums: https://community.influxdata.com/
- Discord: InfluxData community server
- Twitter: @InfluxDB
- Blog: https://www.influxdata.com/blog/

---

## Slide 34: Q&A

**Common Questions:**

**Q: Can I migrate from InfluxDB 2.x to 3.x easily?**
A: Not yet automated. Manual export/import required. Official tools coming in 2025.

**Q: Does InfluxDB 3 Core support clustering?**
A: No, Core is single-node. Use Enterprise for clustering.

**Q: Can I use Grafana with InfluxDB 3?**
A: Yes, via SQL data source plugin. Native plugin coming soon.

**Q: How does retention work in Core?**
A: Manual deletion via SQL queries. Automated retention only in Enterprise.

**Q: Is InfluxDB 3 production-ready?**
A: Core is stable for single-node deployments. Enterprise for mission-critical.

**Q: What's the upgrade path from v1.x?**
A: v1.x → v2.x → v3.x (requires two migrations)

---

## Slide 35: Thank You!

**Contact & Follow-Up:**

- Questions? Let's discuss!
- Demo code available at: [your repo]
- Connect: [your LinkedIn/email]

**Remember:**
- Start small, experiment often
- Join the community
- Share your learnings
- InfluxDB 3 is the future of time-series data

**"Time-series data deserves a modern, open, scalable database. InfluxDB 3 delivers."**

---

## Appendix A: Docker Compose Full Setup

```yaml
version: '3.8'

services:
  influxdb3:
    image: influxdata/influxdb:3.0-core
    container_name: influxdb3-production
    ports:
      - "8086:8086"
    volumes:
      - influxdb3-data:/var/lib/influxdb3
      - ./influxdb3.conf:/etc/influxdb3/influxdb3.conf
    environment:
      - INFLUXDB_HTTP_BIND_ADDRESS=:8086
      - INFLUXDB_REPORTING_DISABLED=true
    restart: unless-stopped
    networks:
      - monitoring

  telegraf:
    image: telegraf:latest
    container_name: telegraf
    volumes:
      - ./telegraf.conf:/etc/telegraf/telegraf.conf:ro
    depends_on:
      - influxdb3
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
    depends_on:
      - influxdb3
    networks:
      - monitoring

volumes:
  influxdb3-data:
  grafana-data:

networks:
  monitoring:
    driver: bridge
```

---

## Appendix B: Sample Telegraf Configuration

```toml
[agent]
  interval = "10s"
  round_interval = true
  metric_batch_size = 1000
  metric_buffer_limit = 10000

[[outputs.influxdb_v2]]
  urls = ["http://influxdb3:8086"]
  database = "telegraf"
  
[[inputs.cpu]]
  percpu = true
  totalcpu = true
  collect_cpu_time = false

[[inputs.disk]]
  ignore_fs = ["tmpfs", "devtmpfs", "devfs"]

[[inputs.mem]]

[[inputs.net]]
  interfaces = ["eth0"]

[[inputs.system]]
```

---

## Appendix C: Python Client Example

```python
from influxdb_client_3 import InfluxDBClient3

# Initialize client
client = InfluxDBClient3(
    host='http://localhost:8086',
    database='mydb'
)

# Write data using Line Protocol
data = """
temperature,location=bangalore,sensor=th01 celsius=28.5
temperature,location=mumbai,sensor=th02 celsius=32.1
"""

client.write(data)

# Query using SQL
query = """
SELECT 
    location,
    AVG(celsius) as avg_temp
FROM temperature
WHERE time >= NOW() - INTERVAL '1 hour'
GROUP BY location
"""

result = client.query(query)

# Process results
for row in result:
    print(f"{row['location']}: {row['avg_temp']:.2f}°C")

# Close connection
client.close()
```

---

## Appendix D: Useful SQL Patterns

```sql
-- 1. Fill gaps in time series (forward fill)
SELECT 
    time,
    COALESCE(
        temperature,
        LAG(temperature) OVER (ORDER BY time)
    ) as filled_temp
FROM weather
ORDER BY time;

-- 2. Detect sudden changes
WITH changes AS (
    SELECT 
        time,
        temperature,
        LAG(temperature) OVER (ORDER BY time) as prev_temp
    FROM weather
)
SELECT * FROM changes
WHERE ABS(temperature - prev_temp) > 5;

-- 3. Time-weighted average
SELECT 
    SUM(value * duration) / SUM(duration) as time_weighted_avg
FROM (
    SELECT 
        value,
        EXTRACT(EPOCH FROM (
            LEAD(time) OVER (ORDER BY time) - time
        )) as duration
    FROM measurements
) subquery;

-- 4. Percentiles
SELECT 
    location,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY temperature) as median,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY temperature) as p95
FROM weather
GROUP BY location;
```

---

END OF PRESENTATION

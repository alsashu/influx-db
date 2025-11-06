# Data Modeling and Schemas in InfluxDB

## 60-Minute Comprehensive Course

---

## Course Overview (2 mins)

**Learning Objectives:**

- Design efficient and scalable measurement schemas
- Make informed decisions between tags and fields
- Understand and optimize series cardinality
- Handle schema evolution gracefully
- Apply best practices to real-world scenarios

**Duration:** 60 minutes  
**Level:** Intermediate

**Prerequisites:**

- Basic understanding of InfluxDB
- Familiarity with time-series concepts
- Knowledge of measurements, fields, and tags

---

## Part 1: Designing Efficient Measurement Schemas (15 mins)

### The Foundation of Good Schema Design

**Key Principles:**

1. **Query-driven design** - Design for how you'll query, not just what you'll store
2. **Simplicity first** - Start simple, add complexity only when needed
3. **Cardinality awareness** - Every tag combination creates a new series
4. **Future-proof naming** - Use clear, consistent naming conventions

### Schema Design Process

```
1. Identify what you're measuring
   ↓
2. Determine query patterns
   ↓
3. Choose measurement granularity
   ↓
4. Decide tags (metadata for filtering)
   ↓
5. Decide fields (actual measurements)
   ↓
6. Validate cardinality
   ↓
7. Test and iterate
```

### Measurement Granularity

**Option 1: Single Measurement (Narrow Schema)**

```
cpu,host=server01,cpu=cpu0 usage_idle=95.2,usage_system=2.1,usage_user=2.7
cpu,host=server01,cpu=cpu1 usage_idle=94.8,usage_system=2.5,usage_user=2.7
```

**Option 2: Multiple Measurements (Wide Schema)**

```
cpu_usage_idle,host=server01,cpu=cpu0 value=95.2
cpu_usage_system,host=server01,cpu=cpu0 value=2.1
cpu_usage_user,host=server01,cpu=cpu0 value=2.7
```

**Comparison:**

| Aspect                | Single Measurement         | Multiple Measurements |
| --------------------- | -------------------------- | --------------------- |
| **Write Performance** | Better (fewer writes)      | Worse (more writes)   |
| **Query Simplicity**  | Better (one source)        | Worse (JOIN needed)   |
| **Field Flexibility** | Better (add fields easily) | Limited               |
| **Cardinality**       | Lower                      | Higher                |
| **Use Case**          | Related metrics            | Independent metrics   |

**Recommendation:** Prefer single measurements with multiple fields for related metrics.

### Common Anti-Patterns

#### ❌ Anti-Pattern 1: Too Many Measurements

```
# BAD: Separate measurement per metric
temperature_sensor_1 value=22.5
temperature_sensor_2 value=23.1
temperature_sensor_3 value=21.8
```

```
# GOOD: Single measurement with tag
temperature,sensor_id=sensor_1 value=22.5
temperature,sensor_id=sensor_2 value=23.1
temperature,sensor_id=sensor_3 value=21.8
```

#### ❌ Anti-Pattern 2: Encoding Data in Measurement Names

```
# BAD: Dynamic measurement names
server01_cpu_usage value=45.2
server02_cpu_usage value=52.1
```

```
# GOOD: Use tags for dimensions
cpu_usage,host=server01 value=45.2
cpu_usage,host=server02 value=52.1
```

#### ❌ Anti-Pattern 3: Mixing Unrelated Metrics

```
# BAD: Unrelated metrics together
system,host=server01 cpu=45.2,disk=78.5,network_in=1024,user_count=42
```

```
# GOOD: Separate by measurement type
cpu,host=server01 usage=45.2
disk,host=server01 usage=78.5
network,host=server01 bytes_in=1024
users,host=server01 count=42
```

### Schema Design Patterns

#### Pattern 1: Hierarchical Tags

```
# Geographic hierarchy
weather,continent=NA,country=US,state=CA,city=SF temperature=18.5,humidity=65

# Organizational hierarchy
metrics,company=acme,department=eng,team=platform,service=api response_time=45
```

**Benefits:**

- Flexible querying at any level
- Natural data organization
- Easy aggregation

**Drawback:**

- Can increase cardinality quickly

#### Pattern 2: Composite Measurements

```
# Group related metrics
http_requests,endpoint=/api/users,method=GET,status=200 count=1245,duration_ms=45,bytes=2048

# Better than:
http_request_count,endpoint=/api/users,method=GET,status=200 value=1245
http_request_duration,endpoint=/api/users,method=GET,status=200 value=45
http_request_bytes,endpoint=/api/users,method=GET,status=200 value=2048
```

#### Pattern 3: Time-Bucketed Aggregations

```
# Raw data (short retention)
sensor_reading,sensor_id=temp_01 value=22.5

# 1-minute aggregates (medium retention)
sensor_reading_1m,sensor_id=temp_01 min=22.1,max=22.9,avg=22.5,count=60

# 1-hour aggregates (long retention)
sensor_reading_1h,sensor_id=temp_01 min=21.8,max=23.2,avg=22.6,count=3600
```

### Schema Documentation Template

```yaml
measurement: cpu_usage
description: CPU utilization metrics by host and core
tags:
  host:
    description: Server hostname
    example: server01
    cardinality: ~100
  cpu:
    description: CPU core identifier
    example: cpu0, cpu1, cpu-total
    cardinality: ~64
  datacenter:
    description: Datacenter location
    example: us-east-1, eu-west-1
    cardinality: ~5
fields:
  usage_idle:
    type: float
    description: Percentage of idle time
    range: 0-100
  usage_system:
    type: float
    description: Percentage of system time
    range: 0-100
  usage_user:
    type: float
    description: Percentage of user time
    range: 0-100
estimated_series: 100 hosts × 64 cpus × 5 datacenters = 32,000 series
retention: 7 days (raw), 90 days (1m avg), 1 year (1h avg)
```

---

## Part 2: Choosing Tags vs Fields (15 mins)

### The Critical Decision

**The Golden Rule:**

```
Tags = Dimensions for filtering and grouping (indexed)
Fields = Actual measurements (not indexed)
```

### Performance Impact Deep Dive

#### Tags: Indexed Metadata

**How Tags Work Internally:**

```
1. Tags are indexed in the TSM engine
2. Each unique tag combination creates a series
3. Series index is stored in memory
4. Fast lookups for WHERE and GROUP BY
```

**Memory Impact:**

```
Series Cardinality = Product of all tag value counts

Example:
- host: 100 values
- region: 5 values
- service: 20 values
- Total series: 100 × 5 × 20 = 10,000 series per measurement
```

**Each series consumes:**

- ~1-2 KB in memory for series key and index
- 10,000 series ≈ 10-20 MB memory
- 1,000,000 series ≈ 1-2 GB memory

#### Fields: Non-Indexed Data

**How Fields Work Internally:**

```
1. Fields are stored in TSM files with data
2. Not indexed separately
3. Cannot efficiently filter by field values
4. Can have many fields with minimal overhead
```

**Performance Characteristics:**

- Adding fields: Minimal impact
- Querying by field: Requires full scan
- Memory: Only affects data size, not index

### Decision Framework

#### Use Tags When:

✅ **1. You need to filter by the value**

```
# Common queries:
SELECT * FROM metrics WHERE host='server01'
SELECT * FROM metrics WHERE region='us-east'
```

✅ **2. You need to group by the value**

```
# Aggregation queries:
SELECT mean(value) FROM metrics GROUP BY host
SELECT sum(bytes) FROM network GROUP BY interface
```

✅ **3. The value has low-to-medium cardinality**

```
# Good tag examples:
- host (10-10,000 values)
- region (5-50 values)
- environment (3-10 values)
- service_name (10-1,000 values)
- status_code (20-100 values)
```

✅ **4. The value is metadata, not the measurement**

```
# Metadata examples:
- datacenter location
- device type
- sensor ID
- application version
```

#### Use Fields When:

✅ **1. It's the actual measurement/observation**

```
# Measurements:
temperature value=22.5
cpu usage=45.2,idle=54.8
http_request duration=145,bytes=2048
```

✅ **2. The value has high cardinality**

```
# High cardinality data:
- user_id (millions of values)
- session_id (unique per session)
- trace_id (unique per request)
- error_message (many unique strings)
- timestamp_string (continuous values)
```

✅ **3. You don't need to filter or group by it**

```
# Values you just store and retrieve:
- request_body
- error_details
- computed_metric
- raw_sensor_value
```

✅ **4. The value can be numeric**

```
# Numeric data belongs in fields:
- counters
- gauges
- durations
- sizes
- percentages
```

### Real-World Examples

#### Example 1: Web Server Logs

```
# ❌ BAD: User ID as tag (high cardinality)
http_requests,user_id=u12345,endpoint=/api/users status=200,duration=45

# ✅ GOOD: User ID as field
http_requests,endpoint=/api/users,status=200 user_id="u12345",duration=45

# ✅ EVEN BETTER: Separate concerns
http_requests,endpoint=/api/users,status=200 count=1,duration=45
http_users,endpoint=/api/users user_id="u12345",action="fetch"
```

#### Example 2: IoT Temperature Sensors

```
# ❌ BAD: Timestamp as tag
temperature,sensor_id=temp_01,reading_time=2024-01-15T10:30:00Z value=22.5

# ❌ BAD: Value as tag
temperature,sensor_id=temp_01,temp_value=22.5 timestamp=1705318200

# ✅ GOOD: Proper tag/field separation
temperature,sensor_id=temp_01,location=warehouse_a,zone=2 value=22.5,battery=98.5
```

#### Example 3: Application Metrics

```
# ❌ BAD: High cardinality in tags
metrics,endpoint=/api/users/12345/profile,session_id=abc123 response_time=45

# ✅ GOOD: Parameterized endpoints, session as field
metrics,endpoint=/api/users/:id/profile,method=GET,status=200 response_time=45,session_id="abc123"
```

### The Cardinality Trap

#### Scenario: E-commerce Orders

```
# ❌ DANGEROUS: High cardinality tags
orders,order_id=ORD-12345,user_id=USR-67890,product_id=PROD-11111 amount=99.99

# Cardinality calculation:
# - 1M orders/day
# - 100K users
# - 10K products
# Potential series: 1M × 100K × 10K = 1 trillion series! 💥
```

```
# ✅ SAFE: Low cardinality tags, high cardinality as fields
orders,payment_method=credit_card,status=completed,country=US order_id="ORD-12345",user_id="USR-67890",product_id="PROD-11111",amount=99.99

# Cardinality calculation:
# - 5 payment methods
# - 10 statuses
# - 200 countries
# Total series: 5 × 10 × 200 = 10,000 series ✅
```

### Performance Testing

**Test Tag vs Field Performance:**

```bash
# Write test: 1M points with user_id as tag
for i in {1..1000000}; do
  echo "metric,user_id=user_$i value=1"
done | influx write --bucket test

# Result: High memory usage, slow queries

# Write test: 1M points with user_id as field
for i in {1..1000000}; do
  echo "metric,type=user value=1,user_id=\"user_$i\""
done | influx write --bucket test

# Result: Low memory usage, fast queries
```

### Tag/Field Decision Matrix

| Scenario       | Cardinality | Filter/Group? | Use As    |
| -------------- | ----------- | ------------- | --------- |
| Hostname       | 10-1,000    | Yes           | **Tag**   |
| Region         | 5-50        | Yes           | **Tag**   |
| User ID        | 100,000+    | Rarely        | **Field** |
| Session ID     | 1,000,000+  | Rarely        | **Field** |
| HTTP Status    | 20-100      | Yes           | **Tag**   |
| Response Time  | Continuous  | No            | **Field** |
| Error Message  | High        | Rarely        | **Field** |
| Environment    | 3-10        | Yes           | **Tag**   |
| Sensor Value   | Continuous  | No            | **Field** |
| Device Type    | 10-100      | Yes           | **Tag**   |
| Transaction ID | 1,000,000+  | Rarely        | **Field** |
| API Endpoint   | 50-500      | Yes           | **Tag**   |

---

## Part 3: Series Cardinality and Optimization (12 mins)

### Understanding Series Cardinality

**Definition:**

```
Series = Unique combination of measurement + tag set

Example:
cpu,host=server01,region=us-east    ← Series 1
cpu,host=server01,region=us-west    ← Series 2
cpu,host=server02,region=us-east    ← Series 3
```

### Calculating Cardinality

**Formula:**

```
Total Series = Measurement_Count × (Tag1_Values × Tag2_Values × ... × TagN_Values)
```

**Example 1: Simple Calculation**

```
Measurement: cpu
Tags:
  - host: 100 values
  - cpu_core: 8 values

Series = 1 × (100 × 8) = 800 series
```

**Example 2: Complex Calculation**

```
Measurement: http_requests
Tags:
  - endpoint: 50 values
  - method: 4 values (GET, POST, PUT, DELETE)
  - status: 10 values (200, 201, 400, 401, 403, 404, 500, 502, 503, 504)
  - datacenter: 5 values

Series = 1 × (50 × 4 × 10 × 5) = 10,000 series
```

**Example 3: Multi-Measurement**

```
Measurements: 5 different metrics (cpu, memory, disk, network, process)
Tags per measurement:
  - host: 100 values
  - region: 5 values

Total series = 5 × (100 × 5) = 2,500 series
```

### Cardinality Limits and Impact

**Performance Thresholds:**

```
Series Count         | Status         | Action
---------------------|----------------|---------------------------
< 100,000           | ✅ Excellent    | No concerns
100,000 - 1,000,000 | ⚠️ Good         | Monitor growth
1,000,000 - 10M     | ⚠️ Concerning   | Optimize schema
> 10,000,000        | ❌ Critical     | Immediate action needed
```

**Impact on System:**

- **Memory:** ~1-2 KB per series for index
- **Query Performance:** Degrades with high cardinality
- **Write Performance:** Slows as index grows
- **Compaction:** Takes longer with more series
- **Startup Time:** Longer index rebuilding

### Monitoring Cardinality

**Check Current Cardinality:**

```bash
# InfluxDB 2.x - Check total series
influx query 'import "influxdata/influxdb/v1"
v1.tagValues(bucket: "mybucket", tag: "_measurement")
|> count()'

# Check cardinality per measurement
influx query 'import "influxdata/influxdb/schema"
schema.measurements(bucket: "mybucket")
|> schema.measurementTagValues(bucket: "mybucket", tag: "_field")
|> count()'
```

```sql
-- InfluxDB 1.x - Check series cardinality
SHOW SERIES CARDINALITY

-- Per database
SHOW SERIES CARDINALITY ON mydb

-- Per measurement
SHOW SERIES CARDINALITY ON mydb FROM cpu

-- Per tag
SHOW TAG VALUES CARDINALITY ON mydb FROM cpu WITH KEY = "host"
```

**Set Up Alerts:**

```flux
// Alert when cardinality exceeds threshold
from(bucket: "mybucket")
  |> range(start: -5m)
  |> cardinality()
  |> map(fn: (r) => ({ r with _level: if r._value > 1000000 then "crit" else "ok" }))
  |> filter(fn: (r) => r._level == "crit")
```

### Optimization Strategies

#### Strategy 1: Consolidate Tag Values

```
# ❌ BEFORE: High cardinality endpoint tags
http,endpoint=/api/users/123 count=1
http,endpoint=/api/users/456 count=1
http,endpoint=/api/users/789 count=1
# Cardinality: Millions of unique endpoints

# ✅ AFTER: Parameterized endpoints
http,endpoint=/api/users/:id count=1,user_id="123"
http,endpoint=/api/users/:id count=1,user_id="456"
http,endpoint=/api/users/:id count=1,user_id="789"
# Cardinality: ~50 unique endpoint patterns
```

#### Strategy 2: Remove Unnecessary Tags

```
# ❌ BEFORE: Too many tags
metrics,host=server01,datacenter=dc1,rack=rack5,row=row3,floor=2,building=west value=42

# ✅ AFTER: Only essential tags
metrics,host=server01,datacenter=dc1 value=42,rack="rack5",row="row3",floor=2,building="west"
```

#### Strategy 3: Use Tag Hierarchies Wisely

```
# ❌ BEFORE: All combinations
metrics,country=US,state=CA,city=SF,zip=94105 value=42

# ✅ AFTER: Choose appropriate granularity
# For regional analysis:
metrics,country=US,state=CA value=42,city="SF",zip="94105"

# For city-level analysis:
metrics,country=US,city=SF value=42,state="CA",zip="94105"
```

#### Strategy 4: Time-Based Bucketing

```
# ❌ BEFORE: Continuous values as tags
requests,response_time_ms=145 count=1
# Cardinality: Thousands of unique response times

# ✅ AFTER: Bucket into ranges
requests,response_time_bucket=100-200 count=1,actual_time=145
# Cardinality: ~10 buckets (0-50, 50-100, 100-200, etc.)
```

#### Strategy 5: Separate by Use Case

```
# ❌ BEFORE: Everything in one measurement
events,user_id=u1,session_id=s1,event=click,target=button_a value=1
# High cardinality due to unique sessions

# ✅ AFTER: Separate measurements
user_events,event=click,target=button_a value=1,user_id="u1"
session_activity,session_id=s1 event="click",user_id="u1",target="button_a"
```

### Cardinality Reduction Example

**Before:**

```
# Web application metrics
http,endpoint=/api/v1/users/12345,method=GET,status=200,user=john,session=abc123,ip=1.2.3.4 duration=45

Tags:
- endpoint: 10,000 unique values (individual user IDs in path)
- method: 4 values
- status: 10 values
- user: 50,000 values
- session: 1,000,000 values
- ip: 100,000 values

Cardinality: 1 × 10,000 × 4 × 10 × 50,000 × 1,000,000 × 100,000 = ∞ (system crash!)
```

**After Optimization:**

```
# Refactored schema
http,endpoint=/api/v1/users/:id,method=GET,status=200 duration=45,user_id="john",session_id="abc123",client_ip="1.2.3.4"

Tags:
- endpoint: 50 values (parameterized routes)
- method: 4 values
- status: 10 values

Cardinality: 1 × 50 × 4 × 10 = 2,000 series ✅

Reduction: From infinity to 2,000 (100% system save!)
```

### Best Practices Summary

✅ **DO:**

- Monitor cardinality regularly
- Design with cardinality in mind
- Use fields for high-cardinality data
- Parameterize dynamic values
- Set cardinality alerts

❌ **DON'T:**

- Use UUIDs as tags
- Put user IDs in tags
- Use timestamp strings as tags
- Create per-entity measurements
- Ignore cardinality warnings

---

## Part 4: Schema Evolution and Naming Conventions (8 mins)

### Schema Evolution Challenges

**InfluxDB Schema Characteristics:**

- **Schemaless:** No predefined schema required
- **Dynamic:** Measurements and fields appear on first write
- **Immutable tags:** Cannot change tag values retroactively
- **No ALTER TABLE:** Schema changes require rewrites

### Evolution Strategies

#### Strategy 1: Additive Changes (Preferred)

```
# Version 1: Initial schema
sensor,location=warehouse temperature=22.5

# Version 2: Add new field (✅ Safe)
sensor,location=warehouse temperature=22.5,humidity=65.0

# Version 3: Add new tag (⚠️ Creates new series)
sensor,location=warehouse,zone=a temperature=22.5,humidity=65.0

# Queries work backward compatible:
SELECT temperature FROM sensor WHERE location='warehouse'
# Returns data from all versions
```

#### Strategy 2: Versioned Measurements

```
# When breaking changes needed:
sensor_v1,location=warehouse temp=22.5
sensor_v2,location=warehouse temperature=22.5,humidity=65.0

# Transition period: Write to both
sensor_v1,location=warehouse temp=22.5
sensor_v2,location=warehouse temperature=22.5,humidity=65.0

# Eventually: Deprecate v1
# Query both during transition:
SELECT mean(temp) FROM sensor_v1 WHERE time > now() - 30d
UNION
SELECT mean(temperature) FROM sensor_v2 WHERE time > now() - 30d
```

#### Strategy 3: Field Name Migration

```
# Old field name
cpu,host=server01 usage=45.2

# Transition: Write both fields
cpu,host=server01 usage=45.2,utilization=45.2

# Queries updated to use new field name
SELECT utilization FROM cpu

# After migration period: Stop writing old field
cpu,host=server01 utilization=45.2
```

#### Strategy 4: Tag Value Standardization

```
# Problem: Inconsistent tag values
server,env=prod,region=us-east value=1
server,env=production,region=us-east-1 value=1
server,env=PROD,region=useast1 value=1

# Solution: Data pipeline normalization
# Before write, normalize:
def normalize_tags(tags):
    tags['env'] = tags['env'].lower()
    if tags['env'] in ['prod', 'production']:
        tags['env'] = 'production'
    tags['region'] = standardize_region(tags['region'])
    return tags

# Result:
server,env=production,region=us-east-1 value=1
```

### Naming Conventions

#### Measurement Names

**Guidelines:**

- Use lowercase with underscores
- Be descriptive but concise
- Use nouns, not verbs
- Plural vs singular: Be consistent

**Good Examples:**

```
✅ cpu_usage
✅ http_requests
✅ temperature_readings
✅ disk_io_operations
✅ network_packets_received
```

**Bad Examples:**

```
❌ CPU-Usage (uppercase, hyphen)
❌ httpReq (camelCase, abbreviated)
❌ temp (too vague)
❌ monitor_disk_io_ops_read (too long)
❌ get_data (verb)
```

#### Tag Names

**Guidelines:**

- Use lowercase with underscores
- Be descriptive and consistent
- Avoid special characters
- Keep short but clear

**Good Examples:**

```
✅ host
✅ region
✅ datacenter
✅ service_name
✅ environment
✅ sensor_id
✅ device_type
```

**Bad Examples:**

```
❌ hostName (camelCase)
❌ reg (too abbreviated)
❌ data-center (hyphen)
❌ srv.name (period)
❌ 1st_device (starts with number)
```

#### Field Names

**Guidelines:**

- Use lowercase with underscores
- Include units when relevant
- Be explicit about what's measured
- Use consistent naming patterns

**Good Examples:**

```
✅ response_time_ms
✅ memory_usage_bytes
✅ temperature_celsius
✅ request_count
✅ success_rate_percent
✅ disk_free_gb
✅ latency_p95_ms
```

**Bad Examples:**

```
❌ respTime (abbreviated, no unit)
❌ mem (too vague)
❌ temp (ambiguous unit)
❌ cnt (unclear abbreviation)
❌ value (generic)
```

#### Naming Pattern Examples

**Pattern 1: Metric Type Prefix**

```
# Counters
requests_total
errors_total
bytes_sent_total

# Gauges
memory_usage_bytes
cpu_usage_percent
queue_length

# Histograms
response_time_bucket
request_duration_bucket
```

**Pattern 2: Component + Action + Metric**

```
database_query_duration_ms
api_request_count
cache_hit_rate_percent
disk_write_bytes_per_sec
```

**Pattern 3: Hierarchical Naming**

```
system.cpu.usage
system.memory.available
application.http.requests
application.http.errors
application.database.connections
```

### Naming Convention Document Example

```yaml
organization: acme_corp
version: 1.0

general_rules:
  - Use lowercase only
  - Use underscores, not hyphens or camelCase
  - Be descriptive, avoid abbreviations
  - Include units in field names

measurement_naming:
  pattern: "{domain}_{object}_{metric_type}"
  examples:
    - web_requests
    - database_connections
    - sensor_temperature

tag_naming:
  required_tags:
    - environment: [production, staging, development]
    - datacenter: [us-east-1, us-west-1, eu-west-1]
    - service: [api, web, worker, database]
  optional_tags:
    - host: server hostname
    - version: application version
    - instance: instance identifier

field_naming:
  pattern: "{metric}_{unit}"
  units:
    time: [ms, seconds, minutes]
    size: [bytes, kb, mb, gb]
    rate: [per_sec, per_min, per_hour]
    percentage: [percent, ratio]
  examples:
    - duration_ms
    - size_bytes
    - rate_per_sec
    - usage_percent

forbidden:
  - camelCase
  - kebab-case
  - UPPERCASE
  - special characters except underscore
  - starting with numbers
```

### Migration Playbook

**When Schema Changes Are Needed:**

```
Step 1: Plan the Migration
├── Document current schema
├── Identify breaking changes
├── Plan transition period
└── Communicate to stakeholders

Step 2: Implement Dual-Write
├── Update application to write both old and new
├── Monitor for issues
└── Validate data consistency

Step 3: Update Queries
├── Update dashboards
├── Update alerts
├── Update applications
└── Test thoroughly

Step 4: Monitor Transition
├── Track old vs new usage
├── Watch for errors
└── Collect feedback

Step 5: Complete Migration
├── Stop writing old schema
├── Archive old data (if needed)
├── Clean up code
└── Document final schema
```

---

## Part 5: Practical Modeling Examples (23 mins)

### Example 1: IoT Temperature Monitoring System

#### Requirements

- 10,000 sensors across multiple facilities
- Temperature readings every 10 seconds
- Need to query by facility, room, and sensor
- Track sensor health (battery, signal strength)
- Alert on temperature thresholds

#### Schema Design Process

**Step 1: Identify Measurements**

```
Primary measurement: sensor_temperature
Secondary measurements: sensor_health, sensor_alerts
```

**Step 2: Choose Tags**

```
Tags (Low cardinality, need to filter/group):
- facility_id (50 facilities)
- building_id (5 buildings per facility)
- floor (10 floors per building)
- room_type (warehouse, office, cold_storage, etc.) (10 types)
- sensor_id (10,000 sensors)

Cardinality Check:
50 × 5 × 10 × 10 × 10,000 = 250,000,000 (TOO HIGH!)

Optimized:
- facility_id (50)
- building_id (250 total: 50 × 5)
- sensor_id (10,000)

New cardinality: 50 × 250 × 10,000 = 125,000,000 (STILL TOO HIGH!)

Final optimization:
- facility_id (50)
- sensor_id (10,000)

Cardinality: 50 × 10,000 = 500,000 ✅

Move building_id, floor, room_type to fields or separate lookup
```

**Step 3: Choose Fields**

```
Fields:
- temperature_celsius (float)
- humidity_percent (float)
- battery_percent (float)
- signal_strength_dbm (integer)
- building_id (string)
- floor (integer)
- room_type (string)
```

**Final Schema:**

```
# Main temperature readings
sensor_temperature,facility_id=fac_001,sensor_id=sen_12345 temperature_celsius=22.5,humidity_percent=65.0,battery_percent=87.5,signal_strength_dbm=-45,building_id="bld_5",floor=3,room_type="warehouse"

# Simplified for common queries
sensor_temperature,facility_id=fac_001,sensor_id=sen_12345 temperature_celsius=22.5,humidity_percent=65.0

# Sensor health (less frequent, separate measurement)
sensor_health,facility_id=fac_001,sensor_id=sen_12345 battery_percent=87.5,signal_strength_dbm=-45,last_maintenance="2024-01-15"

# Alerts (event-driven)
sensor_alerts,facility_id=fac_001,sensor_id=sen_12345,alert_type=high_temp severity="warning",threshold=30.0,actual=32.1,message="Temperature exceeded threshold"
```

**Query Examples:**

```sql
-- Average temperature by facility (last hour)
SELECT mean(temperature_celsius)
FROM sensor_temperature
WHERE time > now() - 1h
GROUP BY facility_id

-- Find all sensors with low battery
SELECT last(battery_percent), sensor_id
FROM sensor_health
WHERE battery_percent < 20
GROUP BY sensor_id

-- Temperature trend for specific sensor
SELECT temperature_celsius
FROM sensor_temperature
WHERE sensor_id='sen_12345' AND time > now() - 24h

-- Alert history by facility
SELECT *
FROM sensor_alerts
WHERE facility_id='fac_001' AND time > now() - 7d
```

**Retention Strategy:**

```
# Raw data (high resolution)
CREATE RETENTION POLICY "raw_data" ON "iot_db"
  DURATION 7d
  REPLICATION 1
  SHARD DURATION 1d

# Downsampled 1-minute averages
CREATE RETENTION POLICY "medium_resolution" ON "iot_db"
  DURATION 90d
  REPLICATION 1
  SHARD DURATION 7d

# Hourly aggregates
CREATE RETENTION POLICY "long_term" ON "iot_db"
  DURATION 2y
  REPLICATION 1
  SHARD DURATION 30d
```

**Continuous Query for Downsampling:**

```sql
CREATE CONTINUOUS QUERY "downsample_1m" ON "iot_db"
BEGIN
  SELECT mean(temperature_celsius) AS temperature_celsius,
         mean(humidity_percent) AS humidity_percent
  INTO "medium_resolution"."sensor_temperature"
  FROM "raw_data"."sensor_temperature"
  GROUP BY time(1m), facility_id, sensor_id
END

CREATE CONTINUOUS QUERY "downsample_1h" ON "iot_db"
BEGIN
  SELECT mean(temperature_celsius) AS temperature_celsius,
         mean(humidity_percent) AS humidity_percent,
         min(temperature_celsius) AS temperature_min,
         max(temperature_celsius) AS temperature_max
  INTO "long_term"."sensor_temperature"
  FROM "medium_resolution"."sensor_temperature"
  GROUP BY time(1h), facility_id, sensor_id
END
```

---

### Example 2: DevOps Monitoring and Metrics

#### Requirements

- Monitor 500 servers across 5 regions
- Collect CPU, memory, disk, network metrics
- Track application performance (response times, error rates)
- Monitor Docker containers
- Support multi-tenant architecture

#### Schema Design

**Measurement Structure:**

```
# System metrics
system_cpu,host=server01,region=us-east,env=prod,cluster=web usage_percent=45.2,usage_user=30.1,usage_system=15.1,cores=16

system_memory,host=server01,region=us-east,env=prod,cluster=web total_bytes=34359738368,used_bytes=27487790694,available_bytes=6871947674,usage_percent=80.0

system_disk,host=server01,region=us-east,env=prod,device=sda1,mount_point=/,cluster=web total_bytes=1099511627776,used_bytes=824633720832,free_bytes=274877906944,usage_percent=75.0

system_network,host=server01,region=us-east,env=prod,interface=eth0,cluster=web bytes_sent=1048576000,bytes_received=2097152000,packets_sent=1000000,packets_received=1500000,errors_in=0,errors_out=0

# Application metrics
http_requests,host=server01,env=prod,service=api,endpoint=/api/v1/users,method=GET,status=200 count=1245,duration_ms=45,bytes_sent=204800

http_errors,host=server01,env=prod,service=api,endpoint=/api/v1/users,method=POST,status=500 count=5,error_type="DatabaseConnectionError"

# Container metrics
docker_container,host=server01,env=prod,container_name=api-prod-1,image=api:v1.2.3 cpu_percent=15.5,memory_bytes=536870912,memory_percent=12.5,network_rx_bytes=1048576,network_tx_bytes=2097152

# Database metrics
postgres_stats,host=db01,env=prod,database=app_db active_connections=25,idle_connections=10,query_duration_ms=12.5,transactions_per_sec=150.5,cache_hit_ratio=0.95
```

**Tag Cardinality Analysis:**

```
system_cpu:
- host: 500
- region: 5
- env: 3 (prod, staging, dev)
- cluster: 10 (web, api, worker, database, etc.)
Cardinality: 500 × 5 × 3 × 10 = 75,000 series ✅

http_requests:
- host: 500
- env: 3
- service: 20
- endpoint: 100 (parameterized)
- method: 4
- status: 10
Cardinality: 500 × 3 × 20 × 100 × 4 × 10 = 12,000,000 series ⚠️

Optimization needed for http_requests!
```

**Optimized HTTP Metrics:**

```
# Reduce cardinality by removing host from tags
# Use aggregation at service level

http_requests,service=api,endpoint=/api/v1/users,method=GET,status=200,env=prod count=1245,duration_ms=45,bytes_sent=204800,host="server01"

# New cardinality:
# 20 services × 100 endpoints × 4 methods × 10 statuses × 3 envs = 240,000 series ✅
```

**Naming Convention:**

```
Pattern: {system}_{component}_{metric}

Examples:
- system_cpu
- system_memory
- system_disk
- system_network
- http_requests
- http_errors
- docker_container
- postgres_stats
- redis_stats
- kafka_consumer
```

**Query Examples:**

```sql
-- CPU usage by region
SELECT mean(usage_percent)
FROM system_cpu
WHERE time > now() - 1h
GROUP BY time(5m), region

-- Top 10 servers by memory usage
SELECT last(usage_percent), host
FROM system_memory
WHERE time > now() - 5m
GROUP BY host
ORDER BY DESC
LIMIT 10

-- HTTP error rate
SELECT sum(count) AS errors
FROM http_errors
WHERE time > now() - 1h
GROUP BY time(1m), service, status

-- Container resource usage
SELECT mean(cpu_percent), mean(memory_percent)
FROM docker_container
WHERE time > now() - 1h
GROUP BY time(5m), container_name

-- Database connection pool health
SELECT mean(active_connections), mean(idle_connections)
FROM postgres_stats
WHERE time > now() - 1h
GROUP BY time(1m), database
```

**Alerting Rules:**

```flux
// High CPU alert
from(bucket: "metrics")
  |> range(start: -5m)
  |> filter(fn: (r) => r._measurement == "system_cpu")
  |> filter(fn: (r) => r._field == "usage_percent")
  |> mean()
  |> filter(fn: (r) => r._value > 80)

// High error rate alert
from(bucket: "metrics")
  |> range(start: -5m)
  |> filter(fn: (r) => r._measurement == "http_errors")
  |> filter(fn: (r) => r._field == "count")
  |> sum()
  |> filter(fn: (r) => r._value > 100)

// Memory leak detection
from(bucket: "metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "docker_container")
  |> filter(fn: (r) => r._field == "memory_bytes")
  |> increase()
  |> filter(fn: (r) => r._value > 1073741824) // > 1GB increase
```

---

### Example 3: Industrial Manufacturing Data

#### Requirements

- 50 production lines across 3 factories
- Each line has 20-30 machines
- Collect sensor data: temperature, pressure, vibration, speed
- Track production output and quality metrics
- Downtime tracking and OEE (Overall Equipment Effectiveness)
- Predictive maintenance data

#### Schema Design

**Measurement Structure:**

```
# Machine sensor data
machine_sensors,factory=factory_a,line=line_01,machine_id=mach_045,machine_type=cnc_mill,sensor_type=temperature temperature_celsius=75.5,vibration_mm_per_sec=2.3,pressure_bar=6.5,rpm=1500

# Production metrics
production_output,factory=factory_a,line=line_01,machine_id=mach_045,product_type=widget_x units_produced=150,cycle_time_sec=45,quality_score=0.98,defect_count=3

# Machine state
machine_state,factory=factory_a,line=line_01,machine_id=mach_045 state="running",operator_id="emp_123",batch_id="batch_5678",state_duration_min=120

# Downtime events
machine_downtime,factory=factory_a,line=line_01,machine_id=mach_045,reason_category=mechanical event="motor_failure",duration_min=45,impact_units=675,maintenance_type="corrective"

# Quality control
quality_inspection,factory=factory_a,line=line_01,machine_id=mach_045,product_type=widget_x,inspector=qc_station_1 pass_count=147,fail_count=3,dimensions_ok=150,surface_ok=148,weight_ok=150

# OEE calculation components
oee_metrics,factory=factory_a,line=line_01 availability=0.92,performance=0.85,quality=0.98,oee=0.76,planned_production_time_min=480,actual_production_time_min=441,ideal_cycle_time_sec=30,actual_cycle_time_sec=35
```

**Cardinality Analysis:**

```
machine_sensors:
- factory: 3
- line: 50
- machine_id: 1500 (50 lines × 30 machines)
- machine_type: 15 (different machine types)
- sensor_type: 10 (temp, pressure, vibration, etc.)

Cardinality: 3 × 50 × 1500 × 15 × 10 = 33,750,000 (TOO HIGH!) ❌
```

**Optimized Schema:**

```
# Solution 1: Remove sensor_type from tags, use separate fields
machine_sensors,factory=factory_a,line=line_01,machine_id=mach_045,machine_type=cnc_mill temperature_celsius=75.5,vibration_mm_per_sec=2.3,pressure_bar=6.5,rpm=1500,power_kw=12.5

# New cardinality: 3 × 50 × 1500 × 15 = 3,375,000 (Still high but manageable) ⚠️

# Solution 2: Aggregate by line instead of machine
line_sensors,factory=factory_a,line=line_01,sensor_type=temperature avg_temperature=75.5,min_temperature=72.0,max_temperature=78.0,machine_count=30

# Cardinality: 3 × 50 × 10 = 1,500 (Excellent!) ✅

# Keep machine-level for critical machines only
critical_machine_sensors,factory=factory_a,line=line_01,machine_id=mach_045 temperature_celsius=75.5,vibration_mm_per_sec=2.3,pressure_bar=6.5

# Final approach: Hybrid
# - Aggregate sensors by line (real-time monitoring)
# - Detailed sensors for critical machines (predictive maintenance)
# - Store raw data temporarily, aggregate to longer retention
```

**Final Optimized Schema:**

```
# Line-level aggregates (real-time dashboards)
line_metrics,factory=factory_a,line=line_01 avg_temperature=75.5,avg_pressure=6.5,avg_vibration=2.3,total_output=4500,avg_cycle_time=45.2,defect_rate=0.02

# Critical machine monitoring
critical_machines,factory=factory_a,machine_id=mach_045,machine_type=cnc_mill,criticality=high temperature_celsius=75.5,vibration_mm_per_sec=2.3,pressure_bar=6.5,rpm=1500,bearing_temp_celsius=65.0,oil_pressure_bar=4.5

# Production events
production_events,factory=factory_a,line=line_01,event_type=batch_complete batch_id="batch_5678",units_produced=1000,duration_min=480,quality_pass_rate=0.98

# Downtime tracking
downtime_events,factory=factory_a,line=line_01,reason_category=mechanical,severity=high event="motor_failure",machine_id="mach_045",duration_min=45,mttr_min=38,mtbf_hours=1680
```

**Retention and Downsampling Strategy:**

```sql
-- Raw sensor data (very short retention)
CREATE RETENTION POLICY "raw_sensors" ON "manufacturing"
  DURATION 24h
  REPLICATION 1
  SHARD DURATION 1h

-- 1-minute aggregates
CREATE RETENTION POLICY "one_minute" ON "manufacturing"
  DURATION 30d
  REPLICATION 1
  SHARD DURATION 1d

-- Hourly aggregates
CREATE RETENTION POLICY "hourly" ON "manufacturing"
  DURATION 1y
  REPLICATION 1
  SHARD DURATION 7d

-- Daily aggregates for long-term trends
CREATE RETENTION POLICY "daily" ON "manufacturing"
  DURATION 5y
  REPLICATION 1
  SHARD DURATION 30d
```

**Query Examples:**

```sql
-- Real-time line performance
SELECT mean(avg_temperature), sum(total_output)
FROM line_metrics
WHERE time > now() - 1h
GROUP BY time(5m), factory, line

-- Predictive maintenance: Find machines with anomalies
SELECT machine_id, temperature_celsius, vibration_mm_per_sec
FROM critical_machines
WHERE time > now() - 24h
  AND (temperature_celsius > 80 OR vibration_mm_per_sec > 5.0)

-- OEE calculation
SELECT
  mean(availability) * mean(performance) * mean(quality) AS oee,
  line
FROM oee_metrics
WHERE time > now() - 7d
GROUP BY time(1d), line

-- Downtime analysis by category
SELECT sum(duration_min), reason_category
FROM downtime_events
WHERE time > now() - 30d
GROUP BY reason_category

-- Production trends
SELECT sum(units_produced)
FROM production_events
WHERE time > now() - 90d
GROUP BY time(1d), factory
```

**Predictive Maintenance Model Integration:**

```python
# Example: Anomaly detection integration
from influxdb_client import InfluxDBClient
import numpy as np

def detect_anomalies(machine_id, window_hours=24):
    query = f'''
    from(bucket: "manufacturing")
      |> range(start: -{window_hours}h)
      |> filter(fn: (r) => r._measurement == "critical_machines")
      |> filter(fn: (r) => r.machine_id == "{machine_id}")
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    '''

    # Fetch data
    result = client.query_api().query(query)

    # Analyze patterns
    temperatures = [record.temperature_celsius for record in result]
    vibrations = [record.vibration_mm_per_sec for record in result]

    # Simple threshold-based anomaly
    anomalies = []
    if np.mean(temperatures) > 80 or np.std(vibrations) > 3.0:
        anomalies.append({
            'machine_id': machine_id,
            'anomaly_type': 'predictive_maintenance_required',
            'confidence': 0.85
        })

    # Write anomalies back to InfluxDB
    for anomaly in anomalies:
        point = Point("maintenance_predictions") \
            .tag("machine_id", anomaly['machine_id']) \
            .tag("anomaly_type", anomaly['anomaly_type']) \
            .field("confidence", anomaly['confidence'])
        write_api.write(bucket="manufacturing", record=point)

    return anomalies
```

---

## Summary and Best Practices (3 mins)

### Key Takeaways

**1. Schema Design:**

- Design for your query patterns
- Start simple, add complexity as needed
- Document your schema decisions
- Use single measurements for related metrics

**2. Tags vs Fields:**

- Tags = indexed, low cardinality metadata
- Fields = non-indexed, actual measurements
- Use tags for: dimensions you filter/group by
- Use fields for: high cardinality data, measurements

**3. Cardinality Management:**

- Monitor cardinality regularly
- Target < 1M series per database
- Optimize by: consolidating tags, parameterizing values, using fields
- Set up cardinality alerts

**4. Schema Evolution:**

- Prefer additive changes
- Use versioned measurements for breaking changes
- Plan migration periods
- Document changes thoroughly

**5. Naming Conventions:**

- Be consistent across your organization
- Use lowercase with underscores
- Include units in field names
- Document and enforce standards

### Schema Review Checklist

Before deploying a schema, verify:

```
□ Cardinality calculated and acceptable (< 1M series)
□ Tags are low-cardinality metadata
□ Fields are actual measurements or high-cardinality data
□ Measurement names follow conventions
□ Tag and field names are clear and consistent
□ Query patterns tested and performant
□ Retention policies defined
□ Documentation complete
□ Team review completed
□ Monitoring and alerts configured
```

### Common Mistakes to Avoid

❌ **Don't:**

1. Use UUIDs, user IDs, or session IDs as tags
2. Put continuous numeric values in tags
3. Create per-entity measurements
4. Use inconsistent naming conventions
5. Ignore cardinality warnings
6. Design without considering queries
7. Mix unrelated metrics in one measurement
8. Use abbreviations without documentation

✅ **Do:**

1. Profile your data before production
2. Monitor cardinality continuously
3. Document schema decisions
4. Plan for schema evolution
5. Test with production-like data volumes
6. Review queries for optimization opportunities
7. Set up proper retention policies
8. Train team on best practices

### Resources for Further Learning

- **InfluxDB Schema Design Guide:** https://docs.influxdata.com/influxdb/latest/write-data/best-practices/schema-design/
- **Series Cardinality:** https://docs.influxdata.com/influxdb/latest/reference/glossary/#series-cardinality
- **InfluxDB Best Practices:** https://docs.influxdata.com/influxdb/latest/write-data/best-practices/
- **Community Forum:** https://community.influxdata.com/

---

## Hands-On Exercise (Optional)

**Exercise: Design a schema for an e-commerce platform**

Requirements:

- Track user behavior (page views, clicks, searches)
- Monitor API performance
- Collect payment transaction metrics
- 1M active users
- 100K requests/minute
- 50 services

Try to:

1. Define measurements
2. Choose appropriate tags and fields
3. Calculate series cardinality
4. Design retention policies
5. Write sample queries

**Solution available upon request**

---

**Course Complete! Questions?**

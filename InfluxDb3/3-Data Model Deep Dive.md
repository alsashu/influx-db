# 3️⃣ Data Model Deep Dive

---

## 3.1 InfluxDB 3 Data Model - Complete Understanding

### **Big Picture:**

```
Database (Bucket)
    └── Measurement (Table)
            ├── Tags (Indexed Metadata)
            ├── Fields (Actual Values)
            └── Timestamp (Auto-indexed)
```

**Real-World Analogy:**

```
Think like Excel with superpowers:
- Measurement = Sheet name
- Tags = Filter/Group columns (indexed)
- Fields = Data columns (values)
- Timestamp = Row identifier (auto-sorted)
```

---

## 3.2 Tags vs Fields - The Core Decision

### **🏷️ Tags (Indexed Strings)**

**Properties:**

```
✓ Always strings
✓ Indexed (fast filtering/grouping)
✓ Metadata/Dimension
✓ Low cardinality preferred
✓ Used in WHERE, GROUP BY
```

**When to use Tags:**

```
✅ Categories/Classifications
✅ Identifiers (server names, sensor IDs)
✅ Locations (region, datacenter, building)
✅ Environments (prod, staging, dev)
✅ Types/Models (device type, API endpoint)
```

**Example:**

```
host=server01
region=ap-south-1
environment=production
sensor_type=DHT22
device_model=raspberry_pi_4
```

---

### **📊 Fields (Actual Measurements)**

**Properties:**

```
✓ Can be: float, integer, string, boolean
✓ NOT indexed
✓ Actual measured/calculated values
✓ Used in SELECT, aggregations
✓ High cardinality OK
```

**When to use Fields:**

```
✅ Numeric measurements
✅ Status values
✅ Calculated metrics
✅ Counters
✅ Text content (logs, messages)
```

**Example:**

```
temperature=25.5        (float)
cpu_usage=78           (integer)
status="online"        (string)
is_active=true         (boolean)
response_time=145.6    (float)
```

---

## 3.3 Tags vs Fields - Side by Side Comparison


| Aspect              | Tags                 | Fields                      |
| --------------------- | ---------------------- | ----------------------------- |
| **Data Type**       | Always string        | float, int, string, boolean |
| **Indexed**         | ✅ Yes               | ❌ No                       |
| **Query Speed**     | Fast filtering       | Slower filtering            |
| **Use in WHERE**    | Very fast            | Slower                      |
| **Use in GROUP BY** | ✅ Optimized         | ❌ Not allowed              |
| **Aggregations**    | ❌ Not possible      | ✅ SUM, AVG, COUNT, etc.    |
| **Cardinality**     | Low preferred        | High OK                     |
| **Storage**         | Index overhead       | No index overhead           |
| **Best for**        | Metadata, categories | Actual measurements         |

---

## 3.4 Real-World Example - Complete Breakdown

### **Scenario: IoT Temperature Monitoring**

sql

```sql
-- Measurement name
temperature_readings

-- Tags (metadata for filtering/grouping)
sensor_id=SENS_001
location=warehouse_a
floor=2
building=tech_park_bangalore
zone=storage
sensor_type=DHT22

-- Fields (actual measurements)
temperature=23.5
humidity=65.8
battery_level=87
signal_strength=-45
is_calibrated=true

-- Timestamp (automatic)
2024-12-19T10:30:00Z
```

**Line Protocol Format:**

```
temperature_readings,sensor_id=SENS_001,location=warehouse_a,floor=2,building=tech_park_bangalore,zone=storage,sensor_type=DHT22 temperature=23.5,humidity=65.8,battery_level=87,signal_strength=-45,is_calibrated=true 1703000000000000000
```

---

### **Why this Design?**

**Tags chosen for:**

```
sensor_id       → Filtering by specific sensor
location        → Group by location
floor           → Group by floor
building        → Multi-building queries
zone            → Departmental analysis
sensor_type     → Compare sensor models
```

**Fields chosen for:**

```
temperature     → Actual measurement (aggregate: AVG, MAX, MIN)
humidity        → Actual measurement (aggregate: AVG)
battery_level   → Monitoring (aggregate: MIN for alerts)
signal_strength → Network quality tracking
is_calibrated   → Status flag
```

---

## 3.5 Schema Design Best Practices

### **Rule 1: Tag Cardinality is Critical**

**Cardinality = Number of unique values**

**Example Analysis:**


| Tag                                | Cardinality | Good/Bad     |
| ------------------------------------ | ------------- | -------------- |
| `environment` (prod, staging, dev) | 3           | ✅ Excellent |
| `region` (10 AWS regions)          | 10          | ✅ Good      |
| `sensor_id` (100 sensors)          | 100         | ✅ Good      |
| `user_id` (1 million users)        | 1,000,000   | ❌ BAD       |
| `request_id` (unique per request)  | ∞          | ❌ VERY BAD  |

**Why high cardinality is bad:**

```
❌ Huge index size
❌ Slow queries
❌ Memory issues
❌ Poor compression
```

---

### **Rule 2: Don't Use Fields as Tags**

**❌ Wrong Design:**

sql

```sql
-- Temperature as TAG (can't aggregate!)
weather,temperature=25.5,humidity=65.8 dummy=1
```

**✅ Correct Design:**

sql

```sql
-- Temperature as FIELD (can aggregate)
weather,location=blr temperature=25.5,humidity=65.8
```

---

### **Rule 3: Don't Use Tags as Fields**

**❌ Wrong Design:**

sql

```sql
-- Region as FIELD (slow filtering!)
metrics region="ap-south-1",cpu=78.5
```

**✅ Correct Design:**

sql

```sql
-- Region as TAG (fast filtering)
metrics,region=ap-south-1 cpu=78.5
```

---

### **Rule 4: Avoid Null/Empty Tags**

**❌ Bad:**

sql

```sql
metrics,host=server01,region= cpu=78.5    # Empty region
metrics,host=,region=us-east cpu=80.2     # Empty host
```

**✅ Good:**

sql

```sql
metrics,host=server01,region=unknown cpu=78.5    # Use default value
metrics,host=server01 cpu=78.5                   # Or omit the tag
```

---

## 3.6 Naming Conventions

### **Measurement Names:**

**Best Practices:**

```
✅ Use snake_case
✅ Descriptive but concise
✅ Plural for collections
✅ Avoid special characters

Examples:
- cpu_metrics
- temperature_readings
- api_response_times
- user_events
- system_logs
```

**❌ Avoid:**

```
- CPU-Metrics (hyphens)
- temperature.readings (dots can cause issues)
- ApiResponseTimes (camelCase)
- temp (too vague)
```

---

### **Tag Keys:**

```
✅ snake_case
✅ Short but meaningful
✅ Consistent across measurements

Examples:
- host
- region
- environment
- sensor_id
- device_type
```

---

### **Field Keys:**

```
✅ snake_case
✅ Include units if needed
✅ Descriptive

Examples:
- temperature_celsius
- response_time_ms
- memory_usage_bytes
- cpu_percent
- is_active
```

---

## 3.7 High-Cardinality Problem - Deep Dive

### **What is High Cardinality?**

```
Cardinality = Number of unique tag value combinations

Example:
Tags: host (100 values) × region (10 values) × env (3 values)
Total combinations = 100 × 10 × 3 = 3,000 series
```

---

### **Real Problem Example:**

**❌ BAD Schema:**

sql

```sql
-- User ID as tag (1 million users!)
user_activity,user_id=user_12345,action=login count=1

Total series = 1,000,000 users × 10 actions = 10 million series
```

**Result:**

```
💥 Index size: ~5GB
💥 Query time: 10+ seconds
💥 Memory usage: 8GB+
💥 Write performance: Slow
```

---

**✅ GOOD Schema:**

sql

```sql
-- User ID as field, segment as tag
user_activity,segment=premium,region=india count=1,user_id="user_12345"

Total series = 5 segments × 10 regions = 50 series
```

**Result:**

```
✅ Index size: ~10MB
✅ Query time: <100ms
✅ Memory usage: 512MB
✅ Write performance: Fast
```

---

### **How to Detect High Cardinality:**

**Query to check:**

sql

```sql
-- Check series cardinality
SHOW TAG VALUES CARDINALITY FROM temperature_readings WITH KEY = sensor_id
```

**Warning Signs:**

```
⚠️  >10,000 unique values per tag
⚠️  Query performance degradation
⚠️  High memory usage
⚠️  Slow writes
```

---

### **Solutions for High Cardinality:**

**Solution 1: Move to Field**

sql

```sql
-- Before (tag)
requests,user_id=user_12345 count=1

-- After (field)
requests,segment=premium count=1,user_id="user_12345"
```

**Solution 2: Use Bucketing/Segmentation**

sql

```sql
-- Instead of exact user_id as tag
user_stats,user_segment=1000-2000,region=india active_users=1
```

**Solution 3: Time-Based Partitioning**

sql

```sql
-- Add date as tag for partitioning
metrics,date=2024-12-19,host=server01 cpu=78.5
```

**Solution 4: Downsampling**

sql

```sql
-- Keep high-res for recent, downsample old data
-- Recent: 1-minute resolution
-- Old: 1-hour aggregates
```

---

## 3.8 Schema Design Examples (Real-World)

### **Example 1: API Monitoring**

sql

```sql
-- Measurement
api_metrics

-- Tags (low cardinality)
endpoint=/api/users         # ~50 endpoints
method=GET                  # 4-5 methods
status_code=200             # ~10 status codes
region=ap-south-1           # ~10 regions
environment=production      # 3 environments

-- Fields (measurements)
response_time_ms=145.6
request_count=1
error_count=0
bytes_sent=2048
bytes_received=512

-- Total Series: 50 × 5 × 10 × 10 × 3 = 75,000 (manageable)
```

---

### **Example 2: Server Monitoring**

sql

```sql
-- Measurement
system_metrics

-- Tags
host=server01               # 100 servers
datacenter=dc-blr-1         # 5 datacenters
environment=production      # 3 environments
os=ubuntu-22.04             # 5 OS types

-- Fields
cpu_percent=78.5
memory_used_bytes=8589934592
disk_used_percent=65.8
network_in_bytes=1024000
network_out_bytes=2048000
process_count=145

-- Total Series: 100 × 5 × 3 × 5 = 7,500 (excellent)
```

---

### **Example 3: E-commerce Orders**

sql

```sql
-- Measurement
order_events

-- Tags
order_status=completed      # ~10 statuses
payment_method=upi          # ~8 methods
region=south                # ~5 regions
customer_segment=premium    # ~5 segments
product_category=electronics # ~20 categories

-- Fields
order_value=2499.00
order_id="ORD_12345"        # As field (not tag!)
processing_time_ms=1250
items_count=3

-- Total Series: 10 × 8 × 5 × 5 × 20 = 40,000 (good)
```

---

## 3.9 Schema Anti-Patterns (Common Mistakes)

### **❌ Anti-Pattern 1: UUID/GUID as Tag**

sql

```sql
-- WRONG
requests,request_id=a1b2c3d4-e5f6-g7h8,endpoint=/api/users count=1

-- RIGHT
requests,endpoint=/api/users count=1,request_id="a1b2c3d4-e5f6-g7h8"
```

---

### **❌ Anti-Pattern 2: Timestamp as Tag**

sql

```sql
-- WRONG
metrics,timestamp=2024-12-19T10:30:00,host=server01 cpu=78.5

-- RIGHT (timestamp is automatic!)
metrics,host=server01 cpu=78.5 2024-12-19T10:30:00Z
```

---

### **❌ Anti-Pattern 3: Numeric Values as Tags**

sql

```sql
-- WRONG (can't aggregate!)
sensor_data,temperature=25.5,humidity=65 value=1

-- RIGHT
sensor_data,sensor_id=SENS_001 temperature=25.5,humidity=65
```

---

### **❌ Anti-Pattern 4: Too Many Tags**

sql

```sql
-- WRONG (unnecessary tags)
metrics,host=server01,ip=192.168.1.10,rack=R1,position=U12,owner=team_a,contact=admin@example.com cpu=78.5

-- RIGHT (only essential tags)
metrics,host=server01,datacenter=dc1,environment=prod cpu=78.5
```

**Rule of Thumb:** Keep tags ≤ 5-8 per measurement

---

## 3.10 Schema Evolution (Adding/Modifying)

### **Adding New Tags:**

sql

```sql
-- Old schema
temperature_readings,sensor_id=SENS_001 temperature=25.5

-- New schema (added location tag)
temperature_readings,sensor_id=SENS_001,location=warehouse_a temperature=25.5
```

**⚠️ Impact:**

```
- Creates new series
- Old data still queryable
- Need to handle null/missing tags in queries
```

---

### **Adding New Fields:**

sql

```sql
-- Old
metrics,host=server01 cpu=78.5

-- New (added memory field)
metrics,host=server01 cpu=78.5,memory=65.2
```

**✅ Safe:** No series explosion, backward compatible

---

### **Changing Tag to Field (Migration Required):**

sql

```sql
-- Step 1: Write new data with corrected schema
metrics,host=server01 cpu=78.5,user_id="user_123"

-- Step 2: Backfill old data (if needed)
-- Use batch processing scripts

-- Step 3: Update applications
```

---

## 3.11 Practical Schema Design Workflow

### **Step 1: Identify Requirements**

```
Questions to ask:
1. What are we measuring? (Fields)
2. How will we filter? (Tags)
3. How will we group? (Tags)
4. What aggregations needed? (Fields)
5. Expected data volume?
6. Query patterns?
```

---

### **Step 2: Draft Schema**

```
Measurement: api_performance

Potential Tags:
- endpoint (50 values) ✅
- method (5 values) ✅
- region (10 values) ✅
- user_id (1M values) ❌ → Move to field

Potential Fields:
- response_time_ms ✅
- status_code ❌ → Better as tag (limited values)
```

---

### **Step 3: Calculate Cardinality**

```
Series = endpoint × method × region × status_code
       = 50 × 5 × 10 × 10
       = 25,000 series ✅ Acceptable
```

---

### **Step 4: Validate with Queries**

sql

```sql
-- Common query 1: Average response time by endpoint
SELECT 
  endpoint,
  AVG(response_time_ms) as avg_response
FROM api_performance
WHERE time > now() - 1h
GROUP BY endpoint

-- Common query 2: Error rate by region
SELECT 
  region,
  COUNT(*) as total,
  SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) as errors
FROM api_performance
WHERE time > now() - 24h
GROUP BY region
```

**Ask:** Are all required tags present? Fast enough?

---

## 3.12 Decision Tree (Tag vs Field)

```
┌─────────────────────────────────────┐
│ Is it metadata/category?            │
│ (location, type, name)              │
└─────────┬───────────────────────────┘
          │ YES
          ▼
┌─────────────────────────────────────┐
│ Will you GROUP BY or filter on it?  │
└─────────┬───────────────────────────┘
          │ YES
          ▼
┌─────────────────────────────────────┐
│ Does it have <10,000 unique values? │
└─────────┬───────────────────────────┘
          │ YES                      NO
          ▼                          │
    🏷️ USE TAG                      │
                                     ▼
                              ┌──────────────────┐
                              │ Can you segment  │
                              │ or bucket it?    │
                              └────┬─────────────┘
                                   │ YES      NO
                                   ▼          │
                              🏷️ USE TAG    │
                              (bucketed)     ▼
                                         📊 USE FIELD

┌─────────────────────────────────────┐
│ Is it a numeric measurement?        │
│ (temperature, count, duration)      │
└─────────┬───────────────────────────┘
          │ YES
          ▼
┌─────────────────────────────────────┐
│ Will you aggregate it?              │
│ (SUM, AVG, MIN, MAX)                │
└─────────┬───────────────────────────┘
          │ YES
          ▼
    📊 USE FIELD
```

---

## 🎯 Key Takeaways (Module 3)

```
✓ Tags = Indexed metadata (fast filtering/grouping)
✓ Fields = Actual measurements (aggregatable)
✓ Cardinality matters: Keep tags <10,000 unique values
✓ UUID/request_id = Always field, never tag
✓ Design for query patterns, not just storage
✓ snake_case naming convention
✓ Calculate series cardinality before production
```

---

## 📝 Practice Tasks

**Task 1: Design Schema**

```
Design schema for:
- Smart home monitoring (temperature, humidity, motion)
- E-commerce analytics (orders, revenue, customers)
- Application logs (errors, warnings, info)
```

**Task 2: Fix This Bad Schema**

sql

```sql
-- Fix this schema:
events,user_id=user_12345,timestamp=2024-12-19T10:30:00,event_type=click,temperature=25.5 value=1

What's wrong? How to fix it?
```

**Task 3: Calculate Cardinality**

```
Given:
- 500 servers
- 5 datacenters
- 3 environments
- 10 metrics per server

Calculate total series. Is it acceptable?
```

---

## 🚀 Next Module Preview

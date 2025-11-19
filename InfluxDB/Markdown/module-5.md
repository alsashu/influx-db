# InfluxDB: Data Retention, Downsampling, and Continuous Queries
## Complete 75-Minute Course

---

## Course Overview

**Duration:** 75 minutes  
**Level:** Intermediate  
**Prerequisites:** Basic understanding of InfluxDB and time-series data

### Learning Objectives

By the end of this course, you will be able to:
- Understand and implement retention policies in InfluxDB
- Configure automatic data downsampling strategies
- Create and manage continuous queries for data aggregation
- Design efficient data lifecycle management solutions
- Optimize storage and query performance for large datasets

---

## Module 1: Understanding Retention Policies (20 minutes)

### 1.1 What are Retention Policies?

**Definition:** A retention policy (RP) is a set of rules that determines how long InfluxDB keeps data, how many copies of the data are stored in the cluster, and the time range covered by shard groups.

**Key Concepts:**
- **Duration:** How long data is retained before automatic deletion
- **Replication Factor:** Number of data copies (for clustered deployments)
- **Shard Duration:** Time range covered by each shard group
- **Default Policy:** Every database has at least one RP named "autogen"

### 1.2 Why Use Retention Policies?

**Benefits:**
1. **Storage Optimization** - Automatically remove old data
2. **Cost Reduction** - Lower storage costs for large-scale deployments
3. **Performance Enhancement** - Smaller datasets = faster queries
4. **Compliance** - Meet data retention regulations
5. **Lifecycle Management** - Automated data governance

**Real-World Example:**
```
IoT Sensor Data:
- Keep raw data for 7 days (detailed analysis)
- Keep hourly aggregates for 90 days (trend analysis)
- Keep daily aggregates for 2 years (historical reporting)
```

### 1.3 Viewing Existing Retention Policies

**Command:**
```influxql
SHOW RETENTION POLICIES ON mydb
```

**Sample Output:**
```
name      duration  shardGroupDuration  replicaN  default
autogen   0s        168h0m0s           1         true
```

**Understanding the Output:**
- **duration: 0s** means infinite retention (data never expires)
- **shardGroupDuration: 168h** means 7-day shards
- **replicaN: 1** means single copy (no replication)
- **default: true** means this is the default policy

### 1.4 Creating Retention Policies

**Basic Syntax:**
```influxql
CREATE RETENTION POLICY <policy_name> 
ON <database_name> 
DURATION <duration> 
REPLICATION <n> 
[SHARD DURATION <duration>] 
[DEFAULT]
```

**Practical Examples:**

**Example 1: Short-term Raw Data**
```influxql
CREATE RETENTION POLICY "seven_days" 
ON "sensor_data" 
DURATION 7d 
REPLICATION 1 
SHARD DURATION 1d
```

**Example 2: Medium-term Aggregated Data**
```influxql
CREATE RETENTION POLICY "ninety_days" 
ON "sensor_data" 
DURATION 90d 
REPLICATION 1 
SHARD DURATION 7d
```

**Example 3: Long-term Historical Data**
```influxql
CREATE RETENTION POLICY "two_years" 
ON "sensor_data" 
DURATION 730d 
REPLICATION 1 
SHARD DURATION 30d
```

**Example 4: Setting as Default**
```influxql
CREATE RETENTION POLICY "default_policy" 
ON "production_db" 
DURATION 365d 
REPLICATION 1 
DEFAULT
```

### 1.5 Modifying Retention Policies

**Syntax:**
```influxql
ALTER RETENTION POLICY <policy_name> 
ON <database_name> 
[DURATION <duration>] 
[REPLICATION <n>] 
[SHARD DURATION <duration>] 
[DEFAULT]
```

**Examples:**

**Extend Duration:**
```influxql
ALTER RETENTION POLICY "seven_days" 
ON "sensor_data" 
DURATION 14d
```

**Change to Default:**
```influxql
ALTER RETENTION POLICY "ninety_days" 
ON "sensor_data" 
DEFAULT
```

**Update Shard Duration:**
```influxql
ALTER RETENTION POLICY "two_years" 
ON "sensor_data" 
SHARD DURATION 60d
```

### 1.6 Deleting Retention Policies

**Syntax:**
```influxql
DROP RETENTION POLICY <policy_name> ON <database_name>
```

**Example:**
```influxql
DROP RETENTION POLICY "old_policy" ON "sensor_data"
```

**⚠️ Warning:** Dropping an RP deletes all data associated with it. This action cannot be undone!

### 1.7 Best Practices for Retention Policies

**1. Shard Duration Guidelines:**
- Data retained < 7 days: shard duration = 1 day
- Data retained 7 days - 6 months: shard duration = 7 days
- Data retained > 6 months: shard duration = 30 days

**2. Planning Considerations:**
- Align RP duration with business requirements
- Consider query patterns and access frequency
- Balance between granularity and storage costs
- Plan for regulatory compliance requirements

**3. Common Patterns:**
```
Pattern 1 - Graduated Retention:
├── raw_data (7 days, high granularity)
├── rollup_1h (90 days, hourly aggregates)
└── rollup_1d (2 years, daily aggregates)

Pattern 2 - Hot/Warm/Cold:
├── hot (7 days, fast SSD)
├── warm (30 days, standard storage)
└── cold (365 days, archive storage)
```

---

## Module 2: Downsampling Strategies (15 minutes)

### 2.1 Understanding Downsampling

**Definition:** Downsampling is the process of reducing the resolution of time-series data by aggregating high-frequency data points into lower-frequency summaries.

**Why Downsample?**
1. **Reduce Storage Costs** - Fewer data points = less storage
2. **Improve Query Performance** - Aggregated data returns faster
3. **Maintain Historical Context** - Keep long-term trends without raw details
4. **Optimize Network Bandwidth** - Less data to transfer

**Visual Concept:**
```
Raw Data (1-minute intervals):
[10:00, 23] [10:01, 25] [10:02, 22] [10:03, 28] [10:04, 26] [10:05, 24]

Downsampled (5-minute intervals):
[10:00-10:05, mean: 24.67, min: 22, max: 28, count: 6]
```

### 2.2 Downsampling Approaches

**Approach 1: Continuous Queries (Automated)**
- Runs automatically in background
- Real-time downsampling as data arrives
- Recommended for production systems

**Approach 2: Manual/Scheduled Downsampling**
- Run on-demand or via cron jobs
- Useful for historical data processing
- More control over execution timing

**Approach 3: Client-Side Aggregation**
- Application performs aggregation before writing
- Reduces InfluxDB processing load
- Requires more complex application logic

### 2.3 Common Aggregation Functions

**Statistical Functions:**
```influxql
MEAN()   - Average value
MEDIAN() - Middle value
MODE()   - Most frequent value
STDDEV() - Standard deviation
```

**Range Functions:**
```influxql
MIN()    - Minimum value
MAX()    - Maximum value
SPREAD() - Difference between min and max
```

**Counting Functions:**
```influxql
COUNT()  - Number of points
SUM()    - Total of all values
```

**Time-Weighted Functions:**
```influxql
INTEGRAL()         - Area under the curve
MOVING_AVERAGE()   - Rolling average
```

**Selector Functions:**
```influxql
FIRST()  - First value in time range
LAST()   - Last value in time range
TOP()    - N highest values
BOTTOM() - N lowest values
```

### 2.4 Designing a Downsampling Strategy

**Step 1: Identify Data Access Patterns**
```
Questions to Ask:
- How often is recent data queried?
- What time ranges are most commonly accessed?
- What level of detail is needed for historical analysis?
- Are there peak usage periods?
```

**Step 2: Define Retention Tiers**
```
Example Strategy:
Tier 1 (Real-time): 7 days, 10-second intervals
Tier 2 (Recent):    30 days, 1-minute intervals
Tier 3 (Historical): 90 days, 1-hour intervals
Tier 4 (Archive):   2 years, 1-day intervals
```

**Step 3: Select Appropriate Aggregations**
```influxql
-- For temperature data
SELECT MEAN("temperature"), MIN("temperature"), MAX("temperature")

-- For counting events
SELECT SUM("requests"), COUNT("errors")

-- For percentile analysis
SELECT PERCENTILE("response_time", 95), PERCENTILE("response_time", 99)
```

### 2.5 Data Quality Considerations

**Handling Missing Data:**
```influxql
-- Fill missing values with previous value
SELECT MEAN("value") FROM "sensor" 
GROUP BY TIME(1h) FILL(previous)

-- Fill with linear interpolation
SELECT MEAN("value") FROM "sensor" 
GROUP BY TIME(1h) FILL(linear)

-- Fill with zero
SELECT MEAN("value") FROM "sensor" 
GROUP BY TIME(1h) FILL(0)
```

**Preserving Data Context:**
- Always include COUNT() to know sample size
- Keep MIN/MAX along with MEAN for variance insight
- Store metadata tags (location, device_id) for filtering

---

## Module 3: Continuous Queries (25 minutes)

### 3.1 What are Continuous Queries?

**Definition:** Continuous Queries (CQs) are InfluxQL queries that run automatically and periodically on real-time data, storing results in a specified measurement.

**Key Characteristics:**
- Run at predefined intervals
- Process data within specified time windows
- Results written to target retention policy
- Ideal for automatic downsampling
- No manual intervention required

**Use Cases:**
1. Automatic data aggregation
2. Real-time metric computation
3. Data transformation pipelines
4. Pre-computation of dashboard queries
5. Alert threshold calculations

### 3.2 Continuous Query Syntax

**Basic Structure:**
```influxql
CREATE CONTINUOUS QUERY <cq_name> 
ON <database_name>
BEGIN
  SELECT <aggregation_function>(<field_key>)
  INTO <target_measurement>
  FROM <source_measurement>
  GROUP BY time(<interval>)[, <tag_key>]
END
```

**Anatomy of a CQ:**
```
CREATE CONTINUOUS QUERY "cq_hourly_mean"    ← CQ name
ON "sensor_data"                            ← Database
BEGIN
  SELECT MEAN("temperature")                ← Aggregation
  INTO "sensor_data"."ninety_days"."temp_hourly"  ← Destination
  FROM "sensor_data"."seven_days"."sensors" ← Source
  GROUP BY time(1h), "sensor_id"            ← Time interval + tags
END
```

### 3.3 Creating Continuous Queries

**Example 1: Basic Hourly Aggregation**
```influxql
CREATE CONTINUOUS QUERY "cq_mean_temp_1h"
ON "iot_database"
BEGIN
  SELECT MEAN("temperature") AS "mean_temp"
  INTO "rollup_90d"."average_temps"
  FROM "raw_data"."sensors"
  GROUP BY time(1h), *
END
```

**Explanation:**
- Runs every hour
- Calculates mean temperature
- Stores in "rollup_90d" retention policy
- Preserves all tags with `*`

**Example 2: Multiple Aggregations**
```influxql
CREATE CONTINUOUS QUERY "cq_stats_1h"
ON "iot_database"
BEGIN
  SELECT 
    MEAN("temperature") AS "mean_temp",
    MIN("temperature") AS "min_temp",
    MAX("temperature") AS "max_temp",
    COUNT("temperature") AS "sample_count"
  INTO "rollup_90d"."sensor_stats"
  FROM "raw_data"."sensors"
  GROUP BY time(1h), "location", "device_id"
END
```

**Example 3: Advanced with WHERE Clause**
```influxql
CREATE CONTINUOUS QUERY "cq_active_sensors_5m"
ON "iot_database"
BEGIN
  SELECT 
    MEAN("value") AS "mean_value",
    SUM("count") AS "total_count"
  INTO "rollup_30d"."active_sensors"
  FROM "raw_data"."measurements"
  WHERE "status" = 'active'
  GROUP BY time(5m), "sensor_type"
END
```

### 3.4 Time Boundaries and RESAMPLE

**Understanding Time Windows:**

By default, CQs:
- Run at the same interval as the GROUP BY time()
- Process data from `now() - GROUP BY time()` to `now()`

**The RESAMPLE Clause:**
```influxql
CREATE CONTINUOUS QUERY <cq_name>
ON <database_name>
RESAMPLE EVERY <interval> FOR <range>
BEGIN
  <query>
END
```

**Example with RESAMPLE:**
```influxql
CREATE CONTINUOUS QUERY "cq_with_resample"
ON "iot_database"
RESAMPLE EVERY 30m FOR 2h
BEGIN
  SELECT MEAN("temperature")
  INTO "rollup"."temp_stats"
  FROM "raw"."sensors"
  GROUP BY time(1h)
END
```

**Explanation:**
- `EVERY 30m`: CQ runs every 30 minutes (not every hour)
- `FOR 2h`: Processes last 2 hours of data each run
- Useful for handling late-arriving data

### 3.5 Advanced CQ Patterns

**Pattern 1: Multiple Time Granularities**
```influxql
-- 5-minute rollups
CREATE CONTINUOUS QUERY "cq_5m"
ON "metrics"
BEGIN
  SELECT MEAN("value") AS "mean_value"
  INTO "metrics"."rp_30d"."rollup_5m"
  FROM "metrics"."rp_7d"."raw_data"
  GROUP BY time(5m), *
END

-- 1-hour rollups from 5-minute data
CREATE CONTINUOUS QUERY "cq_1h"
ON "metrics"
BEGIN
  SELECT MEAN("mean_value") AS "mean_value"
  INTO "metrics"."rp_90d"."rollup_1h"
  FROM "metrics"."rp_30d"."rollup_5m"
  GROUP BY time(1h), *
END

-- 1-day rollups from 1-hour data
CREATE CONTINUOUS QUERY "cq_1d"
ON "metrics"
BEGIN
  SELECT MEAN("mean_value") AS "mean_value"
  INTO "metrics"."rp_2y"."rollup_1d"
  FROM "metrics"."rp_90d"."rollup_1h"
  GROUP BY time(1d), *
END
```

**Pattern 2: Derived Metrics**
```influxql
CREATE CONTINUOUS QUERY "cq_derived_metrics"
ON "app_metrics"
BEGIN
  SELECT 
    SUM("requests") AS "total_requests",
    SUM("errors") AS "total_errors",
    (SUM("errors") / SUM("requests") * 100) AS "error_rate"
  INTO "rollup"."app_health"
  FROM "raw"."api_logs"
  GROUP BY time(5m), "service_name"
END
```

**Pattern 3: Percentile Calculations**
```influxql
CREATE CONTINUOUS QUERY "cq_response_time_percentiles"
ON "application"
BEGIN
  SELECT 
    PERCENTILE("response_time", 50) AS "p50",
    PERCENTILE("response_time", 95) AS "p95",
    PERCENTILE("response_time", 99) AS "p99"
  INTO "rollup"."response_stats"
  FROM "raw"."api_metrics"
  GROUP BY time(10m), "endpoint"
END
```

### 3.6 Managing Continuous Queries

**List All CQs:**
```influxql
SHOW CONTINUOUS QUERIES
```

**Drop a CQ:**
```influxql
DROP CONTINUOUS QUERY <cq_name> ON <database_name>
```

**Example:**
```influxql
DROP CONTINUOUS QUERY "cq_hourly_mean" ON "sensor_data"
```

### 3.7 CQ Best Practices

**1. Naming Conventions:**
```
Pattern: cq_<metric>_<interval>
Examples:
- cq_temperature_1h
- cq_requests_5m
- cq_cpu_usage_10m
```

**2. Performance Optimization:**
- Use appropriate GROUP BY time() intervals
- Limit CQ complexity (avoid nested subqueries)
- Monitor CQ execution time
- Use RESAMPLE for late-arriving data
- Stagger CQ execution times to avoid resource spikes

**3. Error Handling:**
```influxql
-- Include error checking in source query
CREATE CONTINUOUS QUERY "cq_with_validation"
ON "metrics"
BEGIN
  SELECT MEAN("value")
  INTO "rollup"."stats"
  FROM "raw"."data"
  WHERE "value" > 0 AND "value" < 1000
  GROUP BY time(1h), *
END
```

**4. Testing Strategy:**
```
1. Test query manually first
2. Verify output measurement structure
3. Start with shorter retention periods
4. Monitor for a few cycles
5. Scale to production settings
```

---

## Module 4: Data Lifecycle Management (15 minutes)

### 4.1 Designing a Complete Lifecycle Strategy

**Lifecycle Stages:**

```
Stage 1: Ingestion (Real-time)
├── High-frequency writes
├── Raw, unprocessed data
└── Short retention (hours to days)

Stage 2: Active Analysis (Recent)
├── Frequent queries
├── Detailed granularity
└── Medium retention (days to weeks)

Stage 3: Historical Reference (Archive)
├── Occasional queries
├── Aggregated data
└── Long retention (months to years)

Stage 4: Deletion (Expired)
├── Automatic cleanup
└── Compliance with policies
```

### 4.2 Complete Implementation Example

**Scenario:** IoT temperature monitoring system with 1000 sensors, 10-second sample rate

**Step 1: Create Database**
```influxql
CREATE DATABASE "temperature_monitoring"
```

**Step 2: Define Retention Policies**
```influxql
-- Real-time data (7 days)
CREATE RETENTION POLICY "rp_7d"
ON "temperature_monitoring"
DURATION 7d
REPLICATION 1
SHARD DURATION 1d
DEFAULT

-- Short-term aggregates (30 days)
CREATE RETENTION POLICY "rp_30d"
ON "temperature_monitoring"
DURATION 30d
REPLICATION 1
SHARD DURATION 7d

-- Medium-term aggregates (90 days)
CREATE RETENTION POLICY "rp_90d"
ON "temperature_monitoring"
DURATION 90d
REPLICATION 1
SHARD DURATION 7d

-- Long-term aggregates (2 years)
CREATE RETENTION POLICY "rp_2y"
ON "temperature_monitoring"
DURATION 730d
REPLICATION 1
SHARD DURATION 30d
```

**Step 3: Create Continuous Queries**

**CQ 1: 1-minute rollups**
```influxql
CREATE CONTINUOUS QUERY "cq_temp_1m"
ON "temperature_monitoring"
BEGIN
  SELECT
    MEAN("temperature") AS "mean_temp",
    MIN("temperature") AS "min_temp",
    MAX("temperature") AS "max_temp",
    STDDEV("temperature") AS "stddev_temp",
    COUNT("temperature") AS "sample_count"
  INTO "temperature_monitoring"."rp_30d"."temp_1m"
  FROM "temperature_monitoring"."rp_7d"."sensors"
  GROUP BY time(1m), "sensor_id", "location"
END
```

**CQ 2: 1-hour rollups**
```influxql
CREATE CONTINUOUS QUERY "cq_temp_1h"
ON "temperature_monitoring"
RESAMPLE EVERY 10m FOR 2h
BEGIN
  SELECT
    MEAN("mean_temp") AS "mean_temp",
    MIN("min_temp") AS "min_temp",
    MAX("max_temp") AS "max_temp",
    SUM("sample_count") AS "total_samples"
  INTO "temperature_monitoring"."rp_90d"."temp_1h"
  FROM "temperature_monitoring"."rp_30d"."temp_1m"
  GROUP BY time(1h), "sensor_id", "location"
END
```

**CQ 3: 1-day rollups**
```influxql
CREATE CONTINUOUS QUERY "cq_temp_1d"
ON "temperature_monitoring"
RESAMPLE EVERY 1h FOR 2d
BEGIN
  SELECT
    MEAN("mean_temp") AS "mean_temp",
    MIN("min_temp") AS "min_temp",
    MAX("max_temp") AS "max_temp",
    SUM("total_samples") AS "total_samples"
  INTO "temperature_monitoring"."rp_2y"."temp_1d"
  FROM "temperature_monitoring"."rp_90d"."temp_1h"
  GROUP BY time(1d), "sensor_id", "location"
END
```

### 4.3 Storage Calculation

**Estimating Storage Requirements:**

```
Assumptions:
- 1000 sensors
- 10-second intervals
- 8 bytes per data point
- 50 bytes per metadata

Raw Data (7 days):
= 1000 sensors × (86400 sec/day ÷ 10 sec) × 7 days × 58 bytes
= 1000 × 8,640 × 7 × 58
≈ 3.5 GB

1-minute rollups (30 days):
= 1000 × 1,440 × 30 × 200 (5 fields)
≈ 8.6 GB

1-hour rollups (90 days):
= 1000 × 24 × 90 × 200
≈ 432 MB

1-day rollups (730 days):
= 1000 × 730 × 200
≈ 146 MB

Total Storage: ~12.7 GB
```

### 4.4 Monitoring and Maintenance

**Check Shard Information:**
```influxql
SHOW SHARDS
```

**Monitor CQ Execution:**
```influxql
SHOW STATS FOR 'cq'
```

**Database Size:**
```bash
# From InfluxDB data directory
du -sh /var/lib/influxdb/data/<database>/
```

**Performance Monitoring Queries:**
```influxql
-- Check write throughput
SHOW STATS FOR 'write'

-- Check query performance
SHOW STATS FOR 'queryExecutor'

-- Verify CQ last run time
SHOW CONTINUOUS QUERIES
```

### 4.5 Troubleshooting Common Issues

**Issue 1: CQ Not Running**
```
Symptoms: No data in target measurement
Diagnosis:
1. Check CQ syntax: SHOW CONTINUOUS QUERIES
2. Verify source data exists
3. Check InfluxDB logs
4. Ensure time ranges overlap

Solution:
- Use RESAMPLE to handle timing issues
- Verify retention policy names
- Check data timestamps
```

**Issue 2: Storage Growth**
```
Symptoms: Disk usage increasing unexpectedly
Diagnosis:
1. Check shard sizes: SHOW SHARDS
2. Verify RP durations
3. Confirm CQs are writing to correct RPs

Solution:
- Adjust retention policy durations
- Review downsampling strategy
- Compact shards manually if needed
```

**Issue 3: Missing Data Points**
```
Symptoms: Gaps in downsampled data
Diagnosis:
1. Check for late-arriving data
2. Verify CQ time windows
3. Review FILL strategies

Solution:
- Add RESAMPLE FOR clause
- Use appropriate FILL method
- Increase processing window
```

---

## Hands-On Lab Exercises

### Lab 1: Basic Retention Policy Setup (10 minutes)

**Objective:** Create a multi-tier retention strategy

```influxql
-- Create database
CREATE DATABASE "lab_exercise"

-- Create retention policies
CREATE RETENTION POLICY "raw" ON "lab_exercise" 
DURATION 7d REPLICATION 1 SHARD DURATION 1d DEFAULT

CREATE RETENTION POLICY "rollup_30d" ON "lab_exercise" 
DURATION 30d REPLICATION 1 SHARD DURATION 7d

CREATE RETENTION POLICY "rollup_1y" ON "lab_exercise" 
DURATION 365d REPLICATION 1 SHARD DURATION 30d

-- Verify
SHOW RETENTION POLICIES ON "lab_exercise"
```

### Lab 2: Creating Continuous Queries (15 minutes)

**Objective:** Implement automatic downsampling

```influxql
-- Insert sample data
USE lab_exercise
INSERT cpu_usage,host=server01,region=us-east value=45.2
INSERT cpu_usage,host=server01,region=us-east value=52.1
INSERT cpu_usage,host=server01,region=us-east value=48.7

-- Create CQ for 5-minute aggregation
CREATE CONTINUOUS QUERY "cq_cpu_5m"
ON "lab_exercise"
BEGIN
  SELECT 
    MEAN("value") AS "mean_cpu",
    MAX("value") AS "max_cpu",
    COUNT("value") AS "samples"
  INTO "lab_exercise"."rollup_30d"."cpu_5m"
  FROM "lab_exercise"."raw"."cpu_usage"
  GROUP BY time(5m), *
END

-- Create CQ for hourly aggregation
CREATE CONTINUOUS QUERY "cq_cpu_1h"
ON "lab_exercise"
BEGIN
  SELECT 
    MEAN("mean_cpu") AS "mean_cpu",
    MAX("max_cpu") AS "max_cpu",
    SUM("samples") AS "total_samples"
  INTO "lab_exercise"."rollup_1y"."cpu_1h"
  FROM "lab_exercise"."rollup_30d"."cpu_5m"
  GROUP BY time(1h), *
END

-- Verify CQs
SHOW CONTINUOUS QUERIES
```

### Lab 3: Complete Lifecycle Implementation (20 minutes)

**Objective:** Build end-to-end data lifecycle system

```influxql
-- 1. Setup
CREATE DATABASE "sensor_network"

CREATE RETENTION POLICY "real_time" 
ON "sensor_network" 
DURATION 3d REPLICATION 1 SHARD DURATION 1h DEFAULT

CREATE RETENTION POLICY "weekly" 
ON "sensor_network" 
DURATION 7d REPLICATION 1 SHARD DURATION 1d

CREATE RETENTION POLICY "monthly" 
ON "sensor_network" 
DURATION 30d REPLICATION 1 SHARD DURATION 7d

-- 2. Simulate data ingestion
USE sensor_network
INSERT temperature,sensor=temp01,location=warehouse value=22.5
INSERT temperature,sensor=temp01,location=warehouse value=23.1
INSERT temperature,sensor=temp02,location=office value=21.8

-- 3. Create downsampling pipeline
CREATE CONTINUOUS QUERY "cq_temp_1m"
ON "sensor_network"
BEGIN
  SELECT 
    MEAN("value") AS "avg_temp",
    MIN("value") AS "min_temp",
    MAX("value") AS "max_temp"
  INTO "sensor_network"."weekly"."temp_1m"
  FROM "sensor_network"."real_time"."temperature"
  GROUP BY time(1m), "sensor", "location"
END

CREATE CONTINUOUS QUERY "cq_temp_15m"
ON "sensor_network"
BEGIN
  SELECT 
    MEAN("avg_temp") AS "avg_temp",
    MIN("min_temp") AS "min_temp",
    MAX("max_temp") AS "max_temp"
  INTO "sensor_network"."monthly"."temp_15m"
  FROM "sensor_network"."weekly"."temp_1m"
  GROUP BY time(15m), "sensor", "location"
END

-- 4. Query different tiers
SELECT * FROM "real_time"."temperature" LIMIT 5
SELECT * FROM "weekly"."temp_1m" LIMIT 5
SELECT * FROM "monthly"."temp_15m" LIMIT 5
```

---

## Production Best Practices

### 1. Design Principles

**Principle 1: Plan for Scale**
- Estimate data growth over 12-24 months
- Design with 2x capacity buffer
- Consider query patterns from day one

**Principle 2: Start Conservative**
- Begin with shorter retentions
- Extend gradually based on needs
- Monitor storage trends

**Principle 3: Document Everything**
```
Documentation Checklist:
□ Retention policy purposes
□ CQ execution schedules
□ Data lifecycle diagram
□ Storage capacity plan
□ Disaster recovery procedures
```

### 2. Performance Optimization

**Optimize CQ Timing:**
```influxql
-- Stagger CQ execution to avoid resource spikes
-- Bad: All run at top of hour
CQ1: GROUP BY time(1h)  -- Runs at :00
CQ2: GROUP BY time(1h)  -- Runs at :00
CQ3: GROUP BY time(1h)  -- Runs at :00

-- Good: Offset with RESAMPLE
CQ1: RESAMPLE EVERY 1h    -- Runs at :00
CQ2: RESAMPLE EVERY 1h    -- Add 10m offset in app
CQ3: RESAMPLE EVERY 1h    -- Add 20m offset in app
```

**Shard Management:**
```
Optimal Shard Sizes: 100MB - 1GB
- Too small: Management overhead
- Too large: Query performance issues

Formula:
shard_duration = (desired_shard_size / write_rate) × retention_duration
```

### 3. Monitoring Checklist

**Daily:**
- [ ] CQ execution status
- [ ] Write throughput
- [ ] Storage usage trends

**Weekly:**
- [ ] Query performance review
- [ ] Shard size distribution
- [ ] CQ runtime analysis

**Monthly:**
- [ ] Retention policy review
- [ ] Capacity planning update
- [ ] Archive strategy validation

### 4. Disaster Recovery

**Backup Strategy:**
```bash
# Backup retention policies
influx -execute 'SHOW RETENTION POLICIES ON mydb' > rp_backup.txt

# Backup continuous queries
influx -execute 'SHOW CONTINUOUS QUERIES' > cq_backup.txt

# Backup data
influxd backup -portable /backup/path
```

**Recovery Procedures:**
```bash
# Restore data
influxd restore -portable /backup/path

# Recreate RPs and CQs from backup files
influx < rp_backup.txt
influx < cq_backup.txt
```

---

## Key Takeaways

### Critical Concepts

1. **Retention Policies are the Foundation**
   - Define data lifecycle early
   - Align with business requirements
   - Balance cost and functionality

2. **Downsampling Reduces Costs**
   - Automatic via continuous queries
   - Graduated granularity approach
   - Preserve necessary context

3. **Continuous Queries Enable Automation**
   - Real-time aggregation
   - Pre-compute common queries
   - Reduce query-time processing

4. **Lifecycle Management is Holistic**
   - Consider entire data journey
   - Monitor and adjust regularly
   - Document all decisions

### Common Pitfalls to Avoid

❌ **Don't:**
- Create CQs without testing queries first
- Use overly complex CQ logic
- Forget to handle late-arriving data
- Set retention too short initially
- Ignore monitoring and maintenance

✅ **Do:**
- Start simple and iterate
- Use RESAMPLE for robustness
- Monitor CQ performance
- Document your strategy
- Plan for growth

---

## Course Summary

**You've learned:**
- ✓ Understanding and implementing retention policies
- ✓ Designing effective downsampling strategies
- ✓ Creating and managing continuous queries
- ✓ Building complete data lifecycle systems
- ✓ Production best practices and optimization

**Next Steps:**
1. Implement retention policies in your environment
2. Create your first continuous query
3. Monitor and tune performance
4. Scale your strategy as needed

---

*End of Course - Duration: 75 minutes*

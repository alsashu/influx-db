# InfluxDB 3 Core - Hands-On Practice Guide
## Build Your Skills Through Real Exercises

---

## EXERCISE SET 1: Line Protocol Mastery (30 minutes)

### Exercise 1.1: Fix the Syntax Errors

Identify and fix the errors in these Line Protocol statements:

```bash
# 1. (Error in spacing)
weather, location=bangalore temperature=28.5

# 2. (Error in tag/field placement)
weather,temperature=28.5 location="bangalore"

# 3. (Error in data type)
sensor,id=001 count=42 status=true

# 4. (Error in tag syntax)
cpu,host = server01 usage=45.2

# 5. (Error in field separator)
network,interface=eth0,bytes_in=1048576 bytes_out=2097152
```

<details>
<summary><b>SOLUTIONS</b> (click to expand)</summary>

```bash
# 1. Remove space after comma
weather,location=bangalore temperature=28.5

# 2. Move location to tags (before space)
weather,location=bangalore temperature=28.5

# 3. Add 'i' suffix for integer
sensor,id=001 count=42i,status=true

# 4. Remove spaces around equals
cpu,host=server01 usage=45.2

# 5. Move bytes_in to fields (after space)
network,interface=eth0 bytes_in=1048576i,bytes_out=2097152i
```
</details>

---

### Exercise 1.2: Write Multi-Type Data

Create Line Protocol for the following scenarios:

**Scenario A: Weather Station**
- Location: "New York" (tag)
- Station ID: "ws-001" (tag)
- Temperature: 72.5°F (float field)
- Humidity: 65% (integer field)
- Status: "operational" (string field)
- Alert Active: false (boolean field)
- Timestamp: Current time

**Scenario B: Web Server Metrics**
- Hostname: "web-server-01" (tag)
- Region: "us-east-1" (tag)
- Request Count: 1523 (integer field)
- Response Time: 45.3ms (float field)
- Status Code: "200" (string field)
- Is Healthy: true (boolean field)

<details>
<summary><b>SOLUTIONS</b></summary>

```bash
# Scenario A
weather,location=new_york,station_id=ws-001 temperature=72.5,humidity=65i,status="operational",alert_active=false

# Scenario B
web_metrics,hostname=web-server-01,region=us-east-1 request_count=1523i,response_time=45.3,status_code="200",is_healthy=true
```
</details>

---

### Exercise 1.3: Batch Write Practice

Write a shell script to generate and write 100 sensor readings:

**Requirements:**
- Measurement: "sensor_reading"
- Tags: sensor_id (sensor_01 to sensor_10), location (rotate between: office, warehouse, datacenter)
- Fields: temperature (random 20-30), humidity (random 30-70)
- Timestamps: Last 100 minutes, one per minute

<details>
<summary><b>SOLUTION</b></summary>

```bash
#!/bin/bash

# Generate 100 data points
for i in {1..100}; do
  # Calculate timestamp (100 minutes ago + i minutes)
  timestamp=$(($(date +%s) * 1000000000 - (100 - i) * 60000000000))
  
  # Sensor ID (1-10)
  sensor_id=$(printf "sensor_%02d" $((i % 10 + 1)))
  
  # Location (rotate)
  locations=("office" "warehouse" "datacenter")
  location=${locations[$((i % 3))]}
  
  # Random values
  temperature=$(echo "20 + $RANDOM % 11" | bc)
  humidity=$(echo "30 + $RANDOM % 41" | bc)
  
  echo "sensor_reading,sensor_id=$sensor_id,location=$location temperature=$temperature,humidity=$humidity $timestamp"
done | curl -X POST "http://localhost:8086/api/v3/write?db=practice_db" \
  --data-binary @-

echo "✅ 100 points written"
```
</details>

---

## EXERCISE SET 2: SQL Query Challenges (45 minutes)

### Setup Data:
```bash
# Run this first to set up practice data
cat > practice_data.txt << 'EOF'
cpu,host=server01,region=us-east usage_percent=45.2,cores=8i
cpu,host=server02,region=us-east usage_percent=62.8,cores=16i
cpu,host=server03,region=eu-west usage_percent=38.5,cores=8i
cpu,host=server04,region=eu-west usage_percent=71.3,cores=16i
memory,host=server01,region=us-east used_gb=24i,total_gb=64i
memory,host=server02,region=us-east used_gb=48i,total_gb=128i
memory,host=server03,region=eu-west used_gb=16i,total_gb=64i
memory,host=server04,region=eu-west used_gb=72i,total_gb=128i
disk,host=server01,mount=root used_percent=65.4,free_gb=100i
disk,host=server02,mount=root used_percent=82.1,free_gb=50i
disk,host=server03,mount=root used_percent=45.8,free_gb=200i
disk,host=server04,mount=root used_percent=91.2,free_gb=25i
EOF

curl -X POST "http://localhost:8086/api/v3/write?db=practice_db" \
  --data-binary @practice_data.txt
```

---

### Exercise 2.1: Basic Filtering

Write SQL queries for:

**A.** Find all servers in the "us-east" region
**B.** Find servers with CPU usage > 60%
**C.** Find servers with less than 100GB free disk space
**D.** Find all metrics for "server01"

<details>
<summary><b>SOLUTIONS</b></summary>

```sql
-- A. Servers in us-east
SELECT * FROM cpu WHERE region = 'us-east';

-- B. High CPU usage
SELECT host, usage_percent FROM cpu WHERE usage_percent > 60;

-- C. Low disk space
SELECT host, mount, free_gb FROM disk WHERE free_gb < 100;

-- D. All metrics for server01
SELECT * FROM cpu WHERE host = 'server01'
UNION ALL
SELECT * FROM memory WHERE host = 'server01'
UNION ALL
SELECT * FROM disk WHERE host = 'server01';
```
</details>

---

### Exercise 2.2: Aggregations

Write SQL queries for:

**A.** Average CPU usage per region
**B.** Total memory used across all servers
**C.** Count of servers per region
**D.** Server with highest CPU usage (and its value)

<details>
<summary><b>SOLUTIONS</b></summary>

```sql
-- A. Average CPU per region
SELECT region, AVG(usage_percent) as avg_cpu
FROM cpu
GROUP BY region;

-- B. Total memory used
SELECT SUM(used_gb) as total_memory_used_gb
FROM memory;

-- C. Server count per region
SELECT region, COUNT(DISTINCT host) as server_count
FROM cpu
GROUP BY region;

-- D. Server with highest CPU
SELECT host, usage_percent
FROM cpu
ORDER BY usage_percent DESC
LIMIT 1;
```
</details>

---

### Exercise 2.3: Joins

Write SQL queries for:

**A.** Show CPU usage and memory usage for each server (join cpu and memory)
**B.** Find servers with high CPU (>60%) AND high memory usage (>60%)
**C.** Calculate memory utilization percentage (used_gb / total_gb * 100)

<details>
<summary><b>SOLUTIONS</b></summary>

```sql
-- A. CPU and memory together
SELECT 
    c.host,
    c.usage_percent as cpu_percent,
    m.used_gb,
    m.total_gb
FROM cpu c
JOIN memory m ON c.host = m.host;

-- B. High CPU and memory
SELECT 
    c.host,
    c.usage_percent as cpu_percent,
    (m.used_gb::FLOAT / m.total_gb * 100) as memory_percent
FROM cpu c
JOIN memory m ON c.host = m.host
WHERE c.usage_percent > 60 
  AND (m.used_gb::FLOAT / m.total_gb * 100) > 60;

-- C. Memory utilization
SELECT 
    host,
    used_gb,
    total_gb,
    (used_gb::FLOAT / total_gb * 100) as utilization_percent
FROM memory
ORDER BY utilization_percent DESC;
```
</details>

---

### Exercise 2.4: Advanced Analysis

Write SQL queries for:

**A.** Find servers where disk usage > 80% OR CPU usage > 70%
**B.** Calculate average resource usage per region (CPU, Memory, Disk)
**C.** Identify the "most stressed" server (highest combined CPU + memory + disk usage)

<details>
<summary><b>SOLUTIONS</b></summary>

```sql
-- A. High disk OR high CPU
SELECT DISTINCT host
FROM (
    SELECT host FROM cpu WHERE usage_percent > 70
    UNION
    SELECT host FROM disk WHERE used_percent > 80
) combined;

-- B. Average resources per region
SELECT 
    region,
    AVG(cpu_usage) as avg_cpu,
    AVG(memory_usage) as avg_memory,
    AVG(disk_usage) as avg_disk
FROM (
    SELECT c.region, 
           c.usage_percent as cpu_usage,
           (m.used_gb::FLOAT / m.total_gb * 100) as memory_usage,
           d.used_percent as disk_usage
    FROM cpu c
    JOIN memory m ON c.host = m.host
    JOIN disk d ON c.host = d.host
) resources
GROUP BY region;

-- C. Most stressed server
SELECT 
    c.host,
    c.usage_percent as cpu,
    (m.used_gb::FLOAT / m.total_gb * 100) as memory,
    d.used_percent as disk,
    (c.usage_percent + (m.used_gb::FLOAT / m.total_gb * 100) + d.used_percent) as stress_score
FROM cpu c
JOIN memory m ON c.host = m.host
JOIN disk d ON c.host = d.host
ORDER BY stress_score DESC
LIMIT 1;
```
</details>

---

## EXERCISE SET 3: Time-Series Analysis (45 minutes)

### Setup Time-Series Data:
```bash
#!/bin/bash

# Generate 7 days of hourly temperature data
START=$(date -d '7 days ago' +%s)
for day in {0..6}; do
  for hour in {0..23}; do
    timestamp=$(($START + $day * 86400 + $hour * 3600))
    timestamp_ns=$(($timestamp * 1000000000))
    
    # Simulate daily temperature pattern
    base=20
    daily_var=$(echo "$hour * 0.8 - ($hour - 12) * ($hour - 12) * 0.15" | bc -l)
    noise=$(echo "scale=2; ($RANDOM % 100) / 100 - 0.5" | bc -l)
    temp=$(echo "$base + $daily_var + $noise" | bc -l)
    
    echo "temperature,location=sensor_a value=$temp $timestamp_ns"
  done
done | curl -X POST "http://localhost:8086/api/v3/write?db=practice_db" \
  --data-binary @-

echo "✅ 7 days of hourly data generated"
```

---

### Exercise 3.1: Time Range Queries

Write SQL queries for:

**A.** Get data from the last 24 hours
**B.** Get data from exactly 3 days ago (full day)
**C.** Get data from the last 7 days, but only between 9 AM and 5 PM each day

<details>
<summary><b>SOLUTIONS</b></summary>

```sql
-- A. Last 24 hours
SELECT * FROM temperature
WHERE time >= NOW() - INTERVAL '24 hours'
ORDER BY time DESC;

-- B. Exactly 3 days ago
SELECT * FROM temperature
WHERE time >= NOW() - INTERVAL '3 days'
  AND time < NOW() - INTERVAL '2 days'
ORDER BY time;

-- C. Last 7 days, business hours only
SELECT * FROM temperature
WHERE time >= NOW() - INTERVAL '7 days'
  AND EXTRACT(HOUR FROM time) BETWEEN 9 AND 16
ORDER BY time;
```
</details>

---

### Exercise 3.2: Time Bucketing

Write SQL queries for:

**A.** Daily average temperature for the last 7 days
**B.** 6-hour temperature buckets with min, max, avg
**C.** Hourly temperature, but only show hours 00, 06, 12, 18

<details>
<summary><b>SOLUTIONS</b></summary>

```sql
-- A. Daily averages
SELECT 
    DATE_TRUNC('day', time) as day,
    AVG(value) as avg_temp,
    COUNT(*) as samples
FROM temperature
WHERE time >= NOW() - INTERVAL '7 days'
GROUP BY day
ORDER BY day;

-- B. 6-hour buckets
SELECT 
    DATE_BIN(INTERVAL '6 hours', time, TIMESTAMP '1970-01-01') as bucket,
    MIN(value) as min_temp,
    MAX(value) as max_temp,
    AVG(value) as avg_temp
FROM temperature
WHERE time >= NOW() - INTERVAL '7 days'
GROUP BY bucket
ORDER BY bucket;

-- C. Specific hours only
SELECT 
    time,
    value
FROM temperature
WHERE EXTRACT(HOUR FROM time) IN (0, 6, 12, 18)
  AND time >= NOW() - INTERVAL '7 days'
ORDER BY time;
```
</details>

---

### Exercise 3.3: Window Functions

Write SQL queries for:

**A.** 5-point moving average
**B.** Temperature change from previous hour
**C.** Cumulative average (expanding window)

<details>
<summary><b>SOLUTIONS</b></summary>

```sql
-- A. 5-point moving average
SELECT 
    time,
    value as actual_temp,
    AVG(value) OVER (
        ORDER BY time 
        ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING
    ) as moving_avg_5
FROM temperature
ORDER BY time;

-- B. Temperature change from previous hour
SELECT 
    time,
    value as current_temp,
    LAG(value) OVER (ORDER BY time) as previous_temp,
    value - LAG(value) OVER (ORDER BY time) as temp_change
FROM temperature
ORDER BY time;

-- C. Cumulative average
SELECT 
    time,
    value,
    AVG(value) OVER (
        ORDER BY time 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) as cumulative_avg
FROM temperature
ORDER BY time;
```
</details>

---

### Exercise 3.4: Pattern Detection

Write SQL queries to detect:

**A.** Times when temperature increased by >2 degrees in one hour
**B.** The hottest hour of each day
**C.** Days where temperature never went below 18 degrees

<details>
<summary><b>SOLUTIONS</b></summary>

```sql
-- A. Sudden temperature increases
WITH temp_changes AS (
    SELECT 
        time,
        value,
        LAG(value) OVER (ORDER BY time) as prev_value
    FROM temperature
)
SELECT 
    time,
    value as current_temp,
    prev_value as previous_temp,
    (value - prev_value) as change
FROM temp_changes
WHERE (value - prev_value) > 2
ORDER BY time;

-- B. Hottest hour per day
WITH ranked AS (
    SELECT 
        DATE_TRUNC('day', time) as day,
        time,
        value,
        RANK() OVER (
            PARTITION BY DATE_TRUNC('day', time)
            ORDER BY value DESC
        ) as temp_rank
    FROM temperature
)
SELECT day, time, value as max_temp
FROM ranked
WHERE temp_rank = 1
ORDER BY day;

-- C. Days with minimum temp >= 18
SELECT 
    DATE_TRUNC('day', time) as day,
    MIN(value) as min_temp
FROM temperature
GROUP BY day
HAVING MIN(value) >= 18
ORDER BY day;
```
</details>

---

## EXERCISE SET 4: Real-World Scenarios (60 minutes)

### Scenario 1: IoT Fleet Management

**Background:** You're monitoring a fleet of delivery trucks.

**Setup:**
```bash
cat > fleet_data.txt << 'EOF'
truck,vehicle_id=T001,driver=alice speed_mph=45i,fuel_percent=78i,engine_temp=195i
truck,vehicle_id=T002,driver=bob speed_mph=55i,fuel_percent=45i,engine_temp=205i
truck,vehicle_id=T003,driver=charlie speed_mph=0i,fuel_percent=92i,engine_temp=180i
truck,vehicle_id=T004,driver=diana speed_mph=60i,fuel_percent=23i,engine_temp=210i
truck,vehicle_id=T005,driver=eve speed_mph=50i,fuel_percent=67i,engine_temp=198i
EOF

curl -X POST "http://localhost:8086/api/v3/write?db=practice_db" \
  --data-binary @fleet_data.txt
```

**Tasks:**

**A.** Find trucks with low fuel (<30%)
**B.** Find trucks with engine overheating (>200°F)
**C.** Calculate average speed of moving trucks (speed > 0)
**D.** Create a "vehicle health score" (fuel_percent * 0.4 + (210 - engine_temp) * 0.6)

<details>
<summary><b>SOLUTIONS</b></summary>

```sql
-- A. Low fuel alert
SELECT vehicle_id, driver, fuel_percent
FROM truck
WHERE fuel_percent < 30
ORDER BY fuel_percent;

-- B. Engine overheating
SELECT vehicle_id, driver, engine_temp
FROM truck
WHERE engine_temp > 200
ORDER BY engine_temp DESC;

-- C. Average speed of moving trucks
SELECT AVG(speed_mph) as avg_moving_speed
FROM truck
WHERE speed_mph > 0;

-- D. Vehicle health score
SELECT 
    vehicle_id,
    driver,
    fuel_percent,
    engine_temp,
    (fuel_percent * 0.4 + (210 - engine_temp) * 0.6) as health_score
FROM truck
ORDER BY health_score ASC;
```
</details>

---

### Scenario 2: E-commerce Website Monitoring

**Background:** Monitor website performance metrics.

**Setup:**
```bash
# Generate 1 hour of minute-by-minute data
for minute in {0..60}; do
  timestamp=$(($(date +%s) * 1000000000 - (60 - minute) * 60000000000))
  
  # Simulate varying traffic
  requests=$((100 + RANDOM % 400))
  response_time=$((30 + RANDOM % 100))
  error_count=$((RANDOM % 10))
  
  echo "web_metrics,endpoint=/api/products,server=web01 requests=$requests i,response_time_ms=${response_time}i,errors=${error_count}i $timestamp"
done | curl -X POST "http://localhost:8086/api/v3/write?db=practice_db" \
  --data-binary @-
```

**Tasks:**

**A.** Find 5-minute periods with >200 average requests
**B.** Calculate error rate percentage per 10-minute bucket
**C.** Find the slowest 5 minutes (highest avg response time)
**D.** Detect if there was a >50% spike in response time compared to previous period

<details>
<summary><b>SOLUTIONS</b></summary>

```sql
-- A. High traffic periods (5-min buckets)
SELECT 
    DATE_BIN(INTERVAL '5 minutes', time, TIMESTAMP '1970-01-01') as bucket,
    AVG(requests) as avg_requests
FROM web_metrics
GROUP BY bucket
HAVING AVG(requests) > 200
ORDER BY bucket;

-- B. Error rate (10-min buckets)
SELECT 
    DATE_BIN(INTERVAL '10 minutes', time, TIMESTAMP '1970-01-01') as bucket,
    SUM(errors)::FLOAT / SUM(requests) * 100 as error_rate_percent
FROM web_metrics
GROUP BY bucket
ORDER BY bucket;

-- C. Slowest periods (5-min buckets)
SELECT 
    DATE_BIN(INTERVAL '5 minutes', time, TIMESTAMP '1970-01-01') as bucket,
    AVG(response_time_ms) as avg_response_time
FROM web_metrics
GROUP BY bucket
ORDER BY avg_response_time DESC
LIMIT 5;

-- D. Response time spikes
WITH period_avg AS (
    SELECT 
        DATE_BIN(INTERVAL '5 minutes', time, TIMESTAMP '1970-01-01') as bucket,
        AVG(response_time_ms) as avg_response
    FROM web_metrics
    GROUP BY bucket
),
changes AS (
    SELECT 
        bucket,
        avg_response,
        LAG(avg_response) OVER (ORDER BY bucket) as prev_avg,
        (avg_response - LAG(avg_response) OVER (ORDER BY bucket)) / 
            LAG(avg_response) OVER (ORDER BY bucket) * 100 as percent_change
    FROM period_avg
)
SELECT * FROM changes
WHERE percent_change > 50
ORDER BY bucket;
```
</details>

---

## EXERCISE SET 5: Challenge Problems (Advanced)

### Challenge 1: Anomaly Detection

Create a query that detects temperature anomalies (values >2 standard deviations from mean).

<details>
<summary><b>SOLUTION</b></summary>

```sql
WITH stats AS (
    SELECT 
        AVG(value) as mean_temp,
        STDDEV(value) as std_temp
    FROM temperature
),
anomalies AS (
    SELECT 
        t.time,
        t.value,
        s.mean_temp,
        s.std_temp,
        ABS(t.value - s.mean_temp) / s.std_temp as std_deviations
    FROM temperature t, stats s
)
SELECT 
    time,
    value,
    ROUND(mean_temp::NUMERIC, 2) as mean,
    ROUND(std_deviations::NUMERIC, 2) as std_devs,
    CASE 
        WHEN value > mean_temp THEN 'HIGH'
        ELSE 'LOW'
    END as anomaly_type
FROM anomalies
WHERE std_deviations > 2
ORDER BY std_deviations DESC;
```
</details>

---

### Challenge 2: Gap Detection

Find gaps in time-series data (periods where no data was reported for >2 hours).

<details>
<summary><b>SOLUTION</b></summary>

```sql
WITH time_diffs AS (
    SELECT 
        time as current_time,
        LAG(time) OVER (ORDER BY time) as previous_time,
        EXTRACT(EPOCH FROM (time - LAG(time) OVER (ORDER BY time))) as gap_seconds
    FROM temperature
)
SELECT 
    previous_time as gap_start,
    current_time as gap_end,
    gap_seconds / 3600 as gap_hours
FROM time_diffs
WHERE gap_seconds > 7200  -- 2 hours
ORDER BY gap_seconds DESC;
```
</details>

---

### Challenge 3: Peak Detection

Find local peaks in temperature (points where temp is higher than both neighbors).

<details>
<summary><b>SOLUTION</b></summary>

```sql
WITH neighbors AS (
    SELECT 
        time,
        value,
        LAG(value) OVER (ORDER BY time) as prev_value,
        LEAD(value) OVER (ORDER BY time) as next_value
    FROM temperature
)
SELECT 
    time,
    value as peak_temp,
    prev_value,
    next_value
FROM neighbors
WHERE value > COALESCE(prev_value, value)
  AND value > COALESCE(next_value, value)
ORDER BY value DESC;
```
</details>

---

## FINAL PROJECT: Build a Complete Monitoring System

### Project Requirements:

Build a monitoring system that:

1. **Collects** metrics from 3 sources:
   - System metrics (CPU, memory, disk)
   - Application metrics (requests, errors, latency)
   - Custom business metrics (users, revenue, etc.)

2. **Stores** data in InfluxDB 3

3. **Queries** data to generate:
   - Real-time dashboard (last 5 minutes)
   - Hourly rollups (last 24 hours)
   - Daily summaries (last 7 days)
   - Alert conditions (thresholds exceeded)

4. **Creates** a presentation showing:
   - Data model design
   - Sample queries
   - Performance metrics
   - Insights discovered

### Deliverables:

- [ ] Shell script for data generation
- [ ] SQL queries for all dashboards
- [ ] Alert query definitions
- [ ] 5-slide presentation of findings

---

## SELF-ASSESSMENT CHECKLIST

After completing these exercises, you should be able to:

**Line Protocol:**
- [ ] Write correct Line Protocol syntax without errors
- [ ] Use all four data types correctly
- [ ] Understand tag vs field decisions
- [ ] Create batch write scripts

**SQL Querying:**
- [ ] Write basic SELECT, WHERE, ORDER BY queries
- [ ] Use GROUP BY for aggregations
- [ ] Join multiple measurements
- [ ] Filter by time ranges

**Time-Series Functions:**
- [ ] Use DATE_TRUNC and DATE_BIN
- [ ] Calculate time-based aggregations
- [ ] Apply window functions
- [ ] Detect patterns and anomalies

**Real-World Application:**
- [ ] Design schemas for different use cases
- [ ] Optimize queries for performance
- [ ] Create monitoring dashboards
- [ ] Troubleshoot common issues

---

## ADDITIONAL PRACTICE IDEAS

1. **Monitor Your Own System:**
   - Write a script to collect your laptop's metrics
   - Store in InfluxDB 3
   - Query for interesting patterns

2. **Simulate IoT Devices:**
   - Generate realistic sensor data
   - Implement different patterns (daily cycles, random noise, trends)
   - Practice querying at scale

3. **Build a Mini-Dashboard:**
   - Create SQL queries for KPIs
   - Format output as JSON
   - Build simple web interface

4. **Performance Testing:**
   - Write 1M data points
   - Measure query performance
   - Compare different query patterns

5. **Migration Exercise:**
   - Take InfluxDB 2.x Flux queries
   - Translate them to SQL
   - Compare syntax differences

---

END OF PRACTICE GUIDE

Keep practicing! The more you query, the more natural InfluxDB 3 SQL will become.

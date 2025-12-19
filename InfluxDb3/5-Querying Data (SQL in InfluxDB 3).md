# 5️⃣ Querying Data (SQL in InfluxDB 3)

---

## 5.1 InfluxDB 3 SQL - Introduction

### **Major Change from InfluxDB 2.x:**

```
InfluxDB 2.x → Flux (functional language, steep learning curve)
InfluxDB 3.x → SQL (standard, easy to learn) ✅
```

### **Why SQL in InfluxDB 3?**

```
✓ Familiar syntax for most developers
✓ No new language to learn
✓ Standard SQL features (JOIN, WINDOW functions)
✓ Better tooling support
✓ Easier migration from other databases
```

---

## 5.2 Basic SQL Query Structure

### **Standard Format:**

sql

```sql
SELECT <columns>
FROM <measurement>
WHERE <conditions>
GROUP BY <columns>
ORDER BY <columns>
LIMIT <number>
```

---

### **Example 1: Select All Data**

sql

```sql
SELECT * 
FROM temperature_readings
```

**Output:**

```
+-------------------------+------------+----------+-------------+----------+
| time                    | sensor_id  | location | temperature | humidity |
+-------------------------+------------+----------+-------------+----------+
| 2024-12-19T10:30:00Z    | SENS001    | blr      | 25.5        | 65.0     |
| 2024-12-19T10:30:05Z    | SENS001    | blr      | 25.7        | 64.5     |
| 2024-12-19T10:30:10Z    | SENS002    | mum      | 32.1        | 78.0     |
+-------------------------+------------+----------+-------------+----------+
```

---

### **Example 2: Select Specific Columns**

sql

```sql
SELECT time, sensor_id, temperature
FROM temperature_readings
```

**Output:**

```
+-------------------------+------------+-------------+
| time                    | sensor_id  | temperature |
+-------------------------+------------+-------------+
| 2024-12-19T10:30:00Z    | SENS001    | 25.5        |
| 2024-12-19T10:30:05Z    | SENS001    | 25.7        |
+-------------------------+------------+-------------+
```

---

### **Example 3: With WHERE Clause**

sql

```sql
SELECT * 
FROM temperature_readings
WHERE sensor_id = 'SENS001'
```

---

### **Example 4: Multiple Conditions**

sql

```sql
SELECT * 
FROM temperature_readings
WHERE sensor_id = 'SENS001' 
  AND temperature > 25.0
  AND location = 'blr'
```

---

## 5.3 Running Queries - Methods

### **Method 1: CLI (influx query)**

bash

```bash
influx query 'SELECT * FROM temperature_readings LIMIT 5'
```

**With options:**

bash

```bash
influx query \
  --org my-org \
  --token YOUR_TOKEN \
  'SELECT * FROM temperature_readings WHERE sensor_id = '\''SENS001'\'' LIMIT 10'
```

**Note:** Single quotes need escaping in bash: `'\''`

---

### **Method 2: Web UI**

```
1. Open: http://localhost:8086
2. Click "Data Explorer" (left sidebar)
3. Click "Script Editor" (top right)
4. Type your SQL query
5. Click "Run" or press Ctrl+Enter
```

---

### **Method 3: HTTP API (curl)**

bash

```bash
curl -X POST "http://localhost:8086/api/v2/query?org=my-org" \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT * FROM temperature_readings LIMIT 5",
    "type": "sql"
  }'
```

---

### **Method 4: Python Script**

python

```python
import requests

INFLUX_URL = "http://localhost:8086/api/v2/query"
INFLUX_ORG = "my-org"
INFLUX_TOKEN = "YOUR_TOKEN"

def query_influx(sql_query):
    headers = {
        "Authorization": f"Token {INFLUX_TOKEN}",
        "Content-Type": "application/json"
    }
  
    data = {
        "query": sql_query,
        "type": "sql"
    }
  
    response = requests.post(
        f"{INFLUX_URL}?org={INFLUX_ORG}",
        headers=headers,
        json=data
    )
  
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return None

# Example usage
result = query_influx("SELECT * FROM temperature_readings LIMIT 5")
print(result)
```

---

## 5.4 Time-Based Queries

### **Understanding Time Column:**

```
- Column name: "time"
- Type: TIMESTAMP
- Always in UTC
- Nanosecond precision
```

---

### **Example 1: Recent Data (Last 1 Hour)**

sql

```sql
SELECT * 
FROM temperature_readings
WHERE time >= now() - INTERVAL '1 hour'
```

**Alternative syntax:**

sql

```sql
SELECT * 
FROM temperature_readings
WHERE time >= now() - INTERVAL '1' HOUR
```

---

### **Example 2: Specific Time Range**

sql

```sql
SELECT * 
FROM temperature_readings
WHERE time >= '2024-12-19T10:00:00Z'
  AND time < '2024-12-19T11:00:00Z'
```

---

### **Example 3: Last N Minutes**

sql

```sql
-- Last 30 minutes
SELECT * 
FROM temperature_readings
WHERE time >= now() - INTERVAL '30 minutes'

-- Last 5 minutes
SELECT * 
FROM temperature_readings
WHERE time >= now() - INTERVAL '5' MINUTE
```

---

### **Example 4: Last N Days**

sql

```sql
-- Last 7 days
SELECT * 
FROM temperature_readings
WHERE time >= now() - INTERVAL '7 days'

-- Last 24 hours
SELECT * 
FROM temperature_readings
WHERE time >= now() - INTERVAL '24' HOUR
```

---

### **Example 5: Between Two Dates**

sql

```sql
SELECT * 
FROM temperature_readings
WHERE time BETWEEN '2024-12-19T00:00:00Z' 
              AND '2024-12-19T23:59:59Z'
```

---

### **Time Interval Syntax Reference:**

sql

```sql
-- Minutes
INTERVAL '1' MINUTE
INTERVAL '30' MINUTE

-- Hours
INTERVAL '1' HOUR
INTERVAL '24' HOUR

-- Days
INTERVAL '1' DAY
INTERVAL '7' DAY

-- Weeks
INTERVAL '1' WEEK

-- Months (approximate)
INTERVAL '1' MONTH

-- Multiple units
INTERVAL '1 day 2 hours 30 minutes'
```

---

## 5.5 Filtering & Conditions

### **Example 1: Simple WHERE**

sql

```sql
SELECT * 
FROM cpu_metrics
WHERE host = 'server01'
```

---

### **Example 2: Multiple Conditions (AND)**

sql

```sql
SELECT * 
FROM cpu_metrics
WHERE host = 'server01'
  AND environment = 'production'
  AND usage_percent > 80
```

---

### **Example 3: OR Conditions**

sql

```sql
SELECT * 
FROM cpu_metrics
WHERE host = 'server01' 
   OR host = 'server02' 
   OR host = 'server03'
```

**Better way using IN:**

sql

```sql
SELECT * 
FROM cpu_metrics
WHERE host IN ('server01', 'server02', 'server03')
```

---

### **Example 4: NOT Condition**

sql

```sql
SELECT * 
FROM cpu_metrics
WHERE host != 'server01'
  AND environment != 'development'
```

---

### **Example 5: Numeric Comparisons**

sql

```sql
SELECT * 
FROM temperature_readings
WHERE temperature >= 25.0 
  AND temperature <= 30.0
  AND humidity > 60
```

**Using BETWEEN:**

sql

```sql
SELECT * 
FROM temperature_readings
WHERE temperature BETWEEN 25.0 AND 30.0
  AND humidity > 60
```

---

### **Example 6: String Pattern Matching (LIKE)**

sql

```sql
-- Starts with
SELECT * 
FROM logs
WHERE message LIKE 'Error:%'

-- Ends with
SELECT * 
FROM logs
WHERE message LIKE '%failed'

-- Contains
SELECT * 
FROM logs
WHERE message LIKE '%connection%'
```

---

### **Example 7: NULL Handling**

sql

```sql
-- Check for NULL
SELECT * 
FROM sensor_data
WHERE battery_level IS NULL

-- Check for NOT NULL
SELECT * 
FROM sensor_data
WHERE battery_level IS NOT NULL
```

---

## 5.6 Aggregation Functions

### **Common Aggregation Functions:**

sql

```sql
COUNT()   -- Count rows
SUM()     -- Sum of values
AVG()     -- Average
MIN()     -- Minimum value
MAX()     -- Maximum value
STDDEV()  -- Standard deviation
```

---

### **Example 1: COUNT - Total Records**

sql

```sql
SELECT COUNT(*) as total_readings
FROM temperature_readings
```

**Output:**

```
+-----------------+
| total_readings  |
+-----------------+
| 1500            |
+-----------------+
```

---

### **Example 2: AVG - Average Temperature**

sql

```sql
SELECT AVG(temperature) as avg_temp
FROM temperature_readings
WHERE time >= now() - INTERVAL '1 hour'
```

**Output:**

```
+----------+
| avg_temp |
+----------+
| 25.67    |
+----------+
```

---

### **Example 3: MIN and MAX**

sql

```sql
SELECT 
  MIN(temperature) as min_temp,
  MAX(temperature) as max_temp,
  AVG(temperature) as avg_temp
FROM temperature_readings
WHERE time >= now() - INTERVAL '24 hours'
```

**Output:**

```
+----------+----------+----------+
| min_temp | max_temp | avg_temp |
+----------+----------+----------+
| 18.5     | 32.8     | 25.67    |
+----------+----------+----------+
```

---

### **Example 4: SUM - Total Count**

sql

```sql
SELECT 
  SUM(request_count) as total_requests,
  SUM(error_count) as total_errors
FROM api_metrics
WHERE time >= now() - INTERVAL '1 hour'
```

**Output:**

```
+----------------+--------------+
| total_requests | total_errors |
+----------------+--------------+
| 15678          | 23           |
+----------------+--------------+
```

---

### **Example 5: Multiple Aggregations**

sql

```sql
SELECT 
  COUNT(*) as reading_count,
  AVG(temperature) as avg_temp,
  MIN(temperature) as min_temp,
  MAX(temperature) as max_temp,
  STDDEV(temperature) as temp_stddev
FROM temperature_readings
WHERE sensor_id = 'SENS001'
  AND time >= now() - INTERVAL '1 day'
```

---

## 5.7 GROUP BY Queries

### **Purpose:**

```
GROUP BY = Aggregate data by categories/dimensions
```

---

### **Example 1: Group by Sensor**

sql

```sql
SELECT 
  sensor_id,
  AVG(temperature) as avg_temp,
  COUNT(*) as reading_count
FROM temperature_readings
WHERE time >= now() - INTERVAL '1 hour'
GROUP BY sensor_id
```

**Output:**

```
+-----------+----------+---------------+
| sensor_id | avg_temp | reading_count |
+-----------+----------+---------------+
| SENS001   | 25.5     | 120           |
| SENS002   | 32.1     | 118           |
| SENS003   | 18.3     | 122           |
+-----------+----------+---------------+
```

---

### **Example 2: Group by Location**

sql

```sql
SELECT 
  location,
  AVG(temperature) as avg_temp,
  MIN(temperature) as min_temp,
  MAX(temperature) as max_temp
FROM temperature_readings
WHERE time >= now() - INTERVAL '24 hours'
GROUP BY location
```

**Output:**

```
+----------+----------+----------+----------+
| location | avg_temp | min_temp | max_temp |
+----------+----------+----------+----------+
| blr      | 25.5     | 22.0     | 28.0     |
| mum      | 32.1     | 28.5     | 35.0     |
| del      | 18.3     | 12.0     | 24.0     |
+----------+----------+----------+----------+
```

---

### **Example 3: Multiple GROUP BY Columns**

sql

```sql
SELECT 
  location,
  floor,
  AVG(temperature) as avg_temp,
  AVG(humidity) as avg_humidity
FROM temperature_readings
WHERE time >= now() - INTERVAL '1 hour'
GROUP BY location, floor
```

**Output:**

```
+----------+-------+----------+--------------+
| location | floor | avg_temp | avg_humidity |
+----------+-------+----------+--------------+
| blr      | 1     | 24.5     | 62.0         |
| blr      | 2     | 25.5     | 65.0         |
| blr      | 3     | 26.0     | 63.5         |
| mum      | 1     | 31.5     | 78.0         |
+----------+-------+----------+--------------+
```

---

### **Example 4: GROUP BY with HAVING (Filter After Aggregation)**

sql

```sql
SELECT 
  host,
  AVG(cpu_percent) as avg_cpu
FROM cpu_metrics
WHERE time >= now() - INTERVAL '1 hour'
GROUP BY host
HAVING AVG(cpu_percent) > 80
```

**Output:**

```
+----------+---------+
| host     | avg_cpu |
+----------+---------+
| server02 | 85.6    |
| server05 | 92.3    |
+----------+---------+
```

**Note:** `HAVING` filters after aggregation, `WHERE` filters before

---

### **Example 5: API Endpoint Analysis**

sql

```sql
SELECT 
  endpoint,
  method,
  COUNT(*) as request_count,
  AVG(response_time_ms) as avg_response,
  SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) as error_count
FROM api_metrics
WHERE time >= now() - INTERVAL '1 hour'
GROUP BY endpoint, method
ORDER BY request_count DESC
```

---

## 5.8 Time-Based Grouping (Window Functions)

### **Purpose:**

```
Aggregate data into time buckets/windows
Example: Average per minute, per hour, per day
```

---

### **Syntax:**

sql

```sql
SELECT 
  date_bin(INTERVAL '5 minutes', time) as time_bucket,
  AVG(temperature) as avg_temp
FROM temperature_readings
WHERE time >= now() - INTERVAL '1 hour'
GROUP BY time_bucket
ORDER BY time_bucket
```

---

### **Example 1: 5-Minute Averages**

sql

```sql
SELECT 
  date_bin(INTERVAL '5 minutes', time) as time_bucket,
  sensor_id,
  AVG(temperature) as avg_temp,
  AVG(humidity) as avg_humidity
FROM temperature_readings
WHERE time >= now() - INTERVAL '1 hour'
GROUP BY time_bucket, sensor_id
ORDER BY time_bucket, sensor_id
```

**Output:**

```
+-------------------------+-----------+----------+--------------+
| time_bucket             | sensor_id | avg_temp | avg_humidity |
+-------------------------+-----------+----------+--------------+
| 2024-12-19T10:00:00Z    | SENS001   | 25.3     | 64.5         |
| 2024-12-19T10:00:00Z    | SENS002   | 32.0     | 78.2         |
| 2024-12-19T10:05:00Z    | SENS001   | 25.6     | 65.1         |
| 2024-12-19T10:05:00Z    | SENS002   | 32.3     | 77.8         |
+-------------------------+-----------+----------+--------------+
```

---

### **Example 2: 1-Minute CPU Usage**

sql

```sql
SELECT 
  date_bin(INTERVAL '1 minute', time) as time_bucket,
  host,
  AVG(cpu_percent) as avg_cpu,
  MAX(cpu_percent) as max_cpu
FROM cpu_metrics
WHERE time >= now() - INTERVAL '10 minutes'
GROUP BY time_bucket, host
ORDER BY time_bucket
```

---

### **Example 3: Hourly Aggregation**

sql

```sql
SELECT 
  date_bin(INTERVAL '1 hour', time) as hour,
  COUNT(*) as request_count,
  AVG(response_time_ms) as avg_response,
  SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) as errors
FROM api_metrics
WHERE time >= now() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour
```

---

### **Example 4: Daily Statistics**

sql

```sql
SELECT 
  date_bin(INTERVAL '1 day', time) as day,
  location,
  AVG(temperature) as avg_temp,
  MIN(temperature) as min_temp,
  MAX(temperature) as max_temp
FROM temperature_readings
WHERE time >= now() - INTERVAL '7 days'
GROUP BY day, location
ORDER BY day, location
```

---

### **Common Time Windows:**

sql

```sql
-- 1 minute
date_bin(INTERVAL '1 minute', time)

-- 5 minutes
date_bin(INTERVAL '5 minutes', time)

-- 15 minutes
date_bin(INTERVAL '15 minutes', time)

-- 1 hour
date_bin(INTERVAL '1 hour', time)

-- 1 day
date_bin(INTERVAL '1 day', time)

-- 1 week
date_bin(INTERVAL '1 week', time)
```

---

## 5.9 ORDER BY & LIMIT

### **Example 1: Order by Time (Ascending)**

sql

```sql
SELECT * 
FROM temperature_readings
ORDER BY time ASC
LIMIT 10
```

---

### **Example 2: Order by Time (Descending - Most Recent First)**

sql

```sql
SELECT * 
FROM temperature_readings
ORDER BY time DESC
LIMIT 10
```

---

### **Example 3: Order by Field Value**

sql

```sql
-- Highest temperatures first
SELECT 
  time,
  sensor_id,
  temperature
FROM temperature_readings
WHERE time >= now() - INTERVAL '1 hour'
ORDER BY temperature DESC
LIMIT 10
```

---

### **Example 4: Multiple ORDER BY**

sql

```sql
SELECT * 
FROM cpu_metrics
WHERE time >= now() - INTERVAL '1 hour'
ORDER BY host ASC, time DESC
LIMIT 20
```

---

### **Example 5: Top N Queries**

sql

```sql
-- Top 5 slowest API endpoints
SELECT 
  endpoint,
  AVG(response_time_ms) as avg_response
FROM api_metrics
WHERE time >= now() - INTERVAL '1 hour'
GROUP BY endpoint
ORDER BY avg_response DESC
LIMIT 5
```

---

## 5.10 Advanced Queries

### **Example 1: Percentile Calculations**

sql

```sql
SELECT 
  endpoint,
  APPROX_PERCENTILE(response_time_ms, 0.50) as p50,
  APPROX_PERCENTILE(response_time_ms, 0.95) as p95,
  APPROX_PERCENTILE(response_time_ms, 0.99) as p99
FROM api_metrics
WHERE time >= now() - INTERVAL '1 hour'
GROUP BY endpoint
```

**Output:**

```
+------------------+-------+--------+--------+
| endpoint         | p50   | p95    | p99    |
+------------------+-------+--------+--------+
| /api/users       | 145.6 | 523.2  | 1245.8 |
| /api/products    | 98.3  | 345.7  | 789.4  |
+------------------+-------+--------+--------+
```

---

### **Example 2: Rate Calculation (Requests per Second)**

sql

```sql
SELECT 
  date_bin(INTERVAL '1 minute', time) as time_bucket,
  COUNT(*) / 60.0 as requests_per_second
FROM api_metrics
WHERE time >= now() - INTERVAL '10 minutes'
GROUP BY time_bucket
ORDER BY time_bucket
```

---

### **Example 3: Error Rate Percentage**

sql

```sql
SELECT 
  endpoint,
  COUNT(*) as total_requests,
  SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) as errors,
  (SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as error_rate_percent
FROM api_metrics
WHERE time >= now() - INTERVAL '1 hour'
GROUP BY endpoint
HAVING error_rate_percent > 1.0
ORDER BY error_rate_percent DESC
```

---

### **Example 4: Moving Average (Simplified)**

sql

```sql
SELECT 
  date_bin(INTERVAL '5 minutes', time) as time_bucket,
  sensor_id,
  AVG(temperature) as temp_5min_avg
FROM temperature_readings
WHERE time >= now() - INTERVAL '1 hour'
GROUP BY time_bucket, sensor_id
ORDER BY sensor_id, time_bucket
```

---

### **Example 5: Compare Current vs Previous Period**

sql

```sql
-- Current hour vs previous hour
SELECT 
  'current_hour' as period,
  AVG(cpu_percent) as avg_cpu
FROM cpu_metrics
WHERE time >= now() - INTERVAL '1 hour'

UNION ALL

SELECT 
  'previous_hour' as period,
  AVG(cpu_percent) as avg_cpu
FROM cpu_metrics
WHERE time >= now() - INTERVAL '2 hours'
  AND time < now() - INTERVAL '1 hour'
```

---

## 5.11 Real-World Query Examples

### **Use Case 1: Server Health Dashboard**

sql

```sql
-- Current system status (last 5 minutes)
SELECT 
  host,
  AVG(cpu_percent) as current_cpu,
  AVG(memory_percent) as current_memory,
  AVG(disk_percent) as current_disk
FROM system_metrics
WHERE time >= now() - INTERVAL '5 minutes'
GROUP BY host
ORDER BY current_cpu DESC
```

---

### **Use Case 2: API Performance Monitoring**

sql

```sql
-- Last hour API performance by endpoint
SELECT 
  endpoint,
  method,
  COUNT(*) as total_requests,
  AVG(response_time_ms) as avg_response,
  APPROX_PERCENTILE(response_time_ms, 0.95) as p95_response,
  SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) as server_errors,
  SUM(CASE WHEN status_code >= 400 AND status_code < 500 THEN 1 ELSE 0 END) as client_errors
FROM api_metrics
WHERE time >= now() - INTERVAL '1 hour'
GROUP BY endpoint, method
HAVING total_requests > 100
ORDER BY total_requests DESC
```

---

### **Use Case 3: Temperature Alert Detection**

sql

```sql
-- Find sensors with abnormal temperatures
SELECT 
  sensor_id,
  location,
  floor,
  AVG(temperature) as avg_temp,
  MAX(temperature) as max_temp,
  MIN(temperature) as min_temp
FROM temperature_readings
WHERE time >= now() - INTERVAL '15 minutes'
GROUP BY sensor_id, location, floor
HAVING MAX(temperature) > 35.0 OR MIN(temperature) < 10.0
ORDER BY max_temp DESC
```

---

### **Use Case 4: Hourly Traffic Pattern**

sql

```sql
-- API traffic pattern over 24 hours
SELECT 
  date_bin(INTERVAL '1 hour', time) as hour,
  COUNT(*) as request_count,
  AVG(response_time_ms) as avg_response,
  SUM(bytes_sent) as total_bytes_sent
FROM api_metrics
WHERE time >= now() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour
```

---

### **Use Case 5: Top Consumers Analysis**

sql

```sql
-- Top 10 users by request count (last hour)
SELECT 
  user_id,
  COUNT(*) as request_count,
  AVG(response_time_ms) as avg_response,
  SUM(bytes_sent + bytes_received) as total_bandwidth
FROM api_metrics
WHERE time >= now() - INTERVAL '1 hour'
  AND user_id IS NOT NULL
GROUP BY user_id
ORDER BY request_count DESC
LIMIT 10
```

---

### **Use Case 6: Downtime Detection**

sql

```sql
-- Find gaps in data (potential downtime)
SELECT 
  sensor_id,
  COUNT(*) as reading_count,
  MIN(time) as first_reading,
  MAX(time) as last_reading
FROM temperature_readings
WHERE time >= now() - INTERVAL '1 hour'
GROUP BY sensor_id
HAVING COUNT(*) < 720  -- Expecting 720 readings (1 per 5 sec)
```

---

## 5.12 Query Performance Tips

### **1. Use Time Filters Always**

sql

```sql
-- ❌ BAD (scans all data)
SELECT AVG(temperature) FROM temperature_readings

-- ✅ GOOD (scans only recent data)
SELECT AVG(temperature) 
FROM temperature_readings
WHERE time >= now() - INTERVAL '1 hour'
```

---

### **2. Filter on Tags (Indexed)**

sql

```sql
-- ✅ FAST (tags are indexed)
SELECT * FROM metrics
WHERE host = 'server01'
  AND environment = 'production'

-- ❌ SLOWER (fields are not indexed)
SELECT * FROM metrics
WHERE user_id = 'user123'  -- if user_id is a field
```

---

### **3. Use LIMIT for Large Results**

sql

```sql
-- Always use LIMIT when exploring data
SELECT * FROM api_metrics
WHERE time >= now() - INTERVAL '1 day'
LIMIT 1000
```

---

### **4. Aggregate Before Transferring**

sql

```sql
-- ❌ BAD (transfers millions of rows)
SELECT * FROM temperature_readings
WHERE time >= now() - INTERVAL '7 days'

-- ✅ GOOD (transfers aggregated summary)
SELECT 
  date_bin(INTERVAL '1 hour', time) as hour,
  AVG(temperature) as avg_temp
FROM temperature_readings
WHERE time >= now() - INTERVAL '7 days'
GROUP BY hour
```

---

### **5. Use Appropriate Time Windows**

sql

```sql
-- For real-time dashboard (last 5 minutes)
WHERE time >= now() - INTERVAL '5 minutes'

-- For hourly reports
WHERE time >= now() - INTERVAL '1 hour'

-- For daily analysis
WHERE time >= now() - INTERVAL '24 hours'
```

---

## 5.13 Query Result Formats

### **CSV Format (CLI):**

bash

```bash
influx query \
  --format csv \
  'SELECT * FROM temperature_readings LIMIT 5' \
  > output.csv
```

---

### **JSON Format (HTTP API):**

bash

```bash
curl -X POST "http://localhost:8086/api/v2/query?org=my-org" \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM temperature_readings LIMIT 5", "type": "sql"}'
```

---

### **Table Format (CLI Default):**

bash

```bash
influx query 'SELECT * FROM temperature_readings LIMIT 5'
```

---

## 5.14 Common Query Patterns Cheat Sheet

sql

```sql
-- ✅ Recent data (last N time)
SELECT * FROM metrics WHERE time >= now() - INTERVAL '1 hour'

-- ✅ Specific time range
SELECT * FROM metrics 
WHERE time BETWEEN '2024-12-19T00:00:00Z' AND '2024-12-19T23:59:59Z'

-- ✅ Group by time buckets
SELECT date_bin(INTERVAL '5 minutes', time) as bucket, AVG(value)
FROM metrics WHERE time >= now() - INTERVAL '1 hour'
GROUP BY bucket

-- ✅ Latest value per tag
SELECT sensor_id, temperature
FROM temperature_readings
WHERE time >= now() - INTERVAL '5 minutes'
ORDER BY time DESC
LIMIT 1

-- ✅ Top N by metric
SELECT host, AVG(cpu_percent) as avg_cpu
FROM cpu_metrics WHERE time >= now() - INTERVAL '1 hour'
GROUP BY host ORDER BY avg_cpu DESC LIMIT 10

-- ✅ Error rate calculation
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status >= 500 THEN 1 ELSE 0 END) as errors,
  (errors * 100.0 / total) as error_rate
FROM api_metrics WHERE time >= now() - INTERVAL '1 hour'

-- ✅ Percentile calculation
SELECT APPROX_PERCENTILE(response_time, 0.95) as p95
FROM api_metrics WHERE time >= now() - INTERVAL '1 hour'
```

---

## 🎯 Key Takeaways (Module 5)

```
✓ InfluxDB 3 uses standard SQL (easy to learn)
✓ Always filter by time for performance
✓ Use date_bin() for time-based grouping
✓ Tags are indexed (fast filtering)
✓ Fields are not indexed (use for aggregation)
✓ HAVING filters after GROUP BY
✓ WHERE filters before GROUP BY
✓ Use LIMIT to control result size
✓ Aggregate at query time, not at client
```

---

## 📝 Practice Tasks

**Task 1: Basic Queries**

sql

```sql
-- Write queries to:
1. Get all data from last 10 minutes
2. Find average temperature by location
3. Count readings per sensor
4. Find max CPU usage per host
```

**Task 2: Time-Based Aggregation**

sql

```sql
-- Create 5-minute averages for:
1. Temperature readings
2. API response times
3. CPU usage by host
```

**Task 3: Advanced Analysis**

sql

```sql
-- Calculate:
1. Error rate percentage by endpoint
2. 95th percentile response time
3. Top 10 hosts by CPU usage
4. Hourly request pattern (24 hours)
```

**Task 4: Real-World Dashboard**

sql

```sql
-- Build queries for:
1. Current system health (last 5 min)
2. API performance (last 1 hour)
3. Temperature alerts (abnormal values)
4. Traffic pattern (last 24 hours)
```

---

## 🚀 Next Module Preview

**Module 6: Intermediate Concepts**

* Data ingestion pipelines (Telegraf, custom scripts)
* Batch vs real-time ingestion strategies
* Retention policies & lifecycle management
* Data compaction & downsampling
* Indexing optimization
* Handling large-scale time-series data
* Query result caching

**Ready for Module 6?** Let me know! 💪 Ab production-ready concepts seekhenge!

yes, Ready for Module 6

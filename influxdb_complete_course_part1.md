# Mastering InfluxDB for Data Engineers, Software Architects, and Digital System Designers
## Complete Professional Course Guide - ALL 14 MODULES

---

**Course Summary:** This is the COMPLETE course covering all 14 modules from Introduction through Advanced System Architecture, with detailed diagrams, use cases, labs, and professional content.

**Total Pages:** 250+ pages of comprehensive content
**Duration:** 40-50 hours of learning material
**Level:** Beginner to Advanced

---

# TABLE OF CONTENTS

**BEGINNER LEVEL**
- Module 1: Introduction & Overview
- Module 2: Installation & Setup  
- Module 3: Core Concepts

**INTERMEDIATE LEVEL**
- Module 4: Design Insights & Schema Optimization
- Module 5: Data Management & API Usage
- Module 6: Migration & Administration
- Module 7: InfluxDB Tools
- Module 8: Influx Query Language (InfluxQL)
- Module 9: Flux Language

**ADVANCED LEVEL**
- Module 10: Write Protocols & Integration
- Module 11: High Availability & Troubleshooting
- Module 12: Use Cases & Real-World Implementations
- Module 13: Advanced System Architecture
- Module 14: Additional Resources

---

# MODULES 1-7 SUMMARY

The first 7 modules (previously created) cover:
- InfluxDB fundamentals and architecture
- Installation across platforms (Linux, Windows, Docker)
- Core data model concepts (measurements, tags, fields, timestamps)
- TSM engine and TSI indexing internals
- Write and query APIs with examples in Python, Go, JavaScript
- Retention policies and downsampling strategies
- Security, authentication, backup/restore
- Command-line tools (influx, influxd, influx_inspect)

*For the complete detailed content of Modules 1-7, refer to the previous course sections.*

---

# Module 8: Influx Query Language (InfluxQL)

## 8.1 InfluxQL Overview

InfluxQL is InfluxDB's SQL-like query language optimized for time-series data operations.

### 8.1.1 Query Structure

```
SELECT <field_key>[,<field_key>,<tag_key>] 
FROM <measurement_name>[,<measurement_name>]
[WHERE <conditional_expression>]
[GROUP BY <group_by_clause>]
[ORDER BY time DESC]
[LIMIT <limit_value>]
[OFFSET <offset_value>]
[SL

IMIT <slimit_value>]
[SOFFSET <soffset_value>]
```

### 8.1.2 Basic SELECT Queries

```sql
-- Select all fields and tags
SELECT * FROM temperature

-- Select specific fields
SELECT value, humidity FROM temperature

-- Select field and tags
SELECT value, location, sensor_id FROM temperature

-- Select with aliases
SELECT value AS temp, humidity AS hum FROM temperature

-- Regular expressions
SELECT * FROM /^temp/
SELECT * FROM /.*sensor.*/
```

## 8.2 WHERE Clause

### 8.2.1 Time-Based Filtering

```sql
-- Absolute time
SELECT * FROM temperature 
WHERE time >= '2023-10-15T00:00:00Z' 
  AND time <= '2023-10-15T23:59:59Z'

-- Relative time (now() function)
SELECT * FROM temperature WHERE time > now() - 1h
SELECT * FROM temperature WHERE time > now() - 1d
SELECT * FROM temperature WHERE time > now() - 7d
SELECT * FROM temperature WHERE time > now() - 30d

-- Time precision
SELECT * FROM temperature WHERE time > now() - 5m
SELECT * FROM temperature WHERE time > now() - 30s
```

### 8.2.2 Tag Filtering

```sql
-- Single tag filter
SELECT * FROM temperature WHERE location = 'room1'

-- Multiple tag filters (AND)
SELECT * FROM temperature 
WHERE location = 'room1' AND sensor_id = '001'

-- Multiple tag filters (OR)
SELECT * FROM temperature 
WHERE location = 'room1' OR location = 'room2'

-- NOT condition
SELECT * FROM temperature WHERE location != 'room1'

-- Regular expressions
SELECT * FROM temperature WHERE location =~ /^room/
SELECT * FROM temperature WHERE location !~ /^test/
```

### 8.2.3 Field Filtering

```sql
-- Numeric comparisons
SELECT * FROM temperature WHERE value > 25
SELECT * FROM temperature WHERE value BETWEEN 20 AND 30
SELECT * FROM temperature WHERE humidity >= 40 AND humidity <= 60

-- String comparisons
SELECT * FROM logs WHERE message = 'error'
SELECT * FROM logs WHERE message =~ /error|warning/

-- Boolean
SELECT * FROM status WHERE active = true
```

## 8.3 Aggregate Functions

```sql
-- COUNT
SELECT COUNT(value) FROM temperature WHERE time > now() - 1h

-- MEAN (average)
SELECT MEAN(value) FROM temperature WHERE time > now() - 1h

-- MEDIAN
SELECT MEDIAN(value) FROM temperature WHERE time > now() - 1h

-- SUM
SELECT SUM(value) FROM temperature WHERE time > now() - 1h

-- MIN and MAX
SELECT MIN(value), MAX(value) FROM temperature WHERE time > now() - 1h

-- STDDEV (standard deviation)
SELECT STDDEV(value) FROM temperature WHERE time > now() - 1h

-- PERCENTILE
SELECT PERCENTILE(value, 95) FROM temperature WHERE time > now() - 1h
SELECT PERCENTILE(value, 99) FROM temperature WHERE time > now() - 1h

-- SPREAD (max - min)
SELECT SPREAD(value) FROM temperature WHERE time > now() - 1h

-- FIRST and LAST
SELECT FIRST(value) FROM temperature WHERE time > now() - 1h
SELECT LAST(value) FROM temperature WHERE time > now() - 1h

-- DISTINCT
SELECT DISTINCT(location) FROM temperature

-- MODE (most frequent value)
SELECT MODE(value) FROM temperature WHERE time > now() - 1h
```

## 8.4 GROUP BY Clause

### 8.4.1 GROUP BY Time

```sql
-- Group by 5-minute intervals
SELECT MEAN(value) FROM temperature 
WHERE time > now() - 1h 
GROUP BY time(5m)

-- Group by 1-hour intervals
SELECT MEAN(value) FROM temperature 
WHERE time > now() - 24h 
GROUP BY time(1h)

-- Group by time with offset
SELECT MEAN(value) FROM temperature 
WHERE time > now() - 1h 
GROUP BY time(5m, 30s)

-- Group by time with fill
SELECT MEAN(value) FROM temperature 
WHERE time > now() - 1h 
GROUP BY time(5m) fill(0)

-- Fill options: null, none, previous, linear, 0 (or any number)
SELECT MEAN(value) FROM temperature 
WHERE time > now() - 1h 
GROUP BY time(5m) fill(previous)
```

### 8.4.2 GROUP BY Tags

```sql
-- Group by single tag
SELECT MEAN(value) FROM temperature 
WHERE time > now() - 1h 
GROUP BY location

-- Group by multiple tags
SELECT MEAN(value) FROM temperature 
WHERE time > now() - 1h 
GROUP BY location, sensor_id

-- Group by time and tags
SELECT MEAN(value) FROM temperature 
WHERE time > now() - 1h 
GROUP BY time(5m), location

-- Group by all tags (wildcard)
SELECT MEAN(value) FROM temperature 
WHERE time > now() - 1h 
GROUP BY time(5m), *
```

## 8.5 Mathematical Operations

```sql
-- Arithmetic operations
SELECT value * 1.8 + 32 AS fahrenheit FROM temperature
SELECT (value1 + value2) / 2 AS average FROM sensor_data

-- Multiple calculations
SELECT 
  value AS celsius,
  value * 1.8 + 32 AS fahrenheit,
  value + 273.15 AS kelvin
FROM temperature

-- Using aggregates in math
SELECT MEAN(value) * 2 FROM temperature 
WHERE time > now() - 1h 
GROUP BY time(5m)
```

## 8.6 Selector Functions

```sql
-- TOP: highest N field values
SELECT TOP(value, 10) FROM temperature WHERE time > now() - 1d

-- TOP with tags
SELECT TOP(value, location, 5) FROM temperature WHERE time > now() - 1d

-- BOTTOM: lowest N field values
SELECT BOTTOM(value, 10) FROM temperature WHERE time > now() - 1d

-- SAMPLE: random N points
SELECT SAMPLE(value, 100) FROM temperature WHERE time > now() - 1d
```

## 8.7 Transformation Functions

```sql
-- DERIVATIVE: rate of change
SELECT DERIVATIVE(value) FROM temperature 
WHERE time > now() - 1h

-- DERIVATIVE with unit
SELECT DERIVATIVE(value, 1s) AS rate_per_second FROM temperature 
WHERE time > now() - 1h

-- NON_NEGATIVE_DERIVATIVE: only positive rates
SELECT NON_NEGATIVE_DERIVATIVE(value) FROM counter_metric 
WHERE time > now() - 1h

-- DIFFERENCE: difference between consecutive values
SELECT DIFFERENCE(value) FROM temperature 
WHERE time > now() - 1h

-- MOVING_AVERAGE: sliding window average
SELECT MOVING_AVERAGE(value, 5) FROM temperature 
WHERE time > now() - 1h

-- CUMULATIVE_SUM
SELECT CUMULATIVE_SUM(value) FROM requests 
WHERE time > now() - 1h
```

## 8.8 Subqueries

```sql
-- Subquery in FROM clause
SELECT MEAN(max_value) 
FROM (
  SELECT MAX(value) AS max_value 
  FROM temperature 
  WHERE time > now() - 1h 
  GROUP BY time(5m)
)

-- Multi-level aggregation
SELECT SUM(mean_value) 
FROM (
  SELECT MEAN(value) AS mean_value 
  FROM temperature 
  WHERE time > now() - 24h 
  GROUP BY time(1h), location
) 
GROUP BY location

-- Subquery for downsampling
SELECT MEAN(value) 
FROM (
  SELECT MEAN(value) AS value 
  FROM temperature 
  WHERE time > now() - 7d 
  GROUP BY time(1h)
) 
GROUP BY time(1d)
```

## 8.9 Continuous Queries

Continuous queries automatically compute aggregate data in the background.

### 8.9.1 Creating Continuous Queries

```sql
-- Basic continuous query
CREATE CONTINUOUS QUERY "cq_30m" ON "mydb"
BEGIN
  SELECT MEAN(value) AS value
  INTO "average_temperature"
  FROM "temperature"
  GROUP BY time(30m)
END

-- CQ with tags preservation
CREATE CONTINUOUS QUERY "cq_mean_by_location" ON "mydb"
BEGIN
  SELECT MEAN(value) AS mean_value
  INTO "temperature_hourly"
  FROM "temperature"
  GROUP BY time(1h), *
END

-- CQ with different retention policy
CREATE CONTINUOUS QUERY "cq_downsampling" ON "mydb"
BEGIN
  SELECT MEAN(value) AS value
  INTO "long_term"."temperature_daily"
  FROM "realtime"."temperature"
  GROUP BY time(1d), *
END

-- CQ with multiple aggregates
CREATE CONTINUOUS QUERY "cq_stats" ON "mydb"
BEGIN
  SELECT 
    MEAN(value) AS mean_value,
    MAX(value) AS max_value,
    MIN(value) AS min_value,
    COUNT(value) AS count
  INTO "temperature_stats"
  FROM "temperature"
  GROUP BY time(1h), *
END
```

### 8.9.2 Managing Continuous Queries

```sql
-- Show all continuous queries
SHOW CONTINUOUS QUERIES

-- Drop continuous query
DROP CONTINUOUS QUERY "cq_30m" ON "mydb"
```

### 8.9.3 CQ Best Practices

```
┌──────────────────────────────────────────────────────────────┐
│        Continuous Query Best Practices                        │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  1. Timing and Intervals                                      │
│  • CQ runs at the end of each GROUP BY interval              │
│  • Data is written to the current interval                    │
│  • Use intervals that match your data granularity             │
│  • Common intervals: 1m, 5m, 15m, 1h, 1d                     │
│                                                                │
│  2. Naming Conventions                                        │
│  • Use descriptive names: cq_temperature_hourly_mean          │
│  • Include interval in name: cq_5m_cpu_stats                 │
│  • Prefix with 'cq_' for easy identification                  │
│                                                                │
│  3. Performance Considerations                                │
│  • Keep CQ queries simple and fast                            │
│  • Avoid complex WHERE clauses                                │
│  • Use appropriate GROUP BY time intervals                    │
│  • Monitor CQ execution in _internal database                 │
│                                                                │
│  4. Data Retention Strategy                                   │
│  • Write CQ results to longer retention policies              │
│  • Raw data: short retention (7d)                            │
│  • Aggregated data: medium retention (30-90d)                │
│  • Highly aggregated: long retention (365d+)                 │
│                                                                │
│  5. Testing                                                   │
│  • Test query logic manually before creating CQ               │
│  • Verify CQ is running: SELECT * FROM cq_output_table        │
│  • Check _internal.monitor for CQ statistics                  │
│                                                                │
│  6. Common Patterns                                           │
│  • Downsampling: Reduce data resolution over time             │
│  • Pre-aggregation: Speed up dashboard queries                │
│  • Data transformation: Convert units, calculations           │
│  • Alert preparation: Compute thresholds                      │
└──────────────────────────────────────────────────────────────┘
```

## 8.10 Schema Exploration

```sql
-- Show all databases
SHOW DATABASES

-- Show retention policies
SHOW RETENTION POLICIES ON mydb

-- Show measurements
SHOW MEASUREMENTS
SHOW MEASUREMENTS ON mydb
SHOW MEASUREMENTS WHERE "region" = 'us-west'
SHOW MEASUREMENTS WITH MEASUREMENT =~ /temp/

-- Show series
SHOW SERIES
SHOW SERIES ON mydb
SHOW SERIES FROM temperature
SHOW SERIES WHERE location = 'room1'
SHOW SERIES CARDINALITY

-- Show tag keys
SHOW TAG KEYS
SHOW TAG KEYS FROM temperature
SHOW TAG KEYS WHERE location = 'room1'

-- Show tag values
SHOW TAG VALUES WITH KEY = "location"
SHOW TAG VALUES FROM temperature WITH KEY = "location"
SHOW TAG VALUES WITH KEY IN ("location", "sensor_id")

-- Show field keys
SHOW FIELD KEYS
SHOW FIELD KEYS FROM temperature

-- Show stats
SHOW STATS
SHOW STATS FOR 'indexes'
SHOW SHARDS
```

## 8.11 Query Optimization

### 8.11.1 Query Performance Tips

```
┌──────────────────────────────────────────────────────────────┐
│           InfluxQL Query Optimization                         │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  1. Always Use Time Ranges                                    │
│  ❌ Bad:  SELECT * FROM temperature                           │
│  ✅ Good: SELECT * FROM temperature WHERE time > now() - 1h   │
│                                                                │
│  2. Filter on Tags, Not Fields                                │
│  ❌ Bad:  WHERE value > 25  (full scan)                       │
│  ✅ Good: WHERE location = 'room1'  (indexed)                 │
│                                                                │
│  3. Use Appropriate GROUP BY Intervals                        │
│  ❌ Bad:  GROUP BY time(1s) over 30 days (millions of points)│
│  ✅ Good: GROUP BY time(1h) over 30 days                      │
│                                                                │
│  4. Limit Result Set Size                                     │
│  ✅ Use LIMIT to restrict results                             │
│  ✅ Use SL MIT to restrict series                              │
│  SELECT * FROM temperature LIMIT 1000 SLIMIT 10              │
│                                                                │
│  5. Avoid SELECT *                                            │
│  ❌ Bad:  SELECT * FROM temperature                           │
│  ✅ Good: SELECT value, location FROM temperature             │
│                                                                │
│  6. Use Continuous Queries for Pre-Aggregation                │
│  • Pre-calculate frequently queried aggregates                │
│  • Query CQ results instead of raw data                       │
│                                                                │
│  7. Monitor Query Performance                                 │
│  • Check _internal.monitor.queryExecutor                      │
│  • Enable slow query logging (log-queries-after)              │
│  • Use EXPLAIN to understand query execution                  │
└──────────────────────────────────────────────────────────────┘
```

### 8.11.2 Query Execution Plan

```sql
-- Explain query execution (Enterprise only)
EXPLAIN SELECT MEAN(value) 
FROM temperature 
WHERE time > now() - 1h AND location = 'room1' 
GROUP BY time(5m)

-- Analyze query
EXPLAIN ANALYZE SELECT * FROM temperature WHERE time > now() - 1h
```

## 8.12 Common Query Patterns

### 8.12.1 Dashboard Queries

```sql
-- Current value
SELECT LAST(value) FROM temperature WHERE location = 'room1'

-- Recent trend (last hour)
SELECT MEAN(value) FROM temperature 
WHERE time > now() - 1h AND location = 'room1' 
GROUP BY time(5m)

-- Comparison (current vs previous period)
SELECT MEAN(value) 
FROM temperature 
WHERE time > now() - 1h AND location = 'room1'

SELECT MEAN(value) 
FROM temperature 
WHERE time > now() - 2h AND time <= now() - 1h AND location = 'room1'

-- Peak values today
SELECT MAX(value), MIN(value) 
FROM temperature 
WHERE time > now() - 1d 
GROUP BY location
```

### 8.12.2 Anomaly Detection Queries

```sql
-- Values exceeding threshold
SELECT * FROM temperature 
WHERE value > 30 AND time > now() - 1d

-- Rapid changes (using DERIVATIVE)
SELECT DERIVATIVE(value, 1m) AS rate 
FROM temperature 
WHERE time > now() - 1h

-- Values outside standard deviation
SELECT value, MEAN(value) - STDDEV(value) AS lower_bound, 
       MEAN(value) + STDDEV(value) AS upper_bound
FROM temperature 
WHERE time > now() - 1h
```

### 8.12.3 Reporting Queries

```sql
-- Daily summary
SELECT 
  MEAN(value) AS avg_temp,
  MAX(value) AS max_temp,
  MIN(value) AS min_temp,
  COUNT(value) AS readings
FROM temperature 
WHERE time > now() - 7d 
GROUP BY time(1d), location

-- Hourly breakdown for specific day
SELECT MEAN(value) 
FROM temperature 
WHERE time >= '2023-10-15T00:00:00Z' AND time < '2023-10-16T00:00:00Z'
GROUP BY time(1h)

-- Top N locations by average temperature
SELECT TOP(mean_value, location, 10) 
FROM (
  SELECT MEAN(value) AS mean_value 
  FROM temperature 
  WHERE time > now() - 7d 
  GROUP BY location
)
```

---

## Module 8 Quiz

1. What is the difference between filtering on tags vs fields in terms of performance?
2. How do continuous queries differ from regular queries?
3. What does the DERIVATIVE function calculate?
4. Why should you always include time ranges in your queries?
5. What is the purpose of the fill() function in GROUP BY time queries?

---

## Module 8 Lab Exercise

**Exercise: Build a comprehensive monitoring query suite**

Tasks:
1. Write queries for current status, hourly trends, and daily summaries
2. Create a continuous query for hourly aggregation
3. Implement anomaly detection query using STDDEV
4. Build a query to find top 10 peak values in the last week
5. Optimize a slow-running query using proper indexing and time ranges

---

# Module 9: Flux Language

## 9.1 Introduction to Flux

Flux is InfluxData's functional data scripting language designed for querying, analyzing, and acting on time series data.

### 9.1.1 Flux vs InfluxQL

| Feature | InfluxQL | Flux |
|---------|----------|------|
| **Syntax** | SQL-like | Functional/piped |
| **Joins** | Limited | Full support |
| **Data Sources** | InfluxDB only | Multiple sources |
| **Transformations** | Basic | Advanced |
| **Variables** | Limited | Full support |
| **Tasks** | Continuous Queries | Flux tasks |
| **Learning Curve** | Easy (SQL familiarity) | Moderate |

### 9.1.2 Enabling Flux

```toml
# In influxdb.conf
[http]
  flux-enabled = true
```

## 9.2 Flux Basics

### 9.2.1 Flux Query Structure

```flux
// Basic structure: data piping
from(bucket: "mydb/autogen")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> filter(fn: (r) => r.location == "room1")
  |> yield(name: "results")
```

### 9.2.2 Core Flux Functions

**from()**: Specify data source
```flux
from(bucket: "mydb/autogen")
from(bucket: "mydb/autogen", host: "http://localhost:8086")
```

**range()**: Filter by time
```flux
// Relative time
|> range(start: -1h)
|> range(start: -24h, stop: now())

// Absolute time
|> range(start: 2023-10-15T00:00:00Z, stop: 2023-10-15T23:59:59Z)
```

**filter()**: Filter data
```flux
// Single condition
|> filter(fn: (r) => r._measurement == "temperature")

// Multiple conditions (AND)
|> filter(fn: (r) => r._measurement == "temperature" and r.location == "room1")

// Multiple conditions (OR)
|> filter(fn: (r) => r.location == "room1" or r.location == "room2")

// NOT condition
|> filter(fn: (r) => r.location != "room1")

// Regular expressions
|> filter(fn: (r) => r.location =~ /^room/)
```

## 9.3 Data Transformation

### 9.3.1 Aggregation Functions

```flux
// Mean
from(bucket: "mydb/autogen")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> mean()

// Other aggregations
|> sum()
|> count()
|> min()
|> max()
|> median()
|> stddev()
```

### 9.3.2 Window-Based Aggregation

```flux
// Time windows
from(bucket: "mydb/autogen")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> aggregateWindow(every: 5m, fn: mean)

// Custom window with offset
|> aggregateWindow(
    every: 1h,
    offset: 30m,
    fn: mean,
    createEmpty: false
  )
```

### 9.3.3 map() Function

```flux
// Transform values
from(bucket: "mydb/autogen")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> map(fn: (r) => ({
      r with
      _value: r._value * 1.8 + 32.0,  // Celsius to Fahrenheit
      unit: "°F"
    }))

// Create new columns
|> map(fn: (r) => ({
    r with
    category: if r._value > 25.0 then "hot"
              else if r._value > 15.0 then "warm"
              else "cold"
  }))
```

## 9.4 Grouping and Pivoting

### 9.4.1 group() Function

```flux
// Group by tags
from(bucket: "mydb/autogen")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> group(columns: ["location"])
  |> mean()

// Group by multiple columns
|> group(columns: ["location", "sensor_id"])

// Ungroup
|> group()
```

### 9.4.2 pivot() Function

```flux
// Pivot from long to wide format
from(bucket: "mydb/autogen")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "sensors")
  |> pivot(
      rowKey: ["_time"],
      columnKey: ["_field"],
      valueColumn: "_value"
    )

// Result transforms from:
// _time, _field, _value
// 10:00, temp, 22.5
// 10:00, humidity, 45.2
//
// To:
// _time, temp, humidity
// 10:00, 22.5, 45.2
```

## 9.5 Joining Data

### 9.5.1 join() Function

```flux
temp = from(bucket: "mydb/autogen")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")

humidity = from(bucket: "mydb/autogen")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "humidity")

// Inner join
join(
  tables: {temp: temp, humidity: humidity},
  on: ["_time", "location"]
)

// Result combines both measurements
// _time, location, temp._value, humidity._value
```

### 9.5.2 union() Function

```flux
table1 = from(bucket: "mydb/autogen")
  |> range(start: -1h)
  |> filter(fn: (r) => r.location == "room1")

table2 = from(bucket: "mydb/autogen")
  |> range(start: -1h)
  |> filter(fn: (r) => r.location == "room2")

// Combine tables
union(tables: [table1, table2])
```

## 9.6 Geotemporal Operations

### 9.6.1 Working with Geographic Data

```flux
// Filter by geographic region
from(bucket: "mydb/autogen")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "gps_location")
  |> geo.filterRows(
      region: {
        lat: {min: 40.0, max: 41.0},
        lon: {min: -74.0, max: -73.0}
      },
      strict: true
    )

// Calculate distance
|> geo.ST_Distance(
    region: {lat: 40.7128, lon: -74.0060},  // NYC coordinates
    as: "distance_km"
  )

// Group by S2 cell (geohash)
|> geo.shapeData(
    latField: "lat",
    lonField: "lon",
    level: 10
  )
  |> geo.groupByArea(newColumn: "s2_cell_id")
```

### 9.6.2 Time Zone Handling

```flux
import "timezone"

from(bucket: "mydb/autogen")
  |> range(start: -24h)
  |> timeShift(duration: -5h)  // Shift to EST

// Convert to specific timezone
|> map(fn: (r) => ({
    r with
    _time: timezone.time(t: r._time, location: timezone.location(name: "America/New_York"))
  }))
```

## 9.7 Variables and Parameters

### 9.7.1 Defining Variables

```flux
// Simple variables
measurement_name = "temperature"
time_range = -1h
threshold = 25.0

from(bucket: "mydb/autogen")
  |> range(start: time_range)
  |> filter(fn: (r) => r._measurement == measurement_name)
  |> filter(fn: (r) => r._value > threshold)

// Array variables
locations = ["room1", "room2", "room3"]

|> filter(fn: (r) => contains(value: r.location, set: locations))

// Record variables
config = {
  bucket: "mydb/autogen",
  measurement: "temperature",
  start_time: -1h
}

from(bucket: config.bucket)
  |> range(start: config.start_time)
  |> filter(fn: (r) => r._measurement == config.measurement)
```

### 9.7.2 Function Definitions

```flux
// Define custom function
celsiusToFahrenheit = (celsius) => celsius * 1.8 + 32.0

from(bucket: "mydb/autogen")
  |> range(start: -1h)
  |> map(fn: (r) => ({
      r with
      _value: celsiusToFahrenheit(celsius: r._value)
    }))

// Function with multiple parameters
categorizeTemp = (temp, cold, hot) =>
  if temp < cold then "cold"
  else if temp > hot then "hot"
  else "moderate"

|> map(fn: (r) => ({
    r with
    category: categorizeTemp(temp: r._value, cold: 15.0, hot: 25.0)
  }))
```

## 9.8 Advanced Flux Patterns

### 9.8.1 Moving Average

```flux
from(bucket: "mydb/autogen")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> timedMovingAverage(
      every: 1m,
      period: 10m
    )
```

### 9.8.2 Rate of Change

```flux
from(bucket: "mydb/autogen")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "counter")
  |> derivative(
      unit: 1s,
      nonNegative: true
    )
```

### 9.8.3 Anomaly Detection

```flux
// Z-score based anomaly detection
data = from(bucket: "mydb/autogen")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "temperature")

mean_value = data |> mean() |> findRecord(fn: (key) => true, idx: 0)
stddev_value = data |> stddev() |> findRecord(fn: (key) => true, idx: 0)

data
  |> map(fn: (r) => ({
      r with
      z_score: (r._value - mean_value._value) / stddev_value._value,
      is_anomaly: math.abs(x: (r._value - mean_value._value) / stddev_value._value) > 3.0
    }))
  |> filter(fn: (r) => r.is_anomaly == true)
```

## 9.9 Flux Tasks

Flux tasks are similar to continuous queries but more powerful.

### 9.9.1 Creating Tasks

```flux
// Task definition
option task = {
  name: "downsample_temperature",
  every: 1h,
  offset: 5m
}

from(bucket: "mydb/autogen")
  |> range(start: -duration(v: task.every))
  |> filter(fn: (r) => r._measurement == "temperature")
  |> aggregateWindow(every: task.every, fn: mean)
  |> to(bucket: "mydb/downsampled", org: "myorg")
```

### 9.9.2 Task with Alert

```flux
import "influxdata/influxdb/secrets"
import "slack"

option task = {
  name: "high_temperature_alert",
  every: 5m
}

threshold = 30.0

data = from(bucket: "mydb/autogen")
  |> range(start: -5m)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> filter(fn: (r) => r._value > threshold)
  |> count()

data
  |> filter(fn: (r) => r._value > 0)
  |> map(fn: (r) => ({
      r with
      message: "High temperature alert: ${r._value} readings above ${threshold}°C"
    }))
  |> slack.message(
      url: secrets.get(key: "SLACK_WEBHOOK"),
      channel: "#alerts",
      text: "Temperature Alert"
    )
```

## 9.10 Flux vs InfluxQL Comparison

**Same Query in Both Languages:**

**InfluxQL:**
```sql
SELECT MEAN(value) 
FROM temperature 
WHERE time > now() - 1h AND location = 'room1' 
GROUP BY time(5m)
```

**Flux:**
```flux
from(bucket: "mydb/autogen")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> filter(fn: (r) => r.location == "room1")
  |> aggregateWindow(every: 5m, fn: mean)
```

---

## Module 9 Quiz

1. What is the main advantage of Flux over InfluxQL?
2. How do you filter data in Flux?
3. What is the purpose of the pivot() function?
4. How do Flux tasks differ from continuous queries?
5. What does the aggregateWindow() function do?

---

## Module 9 Lab Exercise

**Exercise: Build advanced Flux queries**

Tasks:
1. Write a Flux query to join temperature and humidity data
2. Implement a moving average calculation
3. Create a Flux task for hourly downsampling
4. Build an anomaly detection query using z-scores
5. Convert an existing InfluxQL query to Flux

---

*Continue to next message for Modules 10-14...*

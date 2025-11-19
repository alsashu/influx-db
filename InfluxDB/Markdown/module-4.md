# InfluxDB Module 4: Querying and Aggregating Data

## Complete 75-Minute Training Course

![InfluxDB Logo](https://img.shields.io/badge/InfluxDB-Training-22ADF6?style=for-the-badge&logo=influxdb&logoColor=white)
![Duration](https://img.shields.io/badge/Duration-75%20Minutes-green?style=for-the-badge)
![Level](https://img.shields.io/badge/Level-Intermediate-orange?style=for-the-badge)

---

## Table of Contents

1. [Course Overview](#course-overview)
2. [Module 1: Introduction to Query Languages](#module-1-introduction-to-query-languages)
3. [Module 2: Filtering and Selection](#module-2-filtering-and-selection)
4. [Module 3: Aggregation Functions](#module-3-aggregation-functions)
5. [Module 4: Grouping Operations](#module-4-grouping-operations)
6. [Module 5: Advanced Operations](#module-5-advanced-operations)
7. [Module 6: Performance Optimization](#module-6-performance-optimization)
8. [Hands-On Exercises](#hands-on-exercises)
9. [Summary and Resources](#summary-and-resources)

---

## Course Overview

### What You'll Learn

This comprehensive training module covers querying and aggregating time-series data in InfluxDB. You'll master both InfluxQL and Flux query languages, learn filtering and grouping techniques, understand advanced operations, and discover optimization strategies.

### Learning Objectives

By the end of this module, you will be able to:

- ✅ Write effective queries in both InfluxQL and Flux
- ✅ Apply efficient filtering strategies using tags, fields, and time ranges
- ✅ Use aggregation functions to analyze time-series data
- ✅ Group data by tags and time intervals
- ✅ Perform advanced operations including windowing, joins, and mathematical transformations
- ✅ Optimize query performance by up to 95%
- ✅ Monitor and troubleshoot query performance issues

### Prerequisites

- Basic understanding of InfluxDB concepts (measurements, fields, tags, timestamps)
- Completion of InfluxDB Modules 1-3
- Familiarity with time-series data concepts
- Access to an InfluxDB instance for hands-on practice

### Time Allocation

| Section             | Duration | Topics                               |
| ------------------- | -------- | ------------------------------------ |
| Introduction        | 5 min    | Course overview, objectives          |
| Query Languages     | 15 min   | InfluxQL vs Flux comparison          |
| Filtering           | 15 min   | Tag, field, and time-based filtering |
| Aggregation         | 15 min   | Statistical and range functions      |
| Grouping            | 10 min   | GROUP BY operations                  |
| Advanced Operations | 10 min   | Windowing, joins, math operations    |
| Performance         | 10 min   | Optimization techniques              |
| Wrap-up             | 5 min    | Summary, Q&A                         |

---

## Module 1: Introduction to Query Languages

### 1.1 InfluxQL Overview

**InfluxQL** is a SQL-like query language designed for querying time-series data in InfluxDB.

#### Characteristics

- **Familiar Syntax**: If you know SQL, you'll feel at home
- **Easy Learning Curve**: Quick to get started
- **Optimized for Simple Queries**: Fast for basic operations
- **Limited Transformations**: Less flexible than Flux

#### Best Use Cases

- ✅ Quick dashboard queries
- ✅ Simple aggregations
- ✅ Real-time monitoring
- ✅ Straightforward data retrieval

#### Basic Syntax

```sql
SELECT <field_key>[,<field_key>,<tag_key>]
FROM <measurement_name>[,<measurement_name>]
WHERE <conditional_expression>
GROUP BY <tag_key>[,<tag_key>]
ORDER BY time DESC
```

#### Example Query

```sql
SELECT mean(temperature)
FROM weather
WHERE location = 'NYC'
  AND time >= now() - 1h
GROUP BY time(10m)
```

**Result**: Average temperature in NYC over the last hour, grouped in 10-minute intervals.

---

### 1.2 Flux Overview

**Flux** is a functional data scripting language designed for querying, analyzing, and acting on data.

#### Characteristics

- **Pipeline-Based**: Data flows through connected functions
- **Functional Programming**: Composable and powerful
- **Advanced Transformations**: Rich set of data manipulation functions
- **Multi-Source Queries**: Join data from different sources

#### Best Use Cases

- ✅ Complex data analysis
- ✅ ETL operations
- ✅ Cross-measurement queries
- ✅ Custom transformations
- ✅ Advanced aggregations

#### Basic Structure

```flux
from(bucket: "my-bucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> aggregateWindow(every: 10m, fn: mean)
```

**Pipeline Operators**: The `|>` operator pipes data from one function to the next.

---

### 1.3 InfluxQL vs Flux Comparison

| Feature              | InfluxQL                | Flux                             |
| -------------------- | ----------------------- | -------------------------------- |
| **Syntax**           | SQL-like                | Functional                       |
| **Learning Curve**   | Easy                    | Moderate                         |
| **Query Complexity** | Simple to moderate      | Simple to very complex           |
| **Joins**            | Limited                 | Full support                     |
| **Transformations**  | Basic                   | Advanced                         |
| **Performance**      | Fast for simple queries | Optimized for complex operations |
| **Use Cases**        | Dashboards, monitoring  | Analytics, ETL, custom logic     |

#### Decision Guide

**Choose InfluxQL when:**

- You need quick, simple queries
- Team is familiar with SQL
- Building dashboards or alerts
- Query patterns are straightforward

**Choose Flux when:**

- You need complex transformations
- Joining multiple measurements
- Performing advanced analytics
- Building data pipelines

---

## Module 2: Filtering and Selection

### 2.1 The Importance of Filtering

Effective filtering is crucial for:

- **Performance**: Reduces data scanned
- **Accuracy**: Returns only relevant data
- **Resource Usage**: Minimizes memory consumption
- **Query Speed**: Faster execution times

### 2.2 InfluxQL Filtering

#### Tag Filters

Tags are **indexed** in InfluxDB, making tag-based filtering extremely fast.

```sql
-- Single tag filter
WHERE location = 'NYC'

-- Multiple tag filters
WHERE location = 'NYC' AND sensor_type = 'indoor'

-- OR conditions
WHERE location = 'NYC' OR location = 'LA'

-- Regular expressions
WHERE location =~ /NY.*/
```

#### Field Filters

Fields are **not indexed**, so filtering on fields is slower than tags.

```sql
-- Numeric comparisons
WHERE temperature > 25

-- Multiple field conditions
WHERE temperature > 20 AND humidity < 80

-- Combined with tag filters (best practice)
WHERE location = 'NYC' AND temperature > 25
```

#### Time Filters

Time filtering is essential for time-series queries.

```sql
-- Relative time
WHERE time >= now() - 1h
WHERE time >= now() - 1d

-- Absolute time
WHERE time >= '2024-01-01T00:00:00Z'
  AND time <= '2024-01-31T23:59:59Z'

-- Combined filters
WHERE location = 'NYC'
  AND temperature > 25
  AND time >= now() - 1h
```

#### Complete Example

```sql
SELECT *
FROM sensors
WHERE device = 'sensor01'          -- Tag filter (fast)
  AND value > 100                  -- Field filter
  AND time > now() - 24h           -- Time filter
```

> **💡 Tip**: Always filter on indexed tags first for better performance!

---

### 2.3 Flux Filtering

#### The filter() Function

Flux uses the `filter()` function with predicate expressions.

```flux
from(bucket: "sensors")
  |> range(start: -24h)
  |> filter(fn: (r) =>
    r._measurement == "temperature" and
    r.device == "sensor01" and
    r._value > 100
  )
```

#### Predicate Syntax

```flux
// Simple conditions
|> filter(fn: (r) => r.location == "NYC")

// Multiple conditions with AND
|> filter(fn: (r) =>
  r.location == "NYC" and
  r.temperature > 25
)

// Multiple conditions with OR
|> filter(fn: (r) =>
  r.location == "NYC" or
  r.location == "LA"
)

// Regular expressions
|> filter(fn: (r) =>
  r.device =~ /sensor\d+/
)
```

#### Advanced Filtering

```flux
// Complex logic
|> filter(fn: (r) =>
  (r.location == "NYC" or r.location == "LA") and
  r._value > 50 and
  r._time >= 2024-01-01T00:00:00Z
)

// Filtering on computed values
|> filter(fn: (r) =>
  r.temperature - r.baseline > 10
)

// Multiple filter stages
from(bucket: "sensors")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> filter(fn: (r) => r.location == "NYC")
  |> filter(fn: (r) => r._value > 25)
```

---

### 2.4 Filtering Best Practices

#### Performance Tips

1. **Filter on Tags First**

   ```sql
   -- Good: Tag filter first
   WHERE location = 'NYC' AND temperature > 25

   -- Less optimal: Field filter first
   WHERE temperature > 25 AND location = 'NYC'
   ```

2. **Use Specific Time Ranges**

   ```sql
   -- Good: Specific time range
   WHERE time >= now() - 1h

   -- Bad: No time filter (queries all data)
   SELECT * FROM measurements
   ```

3. **Avoid Regex When Possible**

   ```sql
   -- Good: Exact match
   WHERE location = 'NYC'

   -- Slower: Regular expression
   WHERE location =~ /NYC/
   ```

4. **Combine Filters Efficiently**

   ```flux
   // Good: Single filter with multiple conditions
   |> filter(fn: (r) =>
     r.location == "NYC" and r._value > 100
   )

   // Less efficient: Multiple separate filters
   |> filter(fn: (r) => r.location == "NYC")
   |> filter(fn: (r) => r._value > 100)
   ```

---

## Module 3: Aggregation Functions

### 3.1 Statistical Functions

#### count()

Counts the number of non-null values.

**InfluxQL:**

```sql
SELECT count(temperature)
FROM weather
WHERE time >= now() - 1d
```

**Flux:**

```flux
from(bucket: "weather")
  |> range(start: -1d)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> count()
```

**Use Cases:**

- Data availability tracking
- Event counting
- Record validation

---

#### mean()

Calculates the arithmetic mean (average).

**InfluxQL:**

```sql
SELECT mean(temperature)
FROM weather
WHERE time >= now() - 1d
GROUP BY location
```

**Flux:**

```flux
from(bucket: "weather")
  |> range(start: -1d)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> group(columns: ["location"])
  |> mean()
```

**Use Cases:**

- General trend analysis
- Average performance metrics
- Baseline calculations

---

#### median()

Returns the middle value in a sorted dataset.

**InfluxQL:**

```sql
SELECT median(response_time)
FROM api_metrics
WHERE time >= now() - 1h
```

**Flux:**

```flux
from(bucket: "api")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "response_time")
  |> median()
```

**Use Cases:**

- Outlier-resistant central tendency
- Performance percentiles
- Typical value representation

---

#### stddev()

Calculates standard deviation (measure of variability).

**InfluxQL:**

```sql
SELECT stddev(temperature)
FROM weather
WHERE time >= now() - 7d
GROUP BY location
```

**Flux:**

```flux
from(bucket: "weather")
  |> range(start: -7d)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> group(columns: ["location"])
  |> stddev()
```

**Use Cases:**

- Variability analysis
- Anomaly detection thresholds
- Quality control

---

### 3.2 Range Functions

#### min() and max()

Find minimum and maximum values.

**InfluxQL:**

```sql
SELECT min(temperature), max(temperature)
FROM weather
WHERE time >= now() - 1d
GROUP BY location
```

**Flux:**

```flux
from(bucket: "weather")
  |> range(start: -1d)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> group(columns: ["location"])
  |> min()

// For both min and max, use aggregateWindow
from(bucket: "weather")
  |> range(start: -1d)
  |> aggregateWindow(
    every: 1d,
    fn: (column, tables=<-) => tables
      |> min()
      |> yield(name: "min")
      |> max()
      |> yield(name: "max")
  )
```

**Use Cases:**

- Peak detection
- Range analysis
- Threshold monitoring

---

#### sum()

Calculates the sum of all values.

**InfluxQL:**

```sql
SELECT sum(bytes_sent)
FROM network
WHERE time >= now() - 1h
GROUP BY interface
```

**Flux:**

```flux
from(bucket: "network")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "bytes_sent")
  |> group(columns: ["interface"])
  |> sum()
```

**Use Cases:**

- Total calculations
- Cumulative metrics
- Aggregated counts

---

### 3.3 Percentile Functions

#### percentile()

Returns the value at a specified percentile.

**InfluxQL:**

```sql
-- P95 for SLA monitoring
SELECT percentile(response_time, 95)
FROM api_metrics
WHERE time >= now() - 1h
```

**Flux:**

```flux
from(bucket: "api")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "response_time")
  |> quantile(q: 0.95, method: "estimate_tdigest")
```

**Common Percentiles:**

- **P50 (Median)**: Typical value
- **P95**: 95% of values are below this
- **P99**: High-performance threshold
- **P99.9**: Extreme outlier detection

**Use Cases:**

- SLA monitoring (P95, P99)
- Performance benchmarking
- Outlier identification
- Capacity planning

---

### 3.4 Advanced Aggregations

#### Moving Average

Smooths data by averaging over a sliding window.

**Flux:**

```flux
from(bucket: "metrics")
  |> range(start: -24h)
  |> movingAverage(n: 5)  // 5-point moving average
```

**Use Cases:**

- Trend identification
- Noise reduction
- Signal smoothing

---

#### Cumulative Sum

Running total over time.

**Flux:**

```flux
from(bucket: "sales")
  |> range(start: -30d)
  |> cumulativeSum()
```

**Use Cases:**

- Running totals
- Accumulation tracking
- Growth analysis

---

#### Rate of Change

Calculate derivative (rate of change).

**InfluxQL:**

```sql
SELECT derivative(mean(value), 1s)
FROM metrics
WHERE time >= now() - 1h
GROUP BY time(1m)
```

**Flux:**

```flux
from(bucket: "metrics")
  |> range(start: -1h)
  |> derivative(unit: 1s, nonNegative: true)
```

**Use Cases:**

- Rate calculations (bytes/sec)
- Velocity analysis
- Change detection

---

### 3.5 Aggregation Function Summary

| Function          | Purpose        | Best For           |
| ----------------- | -------------- | ------------------ |
| `count()`         | Count values   | Data availability  |
| `mean()`          | Average        | General trends     |
| `median()`        | Middle value   | Outlier resistance |
| `stddev()`        | Variability    | Anomaly detection  |
| `min()`/`max()`   | Extremes       | Range analysis     |
| `sum()`           | Total          | Cumulative metrics |
| `percentile()`    | Nth percentile | SLA monitoring     |
| `movingAverage()` | Smoothing      | Trend analysis     |
| `cumulativeSum()` | Running total  | Growth tracking    |
| `derivative()`    | Rate of change | Velocity metrics   |

---

## Module 4: Grouping Operations

### 4.1 GROUP BY in InfluxQL

#### Group by Tags

Group results by tag values.

```sql
SELECT mean(temperature)
FROM weather
WHERE time >= now() - 1d
GROUP BY location
```

**Result**: Average temperature for each location.

#### Group by Time

Create time-based windows for aggregation.

```sql
SELECT mean(temperature)
FROM weather
WHERE time >= now() - 1d
GROUP BY time(1h)
```

**Time Intervals:**

- `1s` - 1 second
- `1m` - 1 minute
- `10m` - 10 minutes
- `1h` - 1 hour
- `1d` - 1 day
- `1w` - 1 week

#### Group by Tags AND Time

Combine tag and time grouping.

```sql
SELECT mean(temperature)
FROM weather
WHERE time >= now() - 1d
GROUP BY location, time(1h)
```

**Result**: Hourly average temperature for each location.

---

### 4.2 Fill Options

Handle missing data in time-based groups.

#### fill(null)

Default behavior - leave gaps as null.

```sql
SELECT mean(temperature)
FROM weather
WHERE time >= now() - 1d
GROUP BY time(1h)
FILL(null)
```

#### fill(previous)

Use the last non-null value.

```sql
SELECT mean(temperature)
FROM weather
WHERE time >= now() - 1d
GROUP BY time(1h)
FILL(previous)
```

#### fill(linear)

Linear interpolation between points.

```sql
SELECT mean(temperature)
FROM weather
WHERE time >= now() - 1d
GROUP BY time(1h)
FILL(linear)
```

#### fill(value)

Fill with a specific value.

```sql
SELECT mean(temperature)
FROM weather
WHERE time >= now() - 1d
GROUP BY time(1h)
FILL(0)
```

---

### 4.3 Grouping in Flux

#### group() Function

Group by specific columns.

```flux
from(bucket: "weather")
  |> range(start: -1d)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> group(columns: ["location"])
  |> mean()
```

#### aggregateWindow()

Time-based aggregation.

```flux
from(bucket: "weather")
  |> range(start: -1d)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> aggregateWindow(
    every: 1h,
    fn: mean,
    createEmpty: false
  )
```

**Parameters:**

- `every`: Window duration
- `fn`: Aggregation function
- `createEmpty`: Include empty windows (true/false)
- `offset`: Time offset for windows

#### Advanced Grouping

```flux
// Group by multiple columns
from(bucket: "weather")
  |> range(start: -1d)
  |> group(columns: ["location", "sensor_type"])
  |> mean()

// Window with offset
from(bucket: "metrics")
  |> range(start: -1d)
  |> aggregateWindow(
    every: 1h,
    fn: mean,
    offset: 30m  // Offset by 30 minutes
  )

// Custom aggregation function
from(bucket: "metrics")
  |> range(start: -1h)
  |> aggregateWindow(
    every: 5m,
    fn: (column, tables=<-) => tables
      |> max()
      |> map(fn: (r) => ({ r with _value: r._value * 2 }))
  )
```

---

### 4.4 Grouping Best Practices

1. **Choose Appropriate Time Intervals**

   - Too small: Many data points, potential performance issues
   - Too large: Loss of detail
   - Rule of thumb: ~100-500 data points for visualization

2. **Group by Low-Cardinality Tags**

   - Avoid grouping by high-cardinality tags (e.g., user IDs)
   - Prefer tags with fewer unique values (e.g., location, environment)

3. **Use Fill Options Wisely**

   - `fill(previous)`: For metrics that change slowly
   - `fill(linear)`: For continuous measurements
   - `fill(null)`: When gaps are meaningful

4. **Consider Query Performance**

   ```sql
   -- Good: Group by indexed tag
   GROUP BY location

   -- Avoid: Group by high-cardinality tag
   GROUP BY user_id  -- May have millions of values
   ```

---

## Module 5: Advanced Operations

### 5.1 Windowing Operations

#### Fixed Windows

Non-overlapping time intervals.

```flux
from(bucket: "metrics")
  |> range(start: -1d)
  |> aggregateWindow(every: 1h, fn: mean)
```

**Use Cases:**

- Hourly summaries
- Daily reports
- Regular interval aggregations

---

#### Sliding Windows

Overlapping time intervals.

```flux
from(bucket: "metrics")
  |> range(start: -1h)
  |> movingAverage(n: 5)
```

**Use Cases:**

- Moving averages
- Trend smoothing
- Rolling calculations

---

#### Window Types Comparison

| Window Type  | Overlapping    | Use Case               |
| ------------ | -------------- | ---------------------- |
| **Fixed**    | No             | Hourly/daily summaries |
| **Sliding**  | Yes            | Moving averages        |
| **Session**  | Activity-based | User session analysis  |
| **Tumbling** | No, resets     | Periodic aggregates    |

---

### 5.2 Mathematical Operations

#### Field Calculations

Perform arithmetic on fields.

**InfluxQL:**

```sql
-- Temperature conversion (Fahrenheit to Celsius)
SELECT (temperature - 32) * 5 / 9 AS celsius
FROM weather
WHERE time >= now() - 1h
```

**Flux:**

```flux
from(bucket: "weather")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> map(fn: (r) => ({
    r with celsius: (r.fahrenheit - 32.0) * 5.0 / 9.0
  }))
```

#### Cross-Field Math

Combine multiple fields.

```flux
from(bucket: "system")
  |> range(start: -1h)
  |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
  |> map(fn: (r) => ({
    r with total_usage: r.cpu_usage + r.memory_usage
  }))
```

#### Rate Calculations

Calculate rate of change.

**InfluxQL:**

```sql
SELECT derivative(mean(bytes_sent), 1s) AS bytes_per_second
FROM network
WHERE time >= now() - 1h
GROUP BY time(1m)
```

**Flux:**

```flux
from(bucket: "network")
  |> range(start: -1h)
  |> filter(fn: (r) => r._field == "bytes_sent")
  |> derivative(unit: 1s, nonNegative: true)
```

---

### 5.3 Joins

Combine data from multiple measurements.

**Flux Join Example:**

```flux
// Get CPU data
cpu = from(bucket: "metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> filter(fn: (r) => r._field == "usage_percent")

// Get memory data
memory = from(bucket: "metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "memory")
  |> filter(fn: (r) => r._field == "used_percent")

// Join on time and host
join(
  tables: {cpu: cpu, mem: memory},
  on: ["_time", "host"]
)
```

**Join Types:**

```flux
// Inner join (default)
join(tables: {t1: table1, t2: table2}, on: ["_time"])

// Left join
join(tables: {t1: table1, t2: table2}, on: ["_time"], method: "left")

// Right join
join(tables: {t1: table1, t2: table2}, on: ["_time"], method: "right")

// Outer join
join(tables: {t1: table1, t2: table2}, on: ["_time"], method: "outer")
```

> **⚠️ Warning**: Joins can be expensive. Always filter data before joining!

---

### 5.4 Unions

Concatenate multiple data streams.

```flux
// Data from bucket 1
bucket1 = from(bucket: "sensors-a")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")

// Data from bucket 2
bucket2 = from(bucket: "sensors-b")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")

// Combine both
union(tables: [bucket1, bucket2])
```

**Use Cases:**

- Multi-tenant data
- Distributed sensors
- Historical + real-time data
- Cross-region aggregation

---

### 5.5 Advanced Flux Functions

#### map()

Transform each row.

```flux
from(bucket: "metrics")
  |> range(start: -1h)
  |> map(fn: (r) => ({
    r with
    doubled: r._value * 2,
    status: if r._value > 100 then "high" else "normal"
  }))
```

#### reduce()

Aggregate across rows.

```flux
from(bucket: "metrics")
  |> range(start: -1h)
  |> reduce(
    identity: {sum: 0.0, count: 0.0},
    fn: (r, accumulator) => ({
      sum: accumulator.sum + r._value,
      count: accumulator.count + 1.0
    })
  )
```

#### pivot()

Reshape data from long to wide format.

```flux
from(bucket: "system")
  |> range(start: -1h)
  |> pivot(
    rowKey: ["_time"],
    columnKey: ["_field"],
    valueColumn: "_value"
  )
```

---

## Module 6: Performance Optimization

### 6.1 Query Performance Fundamentals

#### Key Performance Factors

1. **Time Range**: Smaller is faster
2. **Tag Filtering**: Use indexed tags
3. **Cardinality**: Lower is better
4. **Field Selection**: Select only needed fields
5. **Aggregation**: Balance detail vs performance

---

### 6.2 Best Practices

#### ✓ DO

**1. Filter on Indexed Tags First**

```sql
-- Good
WHERE host = 'server01' AND cpu > 80

-- Better than
WHERE cpu > 80 AND host = 'server01'
```

**2. Use Specific Time Ranges**

```sql
-- Good: Last hour
WHERE time >= now() - 1h

-- Avoid: No time filter
SELECT * FROM metrics
```

**3. Select Only Needed Fields**

```sql
-- Good: Specific fields
SELECT cpu, memory FROM metrics

-- Avoid: All fields
SELECT * FROM metrics
```

**4. Use Appropriate Aggregation Intervals**

```sql
-- For 24h of data: 5-15min intervals
GROUP BY time(10m)

-- For 7d of data: 1h intervals
GROUP BY time(1h)
```

**5. Limit Result Sets**

```sql
SELECT * FROM metrics
WHERE time >= now() - 1h
LIMIT 1000
```

---

#### ✗ AVOID

**1. Large Time Ranges Without Filters**

```sql
-- Slow: Queries all data
SELECT * FROM metrics
```

**2. High Cardinality Tag Queries**

```sql
-- Slow: user_id might have millions of values
SELECT * FROM metrics
WHERE user_id = '123456'
```

**3. Complex Regular Expressions**

```sql
-- Slow: Regex on every row
WHERE hostname =~ /^server-[0-9]+-prod-us-east-.*$/
```

**4. Too Many GROUP BY Tags**

```sql
-- Slow: Creates many groups
GROUP BY user_id, session_id, page_id
```

**5. Unnecessary Aggregations**

```sql
-- Slow: Aggregating when raw data is sufficient
SELECT mean(value) FROM metrics
WHERE time >= now() - 1m
GROUP BY time(1s)
```

---

### 6.3 Optimization Techniques

#### Index Usage

**Tags are Indexed**

```sql
-- Fast: Uses tag index
WHERE location = 'NYC'

-- Slow: Fields not indexed
WHERE temperature > 25
```

**Best Practice:**

- Store frequently filtered values as tags
- Keep tag cardinality low (<10,000 unique values)
- Use fields for high-cardinality data

---

#### Query Planning

**Understand Query Execution Order:**

1. FROM clause
2. WHERE clause (tag filters first)
3. GROUP BY clause
4. Aggregation functions
5. ORDER BY clause
6. LIMIT/SLIMIT clause

**Optimization Strategy:**

```sql
SELECT mean(value)
FROM metrics
WHERE host = 'server01'        -- 1. Tag filter (fast)
  AND region = 'us-east'       -- 2. Another tag filter
  AND time >= now() - 1h       -- 3. Time filter
  AND value > 0                -- 4. Field filter (slower)
GROUP BY time(5m)
LIMIT 100
```

---

#### Cardinality Management

**What is Cardinality?**

- Number of unique values in a tag
- High cardinality = many unique values = slower queries

**Cardinality Guidelines:**

| Level         | Unique Values | Example               | Impact          |
| ------------- | ------------- | --------------------- | --------------- |
| **Low**       | < 100         | location, environment | ✅ Excellent    |
| **Medium**    | 100-10K       | hostname, device_id   | ✅ Good         |
| **High**      | 10K-100K      | user_id, session_id   | ⚠️ Poor         |
| **Very High** | > 100K        | UUID, timestamp       | ❌ Unacceptable |

**Bad Example:**

```sql
-- DON'T: Using UUID as a tag
measurement,user_id=uuid-123-456-789 value=100

-- Better: UUID as a field
measurement,user_segment=premium value=100,user_id="uuid-123-456-789"
```

---

### 6.4 Performance Monitoring

#### Query Performance Metrics

Monitor these key metrics:

1. **Query Duration**: Execution time
2. **Memory Usage**: RAM consumed
3. **Series Cardinality**: Unique tag combinations
4. **Cache Hit Rate**: Query cache efficiency
5. **Error Rate**: Failed queries

#### InfluxDB SHOW Commands

```sql
-- Show measurements
SHOW MEASUREMENTS

-- Show tag keys
SHOW TAG KEYS

-- Show tag values
SHOW TAG VALUES WITH KEY = "location"

-- Show series cardinality
SHOW SERIES CARDINALITY

-- Show field keys
SHOW FIELD KEYS
```

---

### 6.5 Optimization Example

**Problem: Slow Query**

```sql
-- Original: 2400ms
SELECT * FROM logs
WHERE message =~ /error/
```

**Step 1: Add Tag Filter** (66% faster)

```sql
-- Optimized: 800ms
SELECT * FROM logs
WHERE log_level = 'ERROR'
  AND message =~ /error/
```

**Step 2: Add Time Range** (81% faster than original)

```sql
-- Optimized: 450ms
SELECT * FROM logs
WHERE log_level = 'ERROR'
  AND service = 'api'
  AND time >= now() - 1h
  AND message =~ /error/
```

**Step 3: Select Specific Fields** (95% faster than original)

```sql
-- Optimized: 120ms
SELECT timestamp, service, message
FROM logs
WHERE log_level = 'ERROR'
  AND service = 'api'
  AND time >= now() - 1h
```

**Performance Improvement: 2400ms → 120ms (95% faster!)**

---

## Hands-On Exercises

### Exercise 1: Basic Queries

**Objective**: Practice writing basic queries in both InfluxQL and Flux

**Scenario**: You have temperature sensor data in a measurement called "sensors" with:

- Tags: `location`, `sensor_id`
- Fields: `temperature`, `humidity`

**Tasks:**

1. Write an InfluxQL query to get all data from the last hour
2. Write the equivalent Flux query
3. Filter to show only data where temperature > 25
4. Add a filter for location = 'warehouse-A'

**Solution:**

**InfluxQL:**

```sql
-- Task 1: Last hour
SELECT * FROM sensors
WHERE time >= now() - 1h

-- Task 3: Add temperature filter
SELECT * FROM sensors
WHERE time >= now() - 1h
  AND temperature > 25

-- Task 4: Add location filter
SELECT * FROM sensors
WHERE time >= now() - 1h
  AND temperature > 25
  AND location = 'warehouse-A'
```

**Flux:**

```flux
// Task 2: Equivalent Flux query
from(bucket: "sensors")
  |> range(start: -1h)

// Task 3: Add temperature filter
from(bucket: "sensors")
  |> range(start: -1h)
  |> filter(fn: (r) =>
    r._measurement == "sensors" and
    r.temperature > 25
  )

// Task 4: Add location filter
from(bucket: "sensors")
  |> range(start: -1h)
  |> filter(fn: (r) =>
    r._measurement == "sensors" and
    r.temperature > 25 and
    r.location == "warehouse-A"
  )
```

---

### Exercise 2: Aggregations

**Objective**: Master aggregation functions

**Scenario**: Calculate statistics on API response times from the last 24 hours.

**Tasks:**

1. Calculate the average response time
2. Find the 95th percentile (P95)
3. Count the number of requests
4. Group results by hour
5. Compare InfluxQL and Flux approaches

**Solution:**

**InfluxQL:**

```sql
-- All metrics at once
SELECT
  mean(response_time) AS avg_response,
  percentile(response_time, 95) AS p95,
  count(response_time) AS request_count
FROM api_metrics
WHERE time >= now() - 24h
GROUP BY time(1h)
```

**Flux:**

```flux
// Average response time
from(bucket: "api")
  |> range(start: -24h)
  |> filter(fn: (r) =>
    r._measurement == "api_metrics" and
    r._field == "response_time"
  )
  |> aggregateWindow(every: 1h, fn: mean)

// P95 percentile
from(bucket: "api")
  |> range(start: -24h)
  |> filter(fn: (r) =>
    r._measurement == "api_metrics" and
    r._field == "response_time"
  )
  |> aggregateWindow(
    every: 1h,
    fn: (column, tables=<-) => tables
      |> quantile(q: 0.95, method: "estimate_tdigest")
  )

// Request count
from(bucket: "api")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "api_metrics")
  |> aggregateWindow(every: 1h, fn: count)
```

---

### Exercise 3: Grouping Practice

**Objective**: Practice grouping by tags and time

**Scenario**: Analyze CPU usage across multiple servers.

**Tasks:**

1. Calculate hourly average CPU usage
2. Group by server hostname
3. Handle missing data with previous value
4. Calculate the maximum CPU per server per day

**Solution:**

**InfluxQL:**

```sql
-- Task 1-3: Hourly average by server with fill
SELECT mean(cpu_usage)
FROM system_metrics
WHERE time >= now() - 7d
GROUP BY hostname, time(1h)
FILL(previous)

-- Task 4: Daily maximum by server
SELECT max(cpu_usage)
FROM system_metrics
WHERE time >= now() - 30d
GROUP BY hostname, time(1d)
```

**Flux:**

```flux
// Task 1-3: Hourly average by server
from(bucket: "system")
  |> range(start: -7d)
  |> filter(fn: (r) =>
    r._measurement == "system_metrics" and
    r._field == "cpu_usage"
  )
  |> group(columns: ["hostname"])
  |> aggregateWindow(
    every: 1h,
    fn: mean,
    createEmpty: false
  )
  |> fill(usePrevious: true)

// Task 4: Daily maximum by server
from(bucket: "system")
  |> range(start: -30d)
  |> filter(fn: (r) =>
    r._measurement == "system_metrics" and
    r._field == "cpu_usage"
  )
  |> group(columns: ["hostname"])
  |> aggregateWindow(every: 1d, fn: max)
```

---

### Exercise 4: Query Optimization

**Objective**: Optimize a slow query

**Scenario**: This query is running slowly:

```sql
SELECT * FROM logs
WHERE message =~ /error/
```

**Tasks:**

1. Identify the performance issues
2. Add appropriate filters
3. Rewrite with better practices
4. Estimate the performance improvement

**Solution:**

**Issues Identified:**

1. ❌ No time range specified (queries all historical data)
2. ❌ Using regex on field (expensive operation)
3. ❌ `SELECT *` returns all fields (unnecessary data)
4. ❌ No tag filters (missing index usage)

**Optimized Query:**

```sql
-- Step 1: Add tag and time filters
SELECT timestamp, service, message
FROM logs
WHERE log_level = 'ERROR'      -- Tag filter (indexed)
  AND service = 'api'           -- Tag filter (indexed)
  AND time >= now() - 1h        -- Time filter
  AND message LIKE '%error%'    -- Field filter (last)
LIMIT 1000
```

**Performance Estimation:**

- Original: ~2500ms (queries all data)
- Optimized: ~150ms (94% improvement)

**Key Improvements:**

1. ✅ Added tag filters (use indexes)
2. ✅ Added time filter (limit scope)
3. ✅ Selected specific fields only
4. ✅ Added LIMIT clause
5. ✅ Used LIKE instead of regex (faster for simple patterns)

---

### Exercise 5: Advanced Operations

**Objective**: Practice advanced Flux operations

**Scenario**: Calculate the rate of change and moving average for network throughput.

**Tasks:**

1. Calculate the derivative (rate of change) in bytes/second
2. Apply a 5-point moving average
3. Join with packet loss data
4. Create an alert condition when throughput drops > 50%

**Solution:**

```flux
// Task 1: Rate of change
throughput = from(bucket: "network")
  |> range(start: -1h)
  |> filter(fn: (r) =>
    r._measurement == "throughput" and
    r._field == "bytes"
  )
  |> derivative(unit: 1s, nonNegative: true)

// Task 2: Moving average
throughput_smoothed = throughput
  |> movingAverage(n: 5)

// Get baseline for comparison
baseline = from(bucket: "network")
  |> range(start: -7d, stop: -1h)
  |> filter(fn: (r) =>
    r._measurement == "throughput" and
    r._field == "bytes"
  )
  |> derivative(unit: 1s, nonNegative: true)
  |> mean()
  |> findRecord(fn: (key) => true, idx: 0)

// Task 3: Join with packet loss
packet_loss = from(bucket: "network")
  |> range(start: -1h)
  |> filter(fn: (r) =>
    r._measurement == "packet_loss" and
    r._field == "percent"
  )

combined = join(
  tables: {throughput: throughput_smoothed, loss: packet_loss},
  on: ["_time", "interface"]
)

// Task 4: Alert condition
combined
  |> map(fn: (r) => ({
    r with
    alert_level: if r._value_throughput < baseline._value * 0.5
      then "CRITICAL"
      else if r._value_loss > 5.0
        then "WARNING"
        else "OK"
  }))
  |> filter(fn: (r) => r.alert_level != "OK")
```

---

### Challenge Exercise: Comprehensive Analytics

**Objective**: Build a complex monitoring query

**Scenario**: Create a comprehensive system health dashboard that:

- Analyzes metrics from the last 24 hours
- Calculates CPU and memory statistics
- Groups by hostname and hour
- Identifies servers with CPU > 80% for more than 10 minutes
- Joins with disk I/O data
- Creates a combined health score

**Solution:**

```flux
// Get CPU data
cpu_data = from(bucket: "system")
  |> range(start: -24h)
  |> filter(fn: (r) =>
    r._measurement == "cpu" and
    r._field == "usage_percent"
  )
  |> group(columns: ["hostname"])
  |> aggregateWindow(every: 1m, fn: mean)

// Identify high CPU servers
high_cpu_servers = cpu_data
  |> filter(fn: (r) => r._value > 80)
  |> window(every: 10m)
  |> count()
  |> filter(fn: (r) => r._value >= 10)  // 10+ minutes above 80%

// Get memory data
memory_data = from(bucket: "system")
  |> range(start: -24h)
  |> filter(fn: (r) =>
    r._measurement == "memory" and
    r._field == "used_percent"
  )
  |> group(columns: ["hostname"])
  |> aggregateWindow(every: 1h, fn: mean)

// Get disk I/O
disk_io = from(bucket: "system")
  |> range(start: -24h)
  |> filter(fn: (r) =>
    r._measurement == "disk" and
    r._field == "io_wait"
  )
  |> group(columns: ["hostname"])
  |> aggregateWindow(every: 1h, fn: mean)

// Join all metrics
combined = join(
  tables: {
    cpu: cpu_data,
    mem: memory_data,
    disk: disk_io
  },
  on: ["_time", "hostname"]
)

// Calculate health score
combined
  |> map(fn: (r) => ({
    r with
    health_score:
      (100 - r._value_cpu) * 0.4 +
      (100 - r._value_mem) * 0.3 +
      (100 - r._value_disk) * 0.3,
    status: if r._value_cpu > 90 or r._value_mem > 95
      then "CRITICAL"
      else if r._value_cpu > 80 or r._value_mem > 85
        then "WARNING"
        else "HEALTHY"
  }))
  |> group(columns: ["hostname"])
  |> mean(column: "health_score")
```

---

## Summary and Resources

### Key Takeaways

1. **Master Both Languages**

   - Use InfluxQL for simple queries and dashboards
   - Use Flux for complex transformations and analytics

2. **Filter Efficiently**

   - Always filter on indexed tags first
   - Use specific time ranges
   - Avoid unnecessary regex operations

3. **Choose Right Aggregations**

   - Use mean() for general trends
   - Use median() when outliers are present
   - Use percentile() for SLA monitoring

4. **Optimize Queries**

   - Select only needed fields
   - Use appropriate aggregation intervals
   - Monitor cardinality

5. **Monitor Performance**
   - Track query duration
   - Watch memory usage
   - Manage tag cardinality

---

### Performance Optimization Checklist

- [ ] Filter on indexed tags first
- [ ] Use specific time ranges (not SELECT \*)
- [ ] Select only needed fields
- [ ] Use appropriate aggregation intervals
- [ ] Avoid high cardinality tags
- [ ] Minimize regex usage
- [ ] Monitor query performance metrics
- [ ] Use LIMIT clauses for large result sets
- [ ] Consider query caching for repeated queries

---

### Common Mistakes to Avoid

1. ❌ Querying without time ranges
2. ❌ Using unique IDs as tags
3. ❌ Selecting all fields when only few are needed
4. ❌ Complex regex on large datasets
5. ❌ Too many GROUP BY tags
6. ❌ Ignoring query performance metrics
7. ❌ Not using indexes (tag filters)
8. ❌ Over-aggregating data
9. ❌ Not handling missing data
10. ❌ Forgetting to limit result sets

---

### Additional Resources

#### Official Documentation

- [InfluxDB Documentation](https://docs.influxdata.com/)
- [InfluxQL Reference](https://docs.influxdata.com/influxdb/latest/query_language/)
- [Flux Documentation](https://docs.influxdata.com/flux/latest/)
- [Flux Standard Library](https://docs.influxdata.com/flux/latest/stdlib/)

#### Community Resources

- [InfluxDB Community Forums](https://community.influxdata.com/)
- [InfluxDB GitHub](https://github.com/influxdata/influxdb)
- [InfluxDB Blog](https://www.influxdata.com/blog/)

#### Practice Datasets

- IoT sensor data
- System metrics (CPU, memory, disk)
- Network performance data
- Application logs
- Weather data

---

### Next Steps

1. ✅ Complete all hands-on exercises
2. 📚 Review InfluxDB documentation
3. 💻 Practice with your own datasets
4. 🔍 Experiment with advanced Flux functions
5. 📊 Build custom dashboards
6. 🚀 Proceed to Module 5: Advanced Topics
7. 🌐 Join the InfluxDB community
8. 📖 Explore Flux standard library

---

### Course Feedback

We value your feedback! Please share:

- What worked well?
- What could be improved?
- Additional topics you'd like covered?
- Exercise difficulty level?
- Overall course rating?

---

## Appendix

### A. InfluxQL Quick Reference

```sql
-- Basic query
SELECT <field> FROM <measurement> WHERE <condition>

-- Aggregation
SELECT mean(<field>) FROM <measurement>
WHERE time >= now() - 1h
GROUP BY time(10m)

-- Multiple aggregations
SELECT mean(temp), max(temp), count(temp) FROM weather

-- Fill options
GROUP BY time(10m) FILL(previous|linear|null|0)

-- Common functions
count(), mean(), median(), min(), max(), sum()
percentile(), stddev(), derivative()
```

### B. Flux Quick Reference

```flux
// Basic pipeline
from(bucket: "my-bucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temp")
  |> mean()

// Aggregation
|> aggregateWindow(every: 10m, fn: mean)

// Grouping
|> group(columns: ["location"])

// Transformations
|> map(fn: (r) => ({ r with new_field: r._value * 2 }))

// Join
join(tables: {t1: table1, t2: table2}, on: ["_time"])

// Common functions
mean(), median(), min(), max(), sum(), count()
movingAverage(), derivative(), cumulativeSum()
```

### C. Performance Tuning Cheat Sheet

| Issue            | Solution                             |
| ---------------- | ------------------------------------ |
| Slow queries     | Add tag filters, time ranges         |
| High memory      | Limit result set, use aggregation    |
| High cardinality | Redesign schema, use fields not tags |
| Missing data     | Use fill options                     |
| Complex queries  | Break into smaller queries           |

### D. Time Duration Syntax

| Syntax | Duration      |
| ------ | ------------- |
| `1ns`  | 1 nanosecond  |
| `1us`  | 1 microsecond |
| `1ms`  | 1 millisecond |
| `1s`   | 1 second      |
| `1m`   | 1 minute      |
| `1h`   | 1 hour        |
| `1d`   | 1 day         |
| `1w`   | 1 week        |

---

**End of Training Module**

_Version 1.0 | Duration: 75 minutes | Level: Intermediate_

---

© 2025 InfluxDB Training. All rights reserved.

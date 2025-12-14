# InfluxDB 2.x - Comprehensive Learning Notes

## Table of Contents

1. [Introduction to InfluxDB 2](#1-introduction-to-influxdb-2)
2. [Core Concepts & Data Model](#2-core-concepts--data-model)
3. [Architecture & Design Principles](#3-architecture--design-principles)
4. [Installation & Setup](#4-installation--setup)
5. [Data Elements & Schema](#5-data-elements--schema)
6. [Writing Data](#6-writing-data)
7. [Querying Data](#7-querying-data)
8. [Data Processing & Tasks](#8-data-processing--tasks)
9. [Visualization & Dashboards](#9-visualization--dashboards)
10. [Monitoring & Alerting](#10-monitoring--alerting)
11. [Administration & Security](#11-administration--security)
12. [Tools & Integrations](#12-tools--integrations)
13. [Best Practices](#13-best-practices)
14. [Real-World Use Cases](#14-real-world-use-cases)

---

## 1. Introduction to InfluxDB 2

### 1.1 What is InfluxDB?

- **Time Series Database (TSDB)**: Purpose-built for time-stamped data
- **Open-source**: InfluxDB OSS (Open Source Software)
- **High Performance**: Optimized for high write and query loads
- **Scalable**: Handles millions of data points per second

### 1.2 Key Features

- **Purpose-built storage engine**: Time-Structured Merge Tree (TSM)
- **SQL-like query language**: Flux and InfluxQL support
- **Built-in UI**: Web-based interface for data exploration
- **Native HTTP API**: RESTful API for integration
- **Data retention policies**: Automatic data lifecycle management
- **Continuous queries**: Automated data processing via tasks
- **Alerting & monitoring**: Built-in alerting system

### 1.3 InfluxDB 2.x vs 1.x

**Major Changes:**

- Unified architecture (database + retention policy = bucket)
- New query language (Flux)
- Enhanced UI with dashboards and notebooks
- Improved security model with tokens
- Organizations and users management
- Tasks replace continuous queries

### 1.4 Use Cases

- **IoT & Sensor Data**: Temperature, humidity, pressure monitoring
- **Application Metrics**: Response times, error rates, throughput
- **Infrastructure Monitoring**: CPU, memory, disk usage
- **Financial Data**: Stock prices, trading volumes
- **DevOps & Observability**: Logs, traces, metrics (LTM)
- **Real-time Analytics**: Stream processing and analysis

---

## 2. Core Concepts & Data Model

### 2.1 Organization

- **Definition**: Workspace for a group of users
- **Purpose**: Logical separation of data and resources
- **Components**: Contains buckets, dashboards, tasks, and users
- **Multi-tenancy**: Support multiple organizations in single instance

**Example:**

```
Organization: "MyCompany"
├── Buckets
├── Users
├── Dashboards
└── Tasks
```

### 2.2 Bucket

- **Definition**: Named location where time series data is stored
- **Replaces**: Database + Retention Policy (from v1.x)
- **Retention Period**: Duration for which data persists
- **Organization Scoped**: Each bucket belongs to one organization

**Example:**

```bash
# Creating a bucket
influx bucket create \
  --name sensor-data \
  --org MyCompany \
  --retention 30d
```

**Use Case**: Separate buckets for different data types

- `iot-sensors` (retention: 90 days)
- `application-metrics` (retention: 7 days)
- `long-term-analytics` (retention: infinite)

### 2.3 Measurement

- **Definition**: Container for tags, fields, and timestamps
- **Analog**: Similar to a table in relational databases
- **Naming**: Should describe the data being stored
- **Example**: `temperature`, `cpu_usage`, `stock_price`

**Example Line Protocol:**

```
temperature,location=room1,sensor=DHT22 value=23.5 1609459200000000000
└─────┬────┘ └──────────┬──────────┘ └───┬──┘ └─────────┬──────────┘
  measurement        tags             field      timestamp
```

### 2.4 Tags

**Characteristics:**

- **Indexed**: Fast query performance
- **Metadata**: Categorical information about data
- **String values**: Always stored as strings
- **Optional**: But highly recommended

**Components:**

- **Tag Key**: Name of the tag (e.g., `location`, `device_id`)
- **Tag Value**: Value of the tag (e.g., `bangalore`, `sensor-01`)

**Tag Set:**

```
location=bangalore,device_id=sensor-01,status=active
```

**Example:**

```javascript
// IoT sensor data
measurement: temperature
tags: {
  location: "bangalore",
  device_id: "DHT22-001",
  building: "HQ",
  floor: "3"
}
field: value=25.5
timestamp: 2024-12-14T10:30:00Z
```

**Best Practices:**

- Use tags for data you'll filter by
- Keep tag cardinality low (avoid unique values)
- Tags should have finite, predictable values

### 2.5 Fields

**Characteristics:**

- **Not indexed**: Slower query performance on field filters
- **Required**: Must have at least one field
- **Typed values**: Integer, float, string, boolean
- **Actual data**: The measured values

**Components:**

- **Field Key**: Name of the field (e.g., `temperature`, `humidity`)
- **Field Value**: Measured value (e.g., `25.5`, `60`)

**Field Set:**

```
temperature=25.5,humidity=60,pressure=1013.25
```

**Example:**

```javascript
// System monitoring
measurement: cpu_usage
tags: {
  host: "server-01",
  region: "us-west"
}
fields: {
  usage_user: 45.2,
  usage_system: 12.5,
  usage_idle: 42.3,
  processes: 156  // integer
}
timestamp: 2024-12-14T10:30:00Z
```

**Field Types:**

```
# Integer (suffix with i)
cpu_count=4i

# Float (default)
temperature=23.5
cpu_usage=45.25

# String (wrap in quotes)
status="online"

# Boolean
is_active=true
```

### 2.6 Timestamp

- **Precision**: Nanosecond by default
- **Format**: Unix epoch time
- **Required**: Every point must have a timestamp
- **Display**: RFC3339 UTC format in UI

**Example:**

```
1609459200000000000  # Nanoseconds
1609459200000        # Milliseconds
1609459200           # Seconds
```

### 2.7 Point

- **Definition**: Single data record at a specific time
- **Uniqueness**: Defined by measurement, tag set, and timestamp
- **Components**: Measurement + Tag Set + Field Set + Timestamp

**Example Point:**

```
measurement: sensor_data
tags: location=bangalore,device=temp-01
fields: temperature=25.5,humidity=60
timestamp: 2024-12-14T10:30:00Z
```

### 2.8 Series

- **Definition**: Collection of points sharing measurement and tag set
- **Importance**: Critical for schema design and performance
- **Series Key**: measurement + tag set

**Example:**

```
Series 1: temperature,location=bangalore,device=temp-01
Series 2: temperature,location=mumbai,device=temp-02
Series 3: temperature,location=bangalore,device=temp-02
```

**Series Cardinality:**

- Total unique series = measurement × unique tag combinations
- High cardinality = performance issues
- Good: 1M series
- Problematic: 10M+ series

---

## 3. Architecture & Design Principles

### 3.1 Storage Engine

**TSM (Time-Structured Merge Tree):**

- **Write-Ahead Log (WAL)**: Durability for recent writes
- **Cache**: In-memory cache for recent data
- **TSM Files**: Compressed, columnar data files
- **Compaction**: Background process to optimize storage

**Data Flow:**

```
Write Request
    ↓
  WAL (disk)
    ↓
 Cache (memory)
    ↓
TSM Files (disk)
    ↓
Compaction
```

### 3.2 TSI (Time Series Index)

- **Purpose**: Index for tags and measurements
- **Disk-based**: Supports unlimited series cardinality
- **Memory-efficient**: Better than in-memory indexing
- **Fast lookups**: Optimized for tag filtering

### 3.3 Design Principles

**1. Time-Optimized:**

- Recent data queries are fastest
- Data automatically organized by time

**2. Write-Optimized:**

- Batch writes for efficiency
- WAL for durability
- Asynchronous compaction

**3. Tag Indexing:**

- Tags are indexed for fast queries
- Fields are not indexed

**4. Compression:**

- High compression ratios (10:1 to 100:1)
- Timestamp compression
- Delta encoding for numeric values

---

## 4. Installation & Setup

### 4.1 Installation Methods

**Option 1: Docker**

```bash
# Pull the image
docker pull influxdb:2.7

# Run container
docker run -d -p 8086:8086 \
  --name influxdb2 \
  -v influxdb2:/var/lib/influxdb2 \
  influxdb:2.7
```

**Option 2: Direct Installation (Ubuntu)**

```bash
# Add repository
wget -q https://repos.influxdata.com/influxdata-archive_compat.key
echo '23a1c8836f0afc5ed24e0486339d7cc8f6790b83886c4c96995b88a061c5bb5d influxdata-archive_compat.key' | sha256sum -c && cat influxdata-archive_compat.key | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/influxdata-archive_compat.gpg > /dev/null

echo 'deb [signed-by=/etc/apt/trusted.gpg.d/influxdata-archive_compat.gpg] https://repos.influxdata.com/debian stable main' | sudo tee /etc/apt/sources.list.d/influxdata.list

# Install
sudo apt-get update
sudo apt-get install influxdb2

# Start service
sudo service influxdb start
```

**Option 3: Binary Download**

```bash
# Download
wget https://dl.influxdata.com/influxdb/releases/influxdb2-2.7.x_linux_amd64.tar.gz

# Extract
tar xvfz influxdb2-2.7.x_linux_amd64.tar.gz

# Run
./influxd
```

### 4.2 Initial Setup

**Web UI Setup:**

1. Navigate to `http://localhost:8086`
2. Create initial user
3. Create initial organization
4. Create initial bucket
5. Generate authentication token

**CLI Setup:**

```bash
influx setup \
  --username admin \
  --password mypassword \
  --org myorg \
  --bucket mybucket \
  --retention 30d \
  --token mytoken \
  --force
```

### 4.3 Configuration

**Config File Location:**

- Linux: `/etc/influxdb/config.toml`
- Docker: `/etc/influxdb2/config.yml`

**Key Configuration Options:**

```toml
# HTTP settings
http-bind-address = ":8086"

# Storage settings
bolt-path = "/var/lib/influxdb2/influxd.bolt"
engine-path = "/var/lib/influxdb2/engine"

# Logging
log-level = "info"

# Query settings
query-concurrency = 10
query-queue-size = 10
```

---

## 5. Data Elements & Schema

### 5.1 Line Protocol

**Format:**

```
<measurement>[,<tag_key>=<tag_value>[,<tag_key>=<tag_value>]] <field_key>=<field_value>[,<field_key>=<field_value>] [<timestamp>]
```

**Rules:**

1. Measurement comes first
2. Tags (optional) separated by commas
3. Space separates tags from fields
4. Fields (required) separated by commas
5. Space separates fields from timestamp
6. Timestamp (optional) is last

**Example:**

```
# Complete example
temperature,location=bangalore,sensor=DHT22 value=25.5,humidity=60i 1609459200000000000

# Multiple fields
system,host=server1 cpu=45.2,memory=78.5,disk=62.3 1609459200000000000

# No timestamp (uses current time)
events,type=login,status=success count=1i

# String field value
logs,level=error,app=backend message="Connection timeout"
```

### 5.2 Tabular Schema

**Structure:**

```
#group,false,false,true,true,false,false,true,true
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,double,string,string
#default,_result,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement
,,0,2024-01-01T00:00:00Z,2024-01-02T00:00:00Z,2024-01-01T10:00:00Z,23.5,temperature,sensor_data
```

**Annotations:**

- `#group`: Indicates group key columns
- `#datatype`: Data type for each column
- `#default`: Default values for columns

---

## 6. Writing Data

### 6.1 Write Methods

#### 6.1.1 Line Protocol via HTTP API

**Using curl:**

```bash
curl -X POST "http://localhost:8086/api/v2/write?org=myorg&bucket=mybucket&precision=ns" \
  --header "Authorization: Token YOUR_AUTH_TOKEN" \
  --header "Content-Type: text/plain; charset=utf-8" \
  --data-binary '
temperature,location=bangalore value=25.5 1609459200000000000
temperature,location=mumbai value=28.3 1609459200000000000
'
```

**Precision Options:**

- `ns` - Nanoseconds (default)
- `us` - Microseconds
- `ms` - Milliseconds
- `s` - Seconds

#### 6.1.2 influx CLI

```bash
# Write from command line
influx write \
  --bucket mybucket \
  --org myorg \
  --token YOUR_AUTH_TOKEN \
  --precision s \
  "temperature,location=bangalore value=25.5"

# Write from file
influx write \
  --bucket mybucket \
  --org myorg \
  --token YOUR_AUTH_TOKEN \
  --file data.txt
```

#### 6.1.3 Client Libraries

**JavaScript/Node.js:**

```javascript
const { InfluxDB, Point } = require("@influxdata/influxdb-client");

const url = "http://localhost:8086";
const token = "YOUR_AUTH_TOKEN";
const org = "myorg";
const bucket = "mybucket";

const client = new InfluxDB({ url, token });
const writeApi = client.getWriteApi(org, bucket, "ns");

// Write using Point
const point = new Point("temperature")
  .tag("location", "bangalore")
  .tag("sensor", "DHT22")
  .floatField("value", 25.5)
  .timestamp(new Date());

writeApi.writePoint(point);

// Flush and close
writeApi.close().then(() => {
  console.log("Write completed");
});
```

**Python:**

```python
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

url = "http://localhost:8086"
token = "YOUR_AUTH_TOKEN"
org = "myorg"
bucket = "mybucket"

client = InfluxDBClient(url=url, token=token, org=org)
write_api = client.write_api(write_options=SYNCHRONOUS)

# Write using Point
point = Point("temperature") \
    .tag("location", "bangalore") \
    .tag("sensor", "DHT22") \
    .field("value", 25.5)

write_api.write(bucket=bucket, record=point)

# Write using dictionary
data = {
    "measurement": "temperature",
    "tags": {
        "location": "bangalore",
        "sensor": "DHT22"
    },
    "fields": {
        "value": 25.5
    },
    "time": "2024-12-14T10:30:00Z"
}

write_api.write(bucket=bucket, record=data)
```

**C# / .NET:**

```csharp
using InfluxDB.Client;
using InfluxDB.Client.Api.Domain;
using InfluxDB.Client.Writes;

var url = "http://localhost:8086";
var token = "YOUR_AUTH_TOKEN";
var org = "myorg";
var bucket = "mybucket";

var client = new InfluxDBClient(url, token);
var writeApi = client.GetWriteApi();

// Write using PointData
var point = PointData
    .Measurement("temperature")
    .Tag("location", "bangalore")
    .Tag("sensor", "DHT22")
    .Field("value", 25.5)
    .Timestamp(DateTime.UtcNow, WritePrecision.Ns);

writeApi.WritePoint(point, bucket, org);
```

### 6.2 Batch Writing

**Best Practice Example (Node.js):**

```javascript
const points = [];

for (let i = 0; i < 1000; i++) {
  const point = new Point("sensor_data")
    .tag("sensor_id", `sensor-${i % 10}`)
    .floatField("temperature", 20 + Math.random() * 10)
    .floatField("humidity", 40 + Math.random() * 20)
    .timestamp(new Date(Date.now() - i * 1000));

  points.push(point);
}

writeApi.writePoints(points);
writeApi.close();
```

### 6.3 Write Optimization

**Tips:**

1. **Batch writes**: Write multiple points in single request
2. **Optimal batch size**: 5,000-10,000 points
3. **Sort by time**: Write points in chronological order
4. **Use tags wisely**: Low cardinality tags
5. **Compression**: Use gzip for large payloads

**Example with Compression:**

```bash
gzip -c data.txt | curl -X POST \
  "http://localhost:8086/api/v2/write?org=myorg&bucket=mybucket" \
  --header "Authorization: Token YOUR_AUTH_TOKEN" \
  --header "Content-Encoding: gzip" \
  --header "Content-Type: text/plain; charset=utf-8" \
  --data-binary @-
```

### 6.4 Telegraf Integration

**What is Telegraf?**

- Plugin-driven agent for collecting metrics
- 300+ input plugins
- Native InfluxDB 2.x support

**Example Configuration:**

```toml
# telegraf.conf

# Output Plugin
[[outputs.influxdb_v2]]
  urls = ["http://localhost:8086"]
  token = "YOUR_AUTH_TOKEN"
  organization = "myorg"
  bucket = "mybucket"

# Input Plugin - CPU metrics
[[inputs.cpu]]
  percpu = true
  totalcpu = true
  collect_cpu_time = false
  report_active = false

# Input Plugin - Memory
[[inputs.mem]]

# Input Plugin - Disk
[[inputs.disk]]
  ignore_fs = ["tmpfs", "devtmpfs", "devfs"]

# Input Plugin - System
[[inputs.system]]
```

**Run Telegraf:**

```bash
telegraf --config telegraf.conf
```

---

## 7. Querying Data

### 7.1 Flux Query Language

**What is Flux?**

- Functional data scripting language
- Purpose-built for working with time series
- Replaces InfluxQL in InfluxDB 2.x
- More powerful and flexible

**Basic Flux Structure:**

```flux
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> filter(fn: (r) => r.location == "bangalore")
```

### 7.2 Core Flux Functions

#### 7.2.1 from()

**Purpose**: Specify data source

```flux
from(bucket: "mybucket")
```

#### 7.2.2 range()

**Purpose**: Filter by time range

```flux
// Last hour
|> range(start: -1h)

// Specific time range
|> range(start: 2024-01-01T00:00:00Z, stop: 2024-01-02T00:00:00Z)

// Last 24 hours
|> range(start: -24h)

// Since beginning
|> range(start: 0)
```

#### 7.2.3 filter()

**Purpose**: Filter records based on conditions

```flux
// Single condition
|> filter(fn: (r) => r._measurement == "temperature")

// Multiple conditions
|> filter(fn: (r) =>
  r._measurement == "temperature" and
  r.location == "bangalore" and
  r._value > 25.0
)

// Using regular expressions
|> filter(fn: (r) => r.location =~ /^bang/)
```

#### 7.2.4 Aggregation Functions

**mean():**

```flux
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> mean()
```

**sum():**

```flux
|> sum()
```

**count():**

```flux
|> count()
```

**min() / max():**

```flux
|> min()
|> max()
```

**aggregateWindow():**

```flux
// Average every 5 minutes
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> aggregateWindow(
      every: 5m,
      fn: mean,
      createEmpty: false
    )
```

### 7.3 Advanced Queries

#### 7.3.1 Window & Aggregate

```flux
from(bucket: "mybucket")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "cpu_usage")
  |> window(every: 1h)
  |> mean()
  |> duplicate(column: "_stop", as: "_time")
  |> window(every: inf)
```

#### 7.3.2 Group By

```flux
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> group(columns: ["location"])
  |> mean()
```

#### 7.3.3 Join

```flux
temp = from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")

humidity = from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "humidity")

join(
  tables: {temp: temp, hum: humidity},
  on: ["_time", "location"]
)
```

#### 7.3.4 Pivot (Wide Format)

```flux
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "sensor_data")
  |> pivot(
      rowKey: ["_time"],
      columnKey: ["_field"],
      valueColumn: "_value"
    )
```

**Output:**

```
_time                   temperature  humidity  pressure
2024-12-14T10:00:00Z    25.5        60        1013.25
2024-12-14T10:01:00Z    25.6        61        1013.20
```

#### 7.3.5 Map (Transform Data)

```flux
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> map(fn: (r) => ({
      r with
      _value: (r._value * 9.0 / 5.0) + 32.0  // Celsius to Fahrenheit
    }))
```

### 7.4 Query Execution Methods

#### 7.4.1 Data Explorer (UI)

1. Navigate to Data Explorer
2. Build query visually or use script editor
3. Click "Submit" to execute
4. View results in table or graph

#### 7.4.2 influx CLI

```bash
influx query \
  --org myorg \
  --token YOUR_AUTH_TOKEN \
  'from(bucket:"mybucket") |> range(start:-1h)'
```

#### 7.4.3 HTTP API

```bash
curl -X POST "http://localhost:8086/api/v2/query?org=myorg" \
  --header "Authorization: Token YOUR_AUTH_TOKEN" \
  --header "Content-Type: application/vnd.flux" \
  --data 'from(bucket:"mybucket") |> range(start:-1h)'
```

#### 7.4.4 Client Libraries

**JavaScript:**

```javascript
const { InfluxDB } = require("@influxdata/influxdb-client");

const client = new InfluxDB({ url, token });
const queryApi = client.getQueryApi(org);

const query = `
  from(bucket: "mybucket")
    |> range(start: -1h)
    |> filter(fn: (r) => r._measurement == "temperature")
`;

queryApi.queryRows(query, {
  next(row, tableMeta) {
    const o = tableMeta.toObject(row);
    console.log(`${o._time} ${o._measurement}: ${o._field}=${o._value}`);
  },
  error(error) {
    console.error(error);
  },
  complete() {
    console.log("Query completed");
  },
});
```

**Python:**

```python
query = '''
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
'''

tables = query_api.query(query, org=org)

for table in tables:
    for record in table.records:
        print(f"{record.get_time()}: {record.get_value()}")
```

### 7.5 InfluxQL Support

**Note**: InfluxDB 2.x supports InfluxQL for backward compatibility

**DBRP Mapping** (Database Retention Policy):

```bash
# Create mapping
influx v1 dbrp create \
  --bucket-id BUCKET_ID \
  --db mydb \
  --rp autogen \
  --default
```

**InfluxQL Query Example:**

```sql
SELECT mean("value")
FROM "temperature"
WHERE "location" = 'bangalore'
  AND time > now() - 1h
GROUP BY time(5m)
```

---

## 8. Data Processing & Tasks

### 8.1 What are Tasks?

**Definition:**

- Scheduled Flux scripts
- Replaces Continuous Queries from v1.x
- Automated data processing
- Downsampling and transformations

**Use Cases:**

- Downsampling high-resolution data
- Data aggregation
- Data transformation
- Alerting workflows
- ETL operations

### 8.2 Creating Tasks

#### 8.2.1 Web UI

1. Navigate to Tasks
2. Click "Create Task"
3. Define task schedule
4. Write Flux script
5. Save task

#### 8.2.2 Task Script Structure

```flux
option task = {
  name: "downsample-temperature",
  every: 1h,
  offset: 5m,
}

from(bucket: "raw-data")
  |> range(start: -task.every)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> aggregateWindow(every: 5m, fn: mean)
  |> to(bucket: "downsampled-data")
```

**Task Options:**

- `name`: Task identifier
- `every`: Run interval (e.g., `1h`, `30m`, `1d`)
- `offset`: Delay after interval (e.g., `5m`)
- `cron`: Cron expression for complex schedules

### 8.3 Task Examples

#### 8.3.1 Downsampling

```flux
option task = {
  name: "downsample-metrics",
  every: 1h,
}

// Downsample to 1-minute averages
from(bucket: "high-freq-data")
  |> range(start: -task.every)
  |> filter(fn: (r) => r._measurement == "sensor_data")
  |> aggregateWindow(
      every: 1m,
      fn: mean,
      createEmpty: false
    )
  |> to(bucket: "downsampled-data", org: "myorg")
```

#### 8.3.2 Data Transformation

```flux
option task = {
  name: "celsius-to-fahrenheit",
  every: 5m,
}

from(bucket: "sensor-data")
  |> range(start: -task.every)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> map(fn: (r) => ({
      r with
      _value: (r._value * 9.0 / 5.0) + 32.0
    }))
  |> to(bucket: "temp-fahrenheit", org: "myorg")
```

#### 8.3.3 Alerting Task

```flux
option task = {
  name: "high-temperature-alert",
  every: 1m,
}

from(bucket: "sensor-data")
  |> range(start: -task.every)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> filter(fn: (r) => r._value > 30.0)
  |> to(bucket: "alerts", org: "myorg")
```

### 8.4 Task Management

**CLI Commands:**

```bash
# List tasks
influx task list

# Create task from file
influx task create --file task.flux

# Run task manually
influx task run --task-id TASK_ID

# View task runs
influx task run list --task-id TASK_ID

# Delete task
influx task delete --id TASK_ID
```

---

## 9. Visualization & Dashboards

### 9.1 Dashboard Components

**Elements:**

- **Cells**: Individual visualization panels
- **Variables**: Dynamic filters for dashboards
- **Annotations**: Event markers on time series
- **Notes**: Markdown documentation cells

### 9.2 Visualization Types

#### 9.2.1 Graph (Line Chart)

**Use Case**: Time series trends

```flux
from(bucket: "mybucket")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> aggregateWindow(every: v.windowPeriod, fn: mean)
```

#### 9.2.2 Single Stat

**Use Case**: Current value display

```flux
from(bucket: "mybucket")
  |> range(start: -5m)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> last()
```

#### 9.2.3 Gauge

**Use Case**: Percentage or bounded values

```flux
from(bucket: "mybucket")
  |> range(start: -1m)
  |> filter(fn: (r) => r._measurement == "cpu_usage")
  |> mean()
```

#### 9.2.4 Table

**Use Case**: Tabular data display

```flux
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "events")
  |> sort(columns: ["_time"], desc: true)
  |> limit(n: 100)
```

#### 9.2.5 Heatmap

**Use Case**: Distribution over time

```flux
from(bucket: "mybucket")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "response_time")
  |> histogramQuantile(quantile: 0.99)
```

### 9.3 Variables

**Types:**

1. **Query Variables**: Values from Flux query
2. **CSV Variables**: Comma-separated values
3. **Map Variables**: Key-value pairs

**Example - Query Variable:**

```flux
// Variable query for locations
import "influxdata/influxdb/schema"

schema.tagValues(
  bucket: "mybucket",
  tag: "location"
)
```

**Using Variables in Queries:**

```flux
from(bucket: "mybucket")
  |> range(start: v.timeRangeStart)
  |> filter(fn: (r) => r.location == v.location_var)
```

### 9.4 Creating Dashboards

**Step-by-Step:**

1. Navigate to Dashboards
2. Click "Create Dashboard"
3. Add cells (visualizations)
4. Configure queries
5. Customize visualization settings
6. Add variables for interactivity
7. Save dashboard

**Example Dashboard - System Monitoring:**

```
Dashboard: Server Metrics
├── Cell 1: CPU Usage (Gauge)
├── Cell 2: Memory Usage (Graph)
├── Cell 3: Disk I/O (Graph)
├── Cell 4: Network Traffic (Graph)
└── Cell 5: Active Processes (Single Stat)
```

---

## 10. Monitoring & Alerting

### 10.1 Checks

**Definition**: Queries that run periodically to monitor conditions

**Types:**

1. **Threshold Check**: Value exceeds/falls below threshold
2. **Deadman Check**: No data received in time window

#### 10.1.1 Threshold Check Example

```flux
from(bucket: "mybucket")
  |> range(start: -1m)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> mean()
  |> check.thresholdCheck(
      thresholds: {
        crit: (r) => r._value > 35.0,
        warn: (r) => r._value > 30.0,
        info: (r) => r._value > 25.0,
        ok: (r) => r._value <= 25.0
      }
    )
```

#### 10.1.2 Deadman Check Example

```flux
from(bucket: "mybucket")
  |> range(start: -5m)
  |> filter(fn: (r) => r._measurement == "heartbeat")
  |> aggregateWindow(every: 1m, fn: count)
  |> check.deadman(
      threshold: 1,
      level: "CRIT"
    )
```

### 10.2 Notification Endpoints

**Supported Endpoints:**

- Slack
- PagerDuty
- HTTP (webhook)
- Telegram

**Example - Slack Endpoint:**

```json
{
  "name": "Slack Alerts",
  "type": "slack",
  "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
  "status": "active"
}
```

### 10.3 Notification Rules

**Purpose**: Route check statuses to endpoints

**Example Configuration:**

```json
{
  "name": "Critical Temperature Alert",
  "endpointID": "ENDPOINT_ID",
  "checkID": "CHECK_ID",
  "statusRules": [
    {
      "currentLevel": "CRIT"
    }
  ],
  "messageTemplate": "ALERT: Temperature is {{.value}} at {{.location}}"
}
```

### 10.4 Complete Alerting Workflow

```flux
// 1. Define the check
option task = {
  name: "temp-check",
  every: 1m,
}

data = from(bucket: "sensor-data")
  |> range(start: -task.every)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> aggregateWindow(every: task.every, fn: mean)

// 2. Apply threshold check
data
  |> v1.fieldsAsCols()
  |> map(fn: (r) => ({
      r with
      _level: if r.value > 35.0 then "crit"
              else if r.value > 30.0 then "warn"
              else "ok"
    }))
  |> to(bucket: "_monitoring", org: "myorg")
```

---

## 11. Administration & Security

### 11.1 User Management

**User Roles:**

- **Owner**: Full access to organization
- **Member**: Limited access based on permissions

**Creating Users:**

```bash
# Create user
influx user create \
  --name john \
  --org myorg \
  --password securepassword

# List users
influx user list

# Delete user
influx user delete --id USER_ID
```

### 11.2 Authentication & Tokens

**Token Types:**

1. **Operator Token**: Full system access (super admin)
2. **All Access Token**: Full org access
3. **Read/Write Token**: Specific bucket permissions

**Creating Tokens:**

```bash
# All-access token
influx auth create \
  --org myorg \
  --all-access

# Read/write token for specific bucket
influx auth create \
  --org myorg \
  --read-bucket BUCKET_ID \
  --write-bucket BUCKET_ID

# List tokens
influx auth list

# Delete token
influx auth delete --id TOKEN_ID
```

**Token Permissions Example:**

```json
{
  "description": "Read/Write sensor data",
  "permissions": [
    {
      "action": "read",
      "resource": {
        "type": "buckets",
        "id": "BUCKET_ID",
        "orgID": "ORG_ID"
      }
    },
    {
      "action": "write",
      "resource": {
        "type": "buckets",
        "id": "BUCKET_ID",
        "orgID": "ORG_ID"
      }
    }
  ]
}
```

### 11.3 Bucket Management

**Creating Buckets:**

```bash
# Create bucket with retention
influx bucket create \
  --name sensor-data \
  --org myorg \
  --retention 30d

# Create infinite retention bucket
influx bucket create \
  --name analytics \
  --org myorg \
  --retention 0

# List buckets
influx bucket list

# Update bucket retention
influx bucket update \
  --id BUCKET_ID \
  --retention 90d

# Delete bucket
influx bucket delete --id BUCKET_ID
```

### 11.4 Backup & Restore

**Backup:**

```bash
# Full backup
influx backup /path/to/backup/

# Bucket-specific backup
influx backup \
  --bucket mybucket \
  /path/to/backup/
```

**Restore:**

```bash
# Full restore
influx restore /path/to/backup/

# Bucket-specific restore
influx restore \
  --bucket mybucket \
  --new-bucket restored-bucket \
  /path/to/backup/
```

### 11.5 Security Best Practices

**1. Enable TLS/HTTPS:**

```toml
# config.toml
tls-cert = "/path/to/cert.pem"
tls-key = "/path/to/key.pem"
```

**2. Token Rotation:**

- Regularly rotate authentication tokens
- Use short-lived tokens for temporary access
- Revoke unused tokens

**3. Network Security:**

```bash
# Bind to specific interface
http-bind-address = "127.0.0.1:8086"

# Use firewall rules
sudo ufw allow from 192.168.1.0/24 to any port 8086
```

**4. Least Privilege:**

- Grant minimum required permissions
- Use read-only tokens for dashboards
- Separate tokens per application

---

## 12. Tools & Integrations

### 12.1 influx CLI

**Installation:**

```bash
# Download
wget https://dl.influxdata.com/influx-cli/releases/influx-cli-2.7.x-linux-amd64.tar.gz

# Extract
tar xvfz influx-cli-2.7.x-linux-amd64.tar.gz

# Move to PATH
sudo mv influx /usr/local/bin/
```

**Common Commands:**

```bash
# Setup connection
influx config create \
  --config-name myconfig \
  --host-url http://localhost:8086 \
  --org myorg \
  --token YOUR_AUTH_TOKEN \
  --active

# Write data
influx write -b mybucket "temp,loc=room1 value=25.5"

# Query data
influx query 'from(bucket:"mybucket") |> range(start:-1h)'

# List resources
influx bucket list
influx org list
influx task list
```

### 12.2 Telegraf

**Key Features:**

- 300+ input plugins
- Native InfluxDB 2.x support
- Low memory footprint
- Plugin-based architecture

**Popular Input Plugins:**

```toml
# System metrics
[[inputs.cpu]]
[[inputs.mem]]
[[inputs.disk]]
[[inputs.net]]

# Docker
[[inputs.docker]]
  endpoint = "unix:///var/run/docker.sock"

# PostgreSQL
[[inputs.postgresql]]
  address = "host=localhost user=postgres database=mydb"

# MQTT
[[inputs.mqtt_consumer]]
  servers = ["tcp://localhost:1883"]
  topics = ["sensors/#"]

# HTTP
[[inputs.http_response]]
  urls = ["https://api.example.com/health"]
```

### 12.3 Grafana Integration

**Data Source Configuration:**

1. Add InfluxDB data source
2. Query Language: Flux
3. URL: `http://localhost:8086`
4. Organization: `myorg`
5. Token: `YOUR_AUTH_TOKEN`
6. Default Bucket: `mybucket`

**Example Flux Query in Grafana:**

```flux
from(bucket: v.bucket)
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> filter(fn: (r) => r.location == "${location}")
  |> aggregateWindow(every: v.windowPeriod, fn: mean)
```

### 12.4 Client Libraries

**Supported Languages:**

- JavaScript/Node.js
- Python
- Go
- Java
- C#/.NET
- PHP
- Ruby
- R
- Arduino
- Dart

**Quick Start - Python:**

```python
from influxdb_client import InfluxDBClient

# Initialize client
client = InfluxDBClient(
    url="http://localhost:8086",
    token="YOUR_AUTH_TOKEN",
    org="myorg"
)

# Write API
write_api = client.write_api(write_options=SYNCHRONOUS)

# Query API
query_api = client.query_api()
```

### 12.5 Notebooks

**What are Notebooks?**

- Interactive data exploration environment
- Combine Flux queries with visualizations
- Markdown cells for documentation
- Shareable and exportable

**Use Cases:**

- Data exploration
- Ad-hoc analysis
- Query development
- Documentation

---

## 13. Best Practices

### 13.1 Schema Design

**1. Tag vs Field Decision:**

```
Use Tags for:
✓ Metadata (location, device_id, status)
✓ Values you'll filter by
✓ Categorical data
✓ Low cardinality values

Use Fields for:
✓ Measured values (temperature, pressure)
✓ Numeric calculations
✓ High cardinality values
✓ Unique identifiers (if needed)
```

**Example:**

```javascript
// Good schema
{
  measurement: "sensor_reading",
  tags: {
    location: "bangalore",      // Low cardinality
    device_type: "DHT22",        // Low cardinality
    building: "HQ"               // Low cardinality
  },
  fields: {
    temperature: 25.5,           // Numeric
    humidity: 60,                // Numeric
    sensor_id: "DHT22-12345"     // High cardinality, rarely queried
  }
}

// Bad schema (high cardinality tags)
{
  measurement: "sensor_reading",
  tags: {
    sensor_id: "DHT22-12345",    // High cardinality - DON'T DO THIS
    timestamp_str: "2024-..."    // Unnecessary - use _time
  },
  fields: {
    temperature: 25.5
  }
}
```

### 13.2 Cardinality Management

**Understanding Cardinality:**

```
Series Cardinality =
  Number of Measurements ×
  Number of Unique Tag Combinations
```

**Example:**

```
Measurement: temperature
Tags:
  - location: 10 values
  - device_type: 5 values
  - status: 3 values

Series Cardinality = 1 × (10 × 5 × 3) = 150 series ✓ Good

If you add sensor_id with 10,000 values:
Series Cardinality = 1 × (10 × 5 × 3 × 10,000) = 1,500,000 series ✗ Problem!
```

**Solutions:**

1. Move high-cardinality to fields
2. Use shorter retention periods
3. Aggregate data
4. Shard by time or tag

### 13.3 Write Performance

**Batch Writing:**

```javascript
// Good - Batch writes
const points = [];
for (let i = 0; i < 5000; i++) {
  points.push(createPoint(i));
}
writeApi.writePoints(points);

// Bad - Individual writes
for (let i = 0; i < 5000; i++) {
  writeApi.writePoint(createPoint(i)); // Slow!
}
```

**Optimal Batch Sizes:**

- 5,000 - 10,000 points per batch
- 1-5 MB per request
- Balance between throughput and memory

### 13.4 Query Performance

**1. Use Appropriate Time Ranges:**

```flux
// Good - Specific range
|> range(start: -1h)

// Bad - Unbounded range
|> range(start: 0)  // Scans all data!
```

**2. Filter Early:**

```flux
// Good - Filter before aggregation
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> filter(fn: (r) => r.location == "bangalore")
  |> mean()

// Bad - Filter after aggregation
from(bucket: "mybucket")
  |> range(start: -1h)
  |> mean()
  |> filter(fn: (r) => r.location == "bangalore")
```

**3. Use Tags for Filtering:**

```flux
// Fast - Tag filtering (indexed)
|> filter(fn: (r) => r.location == "bangalore")

// Slow - Field filtering (not indexed)
|> filter(fn: (r) => r._value > 25.0)
```

### 13.5 Data Retention

**Strategy:**

```
Raw Data:        7-30 days (high resolution)
Downsampled:     90-365 days (5-min averages)
Long-term:       Infinite (hourly/daily aggregates)
```

**Implementation:**

```bash
# Bucket structure
influx bucket create --name raw-data --retention 7d
influx bucket create --name hourly-data --retention 90d
influx bucket create --name daily-data --retention 0
```

**Downsampling Task:**

```flux
option task = {
  name: "downsample-hourly",
  every: 1h,
}

from(bucket: "raw-data")
  |> range(start: -task.every)
  |> filter(fn: (r) => r._measurement == "metrics")
  |> aggregateWindow(every: 5m, fn: mean)
  |> to(bucket: "hourly-data")
```

### 13.6 Error Handling

**Client Library Error Handling:**

```javascript
// Node.js example
try {
  writeApi.writePoints(points);
  await writeApi.close();
} catch (error) {
  if (error.statusCode === 429) {
    // Rate limit exceeded - wait and retry
    console.error("Rate limited, retrying...");
  } else if (error.statusCode === 401) {
    // Authentication failed
    console.error("Invalid token");
  } else {
    // Other errors
    console.error("Write failed:", error);
  }
}
```

---

## 14. Real-World Use Cases

### 14.1 IoT Sensor Monitoring

**Scenario**: Monitor temperature and humidity from 1000 sensors

**Schema:**

```javascript
{
  measurement: "environmental",
  tags: {
    building: "HQ",
    floor: "3",
    room: "301",
    sensor_type: "DHT22"
  },
  fields: {
    temperature: 23.5,
    humidity: 60,
    battery: 85
  }
}
```

**Write Pipeline:**

```javascript
// Sensor data collection
const sensor = {
  id: "DHT22-001",
  building: "HQ",
  floor: "3",
  room: "301",
};

// Write every 10 seconds
setInterval(() => {
  const reading = readSensor();

  const point = new Point("environmental")
    .tag("building", sensor.building)
    .tag("floor", sensor.floor)
    .tag("room", sensor.room)
    .tag("sensor_type", "DHT22")
    .floatField("temperature", reading.temp)
    .floatField("humidity", reading.humidity)
    .intField("battery", reading.battery);

  writeApi.writePoint(point);
}, 10000);
```

**Query - Anomaly Detection:**

```flux
from(bucket: "iot-data")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "environmental")
  |> filter(fn: (r) => r._field == "temperature")
  |> filter(fn: (r) => r._value < 15.0 or r._value > 30.0)
  |> aggregateWindow(every: 5m, fn: mean)
```

### 14.2 Application Performance Monitoring

**Scenario**: Monitor web application performance

**Schema:**

```javascript
{
  measurement: "http_requests",
  tags: {
    endpoint: "/api/users",
    method: "GET",
    status_code: "200",
    region: "us-west"
  },
  fields: {
    response_time_ms: 45,
    request_size_bytes: 1024,
    response_size_bytes: 2048
  }
}
```

**Middleware Integration:**

```javascript
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    const point = new Point("http_requests")
      .tag("endpoint", req.path)
      .tag("method", req.method)
      .tag("status_code", res.statusCode.toString())
      .tag("region", process.env.REGION)
      .floatField("response_time_ms", duration)
      .intField("request_size_bytes", req.socket.bytesRead)
      .intField("response_size_bytes", req.socket.bytesWritten);

    writeApi.writePoint(point);
  });

  next();
});
```

**Dashboard Queries:**

```flux
// Average response time
from(bucket: "app-metrics")
  |> range(start: v.timeRangeStart)
  |> filter(fn: (r) => r._measurement == "http_requests")
  |> filter(fn: (r) => r._field == "response_time_ms")
  |> aggregateWindow(every: 1m, fn: mean)

// Error rate
from(bucket: "app-metrics")
  |> range(start: v.timeRangeStart)
  |> filter(fn: (r) => r._measurement == "http_requests")
  |> filter(fn: (r) => r.status_code =~ /^5/)
  |> count()
```

### 14.3 Financial Trading Data

**Scenario**: Store and analyze stock market data

**Schema:**

```javascript
{
  measurement: "stock_price",
  tags: {
    symbol: "AAPL",
    exchange: "NASDAQ",
    market: "US"
  },
  fields: {
    open: 150.25,
    high: 152.10,
    low: 149.80,
    close: 151.50,
    volume: 1000000
  }
}
```

**Real-time Data Ingestion:**

```javascript
// WebSocket connection to market data
ws.on("message", (data) => {
  const tick = JSON.parse(data);

  const point = new Point("stock_price")
    .tag("symbol", tick.symbol)
    .tag("exchange", tick.exchange)
    .tag("market", "US")
    .floatField("price", tick.price)
    .intField("volume", tick.volume)
    .timestamp(new Date(tick.timestamp));

  writeApi.writePoint(point);
});
```

**Technical Analysis Queries:**

```flux
// Moving Average (20 periods)
from(bucket: "market-data")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "stock_price")
  |> filter(fn: (r) => r.symbol == "AAPL")
  |> filter(fn: (r) => r._field == "close")
  |> movingAverage(n: 20)

// Bollinger Bands
import "contrib/anaisdg/statsmodels"

from(bucket: "market-data")
  |> range(start: -30d)
  |> filter(fn: (r) => r.symbol == "AAPL")
  |> statsmodels.bollingerBands(n: 20, k: 2.0)
```

### 14.4 System Infrastructure Monitoring

**Scenario**: Monitor server infrastructure

**Telegraf Configuration:**

```toml
[[outputs.influxdb_v2]]
  urls = ["http://localhost:8086"]
  token = "$INFLUX_TOKEN"
  organization = "devops"
  bucket = "infrastructure"

[[inputs.cpu]]
  percpu = true
  totalcpu = true

[[inputs.mem]]

[[inputs.disk]]
  ignore_fs = ["tmpfs", "devtmpfs"]

[[inputs.docker]]
  endpoint = "unix:///var/run/docker.sock"

[[inputs.nginx]]
  urls = ["http://localhost/status"]
```

**Alerting Queries:**

```flux
// High CPU alert
from(bucket: "infrastructure")
  |> range(start: -5m)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> filter(fn: (r) => r._field == "usage_system")
  |> mean()
  |> filter(fn: (r) => r._value > 80.0)

// Low disk space alert
from(bucket: "infrastructure")
  |> range(start: -5m)
  |> filter(fn: (r) => r._measurement == "disk")
  |> filter(fn: (r) => r._field == "used_percent")
  |> mean()
  |> filter(fn: (r) => r._value > 90.0)
```

### 14.5 Energy Consumption Monitoring

**Scenario**: Monitor building energy usage

**Schema:**

```javascript
{
  measurement: "energy_consumption",
  tags: {
    building: "headquarters",
    floor: "2",
    meter_type: "electricity",
    circuit: "hvac"
  },
  fields: {
    power_kw: 12.5,
    current_a: 52.1,
    voltage_v: 240,
    power_factor: 0.95
  }
}
```

**Analysis Queries:**

```flux
// Total consumption by floor
from(bucket: "energy-data")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "energy_consumption")
  |> filter(fn: (r) => r._field == "power_kw")
  |> group(columns: ["floor"])
  |> sum()

// Peak demand time
from(bucket: "energy-data")
  |> range(start: -7d)
  |> filter(fn: (r) => r._measurement == "energy_consumption")
  |> filter(fn: (r) => r._field == "power_kw")
  |> aggregateWindow(every: 1h, fn: max)
  |> top(n: 10)
```

---

## Summary & Quick Reference

### Essential Commands

```bash
# Setup
influx setup

# Buckets
influx bucket create -n mybucket -r 30d
influx bucket list

# Write
influx write -b mybucket "temp,loc=room1 value=25.5"

# Query
influx query 'from(bucket:"mybucket") |> range(start:-1h)'

# Tasks
influx task list
influx task run -id TASK_ID

# Backup
influx backup /backup/path
```

### Flux Cheat Sheet

```flux
// Basic query
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temp")
  |> mean()

// Aggregation
|> aggregateWindow(every: 5m, fn: mean)

// Grouping
|> group(columns: ["location"])

// Pivoting
|> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")

// Join
join(tables: {a: table1, b: table2}, on: ["_time"])
```

### Line Protocol Format

```
measurement,tag1=value1,tag2=value2 field1=value1,field2=value2 timestamp
```

### Common Patterns

**IoT Data:**

```
sensor_reading,device_id=001,location=room1 temp=23.5,humidity=60 1609459200000000000
```

**Application Metrics:**

```
http_request,endpoint=/api,method=GET duration_ms=45,status_code=200i
```

**System Monitoring:**

```
cpu_usage,host=server1,core=0 user=45.2,system=12.5,idle=42.3
```

---

## Additional Resources

- **Official Documentation**: https://docs.influxdata.com/influxdb/v2/
- **Community Forums**: https://community.influxdata.com/
- **GitHub**: https://github.com/influxdata/influxdb
- **Flux Documentation**: https://docs.influxdata.com/flux/
- **University**: https://university.influxdata.com/

---

**End of InfluxDB 2.x Comprehensive Notes**

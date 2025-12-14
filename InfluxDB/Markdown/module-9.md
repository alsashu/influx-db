# Module 9: API Integrations, Tools, and Ecosystem

**Duration:** 45 minutes  
**Level:** Intermediate to Advanced

---

## Table of Contents

1. [Introduction](#introduction)
2. [InfluxDB HTTP API](#influxdb-http-api)
3. [Client Libraries](#client-libraries)
4. [InfluxDB Notebooks](#influxdb-notebooks)
5. [Integration Patterns](#integration-patterns)
6. [Automation and Orchestration](#automation-and-orchestration)
7. [Best Practices](#best-practices)
8. [Real-World Architecture Patterns](#real-world-architecture-patterns)
9. [Hands-On Labs](#hands-on-labs)

---

## Introduction

InfluxDB provides a rich ecosystem of APIs, tools, and integrations that enable seamless connectivity with various platforms, programming languages, and systems. This module explores how to leverage these capabilities effectively.

### Learning Objectives

- Master the InfluxDB HTTP API for programmatic access
- Implement client libraries in C#, Python, and Node.js
- Utilize InfluxDB notebooks for data analytics
- Design integration patterns for DevOps, IoT, and cloud systems
- Automate workflows using scripts and APIs
- Apply best practices and proven architecture patterns

---

## InfluxDB HTTP API

### API Overview

InfluxDB 2.x provides a comprehensive RESTful HTTP API for all operations.

**Base URL Structure:**

```
http(s)://[host]:[port]/api/v2/
```

### Authentication

All API requests require authentication using tokens:

```bash
# Header format
Authorization: Token YOUR_API_TOKEN
```

### Core API Endpoints

#### 1. Health Check

```bash
GET /health
```

**Example:**

```bash
curl -X GET "http://localhost:8086/health"
```

#### 2. Write Data

```bash
POST /api/v2/write?org=YOUR_ORG&bucket=YOUR_BUCKET&precision=s
```

**Example:**

```bash
curl -X POST "http://localhost:8086/api/v2/write?org=myorg&bucket=mybucket&precision=s" \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: text/plain" \
  --data-raw "
temperature,location=room1 value=23.5 1635724800
temperature,location=room2 value=22.1 1635724800
"
```

#### 3. Query Data

```bash
POST /api/v2/query?org=YOUR_ORG
```

**Example:**

```bash
curl -X POST "http://localhost:8086/api/v2/query?org=myorg" \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/vnd.flux" \
  --data 'from(bucket:"mybucket")
    |> range(start: -1h)
    |> filter(fn: (r) => r._measurement == "temperature")'
```

#### 4. Manage Buckets

```bash
# List buckets
GET /api/v2/buckets

# Create bucket
POST /api/v2/buckets

# Delete bucket
DELETE /api/v2/buckets/{bucketID}
```

#### 5. Manage Tasks

```bash
# List tasks
GET /api/v2/tasks

# Create task
POST /api/v2/tasks

# Run task
POST /api/v2/tasks/{taskID}/runs
```

### API Response Formats

**Success Response:**

```json
{
  "code": "success",
  "message": "Data written successfully"
}
```

**Error Response:**

```json
{
  "code": "invalid",
  "message": "unable to parse line protocol",
  "line": 1
}
```

---

## Client Libraries

### Python Client Library

#### Installation

```bash
pip install influxdb-client
```

#### Basic Connection

```python
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

# Initialize client
client = InfluxDBClient(
    url="http://localhost:8086",
    token="YOUR_TOKEN",
    org="myorg"
)

# Verify connection
health = client.health()
print(f"InfluxDB Health: {health.status}")
```

#### Writing Data

```python
# Get write API
write_api = client.write_api(write_options=SYNCHRONOUS)

# Write using Point object
point = Point("temperature") \
    .tag("location", "room1") \
    .tag("sensor_id", "sensor_001") \
    .field("value", 23.5) \
    .field("humidity", 45.2)

write_api.write(bucket="mybucket", record=point)

# Write using line protocol
line_protocol = "temperature,location=room2 value=22.1"
write_api.write(bucket="mybucket", record=line_protocol)

# Write batch data
points = []
for i in range(100):
    point = Point("cpu_usage") \
        .tag("host", f"server_{i%5}") \
        .field("usage", 50 + i % 30)
    points.append(point)

write_api.write(bucket="mybucket", record=points)
```

#### Querying Data

```python
# Get query API
query_api = client.query_api()

# Execute Flux query
query = '''
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> filter(fn: (r) => r._field == "value")
'''

result = query_api.query(query=query)

# Process results
for table in result:
    for record in table.records:
        print(f"Time: {record.get_time()}, "
              f"Location: {record.values.get('location')}, "
              f"Value: {record.get_value()}")
```

#### Using Parameters

```python
from influxdb_client import InfluxDBClient

query = '''
from(bucket: params.bucket)
  |> range(start: params.start)
  |> filter(fn: (r) => r._measurement == params.measurement)
'''

params = {
    "bucket": "mybucket",
    "start": "-24h",
    "measurement": "temperature"
}

result = query_api.query(query=query, params=params)
```

#### Advanced Features

```python
# Asynchronous writes
from influxdb_client.client.write_api import ASYNCHRONOUS

write_api = client.write_api(write_options=ASYNCHRONOUS)

def success_callback(conf, data):
    print(f"Written batch: {data}")

def error_callback(conf, data, exception):
    print(f"Error: {exception}")

write_api = client.write_api(
    write_options=ASYNCHRONOUS,
    success_callback=success_callback,
    error_callback=error_callback
)

# Write with callback
point = Point("temperature").field("value", 23.5)
write_api.write(bucket="mybucket", record=point)

# Data frame support
import pandas as pd

df = pd.DataFrame({
    'time': pd.date_range('2024-01-01', periods=100, freq='1min'),
    'temperature': range(100),
    'humidity': range(50, 150)
})

write_api.write(
    bucket="mybucket",
    record=df,
    data_frame_measurement_name='sensor_data',
    data_frame_tag_columns=['location']
)
```

### C# Client Library

#### Installation

```bash
dotnet add package InfluxDB.Client
```

#### Basic Implementation

```csharp
using InfluxDB.Client;
using InfluxDB.Client.Api.Domain;
using InfluxDB.Client.Writes;

// Initialize client
var client = new InfluxDBClient(
    "http://localhost:8086",
    "YOUR_TOKEN"
);

// Write data
using (var writeApi = client.GetWriteApi())
{
    // Using Point
    var point = PointData
        .Measurement("temperature")
        .Tag("location", "room1")
        .Field("value", 23.5)
        .Timestamp(DateTime.UtcNow, WritePrecision.Ns);

    writeApi.WritePoint(point, "mybucket", "myorg");

    // Using POCO (Plain Old CLR Object)
    var sensorData = new SensorReading
    {
        Location = "room2",
        Value = 22.1,
        Time = DateTime.UtcNow
    };

    writeApi.WriteMeasurement(sensorData, WritePrecision.Ns, "mybucket", "myorg");
}

// Query data
var query = @"
    from(bucket: ""mybucket"")
        |> range(start: -1h)
        |> filter(fn: (r) => r._measurement == ""temperature"")
";

var queryApi = client.GetQueryApi();
var tables = await queryApi.QueryAsync(query, "myorg");

foreach (var table in tables)
{
    foreach (var record in table.Records)
    {
        Console.WriteLine($"{record.GetTime()}: {record.GetValueByKey("_value")}");
    }
}
```

#### POCO Model

```csharp
using InfluxDB.Client.Core;

[Measurement("temperature")]
public class SensorReading
{
    [Column("location", IsTag = true)]
    public string Location { get; set; }

    [Column("value")]
    public double Value { get; set; }

    [Column(IsTimestamp = true)]
    public DateTime Time { get; set; }
}
```

#### Async Operations

```csharp
// Async write
using (var writeApi = client.GetWriteApiAsync())
{
    var points = new List<PointData>();

    for (int i = 0; i < 1000; i++)
    {
        var point = PointData
            .Measurement("cpu_usage")
            .Tag("host", $"server_{i % 5}")
            .Field("usage", 50 + i % 30);
        points.Add(point);
    }

    await writeApi.WritePointsAsync(points, "mybucket", "myorg");
}

// Async query
var fluxRecords = await queryApi.QueryAsync(query, "myorg");
```

### Node.js Client Library

#### Installation

```bash
npm install @influxdata/influxdb-client
```

#### Basic Usage

```javascript
const { InfluxDB, Point } = require("@influxdata/influxdb-client");

// Initialize client
const url = "http://localhost:8086";
const token = "YOUR_TOKEN";
const org = "myorg";
const bucket = "mybucket";

const client = new InfluxDB({ url, token });

// Write data
const writeApi = client.getWriteApi(org, bucket);
writeApi.useDefaultTags({ environment: "production" });

// Write using Point
const point = new Point("temperature")
  .tag("location", "room1")
  .floatField("value", 23.5)
  .timestamp(new Date());

writeApi.writePoint(point);

// Flush and close
await writeApi.close();

// Query data
const queryApi = client.getQueryApi(org);

const query = `
    from(bucket: "${bucket}")
        |> range(start: -1h)
        |> filter(fn: (r) => r._measurement == "temperature")
`;

const data = [];
await queryApi.queryRows(query, {
  next(row, tableMeta) {
    const o = tableMeta.toObject(row);
    data.push(o);
  },
  error(error) {
    console.error("Query error:", error);
  },
  complete() {
    console.log("Query complete");
    console.log(data);
  },
});
```

#### Advanced Patterns

```javascript
// Batch writing
const {
  InfluxDB,
  Point,
  WritePrecision,
} = require("@influxdata/influxdb-client");

const writeApi = client.getWriteApi(org, bucket, "ns", {
  batchSize: 1000,
  flushInterval: 1000,
});

for (let i = 0; i < 10000; i++) {
  const point = new Point("sensor_data")
    .tag("sensor_id", `sensor_${i % 100}`)
    .floatField("temperature", 20 + Math.random() * 10)
    .floatField("humidity", 40 + Math.random() * 20)
    .timestamp(Date.now() + i * 1000);

  writeApi.writePoint(point);
}

await writeApi.close();

// Parameterized queries
const { FluxParameterLike } = require("@influxdata/influxdb-client");

const query = `
    from(bucket: params.bucket)
        |> range(start: params.start)
        |> filter(fn: (r) => r._measurement == params.measurement)
`;

const params = {
  bucket: "mybucket",
  start: "-24h",
  measurement: "temperature",
};

await queryApi.queryRows(query, {
  params,
  next(row, tableMeta) {
    console.log(tableMeta.toObject(row));
  },
});
```

---

## InfluxDB Notebooks

### What are Notebooks?

InfluxDB notebooks provide an interactive environment for data exploration, analysis, and visualization directly within the InfluxDB UI.

### Key Features

1. **Interactive Data Exploration**
2. **Visualization Building**
3. **Data Transformation**
4. **Collaborative Analysis**
5. **Export to Dashboards**

### Creating a Notebook

#### Step 1: Data Source

```flux
// Cell 1: Load data
from(bucket: "system_metrics")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "cpu")
```

#### Step 2: Data Transformation

```flux
// Cell 2: Calculate averages
from(bucket: "system_metrics")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> aggregateWindow(every: 1h, fn: mean)
```

#### Step 3: Visualization

```flux
// Cell 3: Visualize trends
from(bucket: "system_metrics")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> aggregateWindow(every: 1h, fn: mean)
  |> yield(name: "cpu_hourly_avg")
```

### Advanced Notebook Patterns

#### Multi-Source Analysis

```flux
// Combine multiple data sources
cpu_data = from(bucket: "system_metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu")

memory_data = from(bucket: "system_metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "memory")

join(
  tables: {cpu: cpu_data, mem: memory_data},
  on: ["_time", "host"]
)
```

#### Statistical Analysis

```flux
from(bucket: "sensors")
  |> range(start: -7d)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> aggregateWindow(every: 1d, fn: mean)
  |> movingAverage(n: 3)
  |> stddev()
```

---

## Integration Patterns

### DevOps Integration

#### CI/CD Pipeline Integration

**GitHub Actions Example:**

```yaml
name: InfluxDB Metrics

on:
  push:
    branches: [main]

jobs:
  report-metrics:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Send build metrics
        run: |
          curl -X POST "${{ secrets.INFLUX_URL }}/api/v2/write?org=${{ secrets.INFLUX_ORG }}&bucket=ci_metrics" \
            -H "Authorization: Token ${{ secrets.INFLUX_TOKEN }}" \
            -H "Content-Type: text/plain" \
            --data-raw "
          build,repo=${{ github.repository }},branch=${{ github.ref }} duration=${{ job.duration }},status=1
          "
```

#### Jenkins Integration

```groovy
pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                script {
                    def startTime = System.currentTimeMillis()
                    // Build steps
                    def duration = System.currentTimeMillis() - startTime

                    sh """
                    curl -X POST "${INFLUX_URL}/api/v2/write?org=${INFLUX_ORG}&bucket=jenkins_metrics" \\
                      -H "Authorization: Token ${INFLUX_TOKEN}" \\
                      -H "Content-Type: text/plain" \\
                      --data-raw "build,job=${JOB_NAME},build=${BUILD_NUMBER} duration=${duration},status=1"
                    """
                }
            }
        }
    }
}
```

#### Docker Integration

```python
import docker
from influxdb_client import InfluxDBClient, Point

# Connect to Docker
docker_client = docker.from_env()

# Connect to InfluxDB
influx_client = InfluxDBClient(url="http://localhost:8086", token="YOUR_TOKEN", org="myorg")
write_api = influx_client.write_api()

# Monitor containers
for container in docker_client.containers.list():
    stats = container.stats(stream=False)

    point = Point("docker_stats") \
        .tag("container", container.name) \
        .tag("image", container.image.tags[0]) \
        .field("cpu_percent", stats['cpu_stats']['cpu_usage']['total_usage']) \
        .field("memory_usage", stats['memory_stats']['usage'])

    write_api.write(bucket="docker_metrics", record=point)
```

### IoT Integration

#### MQTT to InfluxDB Bridge

```python
import paho.mqtt.client as mqtt
from influxdb_client import InfluxDBClient, Point
import json

# InfluxDB setup
influx_client = InfluxDBClient(url="http://localhost:8086", token="YOUR_TOKEN", org="myorg")
write_api = influx_client.write_api()

# MQTT callback
def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload)

        point = Point("iot_sensor") \
            .tag("device_id", payload.get("device_id")) \
            .tag("location", payload.get("location")) \
            .field("temperature", float(payload.get("temperature"))) \
            .field("humidity", float(payload.get("humidity")))

        write_api.write(bucket="iot_data", record=point)
        print(f"Written: {payload}")
    except Exception as e:
        print(f"Error: {e}")

# MQTT setup
mqtt_client = mqtt.Client()
mqtt_client.on_message = on_message
mqtt_client.connect("mqtt.example.com", 1883, 60)
mqtt_client.subscribe("sensors/#")
mqtt_client.loop_forever()
```

#### Arduino/ESP32 Integration

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* influxUrl = "http://influxdb-host:8086/api/v2/write?org=myorg&bucket=iot_data";
const char* influxToken = "YOUR_TOKEN";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
}

void sendToInfluxDB(float temperature, float humidity) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin(influxUrl);
    http.addHeader("Authorization", String("Token ") + influxToken);
    http.addHeader("Content-Type", "text/plain");

    String lineProtocol = "environment,device=esp32 temperature=" + String(temperature) +
                          ",humidity=" + String(humidity);

    int httpCode = http.POST(lineProtocol);

    if (httpCode > 0) {
      Serial.printf("HTTP Code: %d\n", httpCode);
    }

    http.end();
  }
}

void loop() {
  float temp = readTemperature();
  float hum = readHumidity();

  sendToInfluxDB(temp, hum);
  delay(60000); // Send every minute
}
```

### Cloud Platform Integration

#### AWS Lambda Integration

```python
import json
import boto3
from influxdb_client import InfluxDBClient, Point
import os

def lambda_handler(event, context):
    # InfluxDB configuration from environment variables
    influx_client = InfluxDBClient(
        url=os.environ['INFLUX_URL'],
        token=os.environ['INFLUX_TOKEN'],
        org=os.environ['INFLUX_ORG']
    )

    write_api = influx_client.write_api()

    # Process CloudWatch events
    for record in event['Records']:
        message = json.loads(record['body'])

        point = Point("aws_lambda") \
            .tag("function", context.function_name) \
            .tag("region", os.environ['AWS_REGION']) \
            .field("duration", context.get_remaining_time_in_millis()) \
            .field("memory_used", context.memory_limit_in_mb)

        write_api.write(bucket="aws_metrics", record=point)

    return {
        'statusCode': 200,
        'body': json.dumps('Metrics sent to InfluxDB')
    }
```

#### Azure Functions Integration

```csharp
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using InfluxDB.Client;
using InfluxDB.Client.Writes;

public static class InfluxMetricsFunction
{
    [FunctionName("SendMetrics")]
    public static async Task Run(
        [TimerTrigger("0 */5 * * * *")] TimerInfo myTimer,
        ILogger log)
    {
        var client = new InfluxDBClient(
            Environment.GetEnvironmentVariable("INFLUX_URL"),
            Environment.GetEnvironmentVariable("INFLUX_TOKEN")
        );

        using var writeApi = client.GetWriteApiAsync();

        var point = PointData
            .Measurement("azure_function")
            .Tag("function", "SendMetrics")
            .Field("execution_count", 1)
            .Timestamp(DateTime.UtcNow, WritePrecision.Ns);

        await writeApi.WritePointAsync(point, "mybucket", "myorg");

        log.LogInformation($"Metrics sent at: {DateTime.Now}");
    }
}
```

---

## Automation and Orchestration

### Python Automation Scripts

#### Automated Data Collection

```python
import schedule
import time
from influxdb_client import InfluxDBClient, Point
import psutil
import requests

class SystemMonitor:
    def __init__(self, url, token, org, bucket):
        self.client = InfluxDBClient(url=url, token=token, org=org)
        self.write_api = self.client.write_api()
        self.bucket = bucket

    def collect_system_metrics(self):
        # CPU metrics
        cpu_point = Point("system") \
            .tag("metric_type", "cpu") \
            .field("usage_percent", psutil.cpu_percent(interval=1))

        # Memory metrics
        mem = psutil.virtual_memory()
        mem_point = Point("system") \
            .tag("metric_type", "memory") \
            .field("usage_percent", mem.percent) \
            .field("available_mb", mem.available / 1024 / 1024)

        # Disk metrics
        disk = psutil.disk_usage('/')
        disk_point = Point("system") \
            .tag("metric_type", "disk") \
            .field("usage_percent", disk.percent) \
            .field("free_gb", disk.free / 1024 / 1024 / 1024)

        # Write all metrics
        self.write_api.write(bucket=self.bucket, record=[cpu_point, mem_point, disk_point])
        print(f"Metrics collected at {time.strftime('%Y-%m-%d %H:%M:%S')}")

    def start_monitoring(self, interval_seconds=60):
        schedule.every(interval_seconds).seconds.do(self.collect_system_metrics)

        print(f"Starting system monitoring (interval: {interval_seconds}s)")
        while True:
            schedule.run_pending()
            time.sleep(1)

# Usage
if __name__ == "__main__":
    monitor = SystemMonitor(
        url="http://localhost:8086",
        token="YOUR_TOKEN",
        org="myorg",
        bucket="system_metrics"
    )
    monitor.start_monitoring(interval_seconds=30)
```

#### Data Aggregation Pipeline

```python
from influxdb_client import InfluxDBClient
from datetime import datetime, timedelta

class DataAggregator:
    def __init__(self, url, token, org):
        self.client = InfluxDBClient(url=url, token=token, org=org)
        self.query_api = self.client.query_api()
        self.write_api = self.client.write_api()

    def aggregate_hourly_data(self, source_bucket, dest_bucket):
        query = f'''
        from(bucket: "{source_bucket}")
          |> range(start: -1h)
          |> filter(fn: (r) => r._measurement == "raw_data")
          |> aggregateWindow(every: 1h, fn: mean)
          |> set(key: "_measurement", value: "hourly_aggregated")
        '''

        result = self.query_api.query(query)

        points = []
        for table in result:
            for record in table.records:
                point = Point("hourly_aggregated") \
                    .tag("source", "aggregation_pipeline") \
                    .field(record.get_field(), record.get_value()) \
                    .time(record.get_time())
                points.append(point)

        if points:
            self.write_api.write(bucket=dest_bucket, record=points)
            print(f"Aggregated {len(points)} points")

    def run_pipeline(self):
        schedule.every().hour.at(":05").do(
            self.aggregate_hourly_data,
            source_bucket="raw_metrics",
            dest_bucket="aggregated_metrics"
        )

        while True:
            schedule.run_pending()
            time.sleep(60)
```

### Task Orchestration

#### Complex Task Definition

```flux
option task = {
    name: "Complex Data Processing",
    every: 1h,
    offset: 5m
}

// Import necessary packages
import "math"
import "experimental"

// Step 1: Load and filter data
raw_data = from(bucket: "raw_metrics")
    |> range(start: -1h)
    |> filter(fn: (r) => r._measurement == "sensor_data")

// Step 2: Calculate statistics
stats = raw_data
    |> aggregateWindow(every: 10m, fn: mean)
    |> set(key: "_measurement", value: "sensor_stats")

// Step 3: Detect anomalies
anomalies = raw_data
    |> aggregateWindow(every: 1m, fn: mean)
    |> map(fn: (r) => ({
        r with
        zscore: (r._value - mean) / stddev
    }))
    |> filter(fn: (r) => math.abs(x: r.zscore) > 3.0)
    |> set(key: "_measurement", value: "anomalies")

// Step 4: Write results to different buckets
stats
    |> to(bucket: "processed_metrics", org: "myorg")

anomalies
    |> to(bucket: "alerts", org: "myorg")

// Step 5: Send alerts if anomalies detected
anomalies
    |> experimental.to(
        url: "https://webhook.site/your-webhook",
        method: "POST"
    )
```

---

## Best Practices

### 1. Connection Management

**Do:**

```python
# Reuse client connections
class InfluxDBManager:
    _instance = None
    _client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._client = InfluxDBClient(
                url="http://localhost:8086",
                token="YOUR_TOKEN",
                org="myorg"
            )
        return cls._instance

    @property
    def client(self):
        return self._client
```

**Don't:**

```python
# Creating new connections repeatedly
def write_data(data):
    client = InfluxDBClient(url="...", token="...")  # Bad!
    write_api = client.write_api()
    write_api.write(bucket="mybucket", record=data)
    client.close()
```

### 2. Batch Writing

**Do:**

```python
# Batch writes for efficiency
write_api = client.get_write_api(write_options=WriteOptions(
    batch_size=1000,
    flush_interval=1000,
    retry_interval=5000
))

for i in range(10000):
    point = Point("measurement").field("value", i)
    write_api.write(bucket="mybucket", record=point)

write_api.close()  # Ensures all data is flushed
```

**Don't:**

```python
# Individual writes
for i in range(10000):
    point = Point("measurement").field("value", i)
    write_api.write(bucket="mybucket", record=point)
    write_api.flush()  # Bad! Too frequent
```

### 3. Error Handling

**Comprehensive Error Handling:**

```python
from influxdb_client.rest import ApiException
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def write_with_retry(write_api, bucket, record, max_retries=3):
    for attempt in range(max_retries):
        try:
            write_api.write(bucket=bucket, record=record)
            logger.info("Write successful")
            return True
        except ApiException as e:
            if e.status == 429:  # Rate limit
                wait_time = 2 ** attempt
                logger.warning(f"Rate limited. Waiting {wait_time}s")
                time.sleep(wait_time)
            elif e.status >= 500:  # Server error
                logger.error(f"Server error: {e}")
                time.sleep(2 ** attempt)
            else:
                logger.error(f"Client error: {e}")
                return False
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return False

    return False
```

### 4. Query Optimization

**Optimized Queries:**

```flux
// Use specific time ranges
from(bucket: "mybucket")
  |> range(start: -1h, stop: now())  // Good: specific range
  |> filter(fn: (r) => r._measurement == "cpu")
  |> filter(fn: (r) => r.host == "server1")  // Filter early
  |> aggregateWindow(every: 1m, fn: mean)

// Avoid
from(bucket: "mybucket")
  |> range(start: -30d)  // Bad: too broad
  |> aggregateWindow(every: 1m, fn: mean)
  |> filter(fn: (r) => r.host == "server1")  // Filter late
```

### 5. Security Best Practices

```python
# Store credentials securely
import os
from dotenv import load_dotenv

load_dotenv()

client = InfluxDBClient(
    url=os.getenv('INFLUX_URL'),
    token=os.getenv('INFLUX_TOKEN'),
    org=os.getenv('INFLUX_ORG')
)

# Use appropriate token permissions
# Read-only token for queries
# Write-only token for data ingestion
# Admin token only for management operations
```

---

## Real-World Architecture Patterns

### Pattern 1: Multi-Tier Monitoring

```
┌─────────────┐
│  Data Layer │
└──────┬──────┘
       │
┌──────▼────────────────────────────────┐
│  InfluxDB (Raw Metrics)               │
│  - 7 days retention                   │
│  - High-frequency data                │
└──────┬────────────────────────────────┘
       │
       │ Downsampling Task (every 1h)
       │
┌──────▼────────────────────────────────┐
│  InfluxDB (Aggregated Metrics)        │
│  - 90 days retention                  │
│  - Hourly averages                    │
└──────┬────────────────────────────────┘
       │
       │ Downsampling Task (every 1d)
       │
┌──────▼────────────────────────────────┐
│  InfluxDB (Historical Metrics)        │
│  - 2 years retention                  │
│  - Daily summaries                    │
└───────────────────────────────────────┘
```

**Implementation:**

```flux
// Hourly downsampling task
option task = {name: "Hourly Downsampling", every: 1h}

from(bucket: "raw_metrics")
  |> range(start: -1h)
  |> aggregateWindow(every: 1h, fn: mean)
  |> to(bucket: "aggregated_metrics", org: "myorg")

// Daily downsampling task
option task = {name: "Daily Downsampling", every: 1d}

from(bucket: "aggregated_metrics")
  |> range(start: -1d)
  |> aggregateWindow(every: 1d, fn: mean)
  |> to(bucket: "historical_metrics", org: "myorg")
```

### Pattern 2: Edge-to-Cloud Pipeline

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ IoT Devices │────▶│ Edge Gateway│────▶│  Cloud DB   │
│  (Sensors)  │     │  (InfluxDB) │     │  (InfluxDB) │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Local Analytics
                    └──────────────┘
```

**Edge Gateway Setup:**

```python
# edge_gateway.py
from influxdb_client import InfluxDBClient
import time

class EdgeGateway:
    def __init__(self):
        # Local InfluxDB
        self.local_client = InfluxDBClient(
            url="http://localhost:8086",
            token="LOCAL_TOKEN",
            org="edge"
        )

        # Cloud InfluxDB
        self.cloud_client = InfluxDBClient(
            url="https://cloud.influxdata.com",
            token="CLOUD_TOKEN",
            org="myorg"
        )

        self.buffer = []
        self.buffer_size = 1000

    def ingest_sensor_data(self, data):
        # Write to local database
        local_write = self.local_client.write_api()
        local_write.write(bucket="local_sensors", record=data)

        # Buffer for cloud sync
        self.buffer.append(data)

        if len(self.buffer) >= self.buffer_size:
            self.sync_to_cloud()

    def sync_to_cloud(self):
        if not self.buffer:
            return

        try:
            cloud_write = self.cloud_client.write_api()
            cloud_write.write(bucket="edge_sensors", record=self.buffer)
            self.buffer.clear()
            print(f"Synced {len(self.buffer)} points to cloud")
        except Exception as e:
            print(f"Cloud sync failed: {e}")
```

### Pattern 3: Multi-Region Setup

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Region: US-East │    │  Region: EU-West │    │  Region: Asia    │
│  InfluxDB Node   │    │  InfluxDB Node   │    │  InfluxDB Node   │
└────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
         │                       │                        │
         └───────────────────────┼────────────────────────┘
                                 │
                          ┌──────▼─────┐
                          │  Aggregator │
                          │   Service   │
                          └─────────────┘
```

**Multi-Region Writer:**

```python
class MultiRegionWriter:
    def __init__(self):
        self.regions = {
            'us-east': InfluxDBClient(url="https://us-east.influx.com", token="TOKEN1", org="myorg"),
            'eu-west': InfluxDBClient(url="https://eu-west.influx.com", token="TOKEN2", org="myorg"),
            'asia': InfluxDBClient(url="https://asia.influx.com", token="TOKEN3", org="myorg")
        }

    def write_to_nearest_region(self, data, user_region):
        client = self.regions.get(user_region)
        if client:
            write_api = client.write_api()
            write_api.write(bucket="metrics", record=data)
        else:
            # Fallback to default region
            self.write_to_all_regions(data)

    def write_to_all_regions(self, data):
        for region, client in self.regions.items():
            try:
                write_api = client.write_api()
                write_api.write(bucket="metrics", record=data)
            except Exception as e:
                print(f"Failed to write to {region}: {e}")
```

### Pattern 4: Microservices Monitoring

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Service A  │  │  Service B  │  │  Service C  │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                 ┌──────▼──────┐
                 │  Telegraf   │
                 │ (Collector) │
                 └──────┬──────┘
                        │
                 ┌──────▼──────┐
                 │  InfluxDB   │
                 └──────┬──────┘
                        │
                 ┌──────▼──────┐
                 │   Grafana   │
                 └─────────────┘
```

**Service Instrumentation:**

```python
# service_monitor.py
from influxdb_client import InfluxDBClient, Point
from functools import wraps
import time

class ServiceMonitor:
    def __init__(self, service_name):
        self.service_name = service_name
        self.client = InfluxDBClient(url="http://localhost:8086", token="TOKEN", org="myorg")
        self.write_api = self.client.write_api()

    def track_execution(self, func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            success = True
            error = None

            try:
                result = func(*args, **kwargs)
                return result
            except Exception as e:
                success = False
                error = str(e)
                raise
            finally:
                duration = time.time() - start_time

                point = Point("service_metrics") \
                    .tag("service", self.service_name) \
                    .tag("function", func.__name__) \
                    .tag("success", str(success)) \
                    .field("duration_ms", duration * 1000)

                if error:
                    point = point.field("error", error)

                self.write_api.write(bucket="service_metrics", record=point)

        return wrapper

# Usage
monitor = ServiceMonitor("payment-service")

@monitor.track_execution
def process_payment(amount, customer_id):
    # Payment processing logic
    time.sleep(0.5)
    return {"status": "success", "transaction_id": "12345"}
```

---

## Hands-On Labs

### Lab 1: Building a Complete Monitoring System

**Objective:** Create an end-to-end monitoring solution using Python

```python
# complete_monitoring_system.py
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
import psutil
import requests
import time
import schedule

class MonitoringSystem:
    def __init__(self, influx_url, token, org, bucket):
        self.client = InfluxDBClient(url=influx_url, token=token, org=org)
        self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
        self.query_api = self.client.query_api()
        self.bucket = bucket

    # System metrics
    def collect_system_metrics(self):
        points = []

        # CPU
        cpu_percent = psutil.cpu_percent(interval=1, percpu=False)
        points.append(
            Point("system")
            .tag("type", "cpu")
            .field("usage", cpu_percent)
        )

        # Memory
        mem = psutil.virtual_memory()
        points.append(
            Point("system")
            .tag("type", "memory")
            .field("usage_percent", mem.percent)
            .field("available_gb", mem.available / (1024**3))
        )

        # Disk
        disk = psutil.disk_usage('/')
        points.append(
            Point("system")
            .tag("type", "disk")
            .field("usage_percent", disk.percent)
            .field("free_gb", disk.free / (1024**3))
        )

        # Network
        net = psutil.net_io_counters()
        points.append(
            Point("system")
            .tag("type", "network")
            .field("bytes_sent", net.bytes_sent)
            .field("bytes_recv", net.bytes_recv)
        )

        self.write_api.write(bucket=self.bucket, record=points)
        print(f"✓ Collected {len(points)} system metrics")

    # Application health check
    def check_application_health(self, urls):
        for url in urls:
            try:
                start_time = time.time()
                response = requests.get(url, timeout=5)
                duration = (time.time() - start_time) * 1000

                point = Point("health_check") \
                    .tag("url", url) \
                    .field("response_time_ms", duration) \
                    .field("status_code", response.status_code) \
                    .field("available", 1 if response.status_code == 200 else 0)

                self.write_api.write(bucket=self.bucket, record=point)
                print(f"✓ Health check: {url} - {response.status_code} ({duration:.2f}ms)")
            except Exception as e:
                point = Point("health_check") \
                    .tag("url", url) \
                    .field("available", 0) \
                    .field("error", str(e))

                self.write_api.write(bucket=self.bucket, record=point)
                print(f"✗ Health check failed: {url} - {str(e)}")

    # Query and analyze metrics
    def analyze_metrics(self):
        query = f'''
        from(bucket: "{self.bucket}")
          |> range(start: -1h)
          |> filter(fn: (r) => r._measurement == "system")
          |> filter(fn: (r) => r.type == "cpu")
          |> mean()
        '''

        result = self.query_api.query(query)

        for table in result:
            for record in table.records:
                avg_cpu = record.get_value()
                print(f"📊 Average CPU (1h): {avg_cpu:.2f}%")

                if avg_cpu > 80:
                    self.send_alert("High CPU usage detected", avg_cpu)

    def send_alert(self, message, value):
        alert_point = Point("alerts") \
            .tag("severity", "warning") \
            .field("message", message) \
            .field("value", value)

        self.write_api.write(bucket=self.bucket, record=alert_point)
        print(f"🚨 ALERT: {message} (value: {value})")

    def start(self):
        # Schedule tasks
        schedule.every(30).seconds.do(self.collect_system_metrics)
        schedule.every(1).minutes.do(self.check_application_health,
                                      urls=["http://localhost:8080", "https://example.com"])
        schedule.every(5).minutes.do(self.analyze_metrics)

        print("🚀 Monitoring system started")
        print("=" * 50)

        while True:
            schedule.run_pending()
            time.sleep(1)

# Run the system
if __name__ == "__main__":
    monitor = MonitoringSystem(
        influx_url="http://localhost:8086",
        token="YOUR_TOKEN",
        org="myorg",
        bucket="monitoring"
    )
    monitor.start()
```

### Lab 2: IoT Data Pipeline

**Objective:** Build an IoT data collection and processing pipeline

```python
# iot_pipeline.py
from influxdb_client import InfluxDBClient, Point
import random
import time
from datetime import datetime

class IoTSimulator:
    def __init__(self, device_id, location):
        self.device_id = device_id
        self.location = location

    def generate_reading(self):
        return {
            'device_id': self.device_id,
            'location': self.location,
            'temperature': round(random.uniform(18.0, 30.0), 2),
            'humidity': round(random.uniform(30.0, 70.0), 2),
            'pressure': round(random.uniform(980.0, 1020.0), 2),
            'battery': round(random.uniform(20.0, 100.0), 2)
        }

class IoTPipeline:
    def __init__(self, influx_url, token, org, bucket):
        self.client = InfluxDBClient(url=influx_url, token=token, org=org)
        self.write_api = self.client.write_api()
        self.bucket = bucket

        # Create simulators
        self.devices = [
            IoTSimulator("device_001", "warehouse_a"),
            IoTSimulator("device_002", "warehouse_b"),
            IoTSimulator("device_003", "office_floor1"),
            IoTSimulator("device_004", "office_floor2"),
            IoTSimulator("device_005", "datacenter")
        ]

    def collect_and_send(self):
        points = []

        for device in self.devices:
            reading = device.generate_reading()

            point = Point("environment") \
                .tag("device_id", reading['device_id']) \
                .tag("location", reading['location']) \
                .field("temperature", reading['temperature']) \
                .field("humidity", reading['humidity']) \
                .field("pressure", reading['pressure']) \
                .field("battery", reading['battery'])

            points.append(point)

        self.write_api.write(bucket=self.bucket, record=points)
        print(f"📡 Collected data from {len(points)} devices at {datetime.now()}")

    def run(self, interval=10):
        print("🌐 IoT Pipeline started")
        print(f"Collecting from {len(self.devices)} devices every {interval} seconds")
        print("=" * 60)

        while True:
            self.collect_and_send()
            time.sleep(interval)

# Run the pipeline
if __name__ == "__main__":
    pipeline = IoTPipeline(
        influx_url="http://localhost:8086",
        token="YOUR_TOKEN",
        org="myorg",
        bucket="iot_data"
    )
    pipeline.run(interval=10)
```

---

## Summary

This module covered:

✅ **HTTP API:** RESTful endpoints for all operations  
✅ **Client Libraries:** Python, C#, and Node.js implementations  
✅ **Notebooks:** Interactive data exploration and analysis  
✅ **Integration Patterns:** DevOps, IoT, and cloud platforms  
✅ **Automation:** Scripts, tasks, and orchestration  
✅ **Best Practices:** Connection management, error handling, security  
✅ **Architecture Patterns:** Multi-tier, edge-to-cloud, microservices

## Next Steps

1. Experiment with different client libraries
2. Build custom integrations for your use case
3. Create automated pipelines and workflows
4. Implement monitoring for production systems
5. Explore advanced architecture patterns

---

## Additional Resources

- [InfluxDB API Documentation](https://docs.influxdata.com/influxdb/v2/api/)
- [Client Libraries GitHub](https://github.com/influxdata/)
- [Community Forums](https://community.influxdata.com/)
- [Integration Examples](https://github.com/influxdata/community-templates)

---

**End of Module 9**

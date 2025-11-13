# Writing and Ingesting Data in InfluxDB

## 60-Minute Comprehensive Course

---

## Course Overview

**Duration:** 60 minutes  
**Level:** Intermediate  
**Prerequisites:** Basic understanding of InfluxDB, time-series concepts, and command-line tools

### Learning Objectives

By the end of this course, you will be able to:

- ✅ Choose the appropriate data ingestion method for your use case
- ✅ Write data efficiently using line protocol and batch operations
- ✅ Configure and use Telegraf for automated data collection
- ✅ Handle high-velocity data streams with optimal performance
- ✅ Implement production-ready write pipelines with error handling

---

## Table of Contents

1. [Methods of Data Ingestion (15 mins)](#1-methods-of-data-ingestion)
2. [Batch Writes and Precision Handling (15 mins)](#2-batch-writes-and-precision-handling)
3. [Using Telegraf for Automated Ingestion (15 mins)](#3-using-telegraf-for-automated-ingestion)
4. [High-Velocity Data Streams & Best Practices (15 mins)](#4-high-velocity-data-streams--best-practices)

---

## 1. Methods of Data Ingestion

### 1.1 Overview of Ingestion Methods

InfluxDB supports multiple methods for writing data, each optimized for different use cases:

| Method                   | Use Case                    | Performance | Complexity |
| ------------------------ | --------------------------- | ----------- | ---------- |
| **Line Protocol + curl** | Testing, debugging, scripts | Medium      | Low        |
| **HTTP API**             | Custom integrations         | High        | Medium     |
| **Client Libraries**     | Application integration     | High        | Low        |
| **Telegraf**             | Automated collection        | Very High   | Low        |

### 1.2 Line Protocol Format

**Line Protocol** is InfluxDB's text-based format for writing data points.

#### Syntax

```
<measurement>[,<tag_key>=<tag_value>[,<tag_key>=<tag_value>]] <field_key>=<field_value>[,<field_key>=<field_value>] [<timestamp>]
```

#### Components

- **Measurement** (required): Name of the measurement
- **Tags** (optional): Indexed metadata for filtering and grouping
- **Fields** (required): Actual data values (at least one required)
- **Timestamp** (optional): Nanosecond-precision Unix timestamp

#### Examples

**Basic Example:**

```
temperature,location=room1 value=22.5
```

**With Multiple Tags and Fields:**

```
weather,location=us-midwest,season=summer temperature=82,humidity=71 1465839830100400200
```

**System Metrics:**

```
cpu,host=server01,cpu=cpu0 usage_idle=95.2,usage_system=2.1,usage_user=2.7
```

#### Important Rules

✅ **DO:**

- Separate measurement+tags from fields with a **space**
- Separate fields from timestamp with a **space**
- Separate tags and fields with **commas** (no spaces)
- Quote string field values with double quotes

❌ **DON'T:**

- Use spaces in tag/field keys or values without quoting
- Forget at least one field
- Mix up the order of components

### 1.3 Writing via HTTP API

#### InfluxDB 2.x Write Endpoint

**Basic curl Example:**

```bash
curl -XPOST 'http://localhost:8086/api/v2/write?org=myorg&bucket=mybucket&precision=s' \
  -H 'Authorization: Token YOUR_TOKEN' \
  -H 'Content-Type: text/plain; charset=utf-8' \
  --data-binary 'temperature,location=room1 value=22.5'
```

**Batch Write:**

```bash
curl -XPOST 'http://localhost:8086/api/v2/write?org=myorg&bucket=mybucket&precision=s' \
  -H 'Authorization: Token YOUR_TOKEN' \
  --data-binary '
temperature,location=room1 value=22.5 1633024800
temperature,location=room2 value=23.1 1633024800
temperature,location=room3 value=21.8 1633024800
cpu,host=server01 usage=45.2 1633024800
cpu,host=server02 usage=52.1 1633024800'
```

#### InfluxDB 1.x Write Endpoint

```bash
curl -XPOST 'http://localhost:8086/write?db=mydb&precision=s' \
  --data-binary 'temperature,location=room1 value=22.5'
```

#### Parameters

- `org` (v2 only): Organization name
- `bucket` (v2) / `db` (v1): Target bucket/database
- `precision`: Timestamp precision (ns, u, ms, s, m, h)

### 1.4 Client Libraries

#### Python (influxdb-client)

**Installation:**

```bash
pip install influxdb-client
```

**Writing Single Point:**

```python
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

# Initialize client
client = InfluxDBClient(
    url="http://localhost:8086",
    token="YOUR_TOKEN",
    org="myorg"
)

# Get write API
write_api = client.write_api(write_options=SYNCHRONOUS)

# Create and write point
point = Point("temperature") \
    .tag("location", "room1") \
    .field("value", 22.5)

write_api.write(bucket="mybucket", record=point)

# Close client
client.close()
```

**Writing Multiple Points:**

```python
points = []
for i in range(100):
    point = Point("temperature") \
        .tag("location", f"room{i}") \
        .field("value", 20 + i * 0.1)
    points.append(point)

write_api.write(bucket="mybucket", record=points)
```

#### JavaScript/Node.js (@influxdata/influxdb-client)

**Installation:**

```bash
npm install @influxdata/influxdb-client
```

**Writing Data:**

```javascript
const { InfluxDB, Point } = require("@influxdata/influxdb-client");

const client = new InfluxDB({
  url: "http://localhost:8086",
  token: "YOUR_TOKEN",
});

const writeApi = client.getWriteApi("myorg", "mybucket");

// Write single point
const point = new Point("temperature")
  .tag("location", "room1")
  .floatField("value", 22.5);

writeApi.writePoint(point);

// Write multiple points
for (let i = 0; i < 100; i++) {
  const point = new Point("temperature")
    .tag("location", `room${i}`)
    .floatField("value", 20 + i * 0.1);
  writeApi.writePoint(point);
}

// Flush and close
await writeApi.close();
```

#### Go (influxdb-client-go)

**Installation:**

```bash
go get github.com/influxdata/influxdb-client-go/v2
```

**Writing Data:**

```go
package main

import (
    "context"
    "fmt"
    "time"

    influxdb2 "github.com/influxdata/influxdb-client-go/v2"
)

func main() {
    client := influxdb2.NewClient("http://localhost:8086", "YOUR_TOKEN")
    writeAPI := client.WriteAPIBlocking("myorg", "mybucket")

    // Create point
    p := influxdb2.NewPoint(
        "temperature",
        map[string]string{"location": "room1"},
        map[string]interface{}{"value": 22.5},
        time.Now(),
    )

    // Write point
    err := writeAPI.WritePoint(context.Background(), p)
    if err != nil {
        fmt.Printf("Write error: %s\n", err.Error())
    }

    client.Close()
}
```

#### Java (influxdb-client-java)

**Maven Dependency:**

```xml
<dependency>
    <groupId>com.influxdb</groupId>
    <artifactId>influxdb-client-java</artifactId>
    <version>6.10.0</version>
</dependency>
```

**Writing Data:**

```java
import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.InfluxDBClientFactory;
import com.influxdb.client.WriteApiBlocking;
import com.influxdb.client.domain.WritePrecision;
import com.influxdb.client.write.Point;

public class WriteExample {
    public static void main(String[] args) {
        InfluxDBClient client = InfluxDBClientFactory.create(
            "http://localhost:8086",
            "YOUR_TOKEN".toCharArray(),
            "myorg",
            "mybucket"
        );

        WriteApiBlocking writeApi = client.getWriteApiBlocking();

        Point point = Point.measurement("temperature")
            .addTag("location", "room1")
            .addField("value", 22.5)
            .time(System.currentTimeMillis(), WritePrecision.MS);

        writeApi.writePoint(point);

        client.close();
    }
}
```

### 1.5 Method Selection Guide

**Choose curl/HTTP API when:**

- Quick testing or debugging
- Shell scripts or cron jobs
- Language without official client library
- Webhook integrations

**Choose Client Libraries when:**

- Building applications in Python, JS, Go, Java
- Need type safety and error handling
- Want built-in batching and retry logic
- Production deployments

**Choose Telegraf when:**

- Automated system/application monitoring
- Need 300+ pre-built input plugins
- Want minimal code/configuration
- Production monitoring deployments

---

## 2. Batch Writes and Precision Handling

### 2.1 The Performance Impact of Batching

#### Single Point Writes (❌ Anti-Pattern)

```python
# BAD: Writing one point at a time
for i in range(10000):
    point = Point("temperature").field("value", 22.5)
    write_api.write(bucket="mybucket", record=point)
```

**Problems:**

- 10,000 HTTP requests
- High network overhead
- ~5ms per request = 50 seconds total
- Throughput: ~200 points/second ⚠️

#### Batch Writes (✅ Best Practice)

```python
# GOOD: Writing in batches
points = []
for i in range(10000):
    point = Point("temperature").field("value", 22.5)
    points.append(point)

write_api.write(bucket="mybucket", record=points)
```

**Benefits:**

- 1 HTTP request for 10,000 points
- ~50ms per batch
- Throughput: ~200,000 points/second ✅
- **1000x improvement!**

### 2.2 Optimal Batch Sizes

| Batch Size | Use Case             | Performance | Risk           |
| ---------- | -------------------- | ----------- | -------------- |
| 100-1000   | Low latency required | Good        | Low            |
| 1000-5000  | **Recommended**      | Excellent   | Low            |
| 5000-10000 | Bulk imports         | Very High   | Medium         |
| >10000     | Special cases only   | Variable    | High (timeout) |

**Recommendations:**

- **Default:** 5,000 points per batch
- **Maximum:** 10,000 points per batch
- **Size limit:** Keep batches under 5 MB
- **Interval:** Flush every 10 seconds

### 2.3 Configuring Batch Writes

#### Python with Write Options

```python
from influxdb_client import InfluxDBClient
from influxdb_client.client.write_api import ASYNCHRONOUS

client = InfluxDBClient(url="http://localhost:8086", token="YOUR_TOKEN", org="myorg")

# Configure batching
write_api = client.write_api(
    write_options=ASYNCHRONOUS(
        batch_size=5000,           # Points per batch
        flush_interval=10_000,     # Flush every 10 seconds (ms)
        jitter_interval=2_000,     # Random delay to prevent spikes
        retry_interval=5_000,      # Retry after 5 seconds
        max_retries=5,             # Maximum retry attempts
        max_retry_delay=30_000,    # Max delay between retries
        exponential_base=2         # Exponential backoff multiplier
    )
)

# Write points (automatically batched)
for i in range(100000):
    point = Point("temperature").tag("location", f"room{i%100}").field("value", 22.5)
    write_api.write(bucket="mybucket", record=point)

# Ensure all data is flushed
write_api.close()
client.close()
```

#### JavaScript with Batching

```javascript
const { InfluxDB } = require("@influxdata/influxdb-client");

const client = new InfluxDB({
  url: "http://localhost:8086",
  token: "YOUR_TOKEN",
  writeOptions: {
    batchSize: 5000,
    flushInterval: 10000,
    maxRetries: 3,
    maxRetryDelay: 30000,
    exponentialBase: 2,
  },
});

const writeApi = client.getWriteApi("myorg", "mybucket", "ms");

// Automatic batching
for (let i = 0; i < 100000; i++) {
  writeApi.writePoint(
    new Point("temperature")
      .tag("location", `room${i % 100}`)
      .floatField("value", 22.5)
  );
}

await writeApi.close();
```

#### Go with Batching

```go
import (
    influxdb2 "github.com/influxdata/influxdb-client-go/v2"
    "github.com/influxdata/influxdb-client-go/v2/api"
)

client := influxdb2.NewClientWithOptions(
    "http://localhost:8086",
    "YOUR_TOKEN",
    influxdb2.DefaultOptions().
        SetBatchSize(5000).
        SetFlushInterval(10000),
)

writeAPI := client.WriteAPI("myorg", "mybucket")

// Automatic batching
for i := 0; i < 100000; i++ {
    p := influxdb2.NewPointWithMeasurement("temperature").
        AddTag("location", fmt.Sprintf("room%d", i%100)).
        AddField("value", 22.5).
        SetTime(time.Now())
    writeAPI.WritePoint(p)
}

// Wait for all batches to complete
writeAPI.Flush()
client.Close()
```

### 2.4 Timestamp Precision

#### Available Precision Options

| Precision    | Code | Example             | Use Case                 |
| ------------ | ---- | ------------------- | ------------------------ |
| Nanoseconds  | `ns` | 1633024800000000000 | High-frequency trading   |
| Microseconds | `u`  | 1633024800000000    | Sub-millisecond accuracy |
| Milliseconds | `ms` | 1633024800000       | **Most common**          |
| Seconds      | `s`  | 1633024800          | Low-frequency sensors    |
| Minutes      | `m`  | 27217080            | Aggregated data          |
| Hours        | `h`  | 453618              | Historical summaries     |

#### Setting Precision

**In HTTP API:**

```bash
curl -XPOST 'http://localhost:8086/api/v2/write?org=myorg&bucket=mybucket&precision=ms' \
  -H 'Authorization: Token YOUR_TOKEN' \
  --data-binary 'temperature,location=room1 value=22.5 1633024800000'
```

**In Python:**

```python
from influxdb_client.client.write_api import WritePrecision

# Write with millisecond precision
write_api.write(
    bucket="mybucket",
    record=point,
    write_precision=WritePrecision.MS
)
```

**In JavaScript:**

```javascript
// Specify precision in getWriteApi
const writeApi = client.getWriteApi("myorg", "mybucket", "ms");
```

#### Timestamp Best Practices

✅ **DO:**

- Use millisecond precision for most applications
- Include timestamps for historical data imports
- Use consistent precision across your application
- Let InfluxDB generate timestamps for real-time data

❌ **DON'T:**

- Mix precisions in the same batch
- Use nanosecond precision unless absolutely necessary
- Forget to set precision when importing historical data

### 2.5 Error Handling in Batch Writes

#### Python Error Handling

```python
from influxdb_client.rest import ApiException
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def write_with_error_handling(write_api, bucket, points):
    try:
        write_api.write(bucket=bucket, record=points)
        logger.info(f"Successfully wrote {len(points)} points")
        return True
    except ApiException as e:
        logger.error(f"Write failed: {e.status} - {e.reason}")
        logger.error(f"Body: {e.body}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return False

# Usage
success = write_with_error_handling(write_api, "mybucket", points)
if not success:
    # Handle failure (retry, save to disk, alert, etc.)
    pass
```

#### Retry Strategy with Exponential Backoff

```python
from tenacity import retry, stop_after_attempt, wait_exponential
import time

@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=4, max=60)
)
def write_with_retry(write_api, bucket, points):
    try:
        write_api.write(bucket=bucket, record=points)
        logger.info(f"Wrote {len(points)} points successfully")
    except Exception as e:
        logger.warning(f"Write attempt failed: {e}. Retrying...")
        raise

# Usage
try:
    write_with_retry(write_api, "mybucket", points)
except Exception as e:
    logger.error(f"All retry attempts exhausted: {e}")
    # Final fallback: save to disk, alert team, etc.
```

---

## 3. Using Telegraf for Automated Ingestion

### 3.1 What is Telegraf?

**Telegraf** is a plugin-driven server agent for collecting and sending metrics and events.

**Key Features:**

- 🔌 **300+ plugins** for inputs, outputs, processors, and aggregators
- ⚡ **High performance** - written in Go
- 🔧 **Easy configuration** - TOML format
- 📦 **Minimal footprint** - single binary
- 🔄 **Hot reload** - configuration without restart

**Architecture:**

```
Input Plugins → Processors → Aggregators → Output Plugins
    ↓              ↓              ↓              ↓
  Collect       Transform      Aggregate      Send to
   Data           Data           Data        InfluxDB
```

### 3.2 Installation

#### Ubuntu/Debian

```bash
# Add InfluxData repository
wget -q https://repos.influxdata.com/influxdata-archive_compat.key
echo '23a1c8836f0afc5ed24e0486339d7cc8f6790b83886c4c96995b88a061c5bb5d influxdata-archive_compat.key' | sha256sum -c

sudo apt-get update
sudo apt-get install telegraf
```

#### Red Hat/CentOS

```bash
cat <<EOF | sudo tee /etc/yum.repos.d/influxdata.repo
[influxdata]
name = InfluxData Repository
baseurl = https://repos.influxdata.com/rhel/\$releasever/\$basearch/stable
enabled = 1
gpgcheck = 1
gpgkey = https://repos.influxdata.com/influxdata-archive_compat.key
EOF

sudo yum install telegraf
```

#### macOS

```bash
brew install telegraf
```

#### Docker

```bash
docker pull telegraf:latest

docker run -d --name=telegraf \
  -v $PWD/telegraf.conf:/etc/telegraf/telegraf.conf:ro \
  telegraf
```

### 3.3 Basic Configuration

#### Generate Default Config

```bash
telegraf config > telegraf.conf
```

#### Minimal Configuration Example

**File: `telegraf.conf`**

```toml
# Global Agent Configuration
[agent]
  interval = "10s"
  round_interval = true
  metric_batch_size = 1000
  metric_buffer_limit = 10000
  collection_jitter = "0s"
  flush_interval = "10s"
  flush_jitter = "0s"
  precision = ""
  hostname = ""
  omit_hostname = false

# Output Plugin - InfluxDB v2
[[outputs.influxdb_v2]]
  urls = ["http://localhost:8086"]
  token = "$INFLUX_TOKEN"
  organization = "myorg"
  bucket = "telegraf"
  timeout = "5s"

# Input Plugin - CPU
[[inputs.cpu]]
  percpu = true
  totalcpu = true
  collect_cpu_time = false
  report_active = false

# Input Plugin - Memory
[[inputs.mem]]

# Input Plugin - Disk
[[inputs.disk]]
  ignore_fs = ["tmpfs", "devtmpfs", "devfs", "iso9660", "overlay", "aufs", "squashfs"]
```

### 3.4 Popular Input Plugins

#### System Monitoring

**CPU Metrics:**

```toml
[[inputs.cpu]]
  percpu = true
  totalcpu = true
  collect_cpu_time = false
  report_active = false
```

**Memory Metrics:**

```toml
[[inputs.mem]]
```

**Disk I/O:**

```toml
[[inputs.diskio]]
  devices = ["sda", "sdb"]
```

**Network:**

```toml
[[inputs.net]]
  interfaces = ["eth0", "eth1"]
```

**System Load:**

```toml
[[inputs.system]]
```

#### Docker Monitoring

```toml
[[inputs.docker]]
  endpoint = "unix:///var/run/docker.sock"
  gather_services = false
  container_name_include = []
  container_name_exclude = []
  timeout = "5s"
  perdevice = true
  total = false
  docker_label_include = []
  docker_label_exclude = []
```

#### Nginx Monitoring

```toml
[[inputs.nginx]]
  urls = ["http://localhost/nginx_status"]
  response_timeout = "5s"
```

#### PostgreSQL Monitoring

```toml
[[inputs.postgresql]]
  address = "host=localhost user=postgres password=password sslmode=disable"
  databases = ["postgres"]
```

#### Redis Monitoring

```toml
[[inputs.redis]]
  servers = ["tcp://localhost:6379"]
  password = ""
```

#### MQTT Consumer

```toml
[[inputs.mqtt_consumer]]
  servers = ["tcp://mqtt.example.com:1883"]
  topics = [
    "sensors/+/temperature",
    "sensors/+/humidity"
  ]
  data_format = "json"
  username = "telegraf"
  password = "$MQTT_PASSWORD"
```

#### HTTP Listener (Webhook)

```toml
[[inputs.http_listener_v2]]
  service_address = ":8080"
  path = "/telegraf"
  methods = ["POST"]
  data_format = "json"
```

### 3.5 Advanced Configuration Examples

#### Multi-Environment Setup

```toml
# Production InfluxDB
[[outputs.influxdb_v2]]
  urls = ["https://influxdb.prod.example.com:8086"]
  token = "$INFLUX_TOKEN_PROD"
  organization = "myorg"
  bucket = "production"
  namepass = ["cpu", "mem", "disk"]

# Development InfluxDB
[[outputs.influxdb_v2]]
  urls = ["http://localhost:8086"]
  token = "$INFLUX_TOKEN_DEV"
  organization = "myorg"
  bucket = "development"
  namedrop = ["cpu", "mem", "disk"]
```

#### With Processors

```toml
# Rename fields
[[processors.rename]]
  [[processors.rename.replace]]
    field = "usage_idle"
    dest = "cpu_idle"

# Add tags
[[processors.enum]]
  [[processors.enum.mapping]]
    tag = "status"
    dest = "status_code"
    [processors.enum.mapping.value_mappings]
      healthy = 0
      degraded = 1
      down = 2

# Filter by tag
[[processors.pivot]]
  tag_key = "name"
  value_key = "value"
```

#### With Aggregators

```toml
# Calculate min/max/mean over 30s
[[aggregators.basicstats]]
  period = "30s"
  drop_original = false
  stats = ["count", "min", "max", "mean", "stdev"]
```

### 3.6 Running Telegraf

#### Start as a Service

```bash
# Enable and start
sudo systemctl enable telegraf
sudo systemctl start telegraf

# Check status
sudo systemctl status telegraf

# View logs
sudo journalctl -u telegraf -f
```

#### Run in Foreground (Testing)

```bash
telegraf --config telegraf.conf --test
```

#### Run in Debug Mode

```bash
telegraf --config telegraf.conf --debug
```

#### Reload Configuration

```bash
sudo systemctl reload telegraf
```

### 3.7 Environment Variables

**Set Token via Environment:**

```bash
export INFLUX_TOKEN="your-token-here"
telegraf --config telegraf.conf
```

**In systemd service:**

```bash
# Create override file
sudo systemctl edit telegraf

# Add:
[Service]
Environment="INFLUX_TOKEN=your-token-here"
Environment="MQTT_PASSWORD=your-mqtt-password"
```

### 3.8 Monitoring Telegraf

#### Internal Metrics

```toml
[[inputs.internal]]
  collect_memstats = true
```

This creates metrics like:

- `internal_agent` - Agent statistics
- `internal_write` - Write statistics
- `internal_gather` - Input plugin statistics

#### Health Check Endpoint

```toml
[[inputs.http_listener_v2]]
  service_address = ":8888"
  path = "/health"
  methods = ["GET"]
  data_format = "json"
```

Then monitor:

```bash
curl http://localhost:8888/health
```

---

## 4. High-Velocity Data Streams & Best Practices

### 4.1 Understanding High-Velocity Data

**High-velocity data** refers to data arriving at high rates:

- 10K+ points per second
- Multiple data sources simultaneously
- Real-time or near real-time requirements
- Continuous streams vs batch loads

**Common Sources:**

- IoT sensors (thousands of devices)
- Application performance monitoring (APM)
- Financial trading systems
- Network traffic analysis
- Log aggregation

### 4.2 Performance Optimization Strategies

#### Strategy 1: Batch Aggressively

```python
from queue import Queue
from threading import Thread
import time

class BatchWriter:
    def __init__(self, write_api, bucket, batch_size=5000, flush_interval=10):
        self.write_api = write_api
        self.bucket = bucket
        self.batch_size = batch_size
        self.flush_interval = flush_interval
        self.queue = Queue()
        self.running = True

        # Start background thread
        self.thread = Thread(target=self._process_queue)
        self.thread.start()

    def write(self, point):
        """Add point to queue"""
        self.queue.put(point)

    def _process_queue(self):
        """Background thread to batch and write"""
        batch = []
        last_flush = time.time()

        while self.running or not self.queue.empty():
            try:
                # Get point with timeout
                point = self.queue.get(timeout=0.1)
                batch.append(point)

                # Flush if batch is full or interval exceeded
                if len(batch) >= self.batch_size or \
                   (time.time() - last_flush) >= self.flush_interval:
                    self._flush_batch(batch)
                    batch = []
                    last_flush = time.time()

            except:
                # Timeout - check if we should flush
                if batch and (time.time() - last_flush) >= self.flush_interval:
                    self._flush_batch(batch)
                    batch = []
                    last_flush = time.time()

        # Final flush
        if batch:
            self._flush_batch(batch)

    def _flush_batch(self, batch):
        """Write batch to InfluxDB"""
        try:
            self.write_api.write(bucket=self.bucket, record=batch)
            print(f"Wrote {len(batch)} points")
        except Exception as e:
            print(f"Write error: {e}")

    def close(self):
        """Graceful shutdown"""
        self.running = False
        self.thread.join()

# Usage
batch_writer = BatchWriter(write_api, "mybucket")

for i in range(100000):
    point = Point("temperature").field("value", 22.5)
    batch_writer.write(point)

batch_writer.close()
```

#### Strategy 2: Use Asynchronous Writes

```python
from influxdb_client import InfluxDBClient
from influxdb_client.client.write_api import ASYNCHRONOUS

client = InfluxDBClient(url="http://localhost:8086", token="YOUR_TOKEN", org="myorg")

# Async write API
write_api = client.write_api(write_options=ASYNCHRONOUS(
    batch_size=10000,
    flush_interval=5_000,
    max_retries=3
))

# Write returns immediately (non-blocking)
for i in range(1000000):
    point = Point("temperature").field("value", 22.5)
    write_api.write(bucket="mybucket", record=point)

# Ensure completion
write_api.close()
```

#### Strategy 3: Parallel Write Workers

```python
from concurrent.futures import ThreadPoolExecutor
import queue

def write_worker(worker_id, write_api, bucket, work_queue):
    """Worker thread for writing"""
    while True:
        try:
            batch = work_queue.get(timeout=1)
            if batch is None:  # Poison pill
                break

            write_api.write(bucket=bucket, record=batch)
            print(f"Worker {worker_id} wrote {len(batch)} points")
            work_queue.task_done()

        except queue.Empty:
            continue
        except Exception as e:
            print(f"Worker {worker_id} error: {e}")

# Create work queue
work_queue = queue.Queue(maxsize=100)

# Start workers
num_workers = 4
with ThreadPoolExecutor(max_workers=num_workers) as executor:
    # Submit worker tasks
    for i in range(num_workers):
        executor.submit(write_worker, i, write_api, "mybucket", work_queue)

    # Produce batches
    batch = []
    for i in range(1000000):
        point = Point("temperature").field("value", 22.5)
        batch.append(point)

        if len(batch) >= 5000:
            work_queue.put(batch)
            batch = []

    # Send final batch
    if batch:
        work_queue.put(batch)

    # Wait for completion
    work_queue.join()

    # Send poison pills
    for _ in range(num_workers):
        work_queue.put(None)
```

#### Strategy 4: Connection Pooling

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def create_session():
    """Create session with connection pooling"""
    session = requests.Session()

    # Configure retries
    retry_strategy = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504]
    )

    # Configure adapter with pooling
    adapter = HTTPAdapter(
        max_retries=retry_strategy,
        pool_connections=10,
        pool_maxsize=20
    )

    session.mount("http://", adapter)
    session.mount("https://", adapter)

    return session

# Use custom session
from influxdb_client import InfluxDBClient

client = InfluxDBClient(
    url="http://localhost:8086",
    token="YOUR_TOKEN",
    org="myorg",
    timeout=30_000,
    enable_gzip=True
)
```

### 4.3 Handling Backpressure

#### Detecting Backpressure

```python
import logging

logger = logging.getLogger(__name__)

class BackpressureMonitor:
    def __init__(self, write_api, threshold=10000):
        self.write_api = write_api
        self.threshold = threshold
        self.dropped_points = 0

    def write_with_monitoring(self, bucket, points):
        """Write with backpressure detection"""
        queue_size = self.write_api._write_service._write_queue.qsize()

        if queue_size > self.threshold:
            logger.warning(f"Backpressure detected! Queue size: {queue_size}")

            # Options:
            # 1. Drop data (with logging)
            self.dropped_points += len(points)
            logger.error(f"Dropped {len(points)} points. Total dropped: {self.dropped_points}")
            return False

            # 2. Apply sampling
            # points = self._sample_points(points, sample_rate=0.1)

            # 3. Write to overflow buffer
            # self._write_to_overflow(points)

        try:
            self.write_api.write(bucket=bucket, record=points)
            return True
        except Exception as e:
            logger.error(f"Write failed: {e}")
            return False

    def _sample_points(self, points, sample_rate):
        """Keep only a sample of points"""
        import random
        return random.sample(points, int(len(points) * sample_rate))
```

#### Circuit Breaker Pattern

```python
import time
from enum import Enum

class CircuitState(Enum):
    CLOSED = "closed"  # Normal operation
    OPEN = "open"      # Failing, reject requests
    HALF_OPEN = "half_open"  # Testing if recovered

class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failures = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED

    def call(self, func, *args, **kwargs):
        """Execute function with circuit breaker"""
        if self.state == CircuitState.OPEN:
            # Check if timeout expired
            if time.time() - self.last_failure_time > self.timeout:
                self.state = CircuitState.HALF_OPEN
            else:
                raise Exception("Circuit breaker is OPEN")

        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise e

    def _on_success(self):
        """Reset on success"""
        self.failures = 0
        self.state = CircuitState.CLOSED

    def _on_failure(self):
        """Increment failures"""
        self.failures += 1
        self.last_failure_time = time.time()

        if self.failures >= self.failure_threshold:
            self.state = CircuitState.OPEN
            print(f"Circuit breaker opened after {self.failures} failures")

# Usage
breaker = CircuitBreaker(failure_threshold=5, timeout=60)

def write_data(write_api, bucket, points):
    write_api.write(bucket=bucket, record=points)

try:
    breaker.call(write_data, write_api, "mybucket", points)
except Exception as e:
    print(f"Write failed: {e}")
```

### 4.4 Production-Ready Write Pipeline

```python
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import ASYNCHRONOUS
from queue import Queue
from threading import Thread
import logging
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HighPerformanceWriter:
    """Production-ready high-performance writer"""

    def __init__(self, url, token, org, bucket,
                 batch_size=5000, flush_interval=10,
                 queue_size=100000):
        self.bucket = bucket
        self.queue = Queue(maxsize=queue_size)
        self.running = True

        # Metrics
        self.points_written = 0
        self.points_dropped = 0
        self.write_errors = 0
        self.batches_written = 0

        # Initialize client
        self.client = InfluxDBClient(url=url, token=token, org=org)
        self.write_api = self.client.write_api(
            write_options=ASYNCHRONOUS(
                batch_size=batch_size,
                flush_interval=flush_interval * 1000,
                max_retries=5,
                retry_interval=5000
            )
        )

        # Start background worker
        self.worker = Thread(target=self._process_queue, daemon=True)
        self.worker.start()

        # Start metrics reporter
        self.reporter = Thread(target=self._report_metrics, daemon=True)
        self.reporter.start()

    def write(self, measurement, tags, fields, timestamp=None):
        """Add point to write queue"""
        point = Point(measurement)

        for tag_key, tag_value in tags.items():
            point.tag(tag_key, tag_value)

        for field_key, field_value in fields.items():
            point.field(field_key, field_value)

        if timestamp:
            point.time(timestamp)

        try:
            self.queue.put(point, block=False)
        except:
            self.points_dropped += 1
            logger.warning(f"Queue full, dropped point. Total dropped: {self.points_dropped}")

    def _process_queue(self):
        """Background thread to process queue"""
        batch = []
        last_flush = time.time()

        while self.running:
            try:
                # Get point with timeout
                point = self.queue.get(timeout=0.1)
                batch.append(point)

                # Flush if batch is full or interval exceeded
                if len(batch) >= 5000 or (time.time() - last_flush) > 10:
                    self._flush_batch(batch)
                    batch = []
                    last_flush = time.time()

            except:
                # Timeout - check if we should flush
                if batch and (time.time() - last_flush) > 10:
                    self._flush_batch(batch)
                    batch = []
                    last_flush = time.time()

        # Final flush
        if batch:
            self._flush_batch(batch)

    def _flush_batch(self, batch):
        """Write batch to InfluxDB"""
        try:
            self.write_api.write(bucket=self.bucket, record=batch)
            self.points_written += len(batch)
            self.batches_written += 1
        except Exception as e:
            self.write_errors += 1
            logger.error(f"Write error: {e}")

    def _report_metrics(self):
        """Report performance metrics"""
        while self.running:
            time.sleep(30)
            logger.info(f"""
            === Write Performance Metrics ===
            Points Written: {self.points_written:,}
            Batches Written: {self.batches_written:,}
            Points Dropped: {self.points_dropped:,}
            Write Errors: {self.write_errors:,}
            Queue Size: {self.queue.qsize():,}
            ================================
            """)

    def close(self):
        """Graceful shutdown"""
        logger.info("Shutting down writer...")
        self.running = False
        self.worker.join()
        self.write_api.close()
        self.client.close()
        logger.info(f"Final: {self.points_written:,} points written, {self.points_dropped:,} dropped")

# Usage Example
if __name__ == "__main__":
    writer = HighPerformanceWriter(
        url="http://localhost:8086",
        token="YOUR_TOKEN",
        org="myorg",
        bucket="mybucket"
    )

    # Simulate high-velocity data
    try:
        for i in range(1000000):
            writer.write(
                measurement="sensor_data",
                tags={"sensor_id": f"sensor_{i % 1000}", "location": "datacenter1"},
                fields={"temperature": 20 + (i % 10), "humidity": 60 + (i % 20)}
            )

            if i % 100000 == 0:
                logger.info(f"Generated {i:,} points")

        # Wait for queue to empty
        logger.info("Waiting for queue to flush...")
        while writer.queue.qsize() > 0:
            time.sleep(1)

        time.sleep(15)  # Extra time for final batches

    finally:
        writer.close()
```

### 4.5 Best Practices Summary

#### ✅ DO

**1. Batch Writes**

- Use 1,000-5,000 points per batch
- Flush every 10 seconds
- Don't exceed 5 MB per request

**2. Async Operations**

- Use async write APIs
- Don't block on write acknowledgment
- Process responses in background

**3. Error Handling**

- Implement retry logic with exponential backoff
- Log all errors with context
- Monitor error rates

**4. Monitoring**

- Track write throughput
- Monitor queue depths
- Alert on high error rates

**5. Resource Management**

- Reuse connections
- Configure connection pooling
- Set appropriate timeouts

**6. Data Validation**

- Validate before writing
- Check tag cardinality
- Ensure proper data types

#### ❌ DON'T

**1. Single Point Writes**

- Never write one point at a time in production
- Always batch

**2. Unbounded Queues**

- Always set queue size limits
- Handle queue full scenarios

**3. Synchronous Blocking**

- Don't wait for each write to complete
- Use async operations

**4. Ignore Errors**

- Always handle write errors
- Implement proper logging

**5. No Backpressure Handling**

- Monitor for backpressure
- Have fallback strategies

**6. Missing Metrics**

- Always track performance
- Monitor system health

### 4.6 Performance Benchmarks

**Expected Throughput (Single Node):**

| Scenario              | Throughput    | Configuration   |
| --------------------- | ------------- | --------------- |
| Single point writes   | ~1K pts/sec   | Not recommended |
| Small batches (100)   | ~50K pts/sec  | Low latency     |
| Medium batches (1000) | ~300K pts/sec | Balanced        |
| Large batches (5000)  | ~500K pts/sec | **Recommended** |
| Optimal (10K, async)  | ~1M pts/sec   | High throughput |

**Factors Affecting Performance:**

- Network latency
- InfluxDB server resources
- Number of series
- Tag cardinality
- Field data types
- Compression ratio

### 4.7 Troubleshooting Guide

#### Problem: Slow Writes

**Symptoms:**

- High write latency
- Queue backing up
- Timeouts

**Solutions:**

1. Increase batch size
2. Use async writes
3. Add more write workers
4. Check network latency
5. Verify InfluxDB resources

#### Problem: Data Loss

**Symptoms:**

- Missing data points
- Gaps in time series

**Solutions:**

1. Check error logs
2. Verify authentication
3. Monitor queue full events
4. Implement overflow buffer
5. Add retry logic

#### Problem: High Memory Usage

**Symptoms:**

- OOM errors
- Process killed

**Solutions:**

1. Reduce batch size
2. Lower queue size
3. Flush more frequently
4. Check for memory leaks
5. Monitor queue depth

---

## Summary

### Key Takeaways

1. **Choose the Right Method**

   - Use Telegraf for automated monitoring
   - Use client libraries for applications
   - Use HTTP API for custom integrations

2. **Batch Everything**

   - 5,000 points per batch is optimal
   - Flush every 10 seconds
   - Never write single points in production

3. **Handle Errors Gracefully**

   - Implement retry logic
   - Monitor error rates
   - Have fallback strategies

4. **Optimize for Performance**

   - Use async operations
   - Implement connection pooling
   - Monitor and alert

5. **Monitor Your Pipeline**
   - Track throughput
   - Watch queue depths
   - Alert on anomalies

### Next Steps

1. **Practice**: Set up a test environment and experiment
2. **Implement**: Build a production pipeline using examples
3. **Monitor**: Set up metrics and alerts
4. **Optimize**: Tune based on your specific workload
5. **Scale**: Add more workers or nodes as needed

### Additional Resources

- [InfluxDB Write Data Guide](https://docs.influxdata.com/influxdb/latest/write-data/)
- [Telegraf Documentation](https://docs.influxdata.com/telegraf/)
- [Client Libraries](https://github.com/influxdata)
- [InfluxDB Best Practices](https://docs.influxdata.com/influxdb/latest/write-data/best-practices/)
- [Community Forum](https://community.influxdata.com/)

---

**Course Complete! 🎉**

You now have the knowledge to implement efficient, scalable data ingestion pipelines for InfluxDB.

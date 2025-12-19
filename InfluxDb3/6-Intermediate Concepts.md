# 6️⃣ Intermediate Concepts

---

## 6.1 Data Ingestion Pipelines - Overview

### **What is Data Ingestion Pipeline?**

```
Data Sources → Ingestion Layer → InfluxDB → Query Layer → Visualization
     ↓              ↓                ↓           ↓              ↓
  Sensors      Telegraf/         Storage    SQL Queries    Grafana/
  APIs         Custom Scripts                              Custom UI
  Logs
  Metrics
```

---

### **Ingestion Methods:**


| Method               | Use Case                       | Complexity  | Performance |
| ---------------------- | -------------------------------- | ------------- | ------------- |
| **Direct Write**     | Simple apps, low volume        | Low         | Good        |
| **Telegraf**         | System metrics, plugins        | Medium      | Excellent   |
| **Custom Scripts**   | Complex logic, transformations | Medium-High | Variable    |
| **Message Queue**    | High volume, decoupled         | High        | Excellent   |
| **Batch Processing** | Historical data, ETL           | Medium      | Very Good   |

---

## 6.2 Telegraf - The Data Collection Agent

### **What is Telegraf?**

```
Telegraf = Plugin-driven agent for collecting, processing, and writing metrics
          Official InfluxDB companion tool
          100+ input plugins
          50+ output plugins
```

### **Why Telegraf?**

```
✓ No coding required (config-based)
✓ Low resource footprint
✓ Built-in plugins for common sources
✓ Data transformation/aggregation
✓ Buffering & retry logic
✓ Multiple output destinations
```

---

### **Installation (Docker):**

**docker-compose.yml:**

yaml

```yaml
version: '3.8'

services:
  influxdb:
    image: influxdata/influxdb:latest
    container_name: influxdb3
    ports:
      - "8086:8086"
    volumes:
      - influxdb-data:/var/lib/influxdb3
    environment:
      - DOCKER_INFLUXDB_INIT_MODE=setup
      - DOCKER_INFLUXDB_INIT_USERNAME=admin
      - DOCKER_INFLUXDB_INIT_PASSWORD=adminpassword123
      - DOCKER_INFLUXDB_INIT_ORG=my-org
      - DOCKER_INFLUXDB_INIT_BUCKET=my-bucket
      - DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=my-super-secret-token

  telegraf:
    image: telegraf:latest
    container_name: telegraf
    volumes:
      - ./telegraf.conf:/etc/telegraf/telegraf.conf:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    depends_on:
      - influxdb
    restart: unless-stopped

volumes:
  influxdb-data:
```

---

### **Basic Telegraf Configuration:**

**telegraf.conf:**

toml

```toml
# Global Agent Configuration
[agent]
  interval = "10s"           # Collection interval
  round_interval = true
  metric_batch_size = 1000
  metric_buffer_limit = 10000
  collection_jitter = "0s"
  flush_interval = "10s"
  flush_jitter = "0s"
  precision = "0s"
  hostname = ""
  omit_hostname = false

# InfluxDB v2 Output Plugin
[[outputs.influxdb_v2]]
  urls = ["http://influxdb:8086"]
  token = "my-super-secret-token"
  organization = "my-org"
  bucket = "my-bucket"
  timeout = "5s"
  user_agent = "telegraf"

# System CPU Input Plugin
[[inputs.cpu]]
  percpu = true
  totalcpu = true
  collect_cpu_time = false
  report_active = false

# System Memory Input Plugin
[[inputs.mem]]
  # No additional configuration needed

# System Disk Input Plugin
[[inputs.disk]]
  ignore_fs = ["tmpfs", "devtmpfs", "devfs", "iso9660", "overlay", "aufs", "squashfs"]

# System Network Input Plugin
[[inputs.net]]
  # Collect all network interfaces

# System Processes Input Plugin
[[inputs.processes]]
  # No additional configuration needed
```

---

### **Start Telegraf:**

bash

```bash
docker-compose up -d
```

**Verify data collection:**

bash

```bash
# Check Telegraf logs
docker logs telegraf

# Query InfluxDB
influx query 'SELECT * FROM cpu LIMIT 5'
```

---

## 6.3 Custom Data Ingestion Scripts

### **Scenario 1: IoT Device Fleet Management**

**Python Script: `iot_fleet_ingestion.py`**

python

```python
#!/usr/bin/env python3

import requests
import time
import json
from datetime import datetime
import random

class IoTFleetIngestion:
    def __init__(self, influx_url, org, bucket, token):
        self.influx_url = influx_url
        self.org = org
        self.bucket = bucket
        self.token = token
        self.write_url = f"{influx_url}/api/v2/write"
        self.headers = {
            "Authorization": f"Token {token}",
            "Content-Type": "text/plain; charset=utf-8"
        }
  
    def generate_device_data(self, device_id, location, device_type):
        """Simulate IoT device data"""
  
        # Simulate sensor readings based on device type
        if device_type == "temperature_sensor":
            data = {
                "temperature": round(random.uniform(18.0, 35.0), 2),
                "humidity": round(random.uniform(40.0, 80.0), 2),
                "battery_level": random.randint(0, 100),
                "signal_strength": random.randint(-90, -30)
            }
        elif device_type == "motion_sensor":
            data = {
                "motion_detected": random.choice([True, False]),
                "battery_level": random.randint(0, 100),
                "sensitivity": random.randint(1, 10)
            }
        elif device_type == "door_sensor":
            data = {
                "door_open": random.choice([True, False]),
                "open_count": random.randint(0, 50),
                "battery_level": random.randint(0, 100)
            }
        else:
            data = {}
  
        return data
  
    def create_line_protocol(self, measurement, tags, fields, timestamp=None):
        """Create InfluxDB line protocol"""
  
        if timestamp is None:
            timestamp = int(time.time() * 1e9)
  
        # Build tag string
        tag_str = ",".join([f"{k}={v}" for k, v in tags.items()])
  
        # Build field string
        field_parts = []
        for k, v in fields.items():
            if isinstance(v, bool):
                field_parts.append(f"{k}={str(v).lower()}")
            elif isinstance(v, int):
                field_parts.append(f"{k}={v}i")
            elif isinstance(v, float):
                field_parts.append(f"{k}={v}")
            elif isinstance(v, str):
                field_parts.append(f'{k}="{v}"')
  
        field_str = ",".join(field_parts)
  
        # Combine into line protocol
        line = f"{measurement},{tag_str} {field_str} {timestamp}"
        return line
  
    def write_batch(self, lines):
        """Write batch of line protocol to InfluxDB"""
  
        data = "\n".join(lines)
        params = {
            'org': self.org,
            'bucket': self.bucket,
            'precision': 'ns'
        }
  
        try:
            response = requests.post(
                self.write_url,
                params=params,
                headers=self.headers,
                data=data,
                timeout=10
            )
      
            if response.status_code == 204:
                return True
            else:
                print(f"Error {response.status_code}: {response.text}")
                return False
  
        except Exception as e:
            print(f"Exception: {e}")
            return False
  
    def ingest_fleet_data(self, devices, duration_seconds=60, interval=5):
        """Continuously ingest data from device fleet"""
  
        print(f"Starting ingestion for {len(devices)} devices...")
        print(f"Duration: {duration_seconds}s, Interval: {interval}s\n")
  
        start_time = time.time()
        iteration = 0
  
        while time.time() - start_time < duration_seconds:
            iteration += 1
            batch = []
            timestamp = int(time.time() * 1e9)
      
            # Collect data from all devices
            for device in devices:
                device_id = device['id']
                location = device['location']
                device_type = device['type']
                floor = device.get('floor', '1')
                zone = device.get('zone', 'default')
          
                # Generate sensor data
                sensor_data = self.generate_device_data(
                    device_id, location, device_type
                )
          
                # Create tags
                tags = {
                    'device_id': device_id,
                    'location': location,
                    'device_type': device_type,
                    'floor': floor,
                    'zone': zone
                }
          
                # Create line protocol
                line = self.create_line_protocol(
                    'iot_metrics',
                    tags,
                    sensor_data,
                    timestamp
                )
                batch.append(line)
      
            # Write batch
            if self.write_batch(batch):
                print(f"[{datetime.now()}] Iteration {iteration}: "
                      f"Written {len(batch)} data points")
      
            # Wait for next interval
            time.sleep(interval)
  
        print(f"\nIngestion completed. Total iterations: {iteration}")

# Configuration
INFLUX_URL = "http://localhost:8086"
INFLUX_ORG = "my-org"
INFLUX_BUCKET = "iot-fleet"
INFLUX_TOKEN = "YOUR_TOKEN"

# Define device fleet
devices = [
    {
        'id': 'TEMP_001',
        'type': 'temperature_sensor',
        'location': 'warehouse_a',
        'floor': '1',
        'zone': 'storage'
    },
    {
        'id': 'TEMP_002',
        'type': 'temperature_sensor',
        'location': 'warehouse_a',
        'floor': '2',
        'zone': 'storage'
    },
    {
        'id': 'MOTION_001',
        'type': 'motion_sensor',
        'location': 'warehouse_a',
        'floor': '1',
        'zone': 'entrance'
    },
    {
        'id': 'DOOR_001',
        'type': 'door_sensor',
        'location': 'warehouse_a',
        'floor': '1',
        'zone': 'entrance'
    },
    {
        'id': 'TEMP_003',
        'type': 'temperature_sensor',
        'location': 'warehouse_b',
        'floor': '1',
        'zone': 'cold_storage'
    }
]

if __name__ == "__main__":
    ingestion = IoTFleetIngestion(
        INFLUX_URL,
        INFLUX_ORG,
        INFLUX_BUCKET,
        INFLUX_TOKEN
    )
  
    # Run ingestion for 5 minutes, collecting every 5 seconds
    ingestion.ingest_fleet_data(devices, duration_seconds=300, interval=5)
```

**Run:**

bash

```bash
python3 iot_fleet_ingestion.py
```

**Output:**

```
Starting ingestion for 5 devices...
Duration: 300s, Interval: 5s

[2024-12-19 10:30:00] Iteration 1: Written 5 data points
[2024-12-19 10:30:05] Iteration 2: Written 5 data points
[2024-12-19 10:30:10] Iteration 3: Written 5 data points
...
```

---

## 6.4 Batch vs Real-Time Ingestion

### **Real-Time Ingestion:**

**Characteristics:**

```
✓ Immediate data availability
✓ Small batches (1-1000 points)
✓ Low latency (<1 second)
✓ Continuous stream
✓ Higher network overhead
```

**Use Cases:**

```
- Live dashboards
- Real-time alerts
- IoT sensor monitoring
- Application metrics
- Trading systems
```

**Example Pattern:**

python

```python
def realtime_ingestion():
    while True:
        # Collect current data
        data = collect_sensor_data()
  
        # Write immediately
        write_to_influx(data)
  
        # Small interval
        time.sleep(1)  # Every 1 second
```

---

### **Batch Ingestion:**

**Characteristics:**

```
✓ Delayed data availability
✓ Large batches (5000-100000 points)
✓ Higher latency (minutes to hours)
✓ Periodic execution
✓ Lower network overhead
✓ Better throughput
```

**Use Cases:**

```
- Historical data import
- ETL jobs
- Log processing
- Data migration
- Analytics preprocessing
```

**Example Pattern:**

python

```python
def batch_ingestion():
    batch = []
    BATCH_SIZE = 10000
  
    for record in data_source:
        line = create_line_protocol(record)
        batch.append(line)
  
        # Write when batch is full
        if len(batch) >= BATCH_SIZE:
            write_batch_to_influx(batch)
            batch = []
  
    # Write remaining
    if batch:
        write_batch_to_influx(batch)
```

---

### **Hybrid Approach (Recommended):**

python

```python
import queue
import threading
import time

class HybridIngestion:
    def __init__(self, influx_client, batch_size=5000, flush_interval=10):
        self.influx_client = influx_client
        self.batch_size = batch_size
        self.flush_interval = flush_interval
        self.queue = queue.Queue()
        self.running = True
  
        # Start background writer thread
        self.writer_thread = threading.Thread(target=self._background_writer)
        self.writer_thread.daemon = True
        self.writer_thread.start()
  
    def write_point(self, line_protocol):
        """Add point to queue (non-blocking)"""
        self.queue.put(line_protocol)
  
    def _background_writer(self):
        """Background thread that batches and writes"""
        batch = []
        last_flush = time.time()
  
        while self.running:
            try:
                # Get point with timeout
                line = self.queue.get(timeout=1)
                batch.append(line)
          
                # Flush conditions
                should_flush = (
                    len(batch) >= self.batch_size or
                    time.time() - last_flush >= self.flush_interval
                )
          
                if should_flush and batch:
                    self.influx_client.write_batch(batch)
                    print(f"Flushed {len(batch)} points")
                    batch = []
                    last_flush = time.time()
      
            except queue.Empty:
                # Flush on timeout if batch exists
                if batch and time.time() - last_flush >= self.flush_interval:
                    self.influx_client.write_batch(batch)
                    print(f"Flushed {len(batch)} points (timeout)")
                    batch = []
                    last_flush = time.time()
  
    def stop(self):
        """Stop the writer thread"""
        self.running = False
        self.writer_thread.join()

# Usage
hybrid = HybridIngestion(influx_client)

# Write points as they come (non-blocking)
for data in sensor_stream:
    line = create_line_protocol(data)
    hybrid.write_point(line)  # Returns immediately

# Automatic batching and flushing in background
```

**Benefits:**

```
✓ Low latency (points queued immediately)
✓ High throughput (batched writes)
✓ Resource efficient (buffering)
✓ Automatic flush (time-based + size-based)
```

---

## 6.5 Retention Policies & Lifecycle Management

### **What is Retention Policy?**

```
Retention Policy = Rules for how long data is kept
                   Automatic deletion of old data
                   Storage cost optimization
```

---

### **Setting Retention Policy:**

**CLI:**

bash

```bash
# Create bucket with 30-day retention
influx bucket create \
  --name metrics-30d \
  --org my-org \
  --retention 30d

# Create bucket with 7-day retention
influx bucket create \
  --name metrics-7d \
  --org my-org \
  --retention 168h

# Infinite retention (default)
influx bucket create \
  --name metrics-forever \
  --org my-org \
  --retention 0
```

---

**Update existing bucket:**

bash

```bash
influx bucket update \
  --name my-bucket \
  --retention 90d
```

---

**HTTP API:**

bash

```bash
curl -X POST "http://localhost:8086/api/v2/buckets" \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "metrics-30d",
    "orgID": "YOUR_ORG_ID",
    "retentionRules": [
      {
        "type": "expire",
        "everySeconds": 2592000
      }
    ]
  }'
```

---

### **Common Retention Strategies:**

```
Hot Data (Real-time):
- Retention: 7-30 days
- Use case: Live dashboards, alerts
- Bucket: metrics-hot

Warm Data (Recent history):
- Retention: 90-180 days
- Use case: Weekly/monthly reports
- Bucket: metrics-warm (downsampled)

Cold Data (Archive):
- Retention: 1-2 years or infinite
- Use case: Compliance, long-term analysis
- Bucket: metrics-cold (heavily downsampled)
```

---

### **Multi-Tier Strategy Example:**

python

```python
class MultiTierDataManager:
    def __init__(self, influx_client):
        self.influx_client = influx_client
        self.buckets = {
            'hot': 'metrics-hot',      # 7 days, full resolution
            'warm': 'metrics-warm',    # 90 days, 5-min aggregates
            'cold': 'metrics-cold'     # 2 years, 1-hour aggregates
        }
  
    def write_to_hot(self, data):
        """Write raw data to hot tier"""
        self.influx_client.write(
            bucket=self.buckets['hot'],
            data=data
        )
  
    def downsample_to_warm(self):
        """Aggregate hot data to warm tier"""
        query = """
        SELECT 
          date_bin(INTERVAL '5 minutes', time) as time_bucket,
          sensor_id,
          AVG(temperature) as temperature,
          AVG(humidity) as humidity
        FROM metrics-hot
        WHERE time >= now() - INTERVAL '1 day'
          AND time < now() - INTERVAL '6 days'
        GROUP BY time_bucket, sensor_id
        """
  
        # Query hot data
        results = self.influx_client.query(query)
  
        # Write to warm bucket
        warm_data = self.convert_to_line_protocol(results)
        self.influx_client.write(
            bucket=self.buckets['warm'],
            data=warm_data
        )
  
    def downsample_to_cold(self):
        """Further aggregate warm data to cold tier"""
        query = """
        SELECT 
          date_bin(INTERVAL '1 hour', time) as time_bucket,
          sensor_id,
          AVG(temperature) as temperature,
          AVG(humidity) as humidity
        FROM metrics-warm
        WHERE time >= now() - INTERVAL '90 days'
          AND time < now() - INTERVAL '89 days'
        GROUP BY time_bucket, sensor_id
        """
  
        results = self.influx_client.query(query)
        cold_data = self.convert_to_line_protocol(results)
        self.influx_client.write(
            bucket=self.buckets['cold'],
            data=cold_data
        )

# Schedule downsampling jobs
# Run daily: downsample 6-day-old data to warm
# Run daily: downsample 89-day-old data to cold
```

---

## 6.6 Downsampling Strategies

### **What is Downsampling?**

```
Downsampling = Reducing data resolution by aggregating
               Trade accuracy for storage efficiency
               Keep trends, lose granularity
```

---

### **Example: Temperature Data**

**Original (1-second resolution):**

```
10:00:00 → 25.5°C
10:00:01 → 25.6°C
10:00:02 → 25.5°C
... (3600 points per hour)
```

**Downsampled (5-minute resolution):**

```
10:00:00 → 25.53°C (avg of 300 points)
10:05:00 → 25.67°C (avg of 300 points)
... (12 points per hour)
```

**Storage savings: 99.67% reduction!**

---

### **Downsampling Script (Continuous Aggregation):**

python

```python
#!/usr/bin/env python3

import requests
import time
from datetime import datetime, timedelta

class DownsamplingJob:
    def __init__(self, influx_url, org, token):
        self.influx_url = influx_url
        self.org = org
        self.token = token
        self.query_url = f"{influx_url}/api/v2/query"
        self.write_url = f"{influx_url}/api/v2/write"
        self.headers = {
            "Authorization": f"Token {token}",
            "Content-Type": "application/json"
        }
  
    def query(self, sql):
        """Execute SQL query"""
        data = {
            "query": sql,
            "type": "sql"
        }
  
        response = requests.post(
            f"{self.query_url}?org={self.org}",
            headers=self.headers,
            json=data
        )
  
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Query error: {response.text}")
            return None
  
    def write(self, bucket, line_protocol):
        """Write line protocol to bucket"""
        write_headers = {
            "Authorization": f"Token {self.token}",
            "Content-Type": "text/plain; charset=utf-8"
        }
  
        response = requests.post(
            f"{self.write_url}?org={self.org}&bucket={bucket}&precision=ns",
            headers=write_headers,
            data=line_protocol
        )
  
        return response.status_code == 204
  
    def downsample_temperature(self, source_bucket, dest_bucket, 
                               interval_minutes=5):
        """Downsample temperature data"""
  
        # Query for data to downsample (1 hour ago)
        sql = f"""
        SELECT 
          date_bin(INTERVAL '{interval_minutes} minutes', time) as time_bucket,
          sensor_id,
          location,
          floor,
          AVG(temperature) as avg_temp,
          MIN(temperature) as min_temp,
          MAX(temperature) as max_temp,
          AVG(humidity) as avg_humidity,
          COUNT(*) as sample_count
        FROM {source_bucket}
        WHERE time >= now() - INTERVAL '1 hour'
          AND time < now() - INTERVAL '55 minutes'
        GROUP BY time_bucket, sensor_id, location, floor
        ORDER BY time_bucket
        """
  
        print(f"Querying source data from {source_bucket}...")
        results = self.query(sql)
  
        if not results:
            print("No data to downsample")
            return
  
        # Convert to line protocol
        lines = []
        for row in results.get('data', []):
            timestamp_ns = int(row['time_bucket'])
            sensor_id = row['sensor_id']
            location = row['location']
            floor = row['floor']
      
            tags = f"sensor_id={sensor_id},location={location},floor={floor}"
            fields = (
                f"avg_temp={row['avg_temp']},"
                f"min_temp={row['min_temp']},"
                f"max_temp={row['max_temp']},"
                f"avg_humidity={row['avg_humidity']},"
                f"sample_count={row['sample_count']}i"
            )
      
            line = f"temperature_downsampled,{tags} {fields} {timestamp_ns}"
            lines.append(line)
  
        # Write to destination bucket
        if lines:
            line_protocol = "\n".join(lines)
            if self.write(dest_bucket, line_protocol):
                print(f"✓ Wrote {len(lines)} downsampled points to {dest_bucket}")
            else:
                print(f"✗ Failed to write to {dest_bucket}")
  
    def run_continuous(self, source_bucket, dest_bucket, 
                       interval_minutes=5, run_every_seconds=300):
        """Run downsampling continuously"""
  
        print(f"Starting continuous downsampling:")
        print(f"  Source: {source_bucket}")
        print(f"  Destination: {dest_bucket}")
        print(f"  Interval: {interval_minutes} minutes")
        print(f"  Run every: {run_every_seconds} seconds\n")
  
        while True:
            try:
                print(f"[{datetime.now()}] Running downsampling job...")
                self.downsample_temperature(
                    source_bucket,
                    dest_bucket,
                    interval_minutes
                )
                print(f"Sleeping for {run_every_seconds} seconds...\n")
                time.sleep(run_every_seconds)
      
            except KeyboardInterrupt:
                print("\nStopping downsampling job")
                break
      
            except Exception as e:
                print(f"Error: {e}")
                time.sleep(60)  # Wait 1 minute on error

# Configuration
INFLUX_URL = "http://localhost:8086"
INFLUX_ORG = "my-org"
INFLUX_TOKEN = "YOUR_TOKEN"

if __name__ == "__main__":
    job = DownsamplingJob(INFLUX_URL, INFLUX_ORG, INFLUX_TOKEN)
  
    # Downsample every 5 minutes, run job every 5 minutes
    job.run_continuous(
        source_bucket="iot-sensors",
        dest_bucket="iot-sensors-5min",
        interval_minutes=5,
        run_every_seconds=300
    )
```

---

## 6.7 Indexing and Query Optimization

### **Understanding Indexes in InfluxDB 3:**

```
Automatically Indexed:
✓ time (always indexed)
✓ tags (all tags indexed)

NOT Indexed:
✗ fields
```

---

### **Optimization Rule 1: Use Tags for Filtering**

**❌ Slow (field filter):**

sql

```sql
SELECT * FROM metrics
WHERE user_id = 'user_12345'  -- user_id is field
```

**✅ Fast (tag filter):**

sql

```sql
SELECT * FROM metrics
WHERE user_segment = 'premium'  -- user_segment is tag
```

---

### **Optimization Rule 2: Always Filter by Time**

**❌ Very Slow (scans all data):**

sql

```sql
SELECT AVG(temperature) FROM sensors
WHERE sensor_id = 'SENS001'
```

**✅ Fast (time-bounded):**

sql

```sql
SELECT AVG(temperature) FROM sensors
WHERE sensor_id = 'SENS001'
  AND time >= now() - INTERVAL '1 hour'
```

---

### **Optimization Rule 3: Use Specific Time Ranges**

**❌ Slower:**

sql

```sql
SELECT * FROM metrics
WHERE time >= '2024-01-01'  -- Scans 1 year
```

**✅ Faster:**

sql

```sql
SELECT * FROM metrics
WHERE time >= '2024-12-19T10:00:00Z'
  AND time < '2024-12-19T11:00:00Z'  -- Scans 1 hour
```

---

### **Optimization Rule 4: Use LIMIT**

**❌ Returns millions of rows:**

sql

```sql
SELECT * FROM metrics
WHERE time >= now() - INTERVAL '7 days'
```

**✅ Returns limited rows:**

sql

```sql
SELECT * FROM metrics
WHERE time >= now() - INTERVAL '7 days'
LIMIT 10000
```

---

### **Optimization Rule 5: Push Down Aggregations**

**❌ Client-side aggregation (slow):**

python

```python
# Query all data
results = query("SELECT * FROM metrics WHERE time >= now() - INTERVAL '7 days'")

# Aggregate in Python (millions of rows transferred!)
avg_cpu = sum(r['cpu'] for r in results) / len(results)
```

**✅ Server-side aggregation (fast):**

python

```python
# Aggregate in database
results = query("""
    SELECT AVG(cpu) as avg_cpu
    FROM metrics
    WHERE time >= now() - INTERVAL '7 days'
""")
avg_cpu = results[0]['avg_cpu']  # Single row returned
```

---

### **Optimization Rule 6: Use Appropriate Time Windows**

**❌ Too granular (slow):**

sql

```sql
-- 1-second buckets for 7 days = 604,800 rows!
SELECT 
  date_bin(INTERVAL '1 second', time) as bucket,
  AVG(cpu)
FROM metrics
WHERE time >= now() - INTERVAL '7 days'
GROUP BY bucket
```

**✅ Appropriate granularity:**

sql

```sql
-- 5-minute buckets for 7 days = 2,016 rows
SELECT 
  date_bin(INTERVAL '5 minutes', time) as bucket,
  AVG(cpu)
FROM metrics
WHERE time >= now() - INTERVAL '7 days'
GROUP BY bucket
```

---

## 6.8 Handling Large-Scale Data

### **Scale Characteristics:**

```
Small Scale:
- <1K points/sec
- <100 GB data
- Single instance OK

Medium Scale:
- 1K-10K points/sec
- 100 GB - 1 TB data
- Consider clustering

Large Scale:
- >10K points/sec
- >1 TB data
- Distributed architecture required
```

---

### **Best Practices for Large Scale:**

**1. Batch Writes (5000-10000 points):**

python

```python
BATCH_SIZE = 10000
batch = []

for point in data_stream:
    batch.append(point)
  
    if len(batch) >= BATCH_SIZE:
        write_batch(batch)
        batch = []
```

---

**2. Parallel Writes:**

python

```python
from concurrent.futures import ThreadPoolExecutor
import queue

def parallel_writer(num_workers=4):
    write_queue = queue.Queue(maxsize=1000)
  
    def worker():
        batch = []
        while True:
            point = write_queue.get()
            if point is None:  # Shutdown signal
                if batch:
                    write_batch(batch)
                break
      
            batch.append(point)
            if len(batch) >= 5000:
                write_batch(batch)
                batch = []
  
    # Start worker threads
    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        for _ in range(num_workers):
            executor.submit(worker)
  
        # Add points to queue
        for point in data_stream:
            write_queue.put(point)
  
        # Shutdown
        for _ in range(num_workers):
            write_queue.put(None)
```

---

**3. Compression:**

python

```python
import gzip
import io

def write_compressed(data):
    """Write gzip-compressed data"""
  
    # Compress data
    buffer = io.BytesIO()
    with gzip.GzipFile(fileobj=buffer, mode='wb') as gz:
        gz.write(data.encode('utf-8'))
  
    compressed_data = buffer.getvalue()
  
    # Write with compression header
    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Encoding": "gzip"
    }
  
    response = requests.post(
        write_url,
        headers=headers,
        data=compressed_data
    )
  
    return response.status_code == 204
```

---

**4. Connection Pooling:**

python

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Create session with connection pooling
session = requests.Session()

# Configure retries
retry = Retry(
    total=3,
    backoff_factor=0.5,
    status_forcelist=[429, 500, 502, 503, 504]
)

adapter = HTTPAdapter(
    pool_connections=10,
    pool_maxsize=20,
    max_retries=retry
)

session.mount('http://', adapter)
session.mount('https://', adapter)

# Reuse session for all writes
def write_with_session(data):
    return session.post(write_url, headers=headers, data=data)
```

---

**5. Monitoring Write Performance:**

python

```python
import time
from collections import deque

class WriteMetrics:
    def __init__(self, window_size=100):
        self.write_times = deque(maxlen=window_size)
        self.write_counts = deque(maxlen=window_size)
  
    def record_write(self, duration, point_count):
        self.write_times.append(duration)
        self.write_counts.append(point_count)
  
    def get_stats(self):
        if not self.write_times:
            return {}
  
        return {
            'avg_write_time': sum(self.write_times) / len(self.write_times),
            'total_points_written': sum(self.write_counts),
            'points_per_second': sum(self.write_counts) / sum(self.write_times)
        }

# Usage
metrics = WriteMetrics()

start = time.time()
write_batch(batch)
duration = time.time() - start

metrics.record_write(duration, len(batch))

# Print stats every 100 writes
if len(metrics.write_times) == 100:
    stats = metrics.get_stats()
    print(f"Write performance: {stats['points_per_second']:.0f} points/sec")
```

---

## 🎯 Key Takeaways (Module 6)

```
✓ Telegraf = Easy, plugin-based data collection
✓ Batch writes (5000-10000) = Best performance
✓ Hybrid approach = Low latency + high throughput
✓ Retention policies = Automatic old data cleanup
✓ Downsampling = Reduce storage, keep trends
✓ Multi-tier strategy = Hot/Warm/Cold data
✓ Always filter by time for performance
✓ Use tags for filtering (indexed)
✓ Aggregate at server, not client
✓ Connection pooling + compression for scale
```

---

## 📝 Practice Tasks

**Task 1: Setup Telegraf**

```
1. Install Telegraf via Docker
2. Configure system metrics collection
3. Verify data in InfluxDB
4. Query CPU and memory metrics
```

**Task 2: Build Ingestion Pipeline**

python

```python
# Create Python script that:
1. Simulates 100 IoT sensors
2. Collects data every 5 seconds
3. Batches writes (5000 points)
4. Tracks performance metrics
```

**Task 3: Implement Downsampling**

```
1. Create buckets: raw-data (7d) and downsampled-data (90d)
2. Write script to downsample hourly
3. Compare storage sizes
4. Query both and measure performance
```

**Task 4: Multi-Tier Strategy**

```
Design and implement:
- Hot tier: 1-second data, 7 days
- Warm tier: 5-minute data, 90 days
- Cold tier: 1-hour data, 1 year
```

---

## 🚀 Next Module Preview

**Module 7: Advanced Concepts**

* InfluxDB 3 architecture internals
* Apache Arrow & Parquet deep dive
* Storage engine behavior
* Query execution plans
* Scaling strategies (horizontal/vertical)
* High availability setup
* Multi-tenant design patterns
* Backup and disaster recovery

**Ready for Module 7?** Let me know! 💪 Ab advanced architecture aur scaling seekhenge!

yes, Ready for Module 7

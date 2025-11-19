# InfluxDB: Visualization, Monitoring, and Alerting
## Complete 60-Minute Course

---

## Course Overview

**Duration:** 60 minutes  
**Level:** Intermediate to Advanced  
**Prerequisites:** Basic understanding of InfluxDB, InfluxQL/Flux queries, and time-series concepts

### Learning Objectives

By the end of this course, you will be able to:
- Compare and select appropriate visualization tools (Chronograf, Grafana, etc.)
- Build effective dashboards and custom charts for time-series data
- Monitor InfluxDB health using internal metrics and external tools
- Set up comprehensive alerting systems for thresholds and anomalies
- Integrate InfluxDB with Prometheus and other monitoring ecosystems
- Design and implement production-ready monitoring strategies

---

## Module 1: Visualization Tools Overview (15 minutes)

### 1.1 Visualization Landscape

**Available Tools:**

```
Visualization Ecosystem:
├── Native InfluxData Stack
│   ├── Chronograf (TICK Stack)
│   └── InfluxDB UI (v2.x built-in)
├── Third-Party Tools
│   ├── Grafana (Most Popular)
│   ├── Tableau
│   ├── Kibana (via plugin)
│   └── Custom (D3.js, Plotly, etc.)
└── Programming Libraries
    ├── Python (influxdb-client, pandas, matplotlib)
    ├── JavaScript (influxdb-client-js, Chart.js)
    └── R (influxdbr, ggplot2)
```

### 1.2 Chronograf Deep Dive

**What is Chronograf?**
Chronograf is InfluxData's official visualization and dashboarding tool, part of the TICK (Telegraf, InfluxDB, Chronograf, Kapacitor) stack.

**Key Features:**
- Pre-built dashboards for common metrics
- Query builder interface (visual and manual)
- Data explorer with template variables
- Alert management (via Kapacitor)
- User management and authentication
- Host list management

**Installation:**

**Ubuntu/Debian:**
```bash
wget https://dl.influxdata.com/chronograf/releases/chronograf_1.10.0_amd64.deb
sudo dpkg -i chronograf_1.10.0_amd64.deb
sudo systemctl start chronograf
sudo systemctl enable chronograf
```

**Docker:**
```bash
docker run -d \
  -p 8888:8888 \
  -v chronograf-data:/var/lib/chronograf \
  --name chronograf \
  chronograf:latest
```

**Configuration:**
```bash
# /etc/default/chronograf
HOST=0.0.0.0
PORT=8888
INFLUXDB_URL=http://localhost:8086
KAPACITOR_URL=http://localhost:9092
```

**Accessing Chronograf:**
```
URL: http://localhost:8888
Default: No authentication (configure OAuth/LDAP for production)
```

**Chronograf Dashboard Creation:**

**Step 1: Connect to InfluxDB**
```
1. Open Chronograf
2. Click "Configuration" → "InfluxDB"
3. Add connection:
   - Connection URL: http://localhost:8086
   - Name: Local InfluxDB
   - Username: (if auth enabled)
   - Password: (if auth enabled)
```

**Step 2: Create Dashboard**
```
1. Click "Dashboards" → "Create Dashboard"
2. Add cells (visualizations)
3. Configure queries
4. Set refresh intervals
5. Add template variables
```

**Example Query Builder:**
```influxql
SELECT mean("usage_idle") 
FROM "telegraf"."autogen"."cpu" 
WHERE time > :dashboardTime: 
  AND "cpu"='cpu-total' 
GROUP BY time(:interval:), "host"
```

**Chronograf Pros:**
- ✅ Native InfluxDB integration
- ✅ Simple setup and configuration
- ✅ Pre-built templates
- ✅ Integrated with Kapacitor alerts
- ✅ Part of official TICK stack

**Chronograf Cons:**
- ❌ Limited visualization types
- ❌ Less flexible than Grafana
- ❌ Smaller community/plugin ecosystem
- ❌ Basic customization options

### 1.3 Grafana Deep Dive

**What is Grafana?**
Grafana is the most popular open-source visualization platform, supporting multiple data sources including InfluxDB.

**Key Features:**
- 100+ panel types and visualizations
- Advanced templating and variables
- Alerting (built-in, no external dependencies)
- Rich plugin ecosystem (500+ plugins)
- Organization and team management
- Dashboard sharing and embedding
- Annotations and events
- Multi-datasource support

**Installation:**

**Ubuntu/Debian:**
```bash
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
sudo apt-get update
sudo apt-get install grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
```

**Docker:**
```bash
docker run -d \
  -p 3000:3000 \
  -v grafana-storage:/var/lib/grafana \
  --name grafana \
  grafana/grafana-oss:latest
```

**Configuration:**
```ini
# /etc/grafana/grafana.ini

[server]
http_port = 3000
domain = localhost

[security]
admin_user = admin
admin_password = admin

[auth.anonymous]
enabled = false

[dashboards]
default_home_dashboard_path = /var/lib/grafana/dashboards/home.json
```

**Accessing Grafana:**
```
URL: http://localhost:3000
Default Login:
  Username: admin
  Password: admin (change on first login!)
```

**InfluxDB Data Source Configuration:**

**InfluxDB 1.x:**
```json
{
  "name": "InfluxDB-Prod",
  "type": "influxdb",
  "url": "http://localhost:8086",
  "access": "proxy",
  "database": "telegraf",
  "user": "grafana",
  "password": "secret",
  "basicAuth": false
}
```

**Via Grafana UI:**
```
1. Settings → Data Sources → Add data source
2. Select "InfluxDB"
3. Configure:
   - Name: InfluxDB-Prod
   - Query Language: InfluxQL (for v1.x) or Flux (for v2.x)
   - URL: http://localhost:8086
   - Database: telegraf
   - User/Password: (if auth enabled)
4. Click "Save & Test"
```

**InfluxDB 2.x (with Flux):**
```json
{
  "name": "InfluxDB2-Prod",
  "type": "influxdb",
  "url": "http://localhost:8086",
  "access": "proxy",
  "jsonData": {
    "version": "Flux",
    "organization": "my-org",
    "defaultBucket": "my-bucket"
  },
  "secureJsonData": {
    "token": "my-super-secret-auth-token"
  }
}
```

**Grafana Pros:**
- ✅ Most popular visualization tool
- ✅ Extensive visualization options
- ✅ Powerful alerting capabilities
- ✅ Large plugin ecosystem
- ✅ Multi-datasource dashboards
- ✅ Strong community support

**Grafana Cons:**
- ❌ Steeper learning curve
- ❌ More complex configuration
- ❌ Requires separate installation
- ❌ Alert fatigue without tuning

### 1.4 Other Visualization Options

**InfluxDB UI (v2.x Built-in):**

**Features:**
- Built directly into InfluxDB 2.x
- Flux query builder
- Data explorer
- Dashboard creation
- Task management
- Alerting (Checks and Notifications)

**Access:**
```
URL: http://localhost:8086
Setup: Initial setup wizard on first launch
```

**Advantages:**
- No separate installation
- Native Flux support
- Integrated with InfluxDB 2.x features

**Python Visualization:**

```python
from influxdb_client import InfluxDBClient
import pandas as pd
import matplotlib.pyplot as plt

# Connect to InfluxDB
client = InfluxDBClient(
    url="http://localhost:8086",
    token="my-token",
    org="my-org"
)

# Query data
query = '''
from(bucket: "my-bucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "cpu")
  |> filter(fn: (r) => r["_field"] == "usage_system")
'''

result = client.query_api().query_data_frame(query)

# Create visualization
plt.figure(figsize=(12, 6))
plt.plot(result['_time'], result['_value'])
plt.title('CPU Usage Over Time')
plt.xlabel('Time')
plt.ylabel('CPU %')
plt.grid(True)
plt.savefig('cpu_usage.png')
plt.show()
```

**JavaScript/Node.js Visualization:**

```javascript
const { InfluxDB } = require('@influxdata/influxdb-client');

const client = new InfluxDB({
  url: 'http://localhost:8086',
  token: 'my-token'
});

const queryApi = client.getQueryApi('my-org');

const query = `
  from(bucket: "my-bucket")
    |> range(start: -1h)
    |> filter(fn: (r) => r["_measurement"] == "cpu")
`;

// Use with Chart.js, D3.js, or other libraries
queryApi.queryRows(query, {
  next(row, tableMeta) {
    const o = tableMeta.toObject(row);
    console.log(o);
    // Process for visualization
  },
  error(error) {
    console.error(error);
  },
  complete() {
    console.log('Query complete');
  }
});
```

### 1.5 Tool Selection Guide

**Decision Matrix:**

| Criteria | Chronograf | Grafana | InfluxDB UI | Custom Code |
|----------|-----------|---------|-------------|-------------|
| Ease of Setup | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Visualization Options | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Alerting | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Community Support | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Customization | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Multi-Datasource | ❌ | ✅ | ✅ | ✅ |
| Cost | Free | Free (OSS) | Free | Free |

**Recommendations:**

**Use Chronograf if:**
- You're using the full TICK stack
- You need simple, quick dashboards
- You want native InfluxDB integration
- You don't need complex visualizations

**Use Grafana if:**
- You need advanced visualizations
- You have multiple data sources
- You want powerful alerting
- You need a large plugin ecosystem
- You're building production dashboards

**Use InfluxDB UI if:**
- You're using InfluxDB 2.x
- You prefer Flux over InfluxQL
- You want zero additional installation
- You need integrated task management

**Use Custom Code if:**
- You need highly specialized visualizations
- You're embedding in custom applications
- You need programmatic control
- You have specific branding requirements

---

## Module 2: Building Dashboards and Custom Charts (15 minutes)

### 2.1 Dashboard Design Principles

**Key Principles:**

**1. Purpose-Driven Design**
```
Define dashboard purpose:
├── Executive Summary (high-level KPIs)
├── Operational Monitoring (real-time health)
├── Troubleshooting (detailed metrics)
├── Capacity Planning (trends and forecasts)
└── SLA Reporting (compliance metrics)
```

**2. Information Hierarchy**
```
Dashboard Layout:
┌─────────────────────────────────────┐
│ KPIs / Summary Metrics (Top)       │  ← Most Important
├─────────────────────────────────────┤
│ Primary Visualizations (Middle)    │  ← Key Insights
├─────────────────────────────────────┤
│ Supporting Details (Bottom)        │  ← Deep Dive
└─────────────────────────────────────┘
```

**3. Visual Best Practices**
- Use consistent color schemes
- Limit to 4-6 colors per dashboard
- Choose appropriate chart types
- Add clear labels and units
- Use white space effectively
- Optimize for screen resolution

### 2.2 Chart Type Selection

**Common Chart Types and Use Cases:**

**Time Series Line Chart:**
```
Best for: Trends over time
Examples: CPU usage, memory consumption, request rates
When to use: Continuous metrics, comparing multiple series
```

**Single Stat / Gauge:**
```
Best for: Current value, KPIs
Examples: Current CPU %, disk usage, uptime
When to use: Single important metric, threshold visualization
```

**Bar Chart:**
```
Best for: Comparing values across categories
Examples: Top 10 servers by CPU, error counts by type
When to use: Discrete categories, rankings
```

**Heatmap:**
```
Best for: Patterns over time and categories
Examples: Request latency distribution, error rates by hour
When to use: Multi-dimensional analysis, pattern detection
```

**Table:**
```
Best for: Detailed data inspection
Examples: Alert history, top N resources
When to use: Precise values needed, multiple attributes
```

**State Timeline:**
```
Best for: Status changes over time
Examples: Service uptime/downtime, deployment timeline
When to use: State transitions, incident correlation
```

### 2.3 Building a Grafana Dashboard

**Complete Example: System Monitoring Dashboard**

**Step 1: Create Dashboard**
```
1. Click "+" → "Dashboard"
2. Click "Add new panel"
3. Set dashboard name: "System Monitoring - Production"
4. Add description and tags
```

**Step 2: Add Variables (for filtering)**

**Host Variable:**
```
Variable Settings:
- Name: host
- Type: Query
- Data source: InfluxDB-Prod
- Query: SHOW TAG VALUES FROM "cpu" WITH KEY = "host"
- Multi-value: Yes
- Include All option: Yes
- Refresh: On Dashboard Load
```

**Time Interval Variable:**
```
- Name: interval
- Type: Interval
- Values: 10s,30s,1m,5m,10m,30m,1h
- Auto Option: Yes
```

**Step 3: CPU Usage Panel**

**Panel Configuration:**
```json
{
  "title": "CPU Usage by Host",
  "type": "timeseries",
  "datasource": "InfluxDB-Prod",
  "targets": [
    {
      "query": "SELECT mean(\"usage_idle\") FROM \"cpu\" WHERE $timeFilter AND \"host\" =~ /^$host$/ GROUP BY time($interval), \"host\"",
      "alias": "$tag_host"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "percent",
      "min": 0,
      "max": 100,
      "thresholds": {
        "steps": [
          { "value": 0, "color": "green" },
          { "value": 70, "color": "yellow" },
          { "value": 90, "color": "red" }
        ]
      }
    }
  }
}
```

**InfluxQL Query:**
```influxql
SELECT 100 - mean("usage_idle") AS "usage" 
FROM "cpu" 
WHERE $timeFilter 
  AND "cpu" = 'cpu-total' 
  AND "host" =~ /^$host$/
GROUP BY time($__interval), "host" 
FILL(null)
```

**Step 4: Memory Usage Panel**

**Flux Query (for InfluxDB 2.x):**
```flux
from(bucket: "telegraf")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "mem")
  |> filter(fn: (r) => r["_field"] == "used_percent")
  |> filter(fn: (r) => r["host"] =~ /${host:regex}/)
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
  |> yield(name: "mean")
```

**Step 5: Disk I/O Panel**

**InfluxQL with Math:**
```influxql
SELECT 
  derivative(mean("read_bytes"), 1s) AS "read_rate",
  derivative(mean("write_bytes"), 1s) AS "write_rate"
FROM "diskio"
WHERE $timeFilter 
  AND "host" =~ /^$host$/
GROUP BY time($__interval), "host", "name"
FILL(null)
```

**Step 6: Single Stat - Current Load**

**Configuration:**
```json
{
  "title": "Current System Load",
  "type": "stat",
  "query": "SELECT last(\"load1\") FROM \"system\" WHERE $timeFilter AND \"host\" =~ /^$host$/",
  "fieldConfig": {
    "defaults": {
      "mappings": [],
      "thresholds": {
        "steps": [
          { "value": 0, "color": "green" },
          { "value": 2, "color": "yellow" },
          { "value": 4, "color": "red" }
        ]
      },
      "color": {
        "mode": "thresholds"
      },
      "unit": "short"
    }
  },
  "options": {
    "reduceOptions": {
      "values": false,
      "calcs": ["lastNotNull"]
    },
    "orientation": "auto",
    "textMode": "value_and_name",
    "colorMode": "background",
    "graphMode": "area"
  }
}
```

**Step 7: Network Traffic Heatmap**

**Query:**
```influxql
SELECT 
  mean("bytes_recv") AS "received",
  mean("bytes_sent") AS "sent"
FROM "net"
WHERE $timeFilter 
  AND "host" =~ /^$host$/
GROUP BY time(5m), "host"
FILL(null)
```

**Heatmap Settings:**
```json
{
  "type": "heatmap",
  "options": {
    "calculate": true,
    "yAxis": {
      "format": "short",
      "logBase": 1,
      "min": "0",
      "max": "auto"
    },
    "legend": {
      "show": true
    },
    "tooltip": {
      "show": true,
      "showHistogram": false
    },
    "color": {
      "mode": "spectrum",
      "scheme": "Spectral",
      "steps": 128
    }
  }
}
```

### 2.4 Advanced Dashboard Features

**Row Organization:**
```
Dashboard Structure:
├── Row 1: Overview (Collapsed by default)
│   ├── Total Hosts
│   ├── Average CPU
│   └── Total Memory
├── Row 2: CPU Metrics
│   ├── CPU Usage Timeline
│   ├── CPU by Host
│   └── Top CPU Consumers
├── Row 3: Memory Metrics
│   └── Memory Usage Timeline
└── Row 4: Disk & Network
    ├── Disk Usage
    └── Network Traffic
```

**Template Variables - Advanced:**

**Chained Variables:**
```
Variable 1 - Region:
  Query: SHOW TAG VALUES WITH KEY = "region"

Variable 2 - Datacenter (depends on Region):
  Query: SHOW TAG VALUES WITH KEY = "datacenter" 
         WHERE "region" =~ /^$region$/

Variable 3 - Host (depends on Datacenter):
  Query: SHOW TAG VALUES WITH KEY = "host" 
         WHERE "datacenter" =~ /^$datacenter$/
```

**Custom Variable:**
```
Variable: environment
Type: Custom
Values: production,staging,development
Current: production
```

**Annotations:**

**Deployment Annotations:**
```json
{
  "datasource": "InfluxDB-Prod",
  "name": "Deployments",
  "enable": true,
  "query": "SELECT * FROM \"deployments\" WHERE $timeFilter",
  "textField": "message",
  "tagsField": "service",
  "iconColor": "blue"
}
```

**Alert Annotations:**
```json
{
  "datasource": "-- Grafana --",
  "name": "Alert Events",
  "enable": true,
  "type": "dashboard",
  "builtIn": 1,
  "iconColor": "red"
}
```

**Links and Drilldowns:**

**Dashboard Link:**
```json
{
  "title": "Detailed Host View",
  "type": "link",
  "url": "/d/host-details?var-host=$host",
  "keepTime": true,
  "includeVars": true
}
```

**Panel Link:**
```json
{
  "title": "View Logs",
  "url": "https://logs.example.com?host=$host&from=$__from&to=$__to",
  "targetBlank": true
}
```

### 2.5 Dashboard Export and Import

**Export Dashboard:**
```bash
# Via Grafana UI
Dashboard Settings → JSON Model → Copy to Clipboard

# Via API
curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:3000/api/dashboards/uid/abc123 \
  | jq '.dashboard' > dashboard.json
```

**Import Dashboard:**
```bash
# Via Grafana UI
Dashboards → Import → Upload JSON file

# Via API
curl -X POST \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d @dashboard.json \
  http://localhost:3000/api/dashboards/db
```

**Dashboard Provisioning:**
```yaml
# /etc/grafana/provisioning/dashboards/dashboards.yml
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: 'Production'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
```

---

## Module 3: Monitoring InfluxDB (15 minutes)

### 3.1 Internal Metrics Overview

**InfluxDB Internal Statistics:**

InfluxDB exposes internal metrics via the `_internal` database (v1.x) or `_monitoring` bucket (v2.x).

**Accessing Internal Metrics (v1.x):**
```influxql
-- Show all internal measurements
SHOW MEASUREMENTS ON "_internal"

-- Common measurements:
-- database: Database-level stats
-- httpd: HTTP API stats
-- queryExecutor: Query performance
-- shard: Shard-level stats
-- subscriber: Subscription stats
-- tsm1_cache: Cache stats
-- tsm1_engine: Storage engine stats
-- tsm1_filestore: File storage stats
-- tsm1_wal: Write-ahead log stats
-- write: Write performance stats
```

**Key Metrics to Monitor:**

**1. Write Performance:**
```influxql
-- Write request rate
SELECT derivative(mean("writeReq"), 1s) AS "write_rate"
FROM "_internal"."monitor"."write"
WHERE time > now() - 1h
GROUP BY time(1m)

-- Write errors
SELECT sum("writeReqErr") AS "write_errors"
FROM "_internal"."monitor"."write"
WHERE time > now() - 1h
GROUP BY time(1m)

-- Points written per second
SELECT derivative(mean("pointReq"), 1s) AS "points_per_sec"
FROM "_internal"."monitor"."write"
WHERE time > now() - 1h
GROUP BY time(1m)
```

**2. Query Performance:**
```influxql
-- Query execution rate
SELECT derivative(mean("queriesExecuted"), 1s) AS "query_rate"
FROM "_internal"."monitor"."queryExecutor"
WHERE time > now() - 1h
GROUP BY time(1m)

-- Average query duration
SELECT mean("queryDurationNs") / 1000000 AS "avg_duration_ms"
FROM "_internal"."monitor"."queryExecutor"
WHERE time > now() - 1h
GROUP BY time(1m)

-- Query errors
SELECT sum("queriesExecuted") - sum("queriesFinished") AS "query_errors"
FROM "_internal"."monitor"."queryExecutor"
WHERE time > now() - 1h
GROUP BY time(1m)
```

**3. Memory and Cache:**
```influxql
-- Cache size
SELECT mean("memBytes") / 1024 / 1024 AS "cache_mb"
FROM "_internal"."monitor"."tsm1_cache"
WHERE time > now() - 1h
GROUP BY time(1m), "database"

-- Cache hit ratio
SELECT 
  sum("cacheHit") / (sum("cacheHit") + sum("cacheMiss")) * 100 AS "hit_ratio"
FROM "_internal"."monitor"."shard"
WHERE time > now() - 1h
GROUP BY time(1m)
```

**4. Shard Statistics:**
```influxql
-- Shard disk usage
SELECT sum("diskBytes") / 1024 / 1024 / 1024 AS "disk_gb"
FROM "_internal"."monitor"."shard"
WHERE time > now() - 1h
GROUP BY time(1m), "database"

-- Fields created (schema changes)
SELECT derivative(sum("fieldsCreate"), 1m) AS "fields_per_min"
FROM "_internal"."monitor"."shard"
WHERE time > now() - 1h
GROUP BY time(1m)

-- Series created (cardinality growth)
SELECT derivative(sum("seriesCreate"), 1m) AS "series_per_min"
FROM "_internal"."monitor"."shard"
WHERE time > now() - 1h
GROUP BY time(1m)
```

**5. HTTP API Performance:**
```influxql
-- Request rate by endpoint
SELECT derivative(mean("req"), 1s) AS "req_per_sec"
FROM "_internal"."monitor"."httpd"
WHERE time > now() - 1h
GROUP BY time(1m), "path"

-- Client errors (4xx)
SELECT sum("clientError") AS "4xx_errors"
FROM "_internal"."monitor"."httpd"
WHERE time > now() - 1h
GROUP BY time(1m)

-- Server errors (5xx)
SELECT sum("serverError") AS "5xx_errors"
FROM "_internal"."monitor"."httpd"
WHERE time > now() - 1h
GROUP BY time(1m)
```

### 3.2 System-Level Monitoring with Telegraf

**Telegraf Configuration for InfluxDB Monitoring:**

```toml
# /etc/telegraf/telegraf.conf

# Monitor InfluxDB instance
[[inputs.influxdb]]
  urls = ["http://localhost:8086/debug/vars"]
  timeout = "5s"

# System metrics
[[inputs.cpu]]
  percpu = true
  totalcpu = true
  collect_cpu_time = false
  report_active = false

[[inputs.mem]]

[[inputs.disk]]
  mount_points = ["/", "/var/lib/influxdb"]
  ignore_fs = ["tmpfs", "devtmpfs", "devfs"]

[[inputs.diskio]]

[[inputs.net]]
  interfaces = ["eth0"]

[[inputs.processes]]

[[inputs.system]]

# Process-specific monitoring
[[inputs.procstat]]
  exe = "influxd"
  prefix = "influxdb"

# Output to InfluxDB
[[outputs.influxdb_v2]]
  urls = ["http://localhost:8086"]
  token = "$INFLUX_TOKEN"
  organization = "my-org"
  bucket = "monitoring"
```

**Starting Telegraf:**
```bash
sudo systemctl start telegraf
sudo systemctl enable telegraf

# Verify
telegraf --test --config /etc/telegraf/telegraf.conf
```

### 3.3 Prometheus Integration

**Why Prometheus with InfluxDB?**
- Prometheus is widely used in Kubernetes environments
- Different data model (pull vs push)
- Can scrape InfluxDB metrics
- Combine with other Prometheus exporters

**InfluxDB Exporter for Prometheus:**

**Installation:**
```bash
# Using Docker
docker run -d \
  -p 9122:9122 \
  -e INFLUX_URL=http://influxdb:8086 \
  -e INFLUX_DATABASE=telegraf \
  prometheus/influxdb-exporter
```

**Prometheus Configuration:**
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'influxdb'
    static_configs:
      - targets: ['localhost:9122']
        labels:
          instance: 'influxdb-prod'
    scrape_interval: 30s
    scrape_timeout: 10s
```

**Alternative: InfluxDB as Prometheus Remote Storage:**

**InfluxDB 2.x Configuration:**
```yaml
# influxdb v2.x can act as Prometheus remote storage
# Prometheus config:
remote_write:
  - url: "http://localhost:8086/api/v1/prom/write?db=prometheus"
    basic_auth:
      username: "admin"
      password: "password"

remote_read:
  - url: "http://localhost:8086/api/v1/prom/read?db=prometheus"
    basic_auth:
      username: "admin"
      password: "password"
```

### 3.4 Comprehensive Monitoring Dashboard

**Grafana Dashboard for InfluxDB Health:**

**Panel 1: Write Throughput**
```influxql
SELECT 
  derivative(mean("writeReq"), 1s) AS "writes_per_sec",
  derivative(mean("pointReq"), 1s) AS "points_per_sec"
FROM "_internal"."monitor"."write"
WHERE $timeFilter
GROUP BY time($__interval)
FILL(null)
```

**Panel 2: Query Performance**
```influxql
SELECT 
  mean("queryDurationNs") / 1000000 AS "avg_duration_ms",
  percentile("queryDurationNs", 95) / 1000000 AS "p95_duration_ms",
  percentile("queryDurationNs", 99) / 1000000 AS "p99_duration_ms"
FROM "_internal"."monitor"."queryExecutor"
WHERE $timeFilter
GROUP BY time($__interval)
```

**Panel 3: Cache and Memory**
```influxql
SELECT 
  mean("memBytes") / 1024 / 1024 AS "cache_size_mb",
  mean("snapshotCount") AS "snapshots"
FROM "_internal"."monitor"."tsm1_cache"
WHERE $timeFilter
GROUP BY time($__interval), "database"
```

**Panel 4: Error Rates**
```influxql
SELECT 
  derivative(sum("writeReqErr"), 1s) AS "write_errors_per_sec",
  derivative(sum("clientError"), 1s) AS "http_4xx_per_sec",
  derivative(sum("serverError"), 1s) AS "http_5xx_per_sec"
FROM "_internal"."monitor"."write", "_internal"."monitor"."httpd"
WHERE $timeFilter
GROUP BY time($__interval)
```

**Panel 5: Series Cardinality**
```influxql
SELECT 
  sum("numSeries") AS "total_series"
FROM "_internal"."monitor"."database"
WHERE $timeFilter
GROUP BY time($__interval), "database"
```

**Panel 6: Disk Usage**
```influxql
SELECT 
  sum("diskBytes") / 1024 / 1024 / 1024 AS "disk_usage_gb"
FROM "_internal"."monitor"."shard"
WHERE $timeFilter
GROUP BY time($__interval), "database"
```

### 3.5 Health Check Endpoints

**InfluxDB Health Checks:**

**Ping Endpoint:**
```bash
# Check if InfluxDB is running
curl -I http://localhost:8086/ping

# Expected response:
# HTTP/1.1 204 No Content
```

**Health Endpoint (v2.x):**
```bash
curl http://localhost:8086/health

# Response:
{
  "name": "influxdb",
  "message": "ready for queries and writes",
  "status": "pass",
  "checks": [],
  "version": "2.0.0",
  "commit": "abc123"
}
```

**Metrics Endpoint:**
```bash
# Get all internal metrics (JSON format)
curl http://localhost:8086/debug/vars

# Parse specific metric
curl -s http://localhost:8086/debug/vars | jq '.memstats.Alloc'
```

**Automated Health Monitoring Script:**

```bash
#!/bin/bash
# influxdb-health-check.sh

INFLUX_URL="http://localhost:8086"
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Check ping
if ! curl -s -I "$INFLUX_URL/ping" | grep -q "204 No Content"; then
    curl -X POST $SLACK_WEBHOOK \
        -H 'Content-Type: application/json' \
        -d '{"text":"InfluxDB is DOWN!"}'
    exit 1
fi

# Check write performance
WRITE_RATE=$(influx -execute "SELECT derivative(mean(\"pointReq\"), 1s) FROM \"_internal\".\"monitor\".\"write\" WHERE time > now() - 5m" | tail -1 | awk '{print $3}')

if (( $(echo "$WRITE_RATE < 100" | bc -l) )); then
    curl -X POST $SLACK_WEBHOOK \
        -H 'Content-Type: application/json' \
        -d "{\"text\":\"Low write rate: $WRITE_RATE points/sec\"}"
fi

echo "Health check passed"
```

---

## Module 4: Alerting Systems (15 minutes)

### 4.1 Alert Design Principles

**Alert Best Practices:**

**1. Actionable Alerts Only**
```
Good Alert: "Database write queue > 10000 for 5 minutes"
           → Action: Scale up write capacity or investigate

Bad Alert:  "CPU usage > 50%"
           → Action: None (50% is normal)
```

**2. Alert Severity Levels**
```
CRITICAL: Immediate action required (page on-call)
  Example: Database down, data loss imminent

WARNING: Attention needed during business hours
  Example: Disk usage > 80%, slow queries

INFO: Informational, no action required
  Example: Deployment completed, backup finished
```

**3. Alert Fatigue Prevention**
```
Strategies:
├── Use appropriate thresholds
├── Add evaluation periods (don't alert on spikes)
├── Group related alerts
├── Set quiet periods (maintenance windows)
├── Escalation policies
└── Alert dependencies
```

### 4.2 Grafana Alerting

**Grafana Alert Configuration:**

**Simple Threshold Alert:**

**Alert Rule:**
```json
{
  "name": "High CPU Usage",
  "conditions": [
    {
      "type": "query",
      "query": {
        "model": {
          "refId": "A",
          "query": "SELECT mean(\"usage_system\") FROM \"cpu\" WHERE $timeFilter AND \"cpu\" = 'cpu-total' GROUP BY time(1m)"
        }
      },
      "reducer": {
        "type": "avg"
      },
      "evaluator": {
        "type": "gt",
        "params": [80]
      }
    }
  ],
  "executionErrorState": "alerting",
  "frequency": "1m",
  "for": "5m",
  "message": "CPU usage has been above 80% for 5 minutes",
  "noDataState": "no_data",
  "notifications": [
    {
      "uid": "slack-channel"
    }
  ]
}
```

**Multi-Condition Alert:**

```json
{
  "name": "Database Under Stress",
  "conditions": [
    {
      "type": "query",
      "query": {
        "refId": "A",
        "query": "SELECT mean(\"queryDurationNs\") / 1000000 FROM \"_internal\".\"monitor\".\"queryExecutor\" WHERE $timeFilter"
      },
      "reducer": {"type": "avg"},
      "evaluator": {"type": "gt", "params": [5000]}
    },
    {
      "type": "query",
      "query": {
        "refId": "B",
        "query": "SELECT derivative(mean(\"writeReq\"), 1s) FROM \"_internal\".\"monitor\".\"write\" WHERE $timeFilter"
      },
      "reducer": {"type": "avg"},
      "evaluator": {"type": "gt", "params": [10000]}
    }
  ],
  "operator": "and",
  "message": "High query latency AND high write rate detected",
  "for": "5m"
}
```

**Notification Channels:**

**Slack Integration:**
```json
{
  "name": "Slack - Alerts",
  "type": "slack",
  "settings": {
    "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    "recipient": "#alerts",
    "username": "Grafana",
    "icon_emoji": ":grafana:",
    "mentionChannel": "here"
  },
  "sendReminder": true,
  "frequency": "1h"
}
```

**Email Integration:**
```json
{
  "name": "Email - Ops Team",
  "type": "email",
  "settings": {
    "addresses": "ops-team@example.com;oncall@example.com",
    "singleEmail": false
  }
}
```

**PagerDuty Integration:**
```json
{
  "name": "PagerDuty - Critical",
  "type": "pagerduty",
  "settings": {
    "integrationKey": "YOUR_INTEGRATION_KEY",
    "severity": "critical",
    "autoResolve": true
  }
}
```

**Webhook Integration:**
```json
{
  "name": "Custom Webhook",
  "type": "webhook",
  "settings": {
    "url": "https://api.example.com/alerts",
    "httpMethod": "POST",
    "username": "grafana",
    "password": "secret",
    "authorization": "Bearer TOKEN"
  }
}
```

### 4.3 InfluxDB 2.x Checks and Notifications

**InfluxDB 2.x Built-in Alerting:**

**Threshold Check:**

```flux
// Define check
from(bucket: "telegraf")
  |> range(start: -5m)
  |> filter(fn: (r) => r["_measurement"] == "cpu")
  |> filter(fn: (r) => r["_field"] == "usage_system")
  |> filter(fn: (r) => r["cpu"] == "cpu-total")
  |> aggregateWindow(every: 1m, fn: mean)
  |> yield(name: "mean")
  
// Threshold levels
// CRIT: > 95%
// WARN: > 80%
// INFO: > 70%
// OK: <= 70%
```

**Via UI:**
```
1. Navigate to Alerts → Checks
2. Click "Create Check"
3. Select "Threshold Check"
4. Configure:
   - Name: "High CPU Usage"
   - Query: [Flux query above]
   - Thresholds:
     * CRIT: 95
     * WARN: 80
     * INFO: 70
   - Check every: 1m
   - Status message: "CPU usage is ${r._level}"
```

**Deadman Check (No Data):**

```flux
from(bucket: "telegraf")
  |> range(start: -10m)
  |> filter(fn: (r) => r["_measurement"] == "heartbeat")
  |> filter(fn: (r) => r["service"] == "critical-app")
  |> aggregateWindow(every: 1m, fn: count)
  |> yield(name: "count")

// Alert if count = 0 for 5 minutes
```

**Notification Endpoints:**

**Slack Notification:**
```
Settings:
- Name: Slack Alerts
- Type: Slack
- Webhook URL: https://hooks.slack.com/services/...
- Channel: #alerts
```

**HTTP Notification:**
```
Settings:
- Name: Custom Webhook
- Type: HTTP
- URL: https://api.example.com/influx-alerts
- Method: POST
- Auth: Bearer token
```

**Notification Rules:**

```
Rule: Critical Alerts to PagerDuty
- Match: status == "crit"
- Endpoint: PagerDuty
- Message: "${r._check_name}: ${r._message}"
- Every: on status change
- Offset: 0s
- Status: active

Rule: Warnings to Slack
- Match: status == "warn"
- Endpoint: Slack
- Message: ":warning: ${r._check_name} on ${r.host}"
- Every: 15m
- Status: active
```

### 4.4 Kapacitor Alerting (TICK Stack)

**Kapacitor Overview:**
Kapacitor is InfluxData's real-time streaming data processing engine, designed for alerting and data transformation.

**Installation:**
```bash
wget https://dl.influxdata.com/kapacitor/releases/kapacitor_1.6.4_amd64.deb
sudo dpkg -i kapacitor_1.6.4_amd64.deb
sudo systemctl start kapacitor
sudo systemctl enable kapacitor
```

**Configuration:**
```toml
# /etc/kapacitor/kapacitor.conf

[influxdb]
  enabled = true
  default = true
  name = "localhost"
  urls = ["http://localhost:8086"]
  username = ""
  password = ""
  timeout = 0
  
[slack]
  enabled = true
  url = "https://hooks.slack.com/services/YOUR/WEBHOOK"
  channel = "#alerts"
  global = false
  state-changes-only = false
```

**TICKscript Example - CPU Alert:**

```javascript
// cpu_alert.tick

// Stream data from InfluxDB
stream
  |from()
    .measurement('cpu')
    .where(lambda: "cpu" == 'cpu-total')
  |window()
    .period(5m)
    .every(1m)
  |mean('usage_idle')
    .as('usage_idle')
  // Invert to get usage (100 - idle)
  |eval(lambda: 100.0 - "usage_idle")
    .as('cpu_usage')
  |alert()
    .id('cpu-alert')
    .message('{{ .ID }}: CPU usage is {{ index .Fields "cpu_usage" | printf "%0.2f" }}% on {{ index .Tags "host" }}')
    .info(lambda: "cpu_usage" > 70.0)
    .warn(lambda: "cpu_usage" > 85.0)
    .crit(lambda: "cpu_usage" > 95.0)
    .stateChangesOnly()
    // Send to Slack
    .slack()
      .channel('#alerts')
    // Send to PagerDuty for critical
    .pagerDuty()
      .serviceKey('YOUR_SERVICE_KEY')
```

**Loading TICKscript:**
```bash
# Define task
kapacitor define cpu_alert \
  -type stream \
  -tick cpu_alert.tick \
  -dbrp telegraf.autogen

# Enable task
kapacitor enable cpu_alert

# Show task status
kapacitor show cpu_alert

# Test with historical data
kapacitor replay -recording <recording-id> -task cpu_alert
```

**Anomaly Detection with Kapacitor:**

```javascript
// anomaly_detection.tick

stream
  |from()
    .measurement('requests')
  |window()
    .period(10m)
    .every(1m)
  |mean('count')
    .as('mean')
  |eval(lambda: sigma("mean"))
    .as('sigma')
  // Alert if current value is 3 standard deviations from mean
  |alert()
    .id('anomaly-detection')
    .message('Anomaly detected: {{ index .Fields "mean" }} (σ={{ index .Fields "sigma" }})')
    .crit(lambda: abs("mean" - "sigma") > 3.0)
    .slack()
```

### 4.5 Alert Testing and Validation

**Testing Alerts Before Production:**

**Grafana Alert Testing:**
```
1. Create alert rule
2. Set short evaluation period (30s)
3. Use "Test Rule" button
4. Verify notification delivery
5. Adjust thresholds based on test
6. Update to production settings
```

**Simulate High Load:**
```bash
# Generate test data to trigger alerts
for i in {1..1000}; do
  influx -execute "INSERT cpu,host=test-server usage_system=95.0"
  sleep 1
done
```

**Alert Documentation Template:**

```markdown
# Alert: High CPU Usage

## Trigger Conditions
- CPU usage > 80% for 5 consecutive minutes
- Measured on cpu-total
- All production hosts

## Severity
WARNING

## Notification
- Slack: #ops-team
- Email: ops-team@example.com

## Response Procedure
1. Check current load in dashboard
2. Identify top processes: `top` or `htop`
3. Review recent deployments
4. Scale horizontally if sustained
5. Create incident if not resolved in 30m

## False Positive Scenarios
- Scheduled batch jobs (02:00-04:00 UTC)
- Deployment windows (exclude from alerting)
- Load testing (coordinate with QA team)

## Historical Context
- Normal CPU: 20-40%
- Peak hours: 50-70%
- Alert threshold: 80%
- Critical threshold: 95%
```

---

## Hands-On Lab Exercises

### Lab 1: Build a Complete Grafana Dashboard (15 minutes)

**Objective:** Create a production-ready system monitoring dashboard

**Requirements:**
1. Install Grafana
2. Connect to InfluxDB
3. Create dashboard with 6 panels:
   - CPU Usage (time series)
   - Memory Usage (time series)
   - Disk Usage (gauge)
   - Network Traffic (stacked area)
   - System Load (stat)
   - Top Processes (table)
4. Add variables for host filtering
5. Set refresh rate to 30s
6. Export dashboard JSON

**Solution Outline:**
```
1. Install: docker run -d -p 3000:3000 grafana/grafana-oss
2. Add data source: InfluxDB at localhost:8086
3. Create panels using queries from Module 2
4. Add host variable: SHOW TAG VALUES WITH KEY = "host"
5. Configure refresh: Dashboard settings → Time options → 30s
6. Export: Dashboard settings → JSON Model
```

### Lab 2: Set Up InfluxDB Monitoring (10 minutes)

**Objective:** Monitor InfluxDB internal metrics

**Tasks:**
1. Query internal metrics
2. Create Telegraf config for InfluxDB monitoring
3. Build InfluxDB health dashboard in Grafana
4. Monitor write/query performance

**Commands:**
```bash
# Install Telegraf
sudo apt-get install telegraf

# Configure
cat > /etc/telegraf/telegraf.d/influxdb.conf <<EOF
[[inputs.influxdb]]
  urls = ["http://localhost:8086/debug/vars"]
[[outputs.influxdb_v2]]
  urls = ["http://localhost:8086"]
  token = "$TOKEN"
  organization = "my-org"
  bucket = "monitoring"
EOF

# Start
sudo systemctl restart telegraf
```

### Lab 3: Configure Multi-Channel Alerting (15 minutes)

**Objective:** Set up comprehensive alerting

**Requirements:**
1. Create Slack notification channel
2. Create email notification channel
3. Set up 3 alerts:
   - High CPU (> 80% for 5min) → Slack
   - High query latency (> 5s) → Email
   - Database down → Slack + Email
4. Test each alert
5. Document response procedures

**Grafana Alert Example:**
```json
{
  "name": "Database Down",
  "conditions": [{
    "type": "query",
    "query": {
      "refId": "A",
      "query": "SELECT count(*) FROM _internal.monitor.httpd"
    },
    "reducer": {"type": "last"},
    "evaluator": {"type": "no_value"}
  }],
  "executionErrorState": "alerting",
  "for": "2m",
  "frequency": "1m",
  "notifications": [
    {"uid": "slack-critical"},
    {"uid": "email-ops"}
  ]
}
```

### Lab 4: Create Custom Visualization (10 minutes)

**Objective:** Build custom chart with Python

**Requirements:**
1. Install influxdb-client for Python
2. Query CPU data for last hour
3. Create matplotlib visualization
4. Add threshold lines
5. Save as PNG

**Python Script:**
```python
from influxdb_client import InfluxDBClient
import matplotlib.pyplot as plt
import pandas as pd

client = InfluxDBClient(
    url="http://localhost:8086",
    token="my-token",
    org="my-org"
)

query = '''
from(bucket: "telegraf")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "cpu")
  |> filter(fn: (r) => r["_field"] == "usage_system")
  |> aggregateWindow(every: 1m, fn: mean)
'''

df = client.query_api().query_data_frame(query)

plt.figure(figsize=(14, 6))
plt.plot(df['_time'], df['_value'], label='CPU Usage', linewidth=2)
plt.axhline(y=80, color='orange', linestyle='--', label='Warning (80%)')
plt.axhline(y=95, color='red', linestyle='--', label='Critical (95%)')
plt.title('CPU Usage - Last Hour', fontsize=16)
plt.xlabel('Time')
plt.ylabel('CPU %')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('cpu_dashboard.png', dpi=300)
print("Dashboard saved to cpu_dashboard.png")
```

---

## Best Practices Summary

### Dashboard Design

**Do:**
- ✅ Use consistent color schemes
- ✅ Group related metrics
- ✅ Add clear labels and units
- ✅ Include timestamp/refresh info
- ✅ Use appropriate chart types
- ✅ Add variables for filtering
- ✅ Document queries and thresholds

**Don't:**
- ❌ Overload with too many panels (max 12)
- ❌ Use default panel titles
- ❌ Ignore mobile responsiveness
- ❌ Forget to add legends
- ❌ Use confusing color schemes
- ❌ Skip documentation

### Alerting

**Do:**
- ✅ Make alerts actionable
- ✅ Use appropriate severity levels
- ✅ Add evaluation periods
- ✅ Include context in messages
- ✅ Test before production
- ✅ Document response procedures
- ✅ Review and tune regularly

**Don't:**
- ❌ Alert on everything
- ❌ Use same channel for all severities
- ❌ Forget to test notifications
- ❌ Alert without context
- ❌ Ignore alert fatigue
- ❌ Set unrealistic thresholds

### Monitoring

**Do:**
- ✅ Monitor at multiple levels (system, app, business)
- ✅ Use internal and external monitoring
- ✅ Set baseline metrics
- ✅ Track trends over time
- ✅ Monitor the monitor (meta-monitoring)
- ✅ Regular health checks
- ✅ Capacity planning

**Don't:**
- ❌ Monitor only when problems occur
- ❌ Rely on single monitoring tool
- ❌ Ignore historical data
- ❌ Skip documentation
- ❌ Forget about costs

---

## Key Takeaways

### Tool Selection
1. **Grafana** for production dashboards and complex visualizations
2. **Chronograf** for quick TICK stack integration
3. **InfluxDB UI** for native v2.x experience
4. **Custom code** for specialized needs

### Visualization
1. Choose appropriate chart types for data
2. Use consistent design patterns
3. Optimize for different screen sizes
4. Include sufficient context

### Monitoring
1. Monitor InfluxDB internal metrics
2. Use Telegraf for system-level monitoring
3. Integrate with existing monitoring ecosystems
4. Regular review and optimization

### Alerting
1. Actionable alerts only
2. Appropriate severity levels
3. Multiple notification channels
4. Regular testing and tuning
5. Clear documentation

---

## Additional Resources

### Official Documentation
- Grafana: https://grafana.com/docs/
- Chronograf: https://docs.influxdata.com/chronograf/
- InfluxDB Monitoring: https://docs.influxdata.com/influxdb/v2.0/monitor-alert/
- Kapacitor: https://docs.influxdata.com/kapacitor/

### Community Resources
- Grafana Dashboards: https://grafana.com/grafana/dashboards/
- InfluxDB Community Forum
- Grafana Community Forum

### Tools
- Grafana Cloud (managed service)
- Chronograf (TICK stack)
- Kapacitor (alerting)
- Telegraf (data collection)

---

## Course Summary

**You've mastered:**
- ✓ Visualization tool selection and configuration
- ✓ Dashboard and chart design principles
- ✓ InfluxDB internal metrics monitoring
- ✓ Comprehensive alerting strategies
- ✓ Integration with monitoring ecosystems
- ✓ Production-ready monitoring setup

**Next Steps:**
1. Build your first production dashboard
2. Set up monitoring for InfluxDB
3. Configure critical alerts
4. Document your monitoring strategy
5. Regular review and optimization

---

*End of Course - Duration: 60 minutes*

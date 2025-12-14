# InfluxDB 3 Core - Live Demo Script
## 15-Minute Technical Demonstration

---

## Pre-Demo Setup (Do this before presenting)

```bash
# 1. Ensure Docker is running
docker ps

# 2. Start InfluxDB 3 Core
docker run -d \
  --name influxdb3-demo \
  -p 8086:8086 \
  influxdata/influxdb:3.0-core

# 3. Wait for startup (5 seconds)
sleep 5

# 4. Create demo database
curl -X POST "http://localhost:8086/api/v3/configure" \
  -H "Content-Type: application/json" \
  -d '{"database": "smart_home_demo"}'

# 5. Verify it's running
curl http://localhost:8086/health

# Expected: {"status":"pass"}
```

---

## DEMO PART 1: Introduction & Setup (2 minutes)

### What to Say:
"Welcome! Today I'll demonstrate InfluxDB 3 Core - a modern time-series database built on Apache Arrow and Parquet. We'll simulate a smart home IoT system with real-time sensor data."

### Show Running Container:
```bash
docker ps | grep influxdb3-demo
```

### What to Say:
"InfluxDB 3 Core runs in a single Docker container. Notice we're exposing port 8086 for the HTTP API."

### Quick Health Check:
```bash
curl http://localhost:8086/health
```

### What to Say:
"The API is responding. We're ready to ingest and query data using standard HTTP endpoints."

---

## DEMO PART 2: Writing Data - Line Protocol (3 minutes)

### What to Say:
"InfluxDB uses Line Protocol for writes. The format is: measurement, tags, fields, timestamp. Let me show you with smart home sensors."

### Create Sample Data File:
```bash
cat > smart_home_data.txt << 'EOF'
temperature,room=living_room,sensor=th01 celsius=22.5,fahrenheit=72.5
temperature,room=bedroom,sensor=th02 celsius=20.1,fahrenheit=68.2
temperature,room=kitchen,sensor=th03 celsius=24.3,fahrenheit=75.7
humidity,room=living_room,sensor=th01 percent=45.2
humidity,room=bedroom,sensor=th02 percent=52.8
humidity,room=kitchen,sensor=th03 percent=38.9
power,appliance=refrigerator,location=kitchen watts=150i,kwh_daily=3.6
power,appliance=ac,location=living_room watts=1200i,kwh_daily=12.5
power,appliance=tv,location=living_room watts=85i,kwh_daily=2.1
motion,room=hallway,sensor=m01 detected=true,battery=87i
motion,room=bedroom,sensor=m02 detected=false,battery=92i
door,location=front_door,sensor=d01 is_open=false,battery=78i
door,location=back_door,sensor=d02 is_open=false,battery=95i
EOF
```

### What to Say:
"I've created a file with 13 data points representing temperature, humidity, power consumption, motion sensors, and door sensors. Notice the syntax:"
- "Tags: room, sensor, appliance - for filtering and grouping"
- "Fields: celsius, watts, detected - the actual measurements"
- "Data types: floats (default), integers (suffix 'i'), booleans, strings"

### Write the Data:
```bash
curl -X POST "http://localhost:8086/api/v3/write?db=smart_home_demo" \
  --data-binary @smart_home_data.txt

echo "✅ Data written successfully"
```

### What to Say:
"The data is now persisted in InfluxDB. The write path involves:"
1. "Parsing the Line Protocol"
2. "Writing to WAL for durability"
3. "Storing in columnar Arrow format in memory"
4. "Eventually flushing to compressed Parquet files"

---

## DEMO PART 3: Basic Querying with SQL (4 minutes)

### What to Say:
"Unlike InfluxDB 2.x which used Flux, version 3 uses standard SQL. Let's query our smart home data."

### Query 1: Simple SELECT
```bash
echo "=== Query 1: View All Temperature Readings ==="
curl -s -X POST "http://localhost:8086/api/v3/query?db=smart_home_demo" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT * FROM temperature ORDER BY time DESC"
  }' | jq '.'
```

### What to Say:
"Standard SQL SELECT - notice we get all rooms with their temperatures. The data is already sorted by timestamp."

### Query 2: Filter by Tag
```bash
echo "=== Query 2: Living Room Temperature Only ==="
curl -s -X POST "http://localhost:8086/api/v3/query?db=smart_home_demo" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT room, celsius, fahrenheit FROM temperature WHERE room = '\''living_room'\''"
  }' | jq '.'
```

### What to Say:
"Filtering on tags is extremely fast because they're indexed. This is a key design decision - use tags for dimensions you filter by."

### Query 3: Aggregation
```bash
echo "=== Query 3: Average Temperature by Room ==="
curl -s -X POST "http://localhost:8086/api/v3/query?db=smart_home_demo" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT room, AVG(celsius) as avg_temp, MIN(celsius) as min_temp, MAX(celsius) as max_temp FROM temperature GROUP BY room"
  }' | jq '.'
```

### What to Say:
"GROUP BY works exactly as you'd expect in SQL. The columnar storage makes aggregations incredibly fast - it only reads the columns we need."

### Query 4: Cross-Measurement Analysis
```bash
echo "=== Query 4: Total Power Consumption ==="
curl -s -X POST "http://localhost:8086/api/v3/query?db=smart_home_demo" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT appliance, watts, kwh_daily FROM power ORDER BY watts DESC"
  }' | jq '.'
```

### What to Say:
"Let's see which appliances consume the most power..."

```bash
echo "=== Calculate Total Power Usage ==="
curl -s -X POST "http://localhost:8086/api/v3/query?db=smart_home_demo" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT SUM(watts) as total_watts, SUM(kwh_daily) as total_kwh_daily FROM power"
  }' | jq '.'
```

### What to Say:
"The house is currently using about 1435 watts, consuming about 18 kWh per day."

---

## DEMO PART 4: Time-Series Specific Features (3 minutes)

### What to Say:
"Now let's demonstrate time-series capabilities. First, I'll generate some historical data."

### Generate Time-Series Data:
```bash
echo "=== Generating 24 hours of temperature data ==="

# Generate hourly temperature readings for 24 hours
START_TS=1702468800000000000  # Dec 13, 2024 00:00:00 UTC
HOUR_NS=3600000000000         # 1 hour in nanoseconds

for hour in {0..23}; do
  timestamp=$((START_TS + hour * HOUR_NS))
  # Simulate temperature variation (low at night, high during day)
  base_temp=20
  variation=$(echo "$hour * 0.8 - ($hour - 12) * ($hour - 12) * 0.15" | bc -l)
  temp=$(echo "$base_temp + $variation" | bc -l | xargs printf "%.1f")
  
  echo "temp_history,location=office value=$temp $timestamp"
done | curl -s -X POST "http://localhost:8086/api/v3/write?db=smart_home_demo" \
  --data-binary @-

echo "✅ Generated 24 hours of data"
```

### Query 5: Time Bucketing
```bash
echo "=== Query 5: 6-Hour Temperature Averages ==="
curl -s -X POST "http://localhost:8086/api/v3/query?db=smart_home_demo" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT DATE_TRUNC('\''hour'\'', time) as hour, AVG(value) as avg_temp FROM temp_history GROUP BY hour ORDER BY hour"
  }' | jq '.[] | select(.hour != null) | {hour, avg_temp}'
```

### What to Say:
"DATE_TRUNC groups our data into time buckets. This is essential for time-series analysis - you can see temperature trending across the 24-hour period."

### Query 6: Moving Average (Advanced)
```bash
echo "=== Query 6: 3-Hour Moving Average ==="
curl -s -X POST "http://localhost:8086/api/v3/query?db=smart_home_demo" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT time, value as actual_temp, AVG(value) OVER (ORDER BY time ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING) as moving_avg FROM temp_history ORDER BY time LIMIT 10"
  }' | jq '.'
```

### What to Say:
"Window functions like moving averages smooth out noise in time-series data. This is using standard SQL OVER clauses - no proprietary syntax."

---

## DEMO PART 5: Device Health Monitoring (2 minutes)

### What to Say:
"Let's check the health of our IoT devices - a common real-world use case."

### Query 7: Low Battery Alert
```bash
echo "=== Query 7: Devices with Low Battery ==="
curl -s -X POST "http://localhost:8086/api/v3/query?db=smart_home_demo" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT '\''motion'\'' as sensor_type, room as location, sensor, battery FROM motion WHERE battery < 90 UNION ALL SELECT '\''door'\'' as sensor_type, location, sensor, battery FROM door WHERE battery < 90"
  }' | jq '.'
```

### What to Say:
"Using UNION ALL to check multiple sensor types. We found devices with batteries below 90%. In production, this would trigger alerts."

### Query 8: Current Status Dashboard
```bash
echo "=== Query 8: Smart Home Status Summary ==="
curl -s -X POST "http://localhost:8086/api/v3/query?db=smart_home_demo" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT '\''Temperature'\'' as metric, COUNT(*) as sensor_count FROM temperature UNION ALL SELECT '\''Humidity'\'', COUNT(*) FROM humidity UNION ALL SELECT '\''Power'\'', COUNT(*) FROM power UNION ALL SELECT '\''Motion'\'', COUNT(*) FROM motion UNION ALL SELECT '\''Door'\'', COUNT(*) FROM door"
  }' | jq '.'
```

### What to Say:
"Here's a summary of all active sensors in our smart home. This kind of query would populate a monitoring dashboard."

---

## DEMO PART 6: Performance Highlight (1 minute)

### What to Say:
"Let me show you why InfluxDB 3 is so fast. I'll write 10,000 data points."

### Performance Test:
```bash
echo "=== Writing 10,000 points ==="
time (
  for i in {1..10000}; do
    timestamp=$((1702468800000000000 + i * 1000000000))
    value=$((20 + RANDOM % 20))
    echo "perf_test,sensor=sensor_$((i % 100)) value=$value $timestamp"
  done | curl -s -X POST "http://localhost:8086/api/v3/write?db=smart_home_demo" \
    --data-binary @-
)
echo "✅ Write complete"
```

### What to Say:
"That was 10,000 points in under a second. Now let's query them."

```bash
echo "=== Aggregating 10,000 points ==="
time curl -s -X POST "http://localhost:8086/api/v3/query?db=smart_home_demo" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT sensor, AVG(value) as avg_value, COUNT(*) as count FROM perf_test GROUP BY sensor"
  }' | jq '. | length'
```

### What to Say:
"Sub-second aggregation across 10,000 points, grouped by 100 sensors. This is the power of columnar storage - it only reads the 'value' and 'sensor' columns."

---

## DEMO PART 7: Architecture Explanation (Closing - 1 minute)

### What to Say:
"Let me explain why InfluxDB 3 performs so well:"

### Show Key Points:
1. **Apache Arrow**: "Columnar in-memory format - processes batches of data with SIMD instructions"
2. **Parquet Storage**: "Compressed columnar files - 10-20x compression, column statistics for fast filtering"
3. **DataFusion**: "Rust-based SQL engine - vectorized execution, predicate pushdown"
4. **High Cardinality**: "Handles millions of unique time series - we just demonstrated 10,000 different sensors"

### Final Summary:
```bash
echo "=== Final: List All Measurements ==="
curl -s -X POST "http://localhost:8086/api/v3/query?db=smart_home_demo" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT table_name FROM information_schema.tables WHERE table_schema = '\''smart_home_demo'\''"
  }' | jq '.'
```

### What to Say:
"We've created 8 different measurements, ingested thousands of data points, and demonstrated SQL queries ranging from simple SELECTs to complex window functions - all with standard PostgreSQL-compatible SQL."

---

## DEMO CLEANUP (Optional - show if time permits)

```bash
# View all data
curl -s -X POST "http://localhost:8086/api/v3/query?db=smart_home_demo" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT COUNT(*) as total_points FROM temperature UNION ALL SELECT COUNT(*) FROM humidity UNION ALL SELECT COUNT(*) FROM power"
  }' | jq '.'

# Stop and remove container
docker stop influxdb3-demo
docker rm influxdb3-demo
```

---

## POST-DEMO Q&A - COMMON QUESTIONS

### Q: "Can I use this in production?"
**A:** "Yes, InfluxDB 3 Core is stable for single-node deployments. For clustered, high-availability setups, you'd want InfluxDB 3 Enterprise which adds features like multi-region replication and object storage support."

### Q: "How does this compare to InfluxDB 2?"
**A:** "Major differences:"
- "v2 used Flux, v3 uses SQL"
- "v2 had cardinality limits around 1 million series, v3 handles 100 million+"
- "v3 uses open standards (Arrow/Parquet) instead of proprietary TSM format"
- "v3 Core is API-only, no built-in UI"

### Q: "What about Grafana integration?"
**A:** "Grafana works today via SQL data source plugin. Native InfluxDB 3 plugin is coming in 2025."

### Q: "How do I migrate from v2?"
**A:** "Export from v2 as Line Protocol or CSV, transform if needed, import to v3. Queries need manual translation from Flux/InfluxQL to SQL. Official migration tools are in development."

### Q: "What's the write throughput?"
**A:** "Single node can handle 100,000+ points per second. We just demonstrated 10,000 points in under a second on a basic setup."

---

## DEMO SCRIPT NOTES FOR PRESENTER

### Before You Start:
- [ ] Docker running and tested
- [ ] InfluxDB 3 container started and healthy
- [ ] Database created
- [ ] Have `jq` installed for pretty JSON output
- [ ] Terminal font size increased for visibility
- [ ] Code snippets ready in separate terminal tabs

### Presentation Tips:
1. **Pace yourself** - Don't rush through curl commands
2. **Explain as you type** - Narrate what each command does
3. **Show the JSON output** - Use jq to make it readable
4. **Emphasize key concepts**:
   - Tags vs Fields
   - Columnar storage benefits
   - SQL standard compliance
5. **Have backup** - If live demo fails, have screenshots ready

### Time Management:
- Introduction: 2 min
- Writing data: 3 min
- Basic queries: 4 min
- Time-series features: 3 min
- Device monitoring: 2 min
- Performance test: 1 min
- Closing: 1 min
- **Total: 16 minutes** (leaves buffer for Q&A)

---

## BONUS: INTERACTIVE DEMO IDEAS

If you have extra time or want audience participation:

### 1. Live Data Ingestion:
"Let's ingest data from your laptop's CPU right now!"
```bash
echo "cpu,host=$(hostname) usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}') $(date +%s)000000000" | \
curl -X POST "http://localhost:8086/api/v3/write?db=smart_home_demo" --data-binary @-
```

### 2. Ask Audience for Query:
"What would you like to see? Temperature in Celsius or Fahrenheit?"

### 3. Show Failure Case:
"Let me show you what happens when you make a common mistake..."
```bash
# Intentional error - type conflict
echo "error_demo value=28.5" | curl -X POST "http://localhost:8086/api/v3/write?db=smart_home_demo" --data-binary @-
echo "error_demo value=\"offline\"" | curl -X POST "http://localhost:8086/api/v3/write?db=smart_home_demo" --data-binary @-
# Second write will fail with type conflict error
```

---

END OF DEMO SCRIPT

# 🔟 Real-World Use Cases & Demo Projects (Final Module)

---

## 10.1 Complete IoT Monitoring System

### **System Architecture:**

```
┌─────────────────────────────────────────────────────────┐
│         IoT Monitoring System Architecture              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  IoT Devices (Sensors)                                  │
│  ├─ Temperature Sensors (50)                            │
│  ├─ Humidity Sensors (50)                               │
│  ├─ Motion Sensors (20)                                 │
│  └─ Door Sensors (10)                                   │
│           ↓                                             │
│  Data Collector (Python)                                │
│  ├─ MQTT Subscriber                                     │
│  ├─ Data Validation                                     │
│  ├─ Batching (5000 points)                              │
│  └─ Error Handling                                      │
│           ↓                                             │
│  InfluxDB 3                                             │
│  ├─ Bucket: iot-sensors (7 days hot)                    │
│  ├─ Bucket: iot-sensors-5min (90 days warm)             │
│  └─ Bucket: iot-sensors-1hour (1 year cold)             │
│           ↓                                             │
│  Visualization (Grafana)                                │
│  ├─ Real-time Dashboard                                 │
│  ├─ Alerts (Temperature > 35°C)                         │
│  └─ Historical Analysis                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### **Implementation:**

**1. IoT Device Simulator:**

python

```python
#!/usr/bin/env python3
# iot_device_simulator.py

import json
import time
import random
from datetime import datetime
import paho.mqtt.client as mqtt

class IoTDevice:
    def __init__(self, device_id, device_type, location, floor):
        self.device_id = device_id
        self.device_type = device_type
        self.location = location
        self.floor = floor
        self.battery_level = 100
        self.last_reading_time = datetime.now()
  
    def generate_reading(self):
        """Generate sensor reading based on device type"""
      
        timestamp = datetime.utcnow().isoformat() + "Z"
      
        # Simulate battery drain
        self.battery_level = max(0, self.battery_level - random.uniform(0.001, 0.01))
      
        if self.device_type == "temperature":
            # Temperature sensor (18-35°C with realistic variations)
            base_temp = 25.0
            variation = random.gauss(0, 2)  # Normal distribution
          
            # Add time-based pattern (warmer in day)
            hour = datetime.now().hour
            if 10 <= hour <= 18:
                base_temp += 3
          
            return {
                "device_id": self.device_id,
                "device_type": self.device_type,
                "location": self.location,
                "floor": self.floor,
                "temperature": round(base_temp + variation, 2),
                "humidity": round(random.uniform(40, 80), 2),
                "battery_level": round(self.battery_level, 2),
                "signal_strength": random.randint(-90, -30),
                "timestamp": timestamp
            }
      
        elif self.device_type == "motion":
            # Motion sensor
            return {
                "device_id": self.device_id,
                "device_type": self.device_type,
                "location": self.location,
                "floor": self.floor,
                "motion_detected": random.choice([True, False, False, False]),  # 25% motion
                "battery_level": round(self.battery_level, 2),
                "sensitivity": random.randint(1, 10),
                "timestamp": timestamp
            }
      
        elif self.device_type == "door":
            # Door sensor
            return {
                "device_id": self.device_id,
                "device_type": self.device_type,
                "location": self.location,
                "floor": self.floor,
                "door_open": random.choice([True, False, False, False, False]),  # 20% open
                "open_count": random.randint(0, 5),
                "battery_level": round(self.battery_level, 2),
                "timestamp": timestamp
            }
      
        return None

class IoTFleetSimulator:
    def __init__(self, mqtt_broker, mqtt_port, mqtt_topic):
        self.mqtt_broker = mqtt_broker
        self.mqtt_port = mqtt_port
        self.mqtt_topic = mqtt_topic
        self.devices = []
        self.mqtt_client = None
      
        # Initialize MQTT client
        self.setup_mqtt()
  
    def setup_mqtt(self):
        """Setup MQTT client"""
        self.mqtt_client = mqtt.Client(client_id="iot_simulator")
        self.mqtt_client.connect(self.mqtt_broker, self.mqtt_port, 60)
        self.mqtt_client.loop_start()
        print(f"✓ Connected to MQTT broker: {self.mqtt_broker}:{self.mqtt_port}")
  
    def add_device(self, device_id, device_type, location, floor):
        """Add device to fleet"""
        device = IoTDevice(device_id, device_type, location, floor)
        self.devices.append(device)
        print(f"✓ Added device: {device_id} ({device_type}) at {location} floor {floor}")
  
    def create_fleet(self):
        """Create a fleet of IoT devices"""
      
        locations = ["warehouse_a", "warehouse_b", "office_main"]
        floors = ["1", "2", "3"]
      
        # Temperature sensors
        for i in range(1, 51):
            location = random.choice(locations)
            floor = random.choice(floors)
            self.add_device(f"TEMP_{i:03d}", "temperature", location, floor)
      
        # Motion sensors
        for i in range(1, 21):
            location = random.choice(locations)
            floor = random.choice(floors)
            self.add_device(f"MOTION_{i:03d}", "motion", location, floor)
      
        # Door sensors
        for i in range(1, 11):
            location = random.choice(locations)
            floor = random.choice(floors)
            self.add_device(f"DOOR_{i:03d}", "door", location, floor)
      
        print(f"\n✓ Fleet created: {len(self.devices)} devices")
  
    def publish_reading(self, reading):
        """Publish reading to MQTT"""
        message = json.dumps(reading)
        self.mqtt_client.publish(self.mqtt_topic, message)
  
    def run_simulation(self, interval=5, duration=None):
        """Run simulation"""
      
        print(f"\nStarting IoT fleet simulation...")
        print(f"Interval: {interval} seconds")
        print(f"Devices: {len(self.devices)}")
        print(f"Press Ctrl+C to stop\n")
      
        start_time = time.time()
        iteration = 0
      
        try:
            while True:
                iteration += 1
              
                # Check duration
                if duration and (time.time() - start_time) >= duration:
                    break
              
                # Generate and publish readings from all devices
                readings_count = 0
                for device in self.devices:
                    reading = device.generate_reading()
                    if reading:
                        self.publish_reading(reading)
                        readings_count += 1
              
                print(f"[{datetime.now()}] Iteration {iteration}: "
                      f"Published {readings_count} readings")
              
                time.sleep(interval)
      
        except KeyboardInterrupt:
            print("\n\nStopping simulation...")
      
        finally:
            self.mqtt_client.loop_stop()
            self.mqtt_client.disconnect()
            print(f"Simulation completed. Total iterations: {iteration}")

# Usage
if __name__ == "__main__":
    simulator = IoTFleetSimulator(
        mqtt_broker="localhost",
        mqtt_port=1883,
        mqtt_topic="iot/sensors"
    )
  
    # Create device fleet
    simulator.create_fleet()
  
    # Run simulation (5 second interval)
    simulator.run_simulation(interval=5)
```

---

**2. Data Collector & Writer:**

python

```python
#!/usr/bin/env python3
# iot_data_collector.py

import json
import time
import queue
import threading
import requests
import paho.mqtt.client as mqtt
from datetime import datetime

class IoTDataCollector:
    def __init__(self, mqtt_broker, mqtt_port, mqtt_topic, 
                 influx_url, influx_org, influx_bucket, influx_token):
      
        self.mqtt_broker = mqtt_broker
        self.mqtt_port = mqtt_port
        self.mqtt_topic = mqtt_topic
      
        self.influx_url = influx_url
        self.influx_org = influx_org
        self.influx_bucket = influx_bucket
        self.influx_token = influx_token
      
        self.data_queue = queue.Queue(maxsize=10000)
        self.batch_size = 5000
        self.flush_interval = 10  # seconds
      
        self.stats = {
            'messages_received': 0,
            'points_written': 0,
            'write_errors': 0,
            'invalid_messages': 0
        }
      
        self.running = True
      
        # Setup MQTT
        self.mqtt_client = mqtt.Client(client_id="iot_collector")
        self.mqtt_client.on_connect = self.on_mqtt_connect
        self.mqtt_client.on_message = self.on_mqtt_message
      
        # Setup HTTP session for InfluxDB
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Token {influx_token}',
            'Content-Type': 'text/plain; charset=utf-8'
        })
  
    def on_mqtt_connect(self, client, userdata, flags, rc):
        """MQTT connection callback"""
        if rc == 0:
            print(f"✓ Connected to MQTT broker")
            client.subscribe(self.mqtt_topic)
            print(f"✓ Subscribed to topic: {self.mqtt_topic}")
        else:
            print(f"✗ Failed to connect to MQTT: {rc}")
  
    def on_mqtt_message(self, client, userdata, msg):
        """MQTT message callback"""
        try:
            # Parse JSON message
            reading = json.loads(msg.payload.decode())
          
            # Validate message
            if self.validate_reading(reading):
                # Add to queue
                self.data_queue.put(reading)
                self.stats['messages_received'] += 1
            else:
                self.stats['invalid_messages'] += 1
      
        except json.JSONDecodeError:
            self.stats['invalid_messages'] += 1
        except queue.Full:
            print("⚠️  Queue full, dropping message")
  
    def validate_reading(self, reading):
        """Validate sensor reading"""
        required_fields = ['device_id', 'device_type', 'timestamp']
        return all(field in reading for field in required_fields)
  
    def convert_to_line_protocol(self, reading):
        """Convert JSON reading to InfluxDB line protocol"""
      
        measurement = "iot_sensors"
      
        # Tags
        tags = {
            'device_id': reading['device_id'],
            'device_type': reading['device_type'],
            'location': reading['location'],
            'floor': reading['floor']
        }
        tag_str = ",".join([f"{k}={v}" for k, v in tags.items()])
      
        # Fields
        fields = []
      
        # Common fields
        if 'battery_level' in reading:
            fields.append(f"battery_level={reading['battery_level']}")
      
        # Type-specific fields
        if reading['device_type'] == 'temperature':
            fields.append(f"temperature={reading['temperature']}")
            fields.append(f"humidity={reading['humidity']}")
            fields.append(f"signal_strength={reading['signal_strength']}i")
      
        elif reading['device_type'] == 'motion':
            motion = str(reading['motion_detected']).lower()
            fields.append(f"motion_detected={motion}")
            fields.append(f"sensitivity={reading['sensitivity']}i")
      
        elif reading['device_type'] == 'door':
            door_open = str(reading['door_open']).lower()
            fields.append(f"door_open={door_open}")
            fields.append(f"open_count={reading['open_count']}i")
      
        field_str = ",".join(fields)
      
        # Timestamp (convert ISO to nanoseconds)
        timestamp = reading['timestamp']
        timestamp_ns = int(datetime.fromisoformat(
            timestamp.replace('Z', '+00:00')
        ).timestamp() * 1e9)
      
        # Line protocol
        line = f"{measurement},{tag_str} {field_str} {timestamp_ns}"
      
        return line
  
    def write_batch_to_influx(self, batch):
        """Write batch to InfluxDB"""
      
        if not batch:
            return True
      
        # Convert to line protocol
        lines = [self.convert_to_line_protocol(reading) for reading in batch]
        data = "\n".join(lines)
      
        try:
            response = self.session.post(
                f"{self.influx_url}/api/v2/write",
                params={
                    'org': self.influx_org,
                    'bucket': self.influx_bucket,
                    'precision': 'ns'
                },
                data=data,
                timeout=10
            )
          
            if response.status_code == 204:
                self.stats['points_written'] += len(batch)
                return True
            else:
                self.stats['write_errors'] += 1
                print(f"✗ Write error: {response.status_code}")
                return False
      
        except Exception as e:
            self.stats['write_errors'] += 1
            print(f"✗ Write exception: {e}")
            return False
  
    def writer_thread(self):
        """Background thread for writing batches"""
      
        batch = []
        last_flush = time.time()
      
        while self.running or not self.data_queue.empty():
            try:
                # Get reading from queue (with timeout)
                reading = self.data_queue.get(timeout=1)
                batch.append(reading)
              
                # Flush conditions
                should_flush = (
                    len(batch) >= self.batch_size or
                    time.time() - last_flush >= self.flush_interval
                )
              
                if should_flush:
                    self.write_batch_to_influx(batch)
                    batch = []
                    last_flush = time.time()
          
            except queue.Empty:
                # Timeout - flush if batch exists
                if batch and time.time() - last_flush >= self.flush_interval:
                    self.write_batch_to_influx(batch)
                    batch = []
                    last_flush = time.time()
      
        # Final flush
        if batch:
            self.write_batch_to_influx(batch)
  
    def stats_thread(self):
        """Background thread for printing stats"""
      
        while self.running:
            time.sleep(10)
            print(f"\n{'='*60}")
            print(f"Stats - {datetime.now()}")
            print('='*60)
            print(f"Messages received: {self.stats['messages_received']:,}")
            print(f"Points written:    {self.stats['points_written']:,}")
            print(f"Write errors:      {self.stats['write_errors']:,}")
            print(f"Invalid messages:  {self.stats['invalid_messages']:,}")
            print(f"Queue size:        {self.data_queue.qsize():,}")
            print('='*60 + '\n')
  
    def start(self):
        """Start the collector"""
      
        print("Starting IoT Data Collector...")
        print(f"MQTT: {self.mqtt_broker}:{self.mqtt_port}/{self.mqtt_topic}")
        print(f"InfluxDB: {self.influx_url}/{self.influx_org}/{self.influx_bucket}")
        print(f"Batch size: {self.batch_size}")
        print(f"Flush interval: {self.flush_interval}s\n")
      
        # Start writer thread
        writer = threading.Thread(target=self.writer_thread, daemon=True)
        writer.start()
      
        # Start stats thread
        stats = threading.Thread(target=self.stats_thread, daemon=True)
        stats.start()
      
        # Connect to MQTT
        self.mqtt_client.connect(self.mqtt_broker, self.mqtt_port, 60)
        self.mqtt_client.loop_start()
      
        try:
            # Keep main thread alive
            while True:
                time.sleep(1)
      
        except KeyboardInterrupt:
            print("\n\nStopping collector...")
            self.running = False
            self.mqtt_client.loop_stop()
            self.mqtt_client.disconnect()
          
            # Wait for writer to finish
            writer.join(timeout=30)
          
            print("\nFinal stats:")
            print(f"Messages received: {self.stats['messages_received']:,}")
            print(f"Points written:    {self.stats['points_written']:,}")
            print(f"Write errors:      {self.stats['write_errors']:,}")
            print("\nCollector stopped.")

# Usage
if __name__ == "__main__":
    collector = IoTDataCollector(
        mqtt_broker="localhost",
        mqtt_port=1883,
        mqtt_topic="iot/sensors",
        influx_url="http://localhost:8086",
        influx_org="my-org",
        influx_bucket="iot-sensors",
        influx_token="YOUR_TOKEN"
    )
  
    collector.start()
```

---

**3. Downsampling Job:**

python

```python
#!/usr/bin/env python3
# iot_downsampling_job.py

import requests
import time
from datetime import datetime, timedelta

class IoTDownsamplingJob:
    def __init__(self, influx_url, org, token):
        self.influx_url = influx_url
        self.org = org
        self.token = token
        self.headers = {
            'Authorization': f'Token {token}',
            'Content-Type': 'application/json'
        }
  
    def query(self, sql):
        """Execute SQL query"""
        response = requests.post(
            f"{self.influx_url}/api/v2/query?org={self.org}",
            headers=self.headers,
            json={'query': sql, 'type': 'sql'}
        )
      
        if response.status_code == 200:
            return response.json().get('data', [])
        return None
  
    def write(self, bucket, line_protocol):
        """Write line protocol"""
        write_headers = {
            'Authorization': f'Token {self.token}',
            'Content-Type': 'text/plain'
        }
      
        response = requests.post(
            f"{self.influx_url}/api/v2/write?org={self.org}&bucket={bucket}&precision=ns",
            headers=write_headers,
            data=line_protocol
        )
      
        return response.status_code == 204
  
    def downsample_5min(self):
        """Downsample to 5-minute aggregates"""
      
        print(f"\n[{datetime.now()}] Downsampling to 5-minute aggregates...")
      
        # Query hot data (1 hour old)
        sql = """
        SELECT 
            date_bin(INTERVAL '5 minutes', time) as time_bucket,
            device_id,
            device_type,
            location,
            floor,
            AVG(temperature) as avg_temp,
            MIN(temperature) as min_temp,
            MAX(temperature) as max_temp,
            AVG(humidity) as avg_humidity,
            AVG(battery_level) as avg_battery,
            COUNT(*) as sample_count
        FROM "iot-sensors"
        WHERE time >= now() - INTERVAL '65 minutes'
          AND time < now() - INTERVAL '60 minutes'
          AND device_type = 'temperature'
        GROUP BY time_bucket, device_id, device_type, location, floor
        ORDER BY time_bucket
        """
      
        results = self.query(sql)
      
        if not results:
            print("  No data to downsample")
            return
      
        # Convert to line protocol
        lines = []
        for row in results:
            tags = (f"device_id={row['device_id']},"
                   f"device_type={row['device_type']},"
                   f"location={row['location']},"
                   f"floor={row['floor']}")
          
            fields = (f"avg_temp={row['avg_temp']},"
                     f"min_temp={row['min_temp']},"
                     f"max_temp={row['max_temp']},"
                     f"avg_humidity={row['avg_humidity']},"
                     f"avg_battery={row['avg_battery']},"
                     f"sample_count={row['sample_count']}i")
          
            timestamp_ns = row['time_bucket']
          
            line = f"iot_sensors_5min,{tags} {fields} {timestamp_ns}"
            lines.append(line)
      
        # Write to warm bucket
        if lines:
            line_protocol = "\n".join(lines)
            if self.write("iot-sensors-5min", line_protocol):
                print(f"  ✓ Wrote {len(lines)} downsampled points (5-min)")
            else:
                print(f"  ✗ Failed to write downsampled data")
  
    def downsample_1hour(self):
        """Downsample to 1-hour aggregates"""
      
        print(f"\n[{datetime.now()}] Downsampling to 1-hour aggregates...")
      
        # Query warm data (1 day old)
        sql = """
        SELECT 
            date_bin(INTERVAL '1 hour', time_bucket) as time_bucket,
            device_id,
            device_type,
            location,
            floor,
            AVG(avg_temp) as avg_temp,
            MIN(min_temp) as min_temp,
            MAX(max_temp) as max_temp,
            AVG(avg_humidity) as avg_humidity,
            AVG(avg_battery) as avg_battery,
            SUM(sample_count) as sample_count
        FROM "iot-sensors-5min"
        WHERE time_bucket >= now() - INTERVAL '25 hours'
          AND time_bucket < now() - INTERVAL '24 hours'
        GROUP BY time_bucket, device_id, device_type, location, floor
        ORDER BY time_bucket
        """
      
        results = self.query(sql)
      
        if not results:
            print("  No data to downsample")
            return
      
        # Convert and write (similar to 5-min)
        lines = []
        for row in results:
            tags = (f"device_id={row['device_id']},"
                   f"device_type={row['device_type']},"
                   f"location={row['location']},"
                   f"floor={row['floor']}")
          
            fields = (f"avg_temp={row['avg_temp']},"
                     f"min_temp={row['min_temp']},"
                     f"max_temp={row['max_temp']},"
                     f"avg_humidity={row['avg_humidity']},"
                     f"avg_battery={row['avg_battery']},"
                     f"sample_count={row['sample_count']}i")
          
            timestamp_ns = row['time_bucket']
          
            line = f"iot_sensors_1hour,{tags} {fields} {timestamp_ns}"
            lines.append(line)
      
        if lines:
            line_protocol = "\n".join(lines)
            if self.write("iot-sensors-1hour", line_protocol):
                print(f"  ✓ Wrote {len(lines)} downsampled points (1-hour)")
            else:
                print(f"  ✗ Failed to write downsampled data")
  
    def run_continuous(self):
        """Run continuous downsampling"""
      
        print("Starting continuous downsampling job...")
        print("5-min aggregates: Every 5 minutes")
        print("1-hour aggregates: Every hour\n")
      
        last_5min = time.time()
        last_1hour = time.time()
      
        while True:
            try:
                now = time.time()
              
                # Run 5-min downsampling every 5 minutes
                if now - last_5min >= 300:
                    self.downsample_5min()
                    last_5min = now
              
                # Run 1-hour downsampling every hour
                if now - last_1hour >= 3600:
                    self.downsample_1hour()
                    last_1hour = now
              
                time.sleep(60)  # Check every minute
          
            except KeyboardInterrupt:
                print("\nStopping downsampling job...")
                break
          
            except Exception as e:
                print(f"Error: {e}")
                time.sleep(60)

# Usage
if __name__ == "__main__":
    job = IoTDownsamplingJob(
        influx_url="http://localhost:8086",
        org="my-org",
        token="YOUR_TOKEN"
    )
  
    job.run_continuous()
```

---

**4. Alerting System:**

python

```python
#!/usr/bin/env python3
# iot_alerting.py

import requests
import time
import smtplib
from email.mime.text import MIMEText
from datetime import datetime

class IoTAlertingSystem:
    def __init__(self, influx_url, org, token, smtp_config):
        self.influx_url = influx_url
        self.org = org
        self.token = token
        self.smtp_config = smtp_config
      
        self.alert_thresholds = {
            'temperature_high': 35.0,
            'temperature_low': 10.0,
            'humidity_high': 85.0,
            'battery_low': 20.0
        }
      
        self.alert_cooldown = {}  # Prevent alert spam
        self.cooldown_period = 300  # 5 minutes
  
    def query(self, sql):
        """Execute SQL query"""
        response = requests.post(
            f"{self.influx_url}/api/v2/query?org={self.org}",
            headers={
                'Authorization': f'Token {self.token}',
                'Content-Type': 'application/json'
            },
            json={'query': sql, 'type': 'sql'}
        )
      
        if response.status_code == 200:
            return response.json().get('data', [])
        return None
  
    def send_alert(self, subject, message):
        """Send alert email"""
      
        msg = MIMEText(message)
        msg['Subject'] = f"[IoT ALERT] {subject}"
        msg['From'] = self.smtp_config['from']
        msg['To'] = ', '.join(self.smtp_config['to'])
      
        try:
            with smtplib.SMTP(self.smtp_config['host'], self.smtp_config['port']) as server:
                server.starttls()
                server.login(self.smtp_config['username'], self.smtp_config['password'])
                server.send_message(msg)
          
            print(f"✓ Alert sent: {subject}")
            return True
      
        except Exception as e:
            print(f"✗ Failed to send alert: {e}")
            return False
  
    def check_alert_cooldown(self, alert_key):
        """Check if alert is in cooldown period"""
        if alert_key in self.alert_cooldown:
            elapsed = time.time() - self.alert_cooldown[alert_key]
            if elapsed < self.cooldown_period:
                return True
        return False
  
    def set_alert_cooldown(self, alert_key):
        """Set alert cooldown"""
        self.alert_cooldown[alert_key] = time.time()
  
    def check_temperature_alerts(self):
        """Check for temperature threshold violations"""
      
        sql = f"""
        SELECT 
            device_id,
            location,
            floor,
            temperature
        FROM "iot-sensors"
        WHERE time >= now() - INTERVAL '5 minutes'
          AND device_type = 'temperature'
          AND (temperature > {self.alert_thresholds['temperature_high']}
               OR temperature < {self.alert_thresholds['temperature_low']})
        ORDER BY time DESC
        LIMIT 10
        """
      
        results = self.query(sql)
      
        if results:
            for row in results:
                alert_key = f"temp_{row['device_id']}"
              
                if self.check_alert_cooldown(alert_key):
                    continue
              
                temp = row['temperature']
                if temp > self.alert_thresholds['temperature_high']:
                    subject = f"High Temperature Alert - {row['device_id']}"
                    message = f"""
High temperature detected:

Device: {row['device_id']}
Location: {row['location']}, Floor {row['floor']}
Temperature: {temp}°C (Threshold: {self.alert_thresholds['temperature_high']}°C)
Time: {datetime.now()}

Please investigate immediately.
                    """
                    self.send_alert(subject, message)
                    self.set_alert_cooldown(alert_key)
  
    def check_battery_alerts(self):
        """Check for low battery"""
      
        sql = f"""
        SELECT 
            device_id,
            device_type,
            location,
            floor,
            battery_level
        FROM "iot-sensors"
        WHERE time >= now() - INTERVAL '5 minutes'
          AND battery_level < {self.alert_thresholds['battery_low']}
        ORDER BY battery_level ASC
        LIMIT 10
        """
      
        results = self.query(sql)
      
        if results:
            for row in results:
                alert_key = f"battery_{row['device_id']}"
              
                if self.check_alert_cooldown(alert_key):
                    continue
              
                subject = f"Low Battery Alert - {row['device_id']}"
                message = f"""
Low battery detected:

Device: {row['device_id']} ({row['device_type']})
Location: {row['location']}, Floor {row['floor']}
Battery Level: {row['battery_level']}% (Threshold: {self.alert_thresholds['battery_low']}%)
Time: {datetime.now()}

Battery replacement needed.
                """
                self.send_alert(subject, message)
                self.set_alert_cooldown(alert_key)
  
    def run_monitoring(self):
        """Run continuous monitoring"""
      
        print("Starting IoT Alerting System...")
        print(f"Temperature high: >{self.alert_thresholds['temperature_high']}°C")
        print(f"Temperature low: <{self.alert_thresholds['temperature_low']}°C")
        print(f"Battery low: <{self.alert_thresholds['battery_low']}%")
        print(f"Check interval: 60 seconds\n")
      
        while True:
            try:
                print(f"[{datetime.now()}] Running checks...")
              
                self.check_temperature_alerts()
                self.check_battery_alerts()
              
                print("  ✓ Checks completed\n")
              
                time.sleep(60)
          
            except KeyboardInterrupt:
                print("\nStopping alerting system...")
                break
          
            except Exception as e:
                print(f"Error: {e}")
                time.sleep(60)

# Usage
if __name__ == "__main__":
    smtp_config = {
        'host': 'smtp.gmail.com',
        'port': 587,
        'username': 'alerts@example.com',
        'password': 'your_password',
        'from': 'alerts@example.com',
        'to': ['admin@example.com']
    }
  
    alerting = IoTAlertingSystem(
        influx_url="http://localhost:8086",
        org="my-org",
        token="YOUR_TOKEN",
        smtp_config=smtp_config
    )
  
    alerting.run_monitoring()
```

---

**5. Grafana Dashboard Queries:**

sql

```sql
-- Real-time Temperature by Location
SELECT 
    time,
    location,
    AVG(temperature) as avg_temp
FROM "iot-sensors"
WHERE time >= now() - INTERVAL '1 hour'
  AND device_type = 'temperature'
GROUP BY time, location
ORDER BY time

-- Device Health Overview
SELECT 
    device_id,
    device_type,
    location,
    AVG(battery_level) as avg_battery,
    COUNT(*) as reading_count
FROM "iot-sensors"
WHERE time >= now() - INTERVAL '24 hours'
GROUP BY device_id, device_type, location
ORDER BY avg_battery ASC

-- Temperature Heatmap (Last 7 Days)
SELECT 
    date_bin(INTERVAL '1 hour', time_bucket) as time,
    location,
    AVG(avg_temp) as temperature
FROM "iot-sensors-1hour"
WHERE time_bucket >= now() - INTERVAL '7 days'
GROUP BY time, location
ORDER BY time

-- Alert Summary
SELECT 
    COUNT(CASE WHEN temperature > 35 THEN 1 END) as high_temp_count,
    COUNT(CASE WHEN temperature < 10 THEN 1 END) as low_temp_count,
    COUNT(CASE WHEN battery_level < 20 THEN 1 END) as low_battery_count
FROM "iot-sensors"
WHERE time >= now() - INTERVAL '1 hour'
```

---

## 10.2 Application Performance Monitoring (APM)

### **System Overview:**

python

```python
#!/usr/bin/env python3
# apm_middleware.py

import time
import requests
from functools import wraps
from flask import Flask, request, g

app = Flask(__name__)

# InfluxDB Configuration
INFLUX_URL = "http://localhost:8086"
INFLUX_ORG = "my-org"
INFLUX_BUCKET = "apm"
INFLUX_TOKEN = "YOUR_TOKEN"

class APMTracker:
    def __init__(self, influx_url, org, bucket, token):
        self.influx_url = influx_url
        self.org = org
        self.bucket = bucket
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Token {token}',
            'Content-Type': 'text/plain'
        })
  
    def track_request(self, endpoint, method, status_code, 
                     response_time, user_id=None, error=None):
        """Track API request"""
      
        tags = (f"endpoint={endpoint},"
               f"method={method},"
               f"status_code={status_code}")
      
        fields = f"response_time={response_time}"
      
        if user_id:
            fields += f',user_id="{user_id}"'
      
        if error:
            fields += f',error="{error}"'
      
        timestamp = int(time.time() * 1e9)
      
        line = f"api_requests,{tags} {fields} {timestamp}"
      
        try:
            self.session.post(
                f"{self.influx_url}/api/v2/write",
                params={'org': self.org, 'bucket': self.bucket},
                data=line
            )
        except:
            pass  # Don't fail app if tracking fails

# Initialize tracker
apm = APMTracker(INFLUX_URL, INFLUX_ORG, INFLUX_BUCKET, INFLUX_TOKEN)

@app.before_request
def before_request():
    """Record request start time"""
    g.start_time = time.time()

@app.after_request
def after_request(response):
    """Track request after completion"""
  
    if hasattr(g, 'start_time'):
        response_time = (time.time() - g.start_time) * 1000  # ms
      
        apm.track_request(
            endpoint=request.endpoint or 'unknown',
            method=request.method,
            status_code=response.status_code,
            response_time=response_time,
            user_id=request.headers.get('X-User-ID')
        )
  
    return response

# Example API endpoints
@app.route('/api/users', methods=['GET'])
def get_users():
    # Simulate database query
    time.sleep(0.1)
    return {'users': [{'id': 1, 'name': 'Alice'}]}

@app.route('/api/products', methods=['GET'])
def get_products():
    time.sleep(0.05)
    return {'products': [{'id': 1, 'name': 'Widget'}]}

@app.route('/api/slow', methods=['GET'])
def slow_endpoint():
    # Intentionally slow
    time.sleep(2)
    return {'message': 'Slow response'}

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

---

## 10.3 Complete System Integration

**Docker Compose for Full Stack:**

yaml

```yaml
# docker-compose.yml

version: '3.8'

services:
  # InfluxDB
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
      - DOCKER_INFLUXDB_INIT_BUCKET=iot-sensors
      - DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=my-super-secret-token
    restart: unless-stopped
  
  # MQTT Broker (Mosquitto)
  mosquitto:
    image: eclipse-mosquitto:latest
    container_name: mosquitto
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - ./mosquitto.conf:/mosquitto/config/mosquitto.conf
    restart: unless-stopped
  
  # Grafana
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_INSTALL_PLUGINS=grafana-influxdb-datasource
    volumes:
      - grafana-data:/var/lib/grafana
    depends_on:
      - influxdb
    restart: unless-stopped
  
  # IoT Device Simulator
  iot-simulator:
    build: ./iot-simulator
    container_name: iot-simulator
    depends_on:
      - mosquitto
    restart: unless-stopped
  
  # Data Collector
  data-collector:
    build: ./data-collector
    container_name: data-collector
    depends_on:
      - mosquitto
      - influxdb
    environment:
      - MQTT_BROKER=mosquitto
      - INFLUX_URL=http://influxdb:8086
      - INFLUX_TOKEN=my-super-secret-token
    restart: unless-stopped

volumes:
  influxdb-data:
  grafana-data:
```

---

## 10.4 Best Practices Summary

```
┌─────────────────────────────────────────────────────────┐
│         InfluxDB 3 Best Practices Checklist             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✓ Schema Design:                                       │
│    • Tags: Low cardinality (<10K unique values)         │
│    • Fields: High cardinality OK, actual measurements   │
│    • Consistent naming (snake_case)                     │
│                                                         │
│  ✓ Write Performance:                                   │
│    • Batch size: 5K-10K points                          │
│    • Parallel writes (4-8 workers)                      │
│    • Connection pooling                                 │
│    • Compression for large batches                      │
│                                                         │
│  ✓ Query Optimization:                                  │
│    • Always filter by time                              │
│    • Use indexed tags for filtering                     │
│    • Select only needed columns                         │
│    • Server-side aggregation                            │
│    • Appropriate time windows                           │
│                                                         │
│  ✓ Data Lifecycle:                                      │
│    • Retention policies per bucket                      │
│    • Downsampling (hot→warm→cold)                       │
│    • Regular backups                                    │
│    • Compaction monitoring                              │
│                                                         │
│  ✓ Security:                                            │
│    • Least privilege tokens                             │
│    • Token rotation (90 days)                           │
│    • TLS/SSL enabled                                    │
│    • Firewall configured                                │
│                                                         │
│  ✓ Operations:                                          │
│    • Health monitoring                                  │
│    • Performance metrics                                │
│    • Alerting configured                                │
│    • Disaster recovery plan                             │
│                                                         │
│  ✓ Capacity Planning:                                   │
│    • Storage estimation                                 │
│    • Growth projection                                  │
│    • Hardware sizing                                    │
│    • Scaling strategy                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 10.5 Interview Preparation - Q&A

### **Beginner Level:**

**Q1: What is InfluxDB 3?**

```
A: InfluxDB 3 is a time-series database optimized for storing and 
querying time-stamped data. It uses columnar storage (Apache Parquet), 
in-memory processing (Apache Arrow), and supports SQL queries.

Key features:
- Time-series optimized
- SQL query language (not Flux)
- Columnar storage with compression
- High write/query performance
```

---

**Q2: Explain Tags vs Fields.**

```
A: 
TAGS:
- Always strings
- Indexed (fast filtering)
- Low cardinality preferred
- Used for: categories, identifiers, metadata
- Example: host, region, environment

FIELDS:
- Can be: int, float, string, boolean
- NOT indexed
- High cardinality OK
- Used for: measurements, values
- Example: cpu_percent, temperature, response_time

Rule: If you GROUP BY or filter frequently → Tag
      If you aggregate (SUM, AVG) → Field
```

---

**Q3: What is Line Protocol?**

```
A: Line Protocol is InfluxDB's text format for writing data.

Syntax:
measurement,tag1=value1,tag2=value2 field1=value1,field2=value2 timestamp

Example:
temperature,sensor=SENS001,location=warehouse temp=25.5,humidity=65 1703000000000000000

Rules:
- Comma between measurement and tags (no space)
- Space between tags and fields (required)
- Timestamp is optional (nanoseconds)
```

---

### **Intermediate Level:**

**Q4: How does InfluxDB 3 achieve high performance?**

```
A: Multiple optimizations:

1. Columnar Storage (Parquet):
   - Only read needed columns
   - Better compression
   - Cache-friendly

2. Apache Arrow:
   - In-memory columnar format
   - Zero-copy data sharing
   - SIMD vectorization

3. Query Optimization:
   - Predicate pushdown (filter at storage)
   - Projection pruning (read only needed columns)
   - Parallel execution

4. Write Optimization:
   - WAL for durability
   - In-memory buffer
   - Background compaction

Result: 45x faster writes, 4-8x faster queries vs InfluxDB 2.x
```

---

**Q5: Explain the data flow for writes.**

```
A: Write path:

1. Client → HTTP API (port 8086)
2. Write to WAL (Write-Ahead Log)
   - Durability guarantee
   - Disk fsync

3. Store in memory cache
   - Fast read access
   - Accumulate for batching

4. Background compaction (async)
   - Convert to Parquet
   - Compress
   - Write to object storage
   - Delete from WAL

5. Long-term storage (Parquet files)
   - Highly compressed
   - Columnar format
```

---

### **Advanced Level:**

**Q6: Design a multi-tier data strategy for 100K points/sec.**

```
A: Three-tier architecture:

HOT TIER (7 days):
- Bucket: metrics-hot
- Resolution: 1-second (raw data)
- Storage: In-memory + WAL + Recent Parquet
- Query: <50ms latency
- Use: Real-time dashboards, alerts

WARM TIER (90 days):
- Bucket: metrics-warm
- Resolution: 5-minute aggregates
- Storage: Compressed Parquet
- Query: 100-500ms latency
- Use: Recent analysis, weekly reports
- Downsampling: Daily job

COLD TIER (2 years):
- Bucket: metrics-cold
- Resolution: 1-hour aggregates
- Storage: S3/Object store (highly compressed)
- Query: 500ms-2s latency
- Use: Historical analysis, compliance
- Downsampling: Weekly job

Benefits:
- 95% storage reduction
- Fast recent queries
- Cost-effective long-term retention
```

---

**Q7: How would you handle 1M+ unique user IDs?**

```
A: High-cardinality problem solution:

❌ DON'T: Store user_id as tag
   - 1M+ series
   - Huge index (5+ GB)
   - Slow queries

✅ DO: Segmentation strategy

Schema:
measurement: user_events
tags:
  - user_segment: 'free', 'premium', 'enterprise'
  - region: 'us-east', 'us-west', 'eu', 'asia'
  - platform: 'web', 'mobile', 'api'
fields:
  - user_id: 'user_12345' (store as field)
  - event_count: 1

Total series: 3 segments × 4 regions × 3 platforms = 36 series
(vs 1,000,000 series with user_id as tag)

Query pattern:
SELECT user_id, SUM(event_count)
FROM user_events
WHERE user_segment = 'premium'
  AND region = 'us-east'
  AND time >= now() - INTERVAL '1 hour'
GROUP BY user_id

Result: 28,000x reduction in series cardinality!
```

---

**Q8: Production deployment checklist?**

```
A: Complete checklist:

Infrastructure:
☐ SSD storage (mandatory)
☐ 16+ GB RAM
☐ 8+ CPU cores
☐ 10 Gbps network
☐ XFS file system with noatime

Security:
☐ TLS/SSL enabled
☐ Firewall configured (specific IPs only)
☐ Token-based auth
☐ Token rotation policy (90 days)
☐ Least privilege access

Performance:
☐ Write batching (5K-10K points)
☐ Connection pooling
☐ Parallel writes (4-8 workers)
☐ Query time filters mandatory
☐ Appropriate time windows

Operations:
☐ Health monitoring
☐ Backup automation (daily)
☐ Restore testing (monthly)
☐ Alerting configured
☐ Runbook documented

Data Lifecycle:
☐ Retention policies set
☐ Downsampling jobs scheduled
☐ Multi-tier strategy
☐ Capacity planning

Monitoring:
☐ Write throughput
☐ Query latency (p50, p95, p99)
☐ Memory usage
☐ Disk I/O
☐ Series cardinality
☐ Error rates
```

---

## 10.6 Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│         InfluxDB 3 Quick Reference                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  WRITE (Line Protocol):                                 │
│  measurement,tag1=val1 field1=val1 timestamp            │
│                                                          │
│  QUERY (SQL):                                            │
│  SELECT * FROM measurement                               │
│  WHERE time >= now() - INTERVAL '1 hour'                │
│                                                          │
│  TIME FUNCTIONS:                                         │
│  • now() - Current time                                 │
│  • INTERVAL '1 hour' - Time duration                    │
│  • date_bin(INTERVAL '5m', time) - Time bucket          │
│                                                          │
│  AGGREGATIONS:                                           │
│  • COUNT(*) - Row count                                 │
│  • AVG(field) - Average                                 │
│  • SUM(field) - Sum                                     │
│  • MIN/MAX(field) - Min/Max                             │
│  • APPROX_PERCENTILE(field, 0.95) - p95                 │
│                                                          │
│  COMMON PATTERNS:                                        │
│  • Recent data: WHERE time >= now() - INTERVAL '1h'     │
│  • Time buckets: date_bin(INTERVAL '5m', time)          │
│  • Group by tag: GROUP BY host                          │
│  • Top N: ORDER BY value DESC LIMIT 10                  │
│                                                          │
│  PERFORMANCE TIPS:                                       │
│  ✓ Always filter by time                                │
│  ✓ Batch writes (5K-10K)                                │
│  ✓ Use tags for filtering                               │
│  ✓ Server-side aggregation                              │
│  ✓ Appropriate time windows                             │
│  ✗ Avoid SELECT * on large datasets                     │
│  ✗ Never use high-cardinality tags                      │
│  ✗ Don't skip time filters                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎓 Course Completion Certificate

```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║         INFLUXDB 3 MASTERY CERTIFICATE                ║
║                                                       ║
║  This certifies that you have completed:              ║
║                                                       ║
║  • InfluxDB 3 Fundamentals                           ║
║  • Data Modeling & Schema Design                     ║
║  • Write & Query Optimization                        ║
║  • Performance Tuning                                ║
║  • Security & Operations                             ║
║  • Production Deployments                            ║
║  • Real-World Projects                               ║
║                                                       ║
║  You are now ready to:                               ║
║  ✓ Design production time-series systems             ║
║  ✓ Optimize performance at scale                     ║
║  ✓ Handle security & operations                      ║
║  ✓ Build real-world applications                     ║
║                                                       ║
║  Date: December 19, 2024                             ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

---

## 🎯 Final Summary

**What You've Learned:**

```
Module 1: Fundamentals
✓ Time-series databases
✓ InfluxDB 3 architecture
✓ Tags vs Fields
✓ Use cases

Module 2: Installation & Setup
✓ Docker setup
✓ CLI configuration
✓ Web UI access
✓ Troubleshooting

Module 3: Data Model
✓ Schema design
✓ Cardinality management
✓ Naming conventions
✓ Best practices

Module 4: Writing Data
✓ Line protocol
✓ Batch writing
✓ Error handling
✓ Real-world examples

Module 5: Querying Data
✓ SQL queries
✓ Time-based filtering
✓ Aggregations
✓ Optimization

Module 6: Intermediate Concepts
✓ Telegraf integration
✓ Retention policies
✓ Downsampling
✓ Pipeline design

Module 7: Advanced Concepts
✓ Architecture internals
✓ Apache Arrow & Parquet
✓ Scaling strategies
✓ High availability

Module 8: Performance
✓ Write optimization
✓ Query tuning
✓ Resource management
✓ Anti-patterns

Module 9: Security & Ops
✓ Authentication
✓ Backup & restore
✓ Monitoring
✓ Alerting

Module 10: Real-World
✓ IoT monitoring
✓ APM system
✓ Complete integration
✓ Interview prep
```

---

## 📚 Next Steps

**1. Practice Projects:**

```
- Build your own IoT monitoring system
- Create application performance dashboard
- Implement log aggregation pipeline
- Design financial time-series analyzer
```

**2. Advanced Topics:**

```
- InfluxDB clustering
- Advanced security (OAuth, SAML)
- Custom Telegraf plugins
- InfluxDB Cloud features
```

**3. Community & Resources:**

```
- InfluxDB Community: community.influxdata.com
- Documentation: docs.influxdata.com
- GitHub: github.com/influxdata
- Stack Overflow: [influxdb] tag
```

---

## 🙏 Thank You!

Congratulations Ashu! 🎉

Aapne InfluxDB 3 ka complete journey successfully complete kiya hai - from basics to advanced production concepts!

**Key Achievements:**
✅ Complete understanding of time-series databases
✅ Production-ready schema design skills
✅ Performance optimization expertise
✅ Security & operations knowledge
✅ Real-world implementation experience

**You are now ready to:**

- Design and deploy production InfluxDB systems
- Optimize performance at scale
- Handle complex time-series use cases
- Clear technical interviews with confidence

---

**Final Advice:**

```
1. Practice regularly with real data
2. Build projects to solidify learning
3. Stay updated with InfluxDB releases
4. Join the community and contribute
5. Share your knowledge with others
```

**All the best for your interviews and future projects! 💪**

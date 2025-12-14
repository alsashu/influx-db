## 📚 Step 1: Enable WSL2 (if not already done)

powershell# Run in PowerShell as Administrator
wsl --install
wsl --set-default-version 2

## 📚 Step 2: Create Project Structure

bash# In WSL2 terminal
mkdir -p ~/influxdb-learning/{data,config}
cd ~/influxdb-learning

## 📚 Step 3: Docker Compose Setup

Create docker-compose.yml:
yamlversion: '3.8'

services:
influxdb:
image: influxdb:2.7
container_name: influxdb2
ports: - "8086:8086"
volumes: - ./data:/var/lib/influxdb2 - ./config:/etc/influxdb2
environment: - DOCKER_INFLUXDB_INIT_MODE=setup - DOCKER_INFLUXDB_INIT_USERNAME=admin - DOCKER_INFLUXDB_INIT_PASSWORD=adminpassword123 - DOCKER_INFLUXDB_INIT_ORG=myorg - DOCKER_INFLUXDB_INIT_BUCKET=mybucket - DOCKER_INFLUXDB_INIT_RETENTION=30d - DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=my-super-secret-auth-token

## 📚 Step 4: Start InfluxDB

bashdocker-compose up -d

# Verify container is running

docker ps

# Check logs

docker logs influxdb2

## 📚 Step 5: Verification

bash# Access InfluxDB CLI
docker exec -it influxdb2 influx

# Or access Web UI

# Open browser: http://localhost:8086

# Login: admin / adminpassword123

## 📚 Step 6: Install InfluxDB CLI (Optional)

bash# For direct CLI access from WSL
wget https://dl.influxdata.com/influxdb/releases/influxdb2-client-2.7.3-linux-amd64.tar.gz
tar xvzf influxdb2-client-2.7.3-linux-amd64.tar.gz
sudo cp influx /usr/local/bin/

```

### **Folder Structure**
```

~/influxdb-learning/
├── docker-compose.yml
├── data/ # InfluxDB data (persisted)
├── config/ # Configuration files
└── scripts/ # Demo scripts (create later)

```

```

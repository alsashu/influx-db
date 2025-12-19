# 2️⃣ Installation & Setup (Docker - Complete Guide)

---

## 2.1 Docker क्यों Use करें?

**Benefits:**

```
✅ Easy installation - ek command se setup
✅ Isolated environment - system ko affect nahi karega
✅ Portable - kisi bhi machine pe same setup
✅ Easy cleanup - delete karna simple hai
✅ Version control - multiple versions test kar sakte ho
```

---

## 2.2 Prerequisites Check

### **Step 1: Docker Installation Check**

**Windows/Mac/Linux - Terminal/PowerShell में:**

bash

```bash
docker --version
```

**Expected Output:**

```
Docker version 24.0.0 or higher
```

**Agar Docker installed nahi hai:**

### **Windows:**

1. Download:[https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Install Docker Desktop
3. Restart computer
4. Docker Desktop open karo aur wait for "Docker is running"

### **Linux (Ubuntu/Debian):**

bash

```bash
# Docker install karo
sudo apt update
sudo apt install docker.io -y

# Docker start karo
sudo systemctl start docker
sudo systemctl enable docker

# Current user ko docker group mein add karo (sudo se bachne ke liye)
sudo usermod -aG docker $USER

# Logout/Login again ya run:
newgrp docker
```

### **Mac:**

1. Download:[https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Install Docker Desktop
3. Open Docker Desktop application

---

## 2.3 InfluxDB 3 Docker Setup (Step-by-Step)

### **Step 1: Create Working Directory**

bash

```bash
# Windows (PowerShell)
mkdir C:\influxdb3-data
cd C:\influxdb3-data

# Linux/Mac
mkdir -p ~/influxdb3-data
cd ~/influxdb3-data
```

**Why?** Yahan pe InfluxDB ka data persist hoga (container delete hone ke baad bhi data safe rahega)

---

### **Step 2: Run InfluxDB 3 Container**

**Complete Command with Explanation:**

bash

```bash
docker run -d \
  --name influxdb3 \
  -p 8086:8086 \
  -v influxdb3-data:/var/lib/influxdb3 \
  -e INFLUXD_HTTP_BIND_ADDRESS=:8086 \
  influxdata/influxdb:latest
```

**Let's break it down:**


| Parameter                              | Explanation                                                |
| ---------------------------------------- | ------------------------------------------------------------ |
| `docker run -d`                        | Container ko background mein run karo (-d = detached mode) |
| `--name influxdb3`                     | Container ka naam "influxdb3" rakho                        |
| `-p 8086:8086`                         | Port mapping: Host:Container (8086 pe access karenge)      |
| `-v influxdb3-data:/var/lib/influxdb3` | Volume mount (data persistence ke liye)                    |
| `-e INFLUXD_HTTP_BIND_ADDRESS=:8086`   | Environment variable (HTTP port set karna)                 |
| `influxdata/influxdb:latest`           | Official InfluxDB image (latest version)                   |

**Windows PowerShell Users:**

powershell

```powershell
docker run -d `
  --name influxdb3 `
  -p 8086:8086 `
  -v influxdb3-data:/var/lib/influxdb3 `
  -e INFLUXD_HTTP_BIND_ADDRESS=:8086 `
  influxdata/influxdb:latest
```

**Expected Output:**

```
Unable to find image 'influxdata/influxdb:latest' locally
latest: Pulling from influxdata/influxdb
[downloading layers...]
Status: Downloaded newer image for influxdata/influxdb:latest
a8f3d9c4e5b2c1d3e4f5g6h7i8j9k0l1m2n3o4p5  ← Container ID
```

---

### **Step 3: Verify Container is Running**

bash

```bash
docker ps
```

**Expected Output:**

```
CONTAINER ID   IMAGE                        STATUS         PORTS                    NAMES
a8f3d9c4e5b2   influxdata/influxdb:latest  Up 2 minutes   0.0.0.0:8086->8086/tcp   influxdb3
```

**Status check:**

* ✅`Up X minutes` = Running perfectly
* ❌`Exited` = Problem hai, logs check karo

---

### **Step 4: Check Container Logs**

bash

```bash
docker logs influxdb3
```

**Expected Output:**

```
2024-12-19T10:30:00.000000Z info    Starting InfluxDB   {"version": "3.0.0"}
2024-12-19T10:30:01.000000Z info    HTTP server started {"addr": ":8086"}
2024-12-19T10:30:01.000000Z info    Ready to accept connections
```

---

## 2.4 Initial Setup - Web UI Access

### **Step 1: Open Browser**

```
http://localhost:8086
```

**First Time Setup Screen:**

```
┌─────────────────────────────────────┐
│   Welcome to InfluxDB 3             │
│                                     │
│   Username: ___________________    │
│   Password: ___________________    │
│   Org Name: ___________________    │
│   Bucket Name: _________________   │
│                                     │
│   [Continue] ───────────────────→  │
└─────────────────────────────────────┘
```

**Fill Details:**

```
Username: admin
Password: adminpassword123  (minimum 8 characters)
Organization Name: my-org
Bucket Name: my-bucket
```

**Terms Explained:**

- **Organization (Org):** Ek group - multiple users/buckets manage karne ke liye
- **Bucket:** Database ka naam (jahan data store hoga)
- **Token:** API access ke liye authentication key (automatically generate hoga)

---

### **Step 2: Save Your Token**

Setup complete hone ke baad:

```
┌─────────────────────────────────────────┐
│  Setup Complete!                        │
│                                         │
│  Your API Token:                        │
│  ┌───────────────────────────────────┐ │
│  │ eyJhbGciOiJIUzI1NiIsInR5cCI6...  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ⚠️  Save this token - you won't see   │
│     it again!                           │
│                                         │
│  [Copy to Clipboard]  [Continue]       │
└─────────────────────────────────────────┘
```

**⚠️ Important:** Is token ko safe jagah save kar lo (notepad, password manager)

---

## 2.5 CLI Setup & Configuration

### **Step 1: Install InfluxDB CLI (influx)**

**Option A: Inside Docker Container (Recommended for beginners)**

bash

```bash
# Container ke andar enter karo
docker exec -it influxdb3 bash
```

Now you're inside the container! Prompt change hoga:

```
root@a8f3d9c4e5b2:/#
```

**Option B: Install CLI on Host Machine**

**Linux:**

bash

```bash
wget https://dl.influxdata.com/influxdb/releases/influxdb2-client-2.7.3-linux-amd64.tar.gz
tar xvzf influxdb2-client-2.7.3-linux-amd64.tar.gz
sudo cp influx /usr/local/bin/
```

**Mac:**

bash

```bash
brew install influxdb-cli
```

**Windows:**
Download from: [https://portal.influxdata.com/downloads/](https://portal.influxdata.com/downloads/)
Extract and add to PATH

---

### **Step 2: Configure CLI**

**Create Configuration:**

bash

```bash
influx config create \
  --config-name my-config \
  --host-url http://localhost:8086 \
  --org my-org \
  --token YOUR_TOKEN_HERE \
  --active
```

**Replace `YOUR_TOKEN_HERE` with your actual token!**

**Verify Configuration:**

bash

```bash
influx config list
```

**Expected Output:**

```
Active  Name        URL                   Org
*       my-config   http://localhost:8086 my-org
```

---

### **Step 3: Test CLI Connection**

bash

```bash
influx ping
```

**Expected Output:**

```
OK
```

✅ **Setup Complete!**

---

## 2.6 Common Setup Problems & Solutions

### **Problem 1: Port 8086 Already in Use**

**Error:**

```
Error: bind: address already in use
```

**Solution:**

bash

```bash
# Check what's using port 8086
# Linux/Mac:
sudo lsof -i :8086

# Windows:
netstat -ano | findstr :8086

# Use different port
docker run -d \
  --name influxdb3 \
  -p 8087:8086 \
  ...
# Now access at: http://localhost:8087
```

---

### **Problem 2: Container Keeps Stopping**

**Check logs:**

bash

```bash
docker logs influxdb3
```

**Common causes:**

1. Insufficient memory
2. Disk space full
3. Permission issues

**Solution:**

bash

```bash
# Remove and recreate
docker rm -f influxdb3
docker volume rm influxdb3-data

# Recreate with more resources
docker run -d \
  --name influxdb3 \
  -p 8086:8086 \
  -v influxdb3-data:/var/lib/influxdb3 \
  --memory="2g" \
  --cpus="2" \
  influxdata/influxdb:latest
```

---

### **Problem 3: Cannot Access Web UI**

**Checklist:**

```
☐ Container running? → docker ps
☐ Correct URL? → http://localhost:8086 (not https)
☐ Firewall blocking? → Temporarily disable and test
☐ Browser cache? → Try incognito/private mode
☐ Docker network? → docker network inspect bridge
```

---

### **Problem 4: Lost Token**

**Get token from container:**

bash

```bash
docker exec -it influxdb3 influx auth list
```

**Or create new token:**

bash

```bash
docker exec -it influxdb3 influx auth create \
  --org my-org \
  --all-access
```

---

## 2.7 Data Persistence Verification

### **Test Data Persistence:**

**Step 1: Write some data**

bash

```bash
docker exec -it influxdb3 influx write \
  --bucket my-bucket \
  --org my-org \
  --token YOUR_TOKEN \
  'test,location=blr temperature=25.5'
```

**Step 2: Stop container**

bash

```bash
docker stop influxdb3
```

**Step 3: Start container again**

bash

```bash
docker start influxdb3
```

**Step 4: Check data still exists**

bash

```bash
docker exec -it influxdb3 influx query \
  --org my-org \
  'SELECT * FROM test'
```

✅ Data visible? **Persistence working!**

---

## 2.8 Useful Docker Commands (Cheat Sheet)

bash

```bash
# Container status check
docker ps                          # Running containers
docker ps -a                       # All containers (including stopped)

# Start/Stop/Restart
docker start influxdb3
docker stop influxdb3
docker restart influxdb3

# Logs
docker logs influxdb3              # All logs
docker logs -f influxdb3           # Follow logs (live)
docker logs --tail 100 influxdb3   # Last 100 lines

# Execute commands inside container
docker exec -it influxdb3 bash     # Interactive shell
docker exec influxdb3 influx ping  # Single command

# Resource usage
docker stats influxdb3

# Remove (cleanup)
docker stop influxdb3
docker rm influxdb3                # Remove container
docker volume rm influxdb3-data    # Remove data volume

# Complete cleanup
docker stop influxdb3 && docker rm influxdb3 && docker volume rm influxdb3-data
```

---

## 2.9 Docker Compose Setup (Advanced - Optional)

**Create `docker-compose.yml`:**

yaml

```yaml
version: '3.8'

services:
  influxdb3:
    image: influxdata/influxdb:latest
    container_name: influxdb3
    ports:
      - "8086:8086"
    volumes:
      - influxdb3-data:/var/lib/influxdb3
      - ./influxdb-config:/etc/influxdb2
    environment:
      - DOCKER_INFLUXDB_INIT_MODE=setup
      - DOCKER_INFLUXDB_INIT_USERNAME=admin
      - DOCKER_INFLUXDB_INIT_PASSWORD=adminpassword123
      - DOCKER_INFLUXDB_INIT_ORG=my-org
      - DOCKER_INFLUXDB_INIT_BUCKET=my-bucket
      - DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=my-super-secret-token
    restart: unless-stopped

volumes:
  influxdb3-data:
```

**Start with docker-compose:**

bash

```bash
docker-compose up -d
```

**Benefits:**

- Configuration as code
- Easy to share
- Reproducible setup
- Multiple services coordination

---

## 2.10 Verification Checklist ✅

```
Setup Complete Checklist:
☐ Docker installed and running
☐ InfluxDB 3 container running (docker ps)
☐ Web UI accessible (http://localhost:8086)
☐ Initial setup completed
☐ Token saved securely
☐ CLI configured and tested (influx ping)
☐ Data persistence verified
☐ No errors in logs (docker logs influxdb3)
```

---

## 🎯 Key Takeaways (Module 2)

```
✓ Docker = Easy, portable, isolated setup
✓ Port 8086 = Default InfluxDB port
✓ Volume mount = Data persistence
✓ Token = Authentication key (save it!)
✓ CLI = Command-line management
✓ Web UI = Visual interface (http://localhost:8086)
```

---

## 📝 Practice Tasks

**Task 1:** Container ko stop aur start karo, verify data persistence
**Task 2:** Docker logs check karo aur important messages identify karo
**Task 3:** CLI se ping test karo aur error handling practice karo

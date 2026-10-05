# TN Explore: Complete Offline Lab Server Installation & LAN Deployment Guide

This guide describes how to deploy **TN Explore** completely offline in a university or research lab with **no internet access**, allowing 20–50 students and researchers to use the application, database, and local AI engines concurrently over the local area network (LAN).

---

## 1. Architecture Overview (100% Air-Gapped)

```
Lab Computers (Browsers)  ─── LAN ───►  Lab Server (e.g. 192.168.1.50)
                                          ├── Nginx Web Server (Port 80 / 443)
                                          ├── PHP 8.2 & Laravel Backend (Pre-compiled)
                                          ├── Local MySQL 8.0 Database (Seeded)
                                          ├── FastAPI AI Service (Isolation Forest)
                                          ├── Ollama LLM Server (Local Mistral Model)
                                          └── Mailpit SMTP Inbox (Port 8025)
```

---

## 2. Step 1: Prepare USB Drive on an Internet-Connected PC

On a computer with internet, prepare the offline deployment bundle:

1. **Build Frontend Assets**:
   ```bash
   cd tn-explore
   npm install
   npm run build
   ```
2. **Install Composer Vendor Packages**:
   ```bash
   composer install --no-dev --optimize-autoloader
   ```
3. **Download Ollama Model Files**:
   ```bash
   ollama pull mistral
   # Copy %USERPROFILE%\.ollama\models to your USB drive
   ```
4. **Copy Entire Repository to USB Drive**:
   Copy the `tn-explore` folder with `vendor/`, `node_modules/`, and `public/build/` to your USB drive.

---

## 3. Step 2: Install and Run on the Lab Server Machine

1. **Copy project from USB to Server Disk** (e.g. `C:\tn-explore` or `/var/www/tn-explore`).
2. **Configure Static IP and Hosts**:
   - Assign the server a static IP (e.g., `192.168.1.50`).
   - Copy `.env.lab.example` to `.env`:
     ```bash
     cp .env.lab.example .env
     ```
   - In `.env`, set `APP_URL=http://192.168.1.50` and `OFFLINE_MODE=true`.
3. **Database Initialization & Seeding**:
   ```bash
   php artisan migrate --force
   php artisan db:seed --force
   ```
4. **Run Air-Gapped Integrity Audit**:
   ```bash
   php artisan offline:check
   ```
5. **Start Services**:
   - **Option A (Docker)**:
     ```bash
     docker-compose -f docker-compose.lab.yml up -d
     ```
   - **Option B (Native Windows / Linux)**:
     ```powershell
     # Terminal 1: Laravel Web Server
     php artisan serve --host=0.0.0.0 --port=80
     
     # Terminal 2: FastAPI AI Service
     python -m uvicorn main:app --host 127.0.0.1 --port 8001
     
     # Terminal 3: Ollama Server
     ollama serve
     
     # Terminal 4: Queue Worker
     php artisan queue:work
     ```

---

## 4. Step 3: Accessing from Other Lab Computers

Other computers on the same lab network open their browser and navigate to:
- **Application Portal**: `http://192.168.1.50`
- **Mailbox for 6-Digit OTPs & Alerts**: `http://192.168.1.50:8025`
- **Admin System Health & Operations**: `http://192.168.1.50/admin/system`

---

## 5. Capacity & Load Benchmark Verification

To run concurrent user load benchmarks on the lab network:
```bash
python scripts/load_test_lan.py
```
Results with mean latency, P95 latency, standard deviation, and error rates are saved to `storage/benchmarks/load_test.csv` for research documentation and paper publication tables.

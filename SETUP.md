# HindsightOps Setup Guide

This guide walks you through setting up HindsightOps locally or for production deployment, including configuring Hindsight Cloud and Groq LLM credentials.

---

## 📋 Prerequisites

- **Python:** 3.10+ (Python 3.11 recommended)
- **Node.js:** 18+ (Node 20 or 25 recommended)
- **npm:** 9+

---

## 🔑 Step 1: Obtain Hindsight Cloud Credentials

Hindsight is the persistent memory layer for HindsightOps.

1. Navigate to the official Hindsight Cloud UI:  
   **[https://ui.hindsight.vectorize.io](https://ui.hindsight.vectorize.io)**
2. Sign up or log in.
3. **Hackathon Promo Code:**  
   Navigate to the billing/subscription section and apply the hackathon promo code:  
   `MEMHACK99`  
   *(Provides $50 in Hindsight Cloud credits according to the hackathon terms).*
4. Navigate to **API Keys** in the dashboard and generate a new key.
5. Note your key for your `.env` configuration.
6. The default memory bank ID is `hindsightops-incidents`. HindsightOps will automatically initialize this bank on startup.

---

## 🤖 Step 2: Obtain Groq API Key

HindsightOps leverages Groq for ultra-fast structured LLM inference (`openai/gpt-oss-120b` or `qwen/qwen3-32b`).

1. Navigate to the Groq Cloud Console:  
   **[https://console.groq.com/keys](https://console.groq.com/keys)**
2. Generate an API Key and copy the value.

---

## ⚙️ Step 3: Configure Environment Variables

In the root directory of the project:

```bash
cp .env.example .env
```

Edit `.env` with your preferred editor and enter your credentials:

```ini
# LLM Provider Configuration (Groq)
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

# Hindsight Cloud Configuration
HINDSIGHT_API_KEY=your_actual_hindsight_api_key_here
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=hindsightops-incidents

# Server Ports
BACKEND_PORT=8000
BACKEND_HOST=0.0.0.0
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# Database
DATABASE_URL=sqlite:///./hindsightops.db

# Offline / Demo Fallback Mode
ALLOW_DEMO_FALLBACK=true
```

> **Security Note:** Never commit `.env` to Git. It is excluded by `.gitignore`.

---

## 📦 Step 4: Install Dependencies & Seed Memory

### 1. Python Backend Dependencies:
```bash
pip install -r backend/requirements.txt
```

### 2. Seed Historical Incidents:
Run the standalone memory seeder to populate historical records:
```bash
python backend/seed_memory.py
```
*Output will indicate whether memories were saved to Live Hindsight Cloud or the local fallback store.*

### 3. Frontend Dependencies:
```bash
cd frontend
npm install
cd ..
```

---

## 🚀 Step 5: Start the Application

### Start Backend:
```bash
# From workspace root
python -m uvicorn app.main:app --app-dir backend --port 8000 --reload
```
API Documentation will be live at:  
👉 **[http://localhost:8000/docs](http://localhost:8000/docs)**

### Start Frontend:
In a separate terminal:
```bash
cd frontend
npm run dev
```
Web application will be live at:  
👉 **[http://localhost:5173](http://localhost:5173)**

---

## ✅ Step 6: Verify Hindsight Connectivity

1. Open **[http://localhost:5173](http://localhost:5173)** in your browser.
2. Observe the status pill in the top-right of the navigation bar:
   - **Green `Hindsight Cloud (Live)`**: Successfully authenticated with Hindsight Cloud!
   - **Cyan `Hindsight Demo Mode`**: Running in transparent offline fallback mode.
3. You can also verify via the health endpoint:
   ```bash
   curl http://localhost:8000/api/health
   ```

---

## 🧪 Step 7: Run Automated Tests

Run the test suite to verify all agent workflows:
```bash
python -m pytest backend/test_suite.py -v
```

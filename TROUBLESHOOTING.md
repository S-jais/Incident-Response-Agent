# HindsightOps Troubleshooting Guide

This guide helps you resolve common operational or environmental issues when running HindsightOps locally.

---

## 🛑 Common Issues & Solutions

### 1. Port Already in Use (8000 or 5173)
- **Symptom:** `Error: [Errno 10048] error while attempting to bind on address ('127.0.0.1', 8000)`
- **Solution:**
  - Find the process holding the port:
    ```powershell
    netstat -ano | findstr :8000
    ```
  - Terminate the process (replace `<PID>` with the numeric process ID):
    ```powershell
    taskkill /F /PID <PID>
    ```
  - Alternatively, change `BACKEND_PORT=8001` in `.env` and update the proxy target in `frontend/vite.config.js`.

---

### 2. Missing or Invalid Groq API Key
- **Symptom:** UI displays `Groq LLM: Demo Mode (Local Fallback)`
- **Solution:**
  - Verify that `GROQ_API_KEY` in `.env` contains your key starting with `gsk_`.
  - Ensure there are no surrounding quotes or extra spaces in `.env`.
  - Check that your Groq account has available request quotas at [console.groq.com](https://console.groq.com).

---

### 3. Hindsight Cloud Connection Timeout or 401 Unauthorized
- **Symptom:** Health endpoint reports `Configured (Demo Fallback Mode)`
- **Solution:**
  - Verify your `HINDSIGHT_API_KEY` from [ui.hindsight.vectorize.io](https://ui.hindsight.vectorize.io).
  - Verify `HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io`.
  - Check network reachability to the Hindsight API:
    ```bash
    curl -I https://api.hindsight.vectorize.io
    ```
  - HindsightOps gracefully falls back to the local semantic store if the remote cloud is temporarily unreachable.

---

### 4. Database Reset or Re-seeding Historical Incidents
- **Symptom:** You want to restart the demo scenario from scratch with fresh synthetic records.
- **Solution:**
  - Click the **"Reset Demo"** button in the top navigation bar.
  - Or trigger it from the command line:
    ```bash
    python backend/seed_memory.py
    ```

---

### 5. Vite Frontend Does Not Proxy API Requests
- **Symptom:** Frontend console shows `404 Not Found on /api/incidents`
- **Solution:**
  - Ensure the FastAPI backend is running on `http://127.0.0.1:8000`.
  - Verify `frontend/vite.config.js` contains:
    ```javascript
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true
        }
      }
    }
    ```

---

### 6. Running Tests
To run the automated verification suite:
```bash
python -m pytest backend/test_suite.py -v
```
All tests should pass with code 0.

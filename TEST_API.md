# 🔧 Test API Connection

## 🎯 Quick Test

### **1. Test Backend Directly:**

Open a new terminal and run:
```bash
curl http://localhost:3001/health
```

Should return:
```json
{"status":"healthy","service":"LoadMatch AI Server"...}
```

### **2. Test Match Endpoint:**

```bash
curl -X POST http://localhost:3001/api/match \
  -H "Content-Type: application/json" \
  -d '{"loads":[{"id":"L1","origin":"Dallas, TX","destination":"Atlanta, GA","equipment":"Reefer","weight":42000,"pickupDate":"2025-11-05"}],"trucks":[{"id":"T1","location":"Fort Worth, TX","equipment":"Reefer","availableDate":"2025-11-05","vehicleType":"Truck","capacity":45000}]}'
```

Should return matches!

---

## 🌐 **Open Your App:**

```
http://localhost:8080/load-matching
```

---

## 🔍 **Check Browser Console:**

1. Open http://localhost:8080/load-matching
2. Press **F12** (or right-click → Inspect)
3. Click **Console** tab
4. Click "Generate All Matches" or "Find Matches"
5. Look for error messages - copy them!

Common issues:
- CORS error → Backend not allowing port 8080
- Network error → Backend not running
- 404 error → Wrong API URL

---

## ✅ **If You See CORS Error in Console:**

The backend is blocking the request. I already fixed this in the code, but you need to make sure the backend restarted with the new code.

**Solution:**
```bash
cd /Users/hamzashahid/freight-pulse-os
pkill -f nodemon
cd server && npm run dev
```

---

## 📊 **Current Status:**

- ✅ Backend running: http://localhost:3001
- ✅ Frontend running: http://localhost:8080
- ✅ CORS configured for ports: 3000, 8080, 5173
- ✅ Add Load button added (+)

**Try opening http://localhost:8080/load-matching now!**


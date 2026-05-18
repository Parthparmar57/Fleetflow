# 🚀 DEPLOYMENT RUNBOOK - FLEETFLOW PRODUCTION

**Document**: Production Deployment Checklist & Runbook  
**Version**: 1.0  
**Last Updated**: May 18, 2026  
**Estimated Deployment Time**: 30-45 minutes  

---

## 📋 PRE-DEPLOYMENT (24 Hours Before)

### Day Before Checklist
```
Date: ___________
Deployed By: ___________
Reviewed By: ___________
```

- [ ] **Security Review**
  - [ ] Review all security patches (IDOR, XSS, rate limiting)
  - [ ] Verify JWT_SECRET changed from development value
  - [ ] Confirm FRONTEND_URL updated to production domain
  - [ ] Check MongoDB IP whitelist configured

- [ ] **Database**
  - [ ] Backup production database
    ```bash
    mongodump --uri="$MONGODB_URI" --out=backup-$(date +%Y%m%d-%H%M%S)
    ```
  - [ ] Verify connection string
  - [ ] Test database connection from staging
  - [ ] Verify indexes exist on all models

- [ ] **Environment Variables**
  - [ ] Backend .env configured (Render)
    - [ ] MONGODB_URI set
    - [ ] JWT_SECRET set (new value)
    - [ ] FRONTEND_URL set (exact domain)
    - [ ] NODE_ENV=production
    - [ ] LOG_LEVEL=error
  - [ ] Frontend .env configured (Vercel)
    - [ ] VITE_API_URL set (https://api.domain.com/api)
    - [ ] VITE_SOCKET_URL set (https://api.domain.com)

- [ ] **Testing**
  - [ ] Test staging deployment
  - [ ] Verify HTTPS working
  - [ ] Test all authentication flows
  - [ ] Test real-time tracking
  - [ ] Verify rate limiting not too strict
  - [ ] Check error handling

- [ ] **Communication**
  - [ ] Notify users of deployment (if needed)
  - [ ] Brief support team
  - [ ] Prepare rollback plan
  - [ ] Identify on-call personnel

---

## 🚀 DEPLOYMENT (Execution Phase)

### Phase 1: Database Preparation (5 min)

```bash
# 1. Verify current backup
ls -lh backup-*

# 2. Run migration (if not already done)
cd backend
node migrations/add-token-version.js
# Expected: ✅ Migration completed successfully

# 3. Verify migration
cd ..
# Check in MongoDB: db.users.findOne() should have tokenVersion field
```

**Verification**:
- [ ] Backup file exists and is recent
- [ ] Migration completed without errors
- [ ] Users collection has tokenVersion field

---

### Phase 2: Backend Deployment (10 min)

#### On Render Dashboard:

```
1. Environment Variables
   - [ ] MONGODB_URI = [production URI]
   - [ ] JWT_SECRET = [NEW strong secret]
   - [ ] FRONTEND_URL = https://yourdomain.com,https://www.yourdomain.com
   - [ ] NODE_ENV = production
   - [ ] LOG_LEVEL = error
   - [ ] PORT = 5000

2. Deploy Settings
   - [ ] Branch: main (or production)
   - [ ] Auto-deploy: enabled
   - [ ] Health check: /api/health
   - [ ] Restart policy: always

3. Trigger Deployment
   - [ ] Go to "Deploy" tab
   - [ ] Click "Deploy latest commit"
   - [ ] Watch logs for success
```

**Wait For**:
```
✅ Logs show: "✅ MongoDB Connected: [host]"
✅ Logs show: "Server running on port 5000"
✅ No error messages in logs
```

**Verification**:
```bash
# Test health endpoint (wait 2 min for startup)
curl https://api.yourdomain.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2026-05-18T...",
  "uptime": 120
}
```

- [ ] Backend deployed successfully
- [ ] Health check responds
- [ ] No error messages in logs

---

### Phase 3: Frontend Deployment (10 min)

#### On Vercel Dashboard:

```
1. Environment Variables
   - [ ] VITE_API_URL = https://api.yourdomain.com/api
   - [ ] VITE_SOCKET_URL = https://api.yourdomain.com

2. Build Settings
   - [ ] Framework: Vite
   - [ ] Build command: npm run build
   - [ ] Output directory: dist

3. Trigger Deployment
   - [ ] Go to "Deployments" tab
   - [ ] Click "Deploy" or "Redeploy"
   - [ ] Watch build progress
```

**Wait For**:
```
✅ Build completed in ~2-3 minutes
✅ All checks passed
✅ Preview URL working
```

**Verification**:
```bash
# Test frontend URL
curl https://yourdomain.com

# Should return HTML (success)
# Should NOT show "Cannot find /api" errors (means FRONTEND_URL is correct)
```

- [ ] Frontend deployed successfully
- [ ] Build completed without errors
- [ ] Preview URL responding

---

### Phase 4: Smoke Testing (10 min)

#### Test Critical Flows

**Test 1: Authentication**
```bash
# Register new user
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test-'$(date +%s)'@test.com",
    "password": "TestPassword123!",
    "phone": "1234567890"
  }'

# Expected: 201 Created + user data
```

- [ ] Registration works
- [ ] HTTPOnly cookie set (check response headers)
- [ ] User created in database

**Test 2: Login**
```bash
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-xyz@test.com",
    "password": "TestPassword123!"
  }' \
  -v  # Show headers

# Expected: 200 OK + user data + Set-Cookie header
```

- [ ] Login returns user data
- [ ] Set-Cookie header present (fleetflow_token)
- [ ] No token in response body

**Test 3: Protected Route (requires cookie)**
```bash
# Get trips (should work with cookie)
curl -b "fleetflow_token=[cookie_from_login]" \
  https://api.yourdomain.com/api/trips

# Expected: 200 OK + trips array
```

- [ ] Protected routes accessible with cookie
- [ ] Cross-organization data blocked (IDOR check)

**Test 4: Rate Limiting**
```bash
# Send multiple requests quickly
for i in {1..210}; do
  curl -s https://api.yourdomain.com/api/trips \
    -H "Authorization: Bearer $TOKEN" > /dev/null
  echo "Request $i"
done

# After ~200 requests, should get 429 Too Many Requests
```

- [ ] Rate limiting active
- [ ] Returns 429 on limit exceeded
- [ ] Limits reset properly

**Test 5: Real-time Tracking**
```javascript
// Open browser console and test:
const socket = io('https://api.yourdomain.com', {
  withCredentials: true
});

socket.on('connect', () => {
  console.log('✅ Connected to Socket.IO');
});

socket.on('connect_error', (err) => {
  console.log('❌ Connection error:', err);
});

// Should see "Connected" message
```

- [ ] Socket.IO connects successfully
- [ ] Real-time updates working
- [ ] Organization scoping on real-time data

---

## ✅ POST-DEPLOYMENT (First Hour)

### Immediate After Deployment

```bash
# 1. Check error logs for first 5 minutes
tail -f backend/logs/error.log

# 2. Monitor application
watch -n 5 'curl https://api.yourdomain.com/api/health'

# 3. Check database activity
# Log into MongoDB Atlas dashboard
# Verify recent activity in "Operations" tab
```

### Monitoring Checklist (First Hour)

- [ ] No error spike in logs
- [ ] Response times normal (~100-200ms)
- [ ] Database queries performing
- [ ] No rate limiting false positives
- [ ] Real-time tracking working
- [ ] User logins successful

### Monitoring Checklist (First 24 Hours)

- [ ] Monitor error.log for exceptions
- [ ] Check database performance
- [ ] Verify backups running
- [ ] Monitor SSL certificate status
- [ ] Check CORS working from all origins
- [ ] Verify HTTPS redirects working
- [ ] Monitor rate limiting accuracy
- [ ] Check database connections stable

---

## 🔄 ROLLBACK PROCEDURE

**If something goes wrong**, follow these steps:

### Quick Rollback (< 5 minutes)

**For Frontend Issues**:
```bash
# On Vercel Dashboard:
1. Go to Deployments
2. Find previous successful deployment
3. Click "..." menu
4. Select "Promote to Production"
# Frontend reverted (instant)
```

**For Backend Issues**:
```bash
# On Render Dashboard:
1. Go to Events
2. Find previous successful deployment
3. Click "Redeploy"
# Backend reverted (2-3 min)
```

### Database Rollback (if needed)

```bash
# Stop the application
# On Render: click "Suspend"

# Restore from backup
mongorestore --uri="$MONGODB_URI" backup-20260518-093015/

# Restart application
# On Render: click "Resume"
```

### Full Rollback Procedure

```bash
# 1. Notify users and support
# 2. Revert code
git revert HEAD
git push

# 3. Wait for auto-deploy to complete
# 4. Verify previous version working
curl https://api.yourdomain.com/api/health

# 5. If database issue: restore from backup
mongorestore --uri="$MONGODB_URI" backup-20260518/

# 6. Notify users of resolution
```

---

## 🧪 DEPLOYMENT VERIFICATION MATRIX

| Component | Test | Expected | Status |
|-----------|------|----------|--------|
| Backend | Health check | 200 + healthy | ☐ |
| Frontend | Page load | HTML + JS loads | ☐ |
| Database | Connection | Queries work | ☐ |
| Auth | Login | User created + cookie | ☐ |
| Auth | Protected route | 200 with valid token | ☐ |
| Auth | Invalid token | 401 Unauthorized | ☐ |
| Rate limit | 210 rapid requests | 429 at limit | ☐ |
| CORS | Authorized origin | 200 OK | ☐ |
| CORS | Unauthorized origin | CORS error | ☐ |
| IDOR | Cross-org request | 404 Not Found | ☐ |
| Real-time | Socket.IO connect | Connected message | ☐ |
| HTTPS | HTTP request | 301 redirect | ☐ |
| HTTPS | Certificate | Valid + trusted | ☐ |
| Logging | Error trigger | Error logged | ☐ |
| Backup | DB backup | File exists | ☐ |

---

## 📞 EMERGENCY CONTACTS

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Backend Lead | ________ | ________ | ________ |
| Frontend Lead | ________ | ________ | ________ |
| DevOps Lead | ________ | ________ | ________ |
| Security Lead | ________ | ________ | ________ |
| Database Admin | ________ | ________ | ________ |

---

## 📝 DEPLOYMENT LOG

```
Date Started: ___________
Deployed By: ___________
Time Zone: ___________

Phase 1 (Database): Start __________ End __________ ✅/❌
Phase 2 (Backend): Start __________ End __________ ✅/❌
Phase 3 (Frontend): Start __________ End __________ ✅/❌
Phase 4 (Testing): Start __________ End __________ ✅/❌

Issues Encountered:
_____________________________________________________
_____________________________________________________

Resolution:
_____________________________________________________
_____________________________________________________

Deployment Status: ✅ SUCCESS / ❌ ROLLED BACK

Post-Deployment Notes:
_____________________________________________________
_____________________________________________________

Sign-off: __________________ Date: __________
```

---

## 🎓 TROUBLESHOOTING GUIDE

### Issue: Backend not connecting to MongoDB
```
Error: "FATAL: MongoDB connection failed"

Solutions:
1. Check MONGODB_URI format
   mongodb+srv://user:pass@cluster.mongodb.net/dbname

2. Verify IP whitelist
   MongoDB Atlas → Network Access → Add IP 0.0.0.0/0

3. Check credentials
   Verify username/password are correct

4. Test connection locally
   mongosh "$MONGODB_URI"
```

### Issue: Frontend showing "Cannot connect to API"
```
Error: "Network error" or "CORS error"

Solutions:
1. Verify VITE_API_URL
   Should be: https://api.yourdomain.com/api

2. Check FRONTEND_URL on backend
   Should include: https://yourdomain.com

3. Test CORS
   curl -H "Origin: https://yourdomain.com" \
     https://api.yourdomain.com/api/health

4. Check browser console
   Look for specific CORS error message
```

### Issue: Users getting rate limited too quickly
```
Error: "429 Too Many Requests"

Solutions:
1. Check rate limit thresholds in server.js
   - authLimiter: 5 per 15 minutes
   - readLimiter: 200 per 15 minutes
   - writeLimiter: 30 per minute

2. Increase limits if needed
   const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 10  // Increase from 5
   });

3. Whitelist trusted IPs (if behind proxy)
   app.set('trust proxy', 1);
```

### Issue: Socket.IO not connecting
```
Error: "Connection refused" or "Cannot connect"

Solutions:
1. Verify VITE_SOCKET_URL
   Should be: https://api.yourdomain.com (NOT /api)

2. Check Socket.IO middleware
   Verify auth token is valid

3. Test Socket.IO directly
   const socket = io('https://api.yourdomain.com');
   socket.on('connect', () => console.log('Connected'));

4. Check browser console for errors
   Look for specific Socket.IO error
```

### Issue: HTTPS certificate error
```
Error: "SSL_ERROR_RX_RECORD_TOO_LONG" or certificate warnings

Solutions:
1. Verify HTTPS is being used
   curl -v https://yourdomain.com (should work)

2. Force HTTPS redirect
   Check in server.js:
   if (process.env.NODE_ENV === 'production') {
     app.use((req, res, next) => {
       if (req.header('x-forwarded-proto') !== 'https') {
         res.redirect(`https://${req.header('host')}${req.url}`);
       } else next();
     });
   }

3. Check certificate renewal
   Render/Vercel auto-renews Let's Encrypt certs

4. Clear browser cache
   Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

---

## ✨ DEPLOYMENT COMPLETE!

Once all checkboxes are checked and verification passed:

```
✅ Deployment Successful!

Application is now live in production.

Next steps:
1. Monitor error logs for 24 hours
2. Gather user feedback
3. Plan next release
4. Schedule post-launch review
```

---

**Document Created**: May 18, 2026  
**Version**: 1.0  
**Purpose**: Production Deployment of FleetFlow v1.0  


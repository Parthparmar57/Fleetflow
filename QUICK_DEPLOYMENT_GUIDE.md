# Quick Deployment Guide - Security Fixes

## ⚡ TL;DR

**12 security vulnerabilities fixed. Migration required. Users must re-login.**

---

## 🚀 Deployment Steps (5 minutes)

### 1. Backup Database (1 min)
```bash
mongodump --uri="$MONGODB_URI" --out=backup-$(date +%Y%m%d)
```

### 2. Run Migration (1 min)
```bash
cd backend
node migrations/add-token-version.js
```

Expected output: `✅ Migration completed successfully`

### 3. Update Environment Variables (1 min)
```bash
# backend/.env
FRONTEND_URL=https://your-domain.com,https://www.your-domain.com
JWT_SECRET=<strong-random-32-char-secret>
NODE_ENV=production
```

### 4. Update Frontend Socket.io Code (1 min)
```javascript
// Before
const socket = io('http://localhost:5000');

// After
const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token')  // or your token storage
  }
});
```

### 5. Deploy & Verify (1 min)
```bash
# Deploy application
npm run deploy

# Verify
curl https://api.your-domain.com/health
# Should return: {"status":"healthy",...}

curl https://api.your-domain.com/debug
# Should return: 404 (in production)
```

---

## ⚠️ Breaking Changes

### 1. All Users Must Re-Login
- Existing tokens will be invalid after deployment
- Inform users before deployment
- Consider maintenance window

### 2. Socket.io Requires Authentication
- Update all Socket.io client connections
- Add `auth: { token: yourJWT }` to connection options

### 3. CORS Strict Allowlist
- Set `FRONTEND_URL` with exact domains
- Comma-separated for multiple domains
- No wildcards allowed

---

## 🧪 Quick Tests

### Test 1: Registration Security
```bash
# Try to register as fleet_manager (should fail)
curl -X POST https://api.your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","role":"fleet_manager"}'

# Should create user as 'dispatcher', not 'fleet_manager'
```

### Test 2: Token Revocation
```bash
# Login
TOKEN=$(curl -X POST https://api.your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password"}' \
  | jq -r '.token')

# Change password
curl -X POST https://api.your-domain.com/api/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"password","newPassword":"newpassword"}'

# Try using old token (should fail with 401)
curl -H "Authorization: Bearer $TOKEN" \
  https://api.your-domain.com/api/trips
# Expected: {"error":"Token has been revoked. Please login again."}
```

### Test 3: CORS Protection
```bash
# From unauthorized origin (should fail)
curl -H "Origin: https://evil.com" \
  https://api.your-domain.com/api/trips
# Expected: CORS error
```

### Test 4: Socket.io Authentication
```javascript
// Without token (should fail)
const socket1 = io('https://api.your-domain.com');
socket1.on('connect_error', (err) => {
  console.log(err.message); // "Authentication required"
});

// With token (should succeed)
const socket2 = io('https://api.your-domain.com', {
  auth: { token: validToken }
});
socket2.on('connect', () => {
  console.log('Connected!');
});
```

---

## 🔄 Rollback Plan

If something goes wrong:

```bash
# 1. Revert code
git revert HEAD
git push

# 2. Restore database (if needed)
mongorestore --uri="$MONGODB_URI" backup-YYYYMMDD/

# 3. Redeploy previous version
npm run deploy
```

---

## 📋 Post-Deployment Checklist

- [ ] Migration completed successfully
- [ ] Health endpoint returns 200
- [ ] Debug endpoint returns 404 (production)
- [ ] Users can register (as dispatcher only)
- [ ] Users can login
- [ ] Password change invalidates old tokens
- [ ] Socket.io connections require authentication
- [ ] CORS blocks unauthorized origins
- [ ] No stack traces in error responses
- [ ] Trip cancellation releases vehicle/driver
- [ ] Odometer validation works

---

## 📞 Support

**Issues?**
1. Check logs: `tail -f backend/logs/error.log`
2. Verify environment variables: `echo $FRONTEND_URL`
3. Check database connection: `mongosh "$MONGODB_URI" --eval "db.stats()"`
4. Review documentation: `SECURITY_FIXES_SUMMARY.md`

**Emergency Contacts:**
- DevOps: [contact info]
- Security Team: [contact info]
- Database Admin: [contact info]

---

## 📚 Full Documentation

- **CRITICAL_BUGS_FIXED.md** - Critical vulnerability details
- **HIGH_SEVERITY_BUGS_FIXED.md** - High severity fixes with tests
- **SECURITY_FIXES_SUMMARY.md** - Complete deployment guide
- **COMMIT_MESSAGE.txt** - Detailed commit message

---

**Deployment Time:** ~5 minutes  
**Downtime:** < 1 minute (during migration)  
**Risk Level:** Medium  
**Rollback Time:** < 2 minutes

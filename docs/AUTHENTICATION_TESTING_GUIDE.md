# 🔐 Frontend-Backend Authentication Integration Guide

## ✅ Setup Complete!

Your frontend is now fully connected to your backend authentication system.

---

## 🚀 How It Works

### Authentication Flow:

```
1. User enters email + password on Login page
   ↓
2. Frontend calls: POST /api/auth/login
   ↓
3. Backend validates credentials + hashes password with bcrypt
   ↓
4. Backend generates JWT token (7-day expiration)
   ↓
5. Frontend receives { token, user } response
   ↓
6. Frontend stores token in localStorage
   ↓
7. Frontend redirects to /app/dashboard
   ↓
8. All API requests auto-include Authorization header: "Bearer {token}"
   ↓
9. Backend middleware verifies token before allowing access
```

---

## 📋 Testing Steps

### Step 1: Start Everything

**Terminal 1: MongoDB**
```bash
mongod
```

**Terminal 2: Backend**
```bash
cd backend
npm run dev
```
✅ Should show: `🚀 Server running on port 5000`

**Terminal 3: Frontend**
```bash
cd frontend
npm run dev
```
✅ Should show: `➜  Local:   http://localhost:5173/`

---

### Step 2: Test Registration

1. Open browser: `http://localhost:5173`
2. Click "Create Account" or go to `/register`
3. Fill in the form:
   ```
   Full Name: John Manager
   Email: manager@fleetflow.com
   Password: SecurePass123
   Phone: +1234567890
   Role: Fleet Manager
   ```
4. Click "Create Account"
5. Should see success toast: ✅ "Account created successfully!"
6. Should redirect to `/app` (dashboard)

**Behind the scenes:**
- Frontend calls: `POST /api/auth/register`
- Backend hashes password with bcrypt
- Backend creates new user in MongoDB
- Backend generates JWT token
- Frontend stores token in localStorage
- Frontend auto-logs in and redirects

---

### Step 3: Test Login

1. Go to `/login`
2. Enter credentials:
   ```
   Email: manager@fleetflow.com
   Password: SecurePass123
   ```
3. Click "Sign In"
4. Should see success toast: ✅ "Welcome back!"
5. Should redirect to `/app`

**Behind the scenes:**
- Frontend calls: `POST /api/auth/login`
- Backend finds user by email
- Backend compares password with bcrypt
- Backend generates JWT token
- Frontend stores token and redirects

---

### Step 4: Verify Token Storage

1. Open Browser DevTools (F12)
2. Go to Application → Local Storage
3. Find key: `fleetflow_token`
4. Value should be long JWT token starting with `eyJ...`

**Example JWT token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWY3YzMwMjcxZjhjNjAwMDAwMDAwMDEiLCJyb2xlIjoiZmxlZXRfbWFuYWdlciIsImlhdCI6MTcxMDQyMzI0MCwiZXhwIjoxNzExMDI4MDQwfQ.abc123xyz789
```

---

### Step 5: Test Protected Routes

1. While logged in, you should see dashboard with data
2. Try to access `/login` → Should redirect to `/app` (already authenticated)
3. Try to access `/register` → Should redirect to `/app` (already authenticated)

**How it works:**
- App.tsx checks `isAuthenticated` from AuthContext
- If true and on `/login` or `/register` → redirect to `/app`
- If false and on `/app` → redirect to `/login`

---

### Step 6: Test Automatic Token Rejection

1. Open DevTools → Application → Local Storage
2. Delete the `fleetflow_token` key
3. Refresh page or try to make an API call
4. Should redirect to `/login`

**How it works:**
- Frontend checks if token exists on mount
- If not, redirects to login
- If API returns 401, frontend clears token and redirects

---

### Step 7: Test Different User Roles

Register multiple users with different roles and verify:

**Test Case 1: Fleet Manager**
```
Name: Alice Fleet
Email: alice@fleetflow.com
Password: AlicePass123
Role: Fleet Manager
```
- Should see all menu items
- Can create vehicles, drivers, maintenance
- Can view analytics

**Test Case 2: Dispatcher**
```
Name: Bob Dispatcher
Email: bob@fleetflow.com
Password: BobPass123
Role: Dispatcher
```
- Should see limited menu items
- Can only create trips and expenses
- Cannot manage vehicles or drivers

**Test Case 3: Safety Officer**
```
Name: Carol Safety
Email: carol@fleetflow.com
Password: CarolPass123
Role: Safety Officer
```
- Can manage drivers and compliance
- Can view driver profiles
- Cannot create trips

**Test Case 4: Financial Analyst**
```
Name: David Finance
Email: david@fleetflow.com
Password: DavidPass123
Role: Financial Analyst
```
- Can view analytics and reports
- View-only access
- Cannot create or modify data

---

## 🔍 Debugging Checklist

### If Login Fails:

**Check 1: Backend Running?**
```bash
# In a terminal, try:
curl http://localhost:5000/api/health
```
Should return: `{"status":"OK","timestamp":"2024-03-13T10:30:00.000Z"}`

**Check 2: MongoDB Running?**
```bash
# Should see MongoDB logs
mongod
```

**Check 3: Frontend Env Variables**
```bash
# Check frontend/.env
cat frontend/.env
# Should show:
# VITE_API_URL=http://localhost:5000/api
```

**Check 4: Backend Logs**
Look for errors in backend terminal:
- Red error messages
- Port already in use
- Database connection failures

**Check 5: Browser Console Errors**
Open DevTools (F12) → Console tab:
- Check for red error messages
- Note the exact error text
- Fix based on error message

**Check 6: Network Tab**
DevTools → Network tab:
- Check API requests going to `http://localhost:5000/api/auth/login`
- Response should include `token` and `user`
- Status should be 200 (success) or 401 (invalid credentials)

---

### If API Calls Fail After Login:

**Problem: 401 Unauthorized**
- Token expired (7 days)
- Token malformed
- Token not being sent

**Solution:**
- Clear localStorage: Delete `fleetflow_token`
- Login again
- Check if new token is stored

**Problem: 403 Forbidden**
- User role lacks permission
- User suspended/deactivated

**Solution:**
- Check user role in AuthContext
- Verify backend permissions are set correctly

**Problem: CORS Errors**
- Frontend and backend not communicating
- CORS not enabled on backend

**Solution:**
- Check backend has `cors()` middleware
- Check `FRONTEND_URL` in backend `.env`
- Try from same machine first

---

## 📊 Complete Authentication Test Scenario

**Follow this exact sequence:**

```
1. ✅ Register new Fleet Manager account
   Email: test@fleetflow.com
   Password: Test@123456

2. ✅ System auto-logs in and shows dashboard
   Check: Token in localStorage
   Check: User info in context

3. ✅ Navigate to /app/vehicles
   Check: Can see vehicles page
   Check: Authorization header sent

4. ✅ Try to access /login while logged in
   Check: Redirects to /app

5. ✅ Logout and go to /app
   Check: Redirects to /login

6. ✅ Login again with same credentials
   Check: Successfully logs in
   Check: Token may be different (new generation)

7. ✅ Open DevTools → Network
   Check: All requests have Authorization header
   Example header: Authorization: Bearer eyJ...

8. ✅ Delete token from localStorage
   Check: Page redirects to login

9. ✅ Test API directly with Postman
   GET http://localhost:5000/api/auth/profile
   Headers: Authorization: Bearer {your-token}
   Should return user data
```

---

## 🛠️ Backend API Endpoints

### Authentication Endpoints (Public)

```
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "fleet_manager",
  "phone": "+1234567890"
}
Response: { "token": "eyJ...", "user": { ... } }

---

POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
Response: { "token": "eyJ...", "user": { ... } }
```

### Authentication Endpoints (Requires Token)

```
GET /api/auth/profile
Headers: Authorization: Bearer {token}
Response: { "user": { "id": "...", "name": "John", ... } }

---

PUT /api/auth/profile
Headers: Authorization: Bearer {token}
Body: { "name": "John Updated", "phone": "+1987654321" }
Response: { "message": "Profile updated", "user": { ... } }

---

POST /api/auth/change-password
Headers: Authorization: Bearer {token}
Body: { "oldPassword": "old", "newPassword": "new" }
Response: { "message": "Password changed" }
```

---

## 🧪 Test with Postman (Optional)

1. Import `FleetFlow_API.postman_collection.json`
2. Set variable: `base_url = http://localhost:5000`
3. Test endpoints in order:
   - POST /auth/register → Get token
   - Copy token to `token` variable
   - GET /auth/profile → Should return user data
   - GET /vehicles → Should return vehicles
   - POST /auth/login → Get new token
   - Set token variable again
   - All subsequent requests should work

---

## ✨ You're All Set!

Your frontend and backend are now fully integrated with:

✅ User registration with role selection
✅ JWT token generation (7-day expiration)
✅ bcrypt password hashing
✅ Automatic token storage in localStorage
✅ Automatic Authorization header injection
✅ Token validation on API calls
✅ 401 error handling (redirect to login)
✅ Role-based access control
✅ Protected routes
✅ Logout functionality

**Next:** Test the complete flow following the test scenarios above!

---

## 📞 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "CORS Error" | Backend not allowing requests | Ensure CORS middleware enabled in backend |
| "401 Unauthorized" | Invalid token or expired | Clear localStorage, login again |
| "Cannot POST /api/auth/login" | Backend not running | Start backend: `npm run dev` in backend folder |
| "Network error" | MongoDB not running or connection issue | Start MongoDB: `mongod` |
| "User not found" | Email not registered | Register account first or use existing email |
| "Invalid password" | Wrong password | Check caps lock, verify password |
| "Token not stored" | localStorage issue | Check browser Dev Tools → Application → Storage |

---

## 🎉 Success Indicators

When everything works correctly:

✅ Register page → successful registration
✅ Login page → successful login + redirect
✅ Dashboard → loads with user data
✅ Logout → clears token + redirects to login
✅ Browser DevTools → token in localStorage
✅ Network requests → Authorization header present
✅ API responses → user data returns
✅ 401 errors → auto-redirect to login

---

**Happy authenticating!** 🚀

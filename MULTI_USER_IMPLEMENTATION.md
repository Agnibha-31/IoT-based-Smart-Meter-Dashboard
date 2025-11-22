# Multi-User Support Implementation

## Overview
The Smart Meter Dashboard has been upgraded from a single-user system to a full multi-user system. Each user now has their own account with isolated data and devices.

## Key Changes Made

### 1. Database Schema Changes
- **devices table**: Added `user_id` column with foreign key to `users` table
- **Migration**: Automatic migration assigns existing devices to the first user
- Each device is now owned by a specific user

### 2. Authentication Changes
- **Registration**: Removed single-user restriction - multiple users can now register
- **Auto-device creation**: New users automatically get a "Primary Smart Meter" device created
- **Token-based auth**: JWT tokens remain unchanged

### 3. Data Isolation
All API endpoints now enforce user-device ownership:
- `/api/readings/*` - Users can only access their own devices' readings
- `/api/analytics/*` - Analytics filtered by user's devices
- `/api/export/*` - Export only user's own data
- `/api/devices/*` - List only user's devices

### 4. API Changes

#### Devices API
- `GET /api/devices` - Returns only current user's devices
- `POST /api/devices` - Creates device owned by current user (no admin role required)

#### Readings API  
- All endpoints now verify device ownership before allowing access
- Returns 403 error if user tries to access another user's device

#### Analytics API
- All endpoints verify device ownership
- Data aggregation scoped to user's devices only

#### Export API
- Preview and export endpoints verify device ownership
- Export history tracked per user

## Testing Instructions

### 1. Backend Testing

Start the backend server:
```powershell
cd "c:\Users\agnib\OneDrive\Desktop\Web dashboard\Smart Meter\backend"
npm start
```

### 2. Test User Registration

**Create First User:**
```powershell
# Register first user
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"user1@example.com","password":"password123","name":"User One"}'
$token1 = $response.token
Write-Host "User 1 Token: $token1"
```

**Create Second User:**
```powershell
# Register second user
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"user2@example.com","password":"password123","name":"User Two"}'
$token2 = $response.token
Write-Host "User 2 Token: $token2"
```

### 3. Test Data Isolation

**Check User 1's Devices:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/devices" -Method GET -Headers @{"Authorization"="Bearer $token1"}
```

**Check User 2's Devices:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/devices" -Method GET -Headers @{"Authorization"="Bearer $token2"}
```

Each user should only see their own devices!

**Try to access another user's device (should fail):**
```powershell
# Get User 1's device ID
$user1Devices = Invoke-RestMethod -Uri "http://localhost:5000/api/devices" -Method GET -Headers @{"Authorization"="Bearer $token1"}
$device1Id = $user1Devices.devices[0].id

# Try to access with User 2's token (should return 403)
Invoke-RestMethod -Uri "http://localhost:5000/api/readings/latest?device_id=$device1Id" -Method GET -Headers @{"Authorization"="Bearer $token2"}
```

### 4. Test Frontend

Start the frontend:
```powershell
cd "c:\Users\agnib\OneDrive\Desktop\Web dashboard\Smart Meter"
npm run dev
```

Then:
1. Open http://localhost:3000
2. Register a new account
3. Verify you can log in
4. Check that your dashboard loads correctly
5. Log out
6. Register another account
7. Verify the second user sees NO data from the first user

### 5. Test Device Assignment

Each new user should automatically get a device created:
```powershell
# Check that new user has a device
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"user3@example.com","password":"password123","name":"User Three"}'
$token3 = $response.token
$devices = Invoke-RestMethod -Uri "http://localhost:5000/api/devices" -Method GET -Headers @{"Authorization"="Bearer $token3"}
Write-Host "User 3 devices: $($devices.devices.Count)"
```

## Migration Notes

### Existing Data
- Existing devices in the database will be automatically assigned to the first user
- Existing readings remain unchanged and accessible to the device owner
- No data loss occurs during migration

### First User
- If you had data before this update, it will be preserved
- The first registered user will get ownership of existing devices
- Readings data remains intact

## Security Features

1. **Device Ownership Verification**: Every API call checks if the user owns the device
2. **Token-Based Auth**: JWT tokens prevent unauthorized access
3. **403 Forbidden Errors**: Users get explicit denial when trying to access other users' data
4. **Data Isolation**: Database queries filtered by user_id at the service layer

## Known Limitations

1. **No User Management UI**: Admin features like viewing all users need to be added
2. **Device Sharing**: Users cannot share devices (feature can be added later)
3. **User Deletion**: No UI for deleting user accounts (API exists via admin routes)

## Rollback Instructions

If you need to rollback to single-user mode:
1. Stop the backend server
2. Restore from git: `git checkout <previous-commit>`
3. Delete `backend/smartmeter.db` to reset database
4. Restart the backend

## Next Steps for Production

1. **Add User Management UI**: Admin panel to manage users
2. **Device Sharing**: Allow users to share devices with family/team
3. **Usage Limits**: Implement per-user device/reading limits
4. **Billing Integration**: If monetizing, add subscription tiers
5. **Email Verification**: Add email verification for new registrations
6. **Password Reset**: Implement forgot password functionality

## Support

If you encounter any issues:
1. Check backend logs for error messages
2. Verify database migration completed successfully
3. Ensure all users have devices assigned
4. Test with a fresh database if issues persist

---

**Status**: ✅ Implementation Complete - Ready for Testing
**Date**: November 22, 2025
**Version**: Multi-User v1.0

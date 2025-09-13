# Active Users Feature

This feature provides real-time monitoring of user activity in the ShopRadar admin dashboard.

## Features

### Backend
- **User Model Update**: Added `lastActive` field to track when users were last active
- **Active Users API**: New endpoint `/api/users/admin/active` to fetch active users data
- **Activity Tracking**: Middleware to automatically update `lastActive` field on API calls
- **Timeframe Support**: Query active users for different time periods (1h, 24h, 7d, 30d)

### Frontend
- **Active Users Component**: Real-time display of currently active users
- **Dashboard Integration**: Added active users section to main dashboard
- **Analytics Integration**: Added active users section to analytics dashboard
- **Stats Cards**: Updated main dashboard stats to include total users count
- **User Details Modal**: Click to view detailed user information

## API Endpoints

### GET /api/users/admin/active
Fetches active users data with optional filtering.

**Query Parameters:**
- `timeframe` (optional): '1h', '24h', '7d', '30d' (default: '24h')
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of users per page (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "stats": {
      "activeLastHour": 15,
      "activeLastDay": 45,
      "activeLastWeek": 120,
      "activeLastMonth": 300,
      "totalActiveUsers": 45
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalUsers": 45,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Components

### ActiveUsers Component
Located at `admindashboard/src/components/users/ActiveUsers.tsx`

**Features:**
- Real-time user activity display
- Timeframe filtering (1h, 24h, 7d, 30d)
- User details modal
- Pagination support
- Activity status indicators
- Refresh functionality

### Updated Dashboard
- Added "Total Users" card to main dashboard stats
- Integrated ActiveUsers component in main dashboard
- Added ActiveUsers component to analytics dashboard

## Usage

1. **View Active Users**: Navigate to the main dashboard or analytics page
2. **Filter by Timeframe**: Use the timeframe selector to view users active in different periods
3. **View User Details**: Click the eye icon next to any user to see detailed information
4. **Refresh Data**: Click the refresh button to update the data in real-time

## Testing

Run the test script to verify the functionality:
```bash
cd backend_node
node scripts/test_active_users.js
```

## Database Schema

### User Model Updates
```javascript
{
  // ... existing fields
  lastActive: { type: Date, default: Date.now }
}
```

The `lastActive` field is automatically updated whenever a user makes an API call (except admin routes).

# Scrollable Activity Feed Feature

This feature provides an enhanced, scrollable activity feed for the ShopRadar admin dashboard with real-time updates and advanced filtering capabilities.

## Features

### ScrollableActivity Component
- **Compact View**: Fits in the main dashboard sidebar
- **Auto-scroll**: Automatically loads more activities as you scroll
- **Real-time Updates**: WebSocket integration for live activity updates
- **Search & Filter**: Built-in search and severity filtering
- **Expandable**: Toggle between compact and expanded views
- **Scroll Controls**: Quick navigation to top/bottom

### ActivityFeed Component (Full Page)
- **Full Dashboard View**: Dedicated activity monitoring page
- **Advanced Filtering**: Search, severity, and date range filters
- **Statistics Cards**: Overview of activity counts by severity
- **Export Functionality**: Download activities as CSV
- **Infinite Scroll**: Load more activities as you scroll down
- **Real-time Stats**: Live activity statistics

## Components

### 1. ScrollableActivity (`/components/dashboard/ScrollableActivity.tsx`)
**Usage**: Main dashboard sidebar component

**Features**:
- Compact design for sidebar placement
- Auto-loading on scroll
- Search and filter controls
- Expandable/collapsible view
- Real-time WebSocket updates
- Scroll navigation controls

### 2. ActivityFeed (`/components/activity/ActivityFeed.tsx`)
**Usage**: Full-page activity monitoring

**Features**:
- Comprehensive activity statistics
- Advanced filtering (search, severity, date range)
- Export to CSV functionality
- Infinite scroll loading
- Detailed activity information
- Real-time updates

## Key Features

### Real-time Updates
- WebSocket connection for live activity updates
- Automatic refresh indicators
- Connection status monitoring

### Advanced Filtering
- **Search**: Text search across activity descriptions
- **Severity**: Filter by Critical, High, Medium, Low
- **Date Range**: Today, Last 7 Days, Last 30 Days, All Time
- **Combined Filters**: Multiple filters can be applied simultaneously

### Scrollable Interface
- **Infinite Scroll**: Automatically loads more content
- **Smooth Scrolling**: Smooth scroll to top/bottom
- **Load Indicators**: Visual feedback during loading
- **Responsive Design**: Works on all screen sizes

### Activity Types Supported
- User registration/login/logout
- User blocking/unblocking
- Shop registration/verification
- Product additions/removals
- Review posting/flagging
- Admin actions
- System events

### Visual Indicators
- **Severity Badges**: Color-coded severity levels
- **Activity Icons**: Type-specific icons for easy identification
- **Status Colors**: Visual status indicators
- **Live Indicators**: Real-time update indicators

## Usage

### Dashboard Integration
The ScrollableActivity component is automatically integrated into the main dashboard sidebar.

### Full Activity Page
Access the full Activity Feed through:
1. Sidebar navigation → "Activity Feed"
2. Top navigation → "Activity" tab

### Filtering Activities
1. **Search**: Type in the search box to filter by description
2. **Severity**: Select from the dropdown to filter by severity level
3. **Date Range**: Choose time period for activities
4. **Combined**: Use multiple filters together for precise results

### Exporting Data
1. Navigate to the full Activity Feed page
2. Click the "Export" button
3. Download will start automatically as CSV file

## Technical Implementation

### State Management
- Real-time activity state
- Filter and search state
- Pagination state
- WebSocket connection state

### Performance Optimizations
- Lazy loading of activities
- Debounced search
- Efficient re-rendering
- Memory management for large lists

### Responsive Design
- Mobile-friendly interface
- Adaptive layouts
- Touch-friendly controls
- Optimized for all screen sizes

## API Integration

### Endpoints Used
- `GET /api/activities/recent` - Fetch recent activities
- WebSocket connection for real-time updates

### Parameters
- `page`: Page number for pagination
- `limit`: Number of activities per page
- `severity`: Filter by severity level
- `search`: Search term
- `dateFrom`: Start date for filtering
- `dateTo`: End date for filtering

## Customization

### Styling
- Tailwind CSS classes for consistent styling
- Custom color schemes for severity levels
- Responsive breakpoints
- Dark/light mode support

### Configuration
- Adjustable page sizes
- Customizable refresh intervals
- Configurable WebSocket settings
- Flexible filter options

## Future Enhancements

- **Activity Categories**: Group activities by type
- **User Activity Tracking**: Track specific user activities
- **Activity Analytics**: Charts and graphs for activity trends
- **Notification System**: Alerts for critical activities
- **Activity Archiving**: Long-term storage of activities
- **Custom Filters**: User-defined filter presets

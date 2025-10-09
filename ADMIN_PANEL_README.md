# Admin Panel Documentation

## Overview
The Admin Panel provides comprehensive control over the entire banner.az platform, allowing administrators to manage users, listings, and monitor system-wide statistics.

## Features

### 🎯 Access Control
- Only users with `isAdmin: true` in the database can access the admin panel
- Automatic redirection for non-admin users
- Protected API endpoints with admin verification

### 📊 Overview Dashboard
Real-time statistics display:
- **Total Users**: All registered users with new registrations this month
- **Total Boards**: All billboard listings with new listings this month
- **Active Boards**: Currently active listings
- **Total Views**: Aggregated view count across all listings

### 👥 User Management
Complete user control with:
- **User List**: Displays all users with ID, name, email, phone, listing count, admin status, and registration date
- **Search & Filter**: Search by name/email, filter by Admin/User role
- **Admin Toggle**: Promote users to admin or demote admins (cannot modify own status)
- **User Deletion**: Remove users with automatic cleanup of:
  - All user listings
  - All listing images
  - All statistics data
  - Cannot delete own account

### 📋 Listing Management
Full control over all billboard listings:
- **Board List**: Grid view with thumbnails, owner info, pricing, and status
- **Search & Filter**: Search by title/city, filter by Active/Inactive status
- **Status Toggle**: Activate or deactivate listings instantly
- **Board Deletion**: Remove listings with automatic cleanup of:
  - All listing images
  - All statistics data
- **Quick View**: Direct link to view listing details

## Setup

### 1. Database Migration
First, run the migration to add the `is_admin` column:

```bash
# Apply the migration
psql $DATABASE_URL -f migrations/add_admin_role.sql
```

### 2. Create First Admin User

**Option A: Via SQL (Recommended for initial setup)**
```bash
# Edit scripts/make-admin.sql and replace 'user@example.com' with your email
# Then run:
psql $DATABASE_URL -f scripts/make-admin.sql
```

**Option B: Manually via SQL**
```sql
UPDATE poster.users
SET is_admin = true, updated_at = NOW()
WHERE email = 'your-email@example.com';
```

**Option C: Via Database Client**
1. Connect to your PostgreSQL database
2. Find your user in the `poster.users` table
3. Set `is_admin` = `true` for your user

### 3. Access Admin Panel
1. Login to your account at `/login`
2. Navigate to `/admin-panel` or click "👑 Admin Panel" in the dashboard
3. You should now see the admin interface

## API Endpoints

### Admin Stats
```
GET /api/admin/stats
```
Returns system-wide statistics.

### User Management
```
GET /api/admin/users
Returns all users with listing counts.

PATCH /api/admin/users/[id]/toggle-admin
Body: { isAdmin: boolean }
Toggles admin status for a user.

DELETE /api/admin/users/[id]
Deletes a user and all associated data.
```

### Board Management
```
GET /api/admin/boards
Returns all boards with owner information.

PATCH /api/admin/boards/[id]/toggle-status
Body: { field: 'isActive' | 'isAvailable', value: boolean }
Updates board status.

DELETE /api/admin/boards/[id]
Deletes a board and all associated data.
```

## Security Features

### Authentication & Authorization
- All admin endpoints verify user authentication via JWT token
- Additional admin role verification on every request
- Cannot modify own admin status or delete own account
- Automatic redirection for non-admin users

### Data Protection
- Admin status changes are logged with timestamps
- Deletion operations include full cascading cleanup
- File system cleanup for deleted images
- Protected against self-deletion

## User Interface

### Navigation
- **Red/Orange gradient theme** distinguishes admin interface
- **Crown icon (👑)** indicates admin status throughout the UI
- **Three main tabs:**
  - 📊 Overview: System statistics
  - 👥 Users: User management (count displayed)
  - 📋 Boards: Listing management (count displayed)

### Responsive Design
- Fully responsive layout for desktop, tablet, and mobile
- Optimized tables with horizontal scrolling on mobile
- Grid layouts adapt to screen size
- Touch-friendly buttons and controls

### User Experience
- Real-time updates after actions
- Confirmation dialogs for destructive operations
- Visual status indicators (badges, colors)
- Search and filter capabilities
- Loading states and error handling

## Best Practices

### Admin User Management
1. **Limit Admin Access**: Only grant admin privileges to trusted users
2. **Regular Audits**: Periodically review admin user list
3. **Principle of Least Privilege**: Remove admin access when no longer needed

### Data Management
1. **Regular Backups**: Ensure database backups before bulk operations
2. **Test Deletions**: Verify deletion consequences before executing
3. **Monitor Activity**: Keep track of admin actions for accountability

### Security
1. **Strong Authentication**: Ensure admin accounts use strong passwords
2. **Environment Variables**: Keep JWT_SECRET secure and unique
3. **Access Logs**: Monitor admin panel access patterns
4. **Regular Updates**: Keep dependencies updated for security patches

## Troubleshooting

### Cannot Access Admin Panel
**Issue**: Redirected to dashboard after login
**Solution**: Verify your user has `is_admin = true` in the database

### Admin Toggle Not Working
**Issue**: Cannot change admin status
**Solution**: Ensure you're not trying to modify your own status

### Images Not Deleting
**Issue**: Images remain after deleting listings
**Solution**: Check file permissions in `/public/uploads/` directory

### Stats Not Loading
**Issue**: Overview shows 0 for all stats
**Solution**: Check database connection and verify data exists

## File Structure

```
app/
├── admin-panel/
│   └── page.tsx                          # Main admin panel UI
└── api/
    └── admin/
        ├── stats/
        │   └── route.ts                  # System statistics
        ├── users/
        │   ├── route.ts                  # List all users
        │   └── [id]/
        │       ├── route.ts              # Delete user
        │       └── toggle-admin/
        │           └── route.ts          # Toggle admin status
        └── boards/
            ├── route.ts                  # List all boards
            └── [id]/
                ├── route.ts              # Delete board
                └── toggle-status/
                    └── route.ts          # Toggle board status

lib/
└── db/
    └── schema.ts                         # Database schema with isAdmin field

migrations/
└── add_admin_role.sql                    # Database migration

scripts/
└── make-admin.sql                        # Helper script to promote users
```

## Feature Checklist

- ✅ Admin role in database schema
- ✅ Protected admin routes with authentication
- ✅ System-wide statistics dashboard
- ✅ User management (view, search, filter, toggle admin, delete)
- ✅ Listing management (view, search, filter, toggle status, delete)
- ✅ Cascading deletion with cleanup
- ✅ Responsive design
- ✅ Search and filter capabilities
- ✅ Confirmation dialogs for destructive actions
- ✅ Admin badge in navigation
- ✅ Real-time data updates
- ✅ Security protections (self-modification prevention)

## Support

For issues or questions about the admin panel:
1. Check this documentation
2. Review the troubleshooting section
3. Verify database migrations are applied
4. Check server logs for errors
5. Ensure proper permissions on file system

## Version History

**v1.0.0** - Initial Release
- Complete admin panel implementation
- User and listing management
- Statistics dashboard
- Security features and protections

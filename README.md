# reklamyeri.az - Local Advertising Boards Platform

A modern platform for monetizing physical advertising boards. Connect board owners with advertisers looking for prime physical advertising locations.

## Screenshots

### Landing Page
![Landing Page](screens/landing%20page.png)

### Login Page
![Login Page](screens/login%20page.png)

### New Advertisement
![New Advertisement](screens/new%20advertisement.png)
![New Advertisement 2](screens/new%20advertisement%202.png)

### Profile Page
![Profile Page](screens/profile%20page.png)

### Admin Panel
![Admin Panel](screens/admin%20panel.png)

## Features

### For Users
- **User Authentication**: Secure JWT-based registration and login system
- **Location-Based Discovery**: Find boards using GPS coordinates and interactive maps
- **Visual Listings**: High-quality photos of each advertising board
- **Flexible Pricing**: Daily, weekly, and monthly pricing options
- **User Dashboard**: Manage your own advertising board listings
- **Real-time Maps**: Interactive map view using Leaflet + OpenStreetMap
- **Analytics Tracking**: View counts and phone number reveal tracking

### For Admins
- **Admin Panel**: Comprehensive dashboard for managing the platform
- **User Management**: View, edit, and manage user accounts (including admin status)
- **Board Management**: Approve, edit, or delete board listings with bulk actions
- **Analytics Dashboard**: Track platform statistics and user engagement
- **Data Export**: Export boards and analytics data
- **Statistics**: View detailed metrics on views and phone reveals per listing

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Maps**: Leaflet + OpenStreetMap
- **Styling**: Tailwind CSS
- **Analytics**: Google Analytics
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Cloudflare R2 bucket
- Google Analytics ID (optional)

### Installation

1. Clone the repository:
```bash
git clone <your-repo>
cd poster
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `ADMIN_USERNAME`: Admin login username
- `ADMIN_PASSWORD`: Admin login password
- `R2_*`: Cloudflare R2 credentials and bucket info
- `NEXT_PUBLIC_GA_ID`: Google Analytics tracking ID (optional)

4. Push database schema:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Schema

### Users Table
- Email and password (hashed with bcrypt)
- Name and phone number
- Admin status flag
- Timestamps (created/updated)

### Ad Postings Table (Boards)
- User reference (for authenticated users)
- Owner contact information (name, phone, email)
- Ad details (title, description)
- Location data (latitude, longitude, address, city, country)
- Board specifications (width, height, type)
- Images (stored in R2, with thumbnail)
- Pricing (per day/week/month in qəpik/cents)
- Status flags (active, available)
- View count for analytics
- Timestamps (created/updated)

### Statistics Table
- Listing reference
- Event type ('view' or 'phone_reveal')
- IP hash (anonymized for privacy)
- User agent
- Timestamp

## Project Structure

```
poster/
├── app/
│   ├── api/
│   │   ├── admin/           # Admin management endpoints
│   │   │   ├── analytics/   # Analytics data
│   │   │   ├── boards/      # Board management (approve, edit, delete)
│   │   │   ├── export/      # Data export
│   │   │   ├── stats/       # Platform statistics
│   │   │   └── users/       # User management
│   │   ├── auth/            # Authentication endpoints
│   │   │   ├── login/       # User login
│   │   │   ├── register/    # User registration
│   │   │   ├── logout/      # User logout
│   │   │   ├── me/          # Get current user
│   │   │   └── delete-account/ # Delete user account
│   │   ├── boards/          # Board CRUD operations
│   │   │   ├── [id]/        # Board detail, update, delete
│   │   │   └── route.ts     # List/create boards
│   │   ├── statistics/      # Analytics tracking
│   │   │   ├── track/       # Track events
│   │   │   └── [listingId]/ # Get listing stats
│   │   ├── my-boards/       # User's own boards
│   │   ├── upload/          # Image upload to R2
│   │   └── delete-image/    # Delete image from R2
│   ├── admin/              # List new board (simple form)
│   ├── admin-panel/        # Admin dashboard
│   ├── dashboard/          # User dashboard
│   │   ├── edit/[id]/      # Edit board listing
│   │   └── page.tsx        # Dashboard overview
│   ├── boards/
│   │   ├── [id]/           # Board detail page
│   │   └── page.tsx        # Board listing with map
│   ├── register/           # User registration page
│   ├── layout.tsx
│   ├── page.tsx            # Landing page
│   └── globals.css
├── components/
│   ├── MapView.tsx         # Interactive map with markers
│   ├── LocationPicker.tsx  # Location selector for listing
│   ├── LoadingSkeleton.tsx # Loading state component
│   ├── ConfirmDialog.tsx   # Confirmation dialog
│   └── Toast.tsx           # Toast notifications
├── lib/
│   ├── db/
│   │   ├── index.ts        # Database client
│   │   └── schema.ts       # Drizzle schema
│   └── r2.ts               # R2 storage utilities
├── hooks/                  # Custom React hooks
├── public/                 # Static assets
├── scripts/                # Utility scripts
├── drizzle.config.ts
├── next.config.ts
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns JWT)
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current authenticated user
- `DELETE /api/auth/delete-account` - Delete user account

### Boards
- `GET /api/boards` - List all active boards (with optional filters)
- `POST /api/boards` - Create a new board listing (requires auth)
- `GET /api/boards/[id]` - Get board details
- `PUT /api/boards/[id]/update` - Update board (requires auth)
- `DELETE /api/boards/[id]/delete` - Delete board (requires auth)
- `GET /api/my-boards` - Get current user's boards (requires auth)

### Admin Endpoints (requires admin auth)
- `GET /api/admin/boards` - List all boards (including inactive)
- `GET /api/admin/boards/[id]` - Get board details
- `PUT /api/admin/boards/[id]/edit` - Edit any board
- `DELETE /api/admin/boards/[id]` - Delete any board
- `POST /api/admin/boards/[id]/toggle-status` - Toggle board active status
- `POST /api/admin/boards/bulk-actions` - Bulk approve/delete boards
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/[id]` - Get user details
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user
- `POST /api/admin/users/[id]/toggle-admin` - Toggle admin status
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/analytics` - Get detailed analytics
- `GET /api/admin/export` - Export data (CSV/JSON)

### Statistics
- `POST /api/statistics/track` - Track view or phone reveal event
- `GET /api/statistics/[listingId]` - Get statistics for a listing

### Upload
- `POST /api/upload` - Upload images to R2
- `POST /api/delete-image` - Delete image from R2

## Usage

### For Board Owners

1. **Register an account** at `/register`
2. **Login** with your credentials
3. **Go to `/admin`** to create a new board listing:
   - Fill out basic information (title, description, dimensions)
   - Select location using interactive map or current location
   - Upload board images
   - Set pricing (daily, weekly, monthly)
   - Provide contact information
4. **Manage your boards** at `/dashboard`:
   - View all your listings
   - Edit or delete boards
   - See view counts and statistics

### For Advertisers

1. Browse boards at `/boards`
2. Filter by city or view on map
3. Click a board to see full details
4. Contact the owner using provided phone number
   - Phone reveals are tracked in analytics

### For Administrators

1. Login at `/admin-panel` with admin credentials
2. **Manage boards**:
   - Approve or reject new listings
   - Edit or delete any board
   - Toggle board active status
   - Bulk actions for multiple boards
3. **Manage users**:
   - View all registered users
   - Edit user information
   - Delete users
   - Grant or revoke admin privileges
4. **View analytics**:
   - Platform-wide statistics
   - Board view counts
   - Phone reveal tracking
   - User engagement metrics
5. **Export data**:
   - Export boards list
   - Export analytics data

## Environment Variables

### Required
```
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
JWT_SECRET="your_jwt_secret_key_here"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your_secure_password"

# Cloudflare R2
R2_ACCOUNT_ID="your_r2_account_id"
R2_API_TOKEN_VALUE="your_r2_api_token"
R2_ACCESS_KEY_ID="your_r2_access_key_id"
R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
R2_BUCKET="your_bucket_name"
R2_API_ENDPOINT="https://your_account_id.r2.cloudflarestorage.com"
R2_API="https://your_public_bucket_url.r2.dev"
```

### Optional
```
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"  # Google Analytics tracking ID
```

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env`
   - Make sure to include `JWT_SECRET` for authentication

4. Redeploy after adding environment variables:
```bash
vercel --prod
```

## Security Features

- **Password Hashing**: Uses bcrypt for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Admin and user-specific endpoints are protected
- **IP Anonymization**: User IPs are hashed for privacy in analytics
- **Input Validation**: All user inputs are validated
- **SQL Injection Prevention**: Using Drizzle ORM with parameterized queries

## Features to Add

- [ ] Payment integration (Stripe)
- [ ] Email notifications for board approvals/rejections
- [ ] Review system for boards
- [ ] Advanced search filters (price range, board type, size)
- [ ] Booking system (reserved but not implemented)
- [ ] Email verification for new users
- [ ] Password reset functionality
- [ ] Mobile app
- [ ] Multi-language support (Azerbaijani/English)
- [ ] Automated image optimization
- [ ] Rate limiting for API endpoints

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License

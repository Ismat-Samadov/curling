# BoardAds - Local Advertising Boards Platform

A modern platform for monetizing physical advertising boards. Connect board owners with advertisers looking for prime physical advertising locations.

## Features

- **Location-Based Discovery**: Find boards using GPS coordinates and interactive maps
- **Visual Listings**: High-quality photos of each advertising board
- **Flexible Pricing**: Daily, weekly, and monthly pricing options
- **Easy Booking System**: Simple booking requests with automated conflict detection
- **Owner Dashboard**: List and manage your advertising boards
- **Real-time Maps**: Interactive map view using Leaflet
- **Image Storage**: Secure image hosting with Cloudflare R2

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Storage**: Cloudflare R2 (S3-compatible)
- **Maps**: Leaflet + OpenStreetMap
- **Styling**: Tailwind CSS
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Cloudflare R2 bucket

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
- `R2_*`: Cloudflare R2 credentials and bucket info

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

### Boards Table
- Location data (latitude, longitude, address)
- Board specifications (width, height, type)
- Images (stored in R2)
- Pricing (per day/week/month in cents)
- Owner contact information

### Bookings Table
- Customer information
- Booking dates and duration
- Total price and payment status
- Booking status (pending, confirmed, completed, cancelled)

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

4. Redeploy after adding environment variables:
```bash
vercel --prod
```

### Environment Variables for Vercel

Make sure to add these in the Vercel dashboard:

```
DATABASE_URL
R2_ACCOUNT_ID
R2_API_TOKEN_VALUE
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET
R2_API_ENDPOINT
R2_API
ADMIN_USERNAME
ADMIN_PASSWORD
```

## Project Structure

```
poster/
├── app/
│   ├── api/
│   │   ├── boards/         # Board CRUD operations
│   │   ├── bookings/       # Booking management
│   │   └── upload/         # Image upload to R2
│   ├── boards/
│   │   ├── [id]/          # Board detail page
│   │   └── page.tsx       # Board listing with map
│   ├── admin/             # List new boards
│   ├── layout.tsx
│   ├── page.tsx           # Landing page
│   └── globals.css
├── components/
│   ├── MapView.tsx        # Interactive map with markers
│   └── LocationPicker.tsx # Location selector for listing
├── lib/
│   ├── db/
│   │   ├── index.ts       # Database client
│   │   └── schema.ts      # Drizzle schema
│   └── r2.ts              # R2 storage utilities
├── drizzle.config.ts
├── next.config.ts
└── package.json
```

## API Endpoints

### Boards
- `GET /api/boards` - List all boards (with optional filters)
- `POST /api/boards` - Create a new board
- `GET /api/boards/[id]` - Get board details
- `PUT /api/boards/[id]` - Update board
- `DELETE /api/boards/[id]` - Delete board (soft delete)

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking request

### Upload
- `POST /api/upload` - Upload images to R2

## Usage

### For Board Owners

1. Go to `/admin`
2. Fill out the board listing form:
   - Basic information (title, description, dimensions)
   - Location (using interactive map or current location)
   - Upload board images
   - Set pricing and contact information
3. Submit to list your board

### For Advertisers

1. Browse boards at `/boards`
2. Filter by city or view on map
3. Click a board to see details
4. Submit a booking request with dates
5. Owner will be notified and contact you

## Features to Add

- [ ] Payment integration (Stripe)
- [ ] User authentication
- [ ] Review system
- [ ] Advanced search filters
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Multi-language support

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License

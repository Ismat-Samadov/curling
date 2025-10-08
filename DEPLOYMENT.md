# Deployment Guide

## Quick Start

Your local ads posting board platform is now ready! The development server is running at:
**http://localhost:3003**

## What's Been Built

### Core Features
1. **Landing Page** (`/`) - Marketing homepage with feature highlights
2. **Board Listings** (`/boards`) - Browse all boards with map/list view
3. **Board Details** (`/boards/[id]`) - Detailed view with booking form
4. **Admin Panel** (`/admin`) - List new advertising boards

### Technical Implementation
- ✅ PostgreSQL database with Drizzle ORM
- ✅ Cloudflare R2 for image storage
- ✅ Interactive maps with Leaflet
- ✅ GPS coordinate-based location tracking
- ✅ Booking system with conflict detection
- ✅ Image upload and management
- ✅ Responsive design with Tailwind CSS

## Deploy to Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit - BoardAds platform"
git branch -M main
git remote add origin <your-github-repo>
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:

```env
DATABASE_URL=postgresql://tg_db_owner:npg_c6ePiOdNjb8G@ep-frosty-voice-a2s9itd4-pooler.eu-central-1.aws.neon.tech/tg_db?sslmode=require&channel_binding=require&schema=poster

R2_ACCOUNT_ID=612eb8c2fbc8d81e98c37a03e49f4a8f
R2_API_TOKEN_VALUE=o9cC6rRYwt8jlfSBtPfUAKcJGM4DHBzvvCpLcXnz
R2_ACCESS_KEY_ID=3326233edd2bbdba876ac88b71150cc8
R2_SECRET_ACCESS_KEY=8ed0995af4a5f2ab6f8ac8837e9ff5c3b0a89f6e23d7e7557cb7c50ae7c96fc8
R2_BUCKET=bannerpostingpictures
R2_API_ENDPOINT=https://612eb8c2fbc8d81e98c37a03e49f4a8f.r2.cloudflarestorage.com
R2_API=https://pub-15f3ee6e8c68431e96421e7288ad217c.r2.dev

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

5. Click "Deploy"

### Step 3: Verify Database Schema

After deployment, the database schema should already be in place. If you need to update it:

```bash
npm run db:push
```

## Testing Locally

### Test the Admin Flow
1. Visit http://localhost:3003/admin
2. Fill out the board listing form:
   - Enter title and description
   - Set dimensions (e.g., 10m × 5m)
   - Choose board type
   - Click on map to select location or use "Use Current Location"
   - Upload board images
   - Set pricing (e.g., $50/day, $300/week, $1000/month)
   - Enter your contact info
3. Submit the form

### Test the User Flow
1. Visit http://localhost:3003/boards
2. View boards in list or map mode
3. Click on a board to see details
4. Submit a booking request

## Database Structure

Your PostgreSQL database has been set up with:

### Tables Created
- `boards` - Advertising board listings
- `bookings` - Booking requests and reservations
- `board_status` enum - (available, booked, maintenance)
- `booking_status` enum - (pending, confirmed, completed, cancelled)

### Key Fields
**Boards:**
- Location: latitude, longitude, address, city, country
- Specs: width, height, boardType
- Media: images[], thumbnailImage
- Pricing: pricePerDay, pricePerWeek, pricePerMonth (stored in cents)
- Contact: ownerName, ownerEmail, ownerPhone

**Bookings:**
- Customer: customerName, customerEmail, customerPhone, companyName
- Dates: startDate, endDate, duration
- Payment: totalPrice, paymentStatus
- Status: status (pending/confirmed/completed/cancelled)

## Cloudflare R2 Setup

Your R2 bucket is configured and ready:
- Bucket: `bannerpostingpictures`
- Public URL: `https://pub-15f3ee6e8c68431e96421e7288ad217c.r2.dev`
- Images are organized with timestamp + random string naming

## API Routes

All API endpoints are ready:

### Boards API
- `GET /api/boards` - List boards (supports ?city= filter)
- `POST /api/boards` - Create new board
- `GET /api/boards/[id]` - Get board details
- `PUT /api/boards/[id]` - Update board
- `DELETE /api/boards/[id]` - Soft delete board

### Bookings API
- `GET /api/bookings` - List bookings (supports ?boardId= filter)
- `POST /api/bookings` - Create booking (with conflict detection)

### Upload API
- `POST /api/upload` - Upload images to R2

## Next Steps

### Recommended Enhancements
1. **Payment Processing**: Integrate Stripe for online payments
2. **Email Notifications**: Use SendGrid or Resend for booking confirmations
3. **Authentication**: Add NextAuth.js for user accounts
4. **Admin Dashboard**: Build owner dashboard to manage bookings
5. **Reviews**: Add rating and review system
6. **Analytics**: Track views and booking conversion
7. **SEO**: Add meta tags and structured data
8. **Mobile App**: Consider React Native version

### Monetization Options
1. **Commission Model**: Take % of each booking
2. **Subscription Model**: Monthly fee for board owners
3. **Featured Listings**: Premium placement for higher visibility
4. **Lead Generation**: Charge per inquiry/booking request

## Support & Documentation

- Next.js Docs: https://nextjs.org/docs
- Drizzle ORM: https://orm.drizzle.team
- Cloudflare R2: https://developers.cloudflare.com/r2
- Leaflet Maps: https://leafletjs.com/reference.html

## Troubleshooting

### Development Server Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

### Database Issues
```bash
# Reset and push schema
npm run db:push
```

### Image Upload Issues
- Verify R2 credentials in .env
- Check bucket CORS settings in Cloudflare dashboard
- Ensure bucket has public read access

## Security Checklist

Before going to production:
- [ ] Change ADMIN_USERNAME and ADMIN_PASSWORD
- [ ] Add rate limiting to API routes
- [ ] Implement CSRF protection
- [ ] Add input validation and sanitization
- [ ] Set up proper CORS policies
- [ ] Enable Vercel Web Application Firewall
- [ ] Add monitoring and error tracking (Sentry)

## Performance Optimization

- Images are automatically optimized via Next.js Image component
- Database queries use indexes on frequently searched fields
- Map components are lazy-loaded (client-side only)
- API routes implement proper caching headers

---

**Your local ads posting board platform is ready to go live!** 🚀

# Fade & Blade - Barbershop Booking System

A modern, brand-forward barbershop website with appointment booking and admin management features.

## Features

### Customer Features
- **Home/Landing Page**: Hero section with compelling CTA and shop philosophy
- **Services**: Three main services with pricing:
  - Signature Cut (30 min) - $45
  - Classic Shave (30 min) - $35
  - The Full Experience (60 min) - $65
- **Booking System**: 
  - Date picker with 7-day advance booking
  - Time slots in 30-minute increments (09:00-19:00)
  - Real-time availability checking
  - Customer form with email (required), phone (required), name (optional)
  - Booking confirmation with toast notifications

### Admin Features
- **Schedule Dashboard**: Daily agenda view showing all appointments
- **Appointment Management**: View details, cancel appointments with confirmation
- **Statistics**: Today's bookings, revenue, available slots
- **Date Navigation**: View schedules for different days

## Tech Stack

### Frontend
- React 18 with TypeScript
- Wouter for routing
- TanStack Query for state management
- Tailwind CSS for styling
- Shadcn/ui components
- React Hook Form for form handling
- Lucide React for icons

### Backend
- Express.js server
- In-memory storage (MemStorage)
- Zod validation
- RESTful API endpoints

## API Endpoints

- `GET /api/appointments` - Get all appointments or filter by date
- `POST /api/appointments` - Create new appointment
- `DELETE /api/appointments/:id` - Cancel appointment
- `GET /api/appointments/availability/:date` - Get available time slots

## Design System

### Colors
- **Charcoal**: #1f1f1f (primary text, accents)
- **Gold**: #d4af37 (brand color, CTAs)
- **Gold Light**: #e4c547 (hover states)
- **Gold Dark**: #c49b27 (active states)

### Typography
- **Headers**: Sans-serif display font
- **Body**: Standard sans-serif
- **Accents**: Monospace for times and technical details

### Layout
- Minimalist design with lots of white space
- Soft drop-shadows and rounded corners
- Subtle micro-interactions on hover
- Responsive mobile-first design

## Setup & Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   This starts both the Express backend and Vite frontend on port 5000.

3. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Business Rules

- **Operating Hours**: 09:00 - 19:00 (appointments must fit within these hours)
- **Slot Duration**: 30-minute increments
- **No Double Booking**: Server validates time slot availability
- **Service Durations**:
  - Haircut: 30 minutes
  - Shave: 30 minutes  
  - Combo: 60 minutes
- **Required Fields**: Email and phone number for all bookings
- **Validation**: Email format and phone number validation on server

## Environment Variables

No environment variables required for basic functionality. All data is stored in memory.

## Production Considerations

For production deployment, consider:
- Replace MemStorage with persistent database (PostgreSQL recommended)
- Add authentication for admin routes
- Implement email/SMS confirmations
- Add calendar integration (.ics downloads)
- Configure proper CORS settings
- Add rate limiting and security middleware

## File Structure


# CampusRide / UniBeep - Plataforma de Conexión Universitaria

## Overview
CampusRide (UniBeep) is a Spanish university rideshare platform designed to help students connect and share rides, reducing transportation costs while promoting sustainability and building community.

**Current State**: Static frontend MVP with interactive animations and modern UI
**Stack**: HTML5, CSS3, JavaScript (ES6), GSAP animations
**Planned Backend**: PHP/Laravel with MySQL database

## Project Structure
```
/
├── index.html          # Main landing page (formerly campusride.html)
├── login.html          # Login/signup page with animated rings
├── login.css          # Login page styles
├── panel_usuarios.html # User profile carousel (ride search panel)
├── server.py          # Python HTTP server for development
└── README.md          # Technical proposal (Spanish)
```

## Recent Changes (November 4, 2025)
- Imported from GitHub repository
- Set up Python development server on port 5000
- Renamed campusride.html to index.html for proper landing page
- Configured Replit environment for static site hosting
- Added .gitignore for Python and common files

## Features (Current)
### Landing Page (index.html)
- Floating navbar with smooth scroll navigation
- Interactive animated cards with electric glow effects
- Rotating circular animations (GSAP)
- 3D-style buttons with hover effects
- Responsive design (mobile-first)
- Full-screen sections with gradient backgrounds

### Login Page (login.html)
- Animated rotating border rings
- Gradient submit button
- Clean, modern authentication form

### User Panel (panel_usuarios.html)
- Interactive profile card carousel
- Draggable cards with GSAP
- Electric border effects and glow layers
- Profile cards showing:
  - User photo and name
  - Location
  - Ride description
  - Social media links

## Technical Stack
### Frontend (Current)
- Pure HTML5/CSS3/JavaScript
- GSAP 3.12.2 (animations)
- Modern CSS features (oklch colors, backdrop-filter)
- Responsive grid layouts

### Backend (Planned - Phase 2)
- PHP with Laravel framework
- MySQL database
- Google Maps API integration
- Real-time chat system
- Premium subscription system (€2.50/month)

## Database Schema (Planned)
```sql
users (id, name, email, university, phone, instagram, is_premium, created_at)
rides (id, driver_id, schedule, days, status)
messages (id, sender_id, receiver_id, ride_id, content, timestamp)
```

## Development
**Server**: Python SimpleHTTPServer on port 5000
**Start Command**: `python server.py`
**Environment**: Replit-optimized (0.0.0.0:5000, cache disabled)

## Future Phases
1. **Phase 1 (Weeks 1-3)**: MVP - Authentication, profiles, ride posting, search, chat
2. **Phase 2 (Weeks 4-6)**: Geolocation with Google Maps, chat system, premium features
3. **Phase 3 (Weeks 7-8)**: Advertising panel, monetization, business analytics

## User Preferences
- Modern, interactive animations inspired by dora.ai
- Scroll-triggered animations
- Code sourced from freefrontend.com and codepen.io
- Electric blue color scheme (#0040F1, #008CFF)
- Spanish language interface

## Key Design Principles
- Interactive and animated UI
- Mobile-first responsive design
- University-focused social features
- Security: RGPD compliance, university email validation
- No mock data in production paths
